import { useState } from 'react';
import { updateRecipe, updateIngredients, addTagToRecipe, removeTagFromRecipe } from '../api';
import TagBadge from './TagBadge';

export default function RecipeEditModal({ recipe, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: recipe.title || '',
    description: recipe.description || '',
    servings: recipe.servings || '',
    prep_time_min: recipe.prep_time_min || '',
    cook_time_min: recipe.cook_time_min || '',
    steps: recipe.steps || [],
    calories: recipe.calories || '',
    protein_g: recipe.protein_g || '',
    fiber_g: recipe.fiber_g || '',
    sugar_g: recipe.sugar_g || '',
    fat_g: recipe.fat_g || '',
    carbs_g: recipe.carbs_g || '',
  });
  const [ingredients, setIngredients] = useState(
    recipe.ingredients?.map(i => ({ ...i })) || []
  );
  const [tags, setTags] = useState(recipe.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function setStep(index, val) {
    setForm(f => {
      const steps = [...f.steps];
      steps[index] = val;
      return { ...f, steps };
    });
  }

  function addStep() {
    setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  }

  function removeStep(index) {
    setForm(f => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));
  }

  function setIng(index, key, val) {
    setIngredients(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', quantity: '', unit: '', notes: '' }]);
  }

  function removeIngredient(index) {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  }

  async function handleAddTag(e) {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      const updated = await addTagToRecipe(recipe.id, newTag.trim());
      setTags(updated);
      setNewTag('');
    } catch {}
  }

  async function handleRemoveTag(tag) {
    try {
      await removeTagFromRecipe(recipe.id, tag.id);
      setTags(prev => prev.filter(t => t.id !== tag.id));
    } catch {}
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateRecipe(recipe.id, {
        ...form,
        servings: form.servings === '' ? null : Number(form.servings),
        prep_time_min: form.prep_time_min === '' ? null : Number(form.prep_time_min),
        cook_time_min: form.cook_time_min === '' ? null : Number(form.cook_time_min),
        calories: form.calories === '' ? null : Number(form.calories),
        protein_g: form.protein_g === '' ? null : Number(form.protein_g),
        fiber_g: form.fiber_g === '' ? null : Number(form.fiber_g),
        sugar_g: form.sugar_g === '' ? null : Number(form.sugar_g),
        fat_g: form.fat_g === '' ? null : Number(form.fat_g),
        carbs_g: form.carbs_g === '' ? null : Number(form.carbs_g),
        steps: form.steps.filter(s => s.trim()),
      });
      await updateIngredients(
        recipe.id,
        ingredients
          .filter(i => i.name.trim())
          .map(i => ({
            name: i.name,
            quantity: i.quantity === '' ? null : Number(i.quantity),
            unit: i.unit || null,
            notes: i.notes || null,
          }))
      );
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Edit Recipe</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <div className="px-6 py-4 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}

          {/* Basic info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Info</h3>
            <div className="flex flex-col gap-3">
              <input
                className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Title"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
              />
              <textarea
                className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Description"
                rows={2}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
              />
              <div className="grid grid-cols-3 gap-2">
                {[['servings', 'Servings'], ['prep_time_min', 'Prep (min)'], ['cook_time_min', 'Cook (min)']].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                    <input
                      type="number"
                      className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                      value={form[key]}
                      onChange={e => setField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Nutrition */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Nutrition (per serving)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[['calories', 'Calories'], ['protein_g', 'Protein (g)'], ['fiber_g', 'Fiber (g)'], ['sugar_g', 'Sugar (g)'], ['fat_g', 'Fat (g)'], ['carbs_g', 'Carbs (g)']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                  <input
                    type="number"
                    className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Ingredients */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Ingredients</h3>
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="border rounded-lg px-2 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Ingredient"
                    value={ing.name}
                    onChange={e => setIng(i, 'name', e.target.value)}
                  />
                  <input
                    type="number"
                    className="border rounded-lg px-2 py-1.5 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Qty"
                    value={ing.quantity || ''}
                    onChange={e => setIng(i, 'quantity', e.target.value)}
                  />
                  <input
                    className="border rounded-lg px-2 py-1.5 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Unit"
                    value={ing.unit || ''}
                    onChange={e => setIng(i, 'unit', e.target.value)}
                  />
                  <input
                    className="border rounded-lg px-2 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Notes"
                    value={ing.notes || ''}
                    onChange={e => setIng(i, 'notes', e.target.value)}
                  />
                  <button onClick={() => removeIngredient(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                </div>
              ))}
              <button onClick={addIngredient} className="text-sm text-orange-600 hover:text-orange-700 text-left">+ Add ingredient</button>
            </div>
          </section>

          {/* Steps */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Steps</h3>
            <div className="flex flex-col gap-2">
              {form.steps.map((step, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-xs text-gray-400 mt-2.5 w-5 shrink-0">{i + 1}.</span>
                  <textarea
                    className="border rounded-lg px-2 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                    rows={2}
                    value={step}
                    onChange={e => setStep(i, e.target.value)}
                  />
                  <button onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none mt-1.5">×</button>
                </div>
              ))}
              <button onClick={addStep} className="text-sm text-orange-600 hover:text-orange-700 text-left">+ Add step</button>
            </div>
          </section>

          {/* Tags */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Tags</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(t => <TagBadge key={t.id} tag={t} onRemove={handleRemoveTag} />)}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                className="border rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Add a tag…"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
              />
              <button type="submit" className="text-sm bg-orange-100 text-orange-600 hover:bg-orange-200 px-3 py-1.5 rounded-lg font-medium">Add</button>
            </form>
          </section>
        </div>

        <div className="px-6 py-4 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg font-medium"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
