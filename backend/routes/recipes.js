const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db');

const router = express.Router();
const execAsync = promisify(exec);
const client = new Anthropic();

const RECIPE_EXTRACTION_SYSTEM_PROMPT = `You are a recipe extraction assistant. Given video metadata (title, description, captions/transcript) from a cooking video, extract a structured recipe and return it as a single valid JSON object — no markdown fences, no prose, just the JSON.

If information is missing or ambiguous, make your best estimate based on culinary knowledge. If quantities are vague, assume typical serving sizes.

Return EXACTLY this JSON schema:

{
  "title": "string — recipe name",
  "description": "string — 1-3 sentence description of the dish",
  "servings": integer,
  "prep_time_min": integer,
  "cook_time_min": integer,
  "ingredients": [
    {
      "name": "string — ingredient name, lowercase, no brand names",
      "quantity": number or null,
      "unit": "string or null — use: g, kg, ml, l, tsp, tbsp, cup, oz, lb, cloves, slices, pieces",
      "notes": "string or null — e.g. 'finely chopped', 'room temperature'"
    }
  ],
  "steps": [
    "string — one complete instruction step per entry"
  ],
  "nutrition": {
    "calories": integer,
    "protein_g": number,
    "fiber_g": number,
    "sugar_g": number,
    "fat_g": number,
    "carbs_g": number
  },
  "tags": ["string — each tag is a short lowercase label"]
}

Tag guidelines — only use tags that clearly apply:
- Diet: "vegan", "vegetarian", "gluten-free", "dairy-free", "keto", "paleo"
- Nutrition: "high-protein", "low-carb", "low-calorie"
- Time: "quick meals" (under 30 min total), "meal prep"
- Meal type: "breakfast", "lunch", "dinner", "snack", "dessert"
- Cuisine: "italian", "asian", "mexican", "mediterranean", "american"
- Style: "one-pot", "no-cook", "baked", "fried", "grilled"

All nutrition values are per serving.

If this content does not appear to contain a recipe (no ingredients, no instructions), return:
{"error": "No recipe found in this video content"}`;

function extractCaptions(meta) {
  const sources = [meta.automatic_captions, meta.subtitles];
  for (const src of sources) {
    if (!src) continue;
    const lang = src['en'] || src['en-US'] || Object.values(src)[0];
    if (!lang || !Array.isArray(lang)) continue;
    const json3 = lang.find(e => e.ext === 'json3' && e.data);
    if (json3) {
      return (json3.data.events || [])
        .filter(e => e.segs)
        .map(e => e.segs.map(s => s.utf8).join(''))
        .join(' ');
    }
  }
  return '';
}

async function extractVideoMetadata(url) {
  const cmd = `python -m yt_dlp --skip-download --print-json --no-playlist --quiet "${url}"`;
  try {
    const { stdout } = await execAsync(cmd, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024,
    });
    const meta = JSON.parse(stdout);
    return {
      title: meta.title || '',
      description: meta.description || '',
      captions: extractCaptions(meta),
      uploader: meta.uploader || '',
    };
  } catch (err) {
    if (err.code === 'ETIMEDOUT') throw new Error('Video extraction timed out');
    if (err.message.includes('not found') || err.message.includes('No such file')) {
      throw new Error('yt-dlp is not installed. Run: python -m pip install yt-dlp');
    }
    const msg = err.stderr || err.message || '';
    if (msg.includes('Private') || msg.includes('private')) {
      throw new Error('This video is private or unavailable');
    }
    throw new Error(`Could not extract video: ${msg.slice(0, 200)}`);
  }
}

async function extractRecipeWithClaude(videoMeta, sourceUrl) {
  const context = [
    videoMeta.title && `Title: ${videoMeta.title}`,
    videoMeta.uploader && `Creator: ${videoMeta.uploader}`,
    videoMeta.description && `Description:\n${videoMeta.description}`,
    videoMeta.captions && `Captions/Transcript:\n${videoMeta.captions}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: [
      {
        type: 'text',
        text: RECIPE_EXTRACTION_SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Extract a structured recipe from the following video content. Source URL: ${sourceUrl}\n\n${context}`,
      },
    ],
  });

  const text = response.content.find(b => b.type === 'text')?.text || '';
  return JSON.parse(text);
}

function getFullRecipe(id) {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(id);
  if (!recipe) return null;
  recipe.ingredients = db.prepare(
    'SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id'
  ).all(id);
  recipe.tags = db.prepare(`
    SELECT t.id, t.name FROM tags t
    JOIN recipe_tags rt ON rt.tag_id = t.id
    WHERE rt.recipe_id = ?
    ORDER BY t.name
  `).all(id);
  recipe.steps = JSON.parse(recipe.steps || '[]');
  return recipe;
}

