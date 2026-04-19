const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const items = db.prepare(
    'SELECT * FROM shopping_list_items ORDER BY ingredient_name'
  ).all();
  res.json(items);
});

router.post('/add-recipe', (req, res) => {
  const { recipe_id } = req.body;
  if (!recipe_id) return res.status(400).json({ error: 'recipe_id required' });

  const recipe = db.prepare('SELECT id FROM recipes WHERE id = ?').get(recipe_id);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  const ingredients = db.prepare(
    'SELECT * FROM ingredients WHERE recipe_id = ?'
  ).all(recipe_id);

  const addIngredients = db.transaction(() => {
    for (const ing of ingredients) {
      const normalizedName = ing.name.toLowerCase().trim();

      const existing = db.prepare(
        'SELECT * FROM shopping_list_items WHERE LOWER(TRIM(ingredient_name)) = ?'
      ).get(normalizedName);

      if (existing) {
        const existingIds = JSON.parse(existing.source_recipe_ids || '[]');
        if (!existingIds.includes(recipe_id)) existingIds.push(recipe_id);

        let newQty = existing.quantity;
        if (
          existing.unit === ing.unit &&
          ing.quantity !== null &&
          existing.quantity !== null
        ) {
          newQty = existing.quantity + ing.quantity;
        }

        db.prepare(
          'UPDATE shopping_list_items SET quantity = ?, source_recipe_ids = ? WHERE id = ?'
        ).run(newQty, JSON.stringify(existingIds), existing.id);
      } else {
        db.prepare(
          'INSERT INTO shopping_list_items (ingredient_name, quantity, unit, source_recipe_ids) VALUES (?, ?, ?, ?)'
        ).run(
          normalizedName,
          ing.quantity || null,
          ing.unit || null,
          JSON.stringify([recipe_id])
        );
      }
    }
  });

  addIngredients();
  const items = db.prepare(
    'SELECT * FROM shopping_list_items ORDER BY ingredient_name'
  ).all();
  res.json(items);
});

router.post('/', (req, res) => {
  const { ingredient_name, quantity, unit } = req.body;
  if (!ingredient_name || !ingredient_name.trim()) {
    return res.status(400).json({ error: 'ingredient_name required' });
  }
  const name = ingredient_name.trim().toLowerCase();
  const existing = db.prepare('SELECT * FROM shopping_list_items WHERE LOWER(TRIM(ingredient_name)) = ?').get(name);
  if (existing) return res.json(existing);
  db.prepare('INSERT INTO shopping_list_items (ingredient_name, quantity, unit, source_recipe_ids) VALUES (?, ?, ?, ?)').run(
    name, quantity || null, unit || null, '[]'
  );
  const item = db.prepare('SELECT * FROM shopping_list_items WHERE ingredient_name = ?').get(name);
  res.status(201).json(item);
});

router.patch('/:id', (req, res) => {
  const { checked, quantity, unit, ingredient_name } = req.body;
  const item = db.prepare('SELECT * FROM shopping_list_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const updated = db.prepare(`
    UPDATE shopping_list_items
    SET checked = ?, quantity = ?, unit = ?, ingredient_name = ?
    WHERE id = ?
  `).run(
    checked !== undefined ? (checked ? 1 : 0) : item.checked,
    quantity !== undefined ? quantity : item.quantity,
    unit !== undefined ? unit : item.unit,
    ingredient_name !== undefined ? ingredient_name : item.ingredient_name,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM shopping_list_items WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM shopping_list_items WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

router.delete('/', (req, res) => {
  db.prepare('DELETE FROM shopping_list_items').run();
  res.status(204).end();
});

module.exports = router;
