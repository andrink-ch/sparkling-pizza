import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const extractRecipe     = url              => api.post('/recipes/extract',      { url }).then(r => r.data);
export const extractRecipeText = (text, url = '') => api.post('/recipes/extract-text', { text, url }).then(r => r.data);

export const getRecipes = params =>
  api.get('/recipes', { params }).then(r => r.data);

export const getRecipe = id =>
  api.get(`/recipes/${id}`).then(r => r.data);

export const updateRecipe = (id, data) =>
  api.put(`/recipes/${id}`, data).then(r => r.data);

export const updateIngredients = (id, ingredients) =>
  api.put(`/recipes/${id}/ingredients`, { ingredients }).then(r => r.data);

export const deleteRecipe = id =>
  api.delete(`/recipes/${id}`);

export const addTagToRecipe = (id, name) =>
  api.post(`/recipes/${id}/tags`, { name }).then(r => r.data);

export const removeTagFromRecipe = (recipeId, tagId) =>
  api.delete(`/recipes/${recipeId}/tags/${tagId}`);

export const getTags = () =>
  api.get('/tags').then(r => r.data);

export const getShoppingList = () =>
  api.get('/shopping').then(r => r.data);

export const addRecipeToShopping = recipe_id =>
  api.post('/shopping/add-recipe', { recipe_id }).then(r => r.data);

export const updateShoppingItem = (id, data) =>
  api.patch(`/shopping/${id}`, data).then(r => r.data);

export const deleteShoppingItem = id =>
  api.delete(`/shopping/${id}`);

export const clearShoppingList = () =>
  api.delete('/shopping');
