const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const tags = db.prepare(`
    SELECT t.id, t.name, COUNT(rt.recipe_id) AS recipe_count
    FROM tags t
    LEFT JOIN recipe_tags rt ON rt.tag_id = t.id
    GROUP BY t.id
    ORDER BY t.name
  `).all();
  res.json(tags);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'name is required' });
  }
  const normalized = name.toLowerCase().trim();
  try {
    const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(normalized);
    res.status(201).json({ id: result.lastInsertRowid, name: normalized });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      const existing = db.prepare('SELECT * FROM tags WHERE name = ?').get(normalized);
      res.status(200).json(existing);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

module.exports = router;
