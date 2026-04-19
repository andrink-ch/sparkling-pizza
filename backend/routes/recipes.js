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

function decodeHTML(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}

function getMetaContent(html, prop, attr = 'property') {
  const r1 = new RegExp(`<meta\\s+${attr}=["']${prop}["']\\s+content=["']([^"']*?)["']`, 'i');
  const r2 = new RegExp(`<meta\\s+content=["']([^"']*?)["']\\s+${attr}=["']${prop}["']`, 'i');
  const m = html.match(r1) || html.match(r2);
  return m ? decodeHTML(m[1]) : '';
}

async function fetchPageMetadata(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const title = getMetaContent(html, 'og:title') || getMetaContent(html, 'twitter:title') || '';
  const metaDesc = getMetaContent(html, 'og:description') || getMetaContent(html, 'description', 'name') || '';

  // Try TikTok's embedded JSON for the full description
  let richDesc = '';
  const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    try {
      const str = scriptMatch[1];
      const hits = [...str.matchAll(/"desc":"((?:[^"\\]|\\.){30,})"/g)];
      if (hits.length) richDesc = hits[0][1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    } catch {}
  }

  const description = richDesc || metaDesc;
  if (!title && !description) throw new Error('No readable content found at this URL');
  return { title, description, captions: '', uploader: '' };
}

async function extractVideoMetadata(url) {
  // Strategy 1: direct HTTP fetch (works for TikTok/Instagram meta tags)
  try {
    return await fetchPageMetadata(url);
  } catch {
    // Strategy 2: yt-dlp fallback
    try {
      const cmd = `python -m yt_dlp --skip-download --print-json --no-playlist --quiet "${url}"`;
      const { stdout } = await execAsync(cmd, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });
      const meta = JSON.parse(stdout);
      const captions = (() => {
        for (const src of [meta.automatic_captions, meta.subtitles]) {
          if (!src) continue;
          const lang = src['en'] || src['en-US'] || Object.values(src)[0];
          if (!lang || !Array.isArray(lang)) continue;
          const j = lang.find(e => e.ext === 'json3' && e.data);
          if (j) return (j.data.events || []).filter(e => e.segs).map(e => e.segs.map(s => s.utf8).join('')).join(' ');
        }
        return '';
      })();
      return { title: meta.title || '', description: meta.description || '', captions, uploader: meta.uploader || '' };
    } catch {
      throw new Error('Could not extract this URL. Try the "Paste text" tab — copy the description from TikTok and paste it there.');
    }
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

function saveRecipe(recipeData, sourceUrl, rawMeta) {
  const insertRecipe = db.transaction(data => {
    const result = db.prepare(`
      INSERT INTO recipes
        (source_url, title, description, servings, prep_time_min, cook_time_min,
         steps, calories, protein_g, fiber_g, sugar_g, fat_g, carbs_g, raw_caption)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sourceUrl || '',
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
      rawMeta ? JSON.stringify(rawMeta) : null
    );
    const recipeId = result.lastInsertRowid;

    const insertIng = db.prepare('INSERT INTO ingredients (recipe_id, name, quantity, unit, notes) VALUES (?, ?, ?, ?, ?)');
    for (const ing of data.ingredients || []) {
      insertIng.run(recipeId, ing.name, ing.quantity || null, ing.unit || null, ing.notes || null);
    }

    const upsertTag = db.prepare('INSERT INTO tags (name) VALUES (?) ON CONFLICT(name) DO NOTHING');
    const getTag    = db.prepare('SELECT id FROM tags WHERE name = ?');
    const linkTag   = db.prepare('INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)');
    for (const tagName of data.tags || []) {
      const name = tagName.toLowerCase().trim();
      upsertTag.run(name);
      const tag = getTag.get(name);
      if (tag) linkTag.run(recipeId, tag.id);
    }
    return recipeId;
  });
  return insertRecipe(recipeData);
}

// POST /api/recipes/extract  (URL-based)
router.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' });

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

  if (recipeData.error) return res.status(422).json({ error: recipeData.error });

  try {
    res.status(201).json(getFullRecipe(saveRecipe(recipeData, url, videoMeta)));
  } catch (err) {
    res.status(500).json({ error: `Database error: ${err.message}` });
  }
});

// POST /api/recipes/extract-text  (paste raw text)
router.post('/extract-text', async (req, res) => {
  const { text, url } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length < 10) {
    return res.status(400).json({ error: 'text is required (min 10 chars)' });
  }

  const videoMeta = { title: '', description: text.trim(), captions: '', uploader: '' };

  let recipeData;
  try {
    recipeData = await extractRecipeWithClaude(videoMeta, url || '');
  } catch (err) {
    return res.status(500).json({ error: `Claude API error: ${err.message}` });
  }

  if (recipeData.error) return res.status(422).json({ error: recipeData.error });

  try {
    res.status(201).json(getFullRecipe(saveRecipe(recipeData, url || '', null)));
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
