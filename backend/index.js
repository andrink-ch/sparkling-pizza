require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const recipesRouter = require('./routes/recipes');
const tagsRouter = require('./routes/tags');
const shoppingRouter = require('./routes/shopping');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/recipes', recipesRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/shopping', shoppingRouter);

const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`sparkling-pizza backend on http://localhost:${PORT}`);
});