// POST /api/recipes/extract
router.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  let videoMeta;
  try {
    videoMeta = await extractVideoMetadata(url);
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }

  let recipeData;
  try {
    recipeData = await extractRecipeWithClaude(videoMeta, url);
  } catch (err) {
    return res.status(500).json({ error: `Claude API error: ${err.message}` });
  }

  if (recipeData.error) {
    return res.status(422).json({ error: recipeData.error });
  }

  const insertRecipe = db.transaction(data => {
    const result = db.prepare(`
      INSERT INTO recipes
        (source_url, title, description, servings, prep_time_min, cook_time_min,
         steps, calories, protein_g, fiber_g, sugar_g, fat_g, carbs_g, raw_caption)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      url,
      data.title,
      data.description || '',
      data.servings || null,
      data.prep_time_min || null,
      data.cook_time_min || null,
      JSON.stringify(data.steps || []),
      data.nutrition?.calories || null,
      data.nutrition?.protein_g || null,
      data.nutrition?.fiber_g || null,
      data.nutrition?.sugar_g || null,
      data.nutrition?.fat_g || null,
      data.nutrition?.carbs_g || null,
      JSON.stringify(videoMeta)
    );
    const recipeId = result.lastInsertRowid;

    const insertIng = db.prepare(
      'INSERT INTO ingredients (recipe_id, name, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)'
    );
    for (const ing of data.ingredients || []) {
      insertIng.run(recipeId, ing.name, ing.quantity || null, ing.unit || null, ing.notes || null);
    }

    const upsertTag = db.prepare(
      'INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING'
    );
    const getTag = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag = db.prepare(
      'INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)'
    );
    for (const tagName of data.tags || []) {
      const name = tagName.toLowerCase().trim();
      upsertTag.run(name);
      const tag = getTag.get(name);
      if (tag) linkTag.run(recipeId, tag.id);
    }

    return recipeId;
  });

  try {
    const recipeId = insertRecipe(recipeData);
    res.status(201).json(getFullRecipe(recipeId));
  } catch (err) {
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// GET /api/recipes
router.get('/', (req, res) => {
  const { q, tag } = req.query;

  let query = `
    SELECT DISTINCT r.* FROM recipes r
    LEFT JOIN ingredients i ON i.recipe_id = r.id
    LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
    LEFT JOIN tags t ON t.id = rt.tag_id
    WHERE 1=1
  `;
  const params = [];

  if (q) {
    query += ` AND (
      LOWER(r.title) LIKE LOWER(?) OR
      LOWER(r.description) LIKE LOWER(?) OR
      LOWER(i.name) LIKE LOWER(?)
    )`;
    const like = `%${q}%`;
    params.push(like, like, like);
  }

  if (tag) {
    query += ' AND LOWER(t.name) = LOWER(?)';
    params.push(tag);
  }

  query += ' ORDER BY r.created_at DESC';

  const recipes = db.prepare(query).all(...params);
  const result = recipes.map(r => {
    r.tags = db.prepare(`
      SELECT t.id, t.name FROM tags t
      JOIN recipe_tags rt ON rt.tag_id = t.id
      WHERE rt.recipe_id = ?
      ORDER BY t.name
    `).all(r.id);
    r.steps = JSON.parse(r.steps || '[]');
    return r;
  });

  res.json(result);
});

// GET /api/recipes/:id
router.get('/:id', (req, res) => {
  const recipe = getFullRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  res.json(recipe);
});

// PUT /api/recipes/:id
router.put('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const {
    title, description, servings, prep_time_min, cook_time_min,
    steps, calories, protein_g, fiber_g, sugar_g, fat_g, carbs_g,
  } = req.body;

  db.prepare(`
    UPDATE recipes SET
      title = ?, description = ?, servings = ?, prep_time_min = ?, cook_time_min = ?,
      steps = ?, calories = ?, protein_g = ?, fiber_g = ?, sugar_g = ?, fat_g = ?, carbs_g = ?
    WHERE id = ?
  `).run(
    title ?? recipe.title,
    description ?? recipe.description,
    servings ?? recipe.servings,
    prep_time_min ?? recipe.prep_time_min,
    cook_time_min ?? recipe.cook_time_min,
    steps !== undefined ? JSON.stringify(steps) : recipe.steps,
    calories ?? recipe.calories,
    protein_g ?? recipe.protein_g,
    fiber_g ?? recipe.fiber_g,
    sugar_g ?? recipe.sugar_g,
    fat_g ?? recipe.fat_g,
    carbs_g ?? recipe.carbs_g,
    req.params.id
  );

  res.json(getFullRecipe(req.params.id));
});

// DELETE /api/recipes/:id
router.delete('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// PUT /api/recipes/:id/ingredients
router.put('/:id/ingredients', (req, res) => {
  const { ingredients } = req.body;
  if (!Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'ingredients array required' });
  }

  const replace = db.transaction(() => {
    db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(req.params.id);
    const insert = db.prepare(
      'INSERT INTO ingredients (recipe_id, name, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)'
    );
    for (const ing of ingredients) {
      insert.run(req.params.id, ing.name, ing.quantity || null, ing.unit || null, ing.notes || null);
    }
  });

  replace();
  res.json(db.prepare('SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY id').all(req.params.id));
});

// POST /api/recipes/:id/tags
router.post('/:id/tags', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const normalized = name.toLowerCase().trim();

  db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING').run(normalized);
  const tag = db.prepare('SELECT * FROM tags WHERE name = ?').get(normalized);
  db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)').run(req.params.id, tag.id);

  const tags = db.prepare(`
    SELECT t.id, t.name FROM tags t
    JOIN recipe_tags rt ON rt.tag_id = t.id
    WHERE rt.recipe_id = ?
    ORDER BY t.name
  `).all(req.params.id);
  res.json(tags);
});

// DELETE /api/recipes/:id/tags/:tagId
router.delete('/:id/tags/:tagId', (req, res) => {
  db.prepare('DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?').run(
    req.params.id, req.params.tagId
  );
  res.status(204).end();
});

module.exports = router;
