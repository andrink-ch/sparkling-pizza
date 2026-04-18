import { useState } from 'react';
import { updateRecipe, updateIngredients, addTagToRecipe, removeTagFromRecipe } from '../api';
import TagBadge from './TagBadge';

const fieldCls = 'w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all font-sans';

function Section({ title, children }) {
  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4 mb-3">{title}</p>
      {children}
    </section>
  );
}

export default function RecipeEditModal({ recipe, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:         recipe.title          || '',
    description:   recipe.description    || '',
    servings:      recipe.servings       || '',
    prep_time_min: recipe.prep_time_min  || '',
    cook_time_min: recipe.cook_time_min  || '',
    steps:         recipe.steps          || [],
    calories:      recipe.calories       || '',
    protein_g:     recipe.protein_g      || '',
    fiber_g:       recipe.fiber_g        || '',
    sugar_g:       recipe.sugar_g        || '',
    fat_g:         recipe.fat_g          || '',
    carbs_g:       recipe.carbs_g        || '',
  });
  const [ingredients, setIngredients] = useState(recipe.ingredients?.map(i => ({ ...i })) || []);
  const [tags,        setTags]        = useState(recipe.tags || []);
  const [newTag,      setNewTag]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setStep(i, val)    { setForm(f => { const s = [...f.steps]; s[i] = val; return { ...f, steps: s }; }); }
  function addStep()          { setForm(f => ({ ...f, steps: [...f.steps, ''] })); }
  function removeStep(i)      { setForm(f => ({ ...f, steps: f.steps.filter((_, j) => j !== i) })); }
  function setIng(i, k, v)   { setIngredients(p => { const n = [...p]; n[i] = { ...n[i], [k]: v }; return n; }); }
  function addIngredient()    { setIngredients(p => [...p, { name: '', quantity: '', unit: '', notes: '' }]); }
  function removeIngredient(i){ setIngredients(p => p.filter((_, j) => j !== i)); }

  async function handleAddTag(e) {
    e.preventDefault();
    if (!newTag.trim()) return;
    try { const updated = await addTagToRecipe(recipe.id, newTag.trim()); setTags(updated); setNewTag(''); }
    catch {}
  }

  async function handleRemoveTag(tag) {
    try { await removeTagFromRecipe(recipe.id, tag.id); setTags(prev => prev.filter(t => t.id !== tag.id)); }
    catch {}
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      await updateRecipe(recipe.id, {
        ...form,
        servings:      form.servings      === '' ? null : Number(form.servings),
        prep_time_min: form.prep_time_min === '' ? null : Number(form.prep_time_min),
        cook_time_min: form.cook_time_min === '' ? null : Number(form.cook_time_min),
        calories:      form.calories      === '' ? null : Number(form.calories),
        protein_g:     form.protein_g     === '' ? null : Number(form.protein_g),
        fiber_g:       form.fiber_g       === '' ? null : Number(form.fiber_g),
        sugar_g:       form.sugar_g       === '' ? null : Number(form.sugar_g),
        fat_g:         form.fat_g         === '' ? null : Number(form.fat_g),
        carbs_g:       form.carbs_g       === '' ? null : Number(form.carbs_g),
        steps:         form.steps.filter(s => s.trim()),
      });
      await updateIngredients(recipe.id,
        ingredients.filter(i => i.name.trim()).map(i => ({
          name:     i.name,
          quantity: i.quantity === '' ? null : Number(i.quantity),
          unit:     i.unit  || null,
          notes:    i.notes || null,
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
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-modal border border-border animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-bold text-xl text-ink">Edit Recipe</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:text-ink hover:bg-border transition-colors text-xl">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-6 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="text-sm rounded-lg p-3 bg-red-50 text-red-600 border border-red-200">{error}</div>
          )}

          <Section title="Basic info">
            <div className="flex flex-col gap-2.5">
              <input className={fieldCls} placeholder="Recipe title" value={form.title}
                onChange={e => setField('title', e.target.value)} />
              <textarea className={fieldCls + ' resize-none'} placeholder="Description" rows={2}
                value={form.description} onChange={e => setField('description', e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                {[['servings','Servings'],['prep_time_min','Prep (min)'],['cook_time_min','Cook (min)']].map(([k, l]) => (
                  <div key={k}>
                    <label className="text-[10px] text-ink-4 mb-1 block font-semibold uppercase tracking-wider">{l}</label>
                    <input type="number" className={fieldCls} value={form[k]} onChange={e => setField(k, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Nutrition per serving">
            <div className="grid grid-cols-3 gap-2">
              {[['calories','Calories'],['protein_g','Protein (g)'],['fiber_g','Fiber (g)'],['sugar_g','Sugar (g)'],['fat_g','Fat (g)'],['carbs_g','Carbs (g)']].map(([k, l]) => (
                <div key={k}>
                  <label className="text-[10px] text-ink-4 mb-1 block font-semibold uppercase tracking-wider">{l}</label>
                  <input type="number" className={fieldCls} value={form[k]} onChange={e => setField(k, e.target.value)} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Ingredients">
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={fieldCls + ' flex-1'} placeholder="Ingredient" value={ing.name}
                    onChange={e => setIng(i, 'name', e.target.value)} />
                  <input type="number" className={fieldCls + ' !w-16'} placeholder="Qty" value={ing.quantity || ''}
                    onChange={e => setIng(i, 'quantity', e.target.value)} />
                  <input className={fieldCls + ' !w-16'} placeholder="Unit" value={ing.unit || ''}
                    onChange={e => setIng(i, 'unit', e.target.value)} />
                  <input className={fieldCls + ' flex-1'} placeholder="Notes" value={ing.notes || ''}
                    onChange={e => setIng(i, 'notes', e.target.value)} />
                  <button onClick={() => removeIngredient(i)}
                    className="text-ink-4 hover:text-red-500 text-lg leading-none transition-colors shrink-0">×</button>
                </div>
              ))}
              <button onClick={addIngredient}
                className="text-sm text-accent hover:text-accent-dark font-semibold text-left transition-colors">
                + Add ingredient
              </button>
            </div>
          </Section>

          <Section title="Steps">
            <div className="flex flex-col gap-2">
              {form.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="text-[10px] font-bold mt-2.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-accent-bg text-accent">
                    {i + 1}
                  </span>
                  <textarea className={fieldCls + ' flex-1 resize-none'} rows={2}
                    value={step} onChange={e => setStep(i, e.target.value)} />
                  <button onClick={() => removeStep(i)}
                    className="text-ink-4 hover:text-red-500 text-lg leading-none transition-colors mt-1.5">×</button>
                </div>
              ))}
              <button onClick={addStep}
                className="text-sm text-accent hover:text-accent-dark font-semibold text-left transition-colors">
                + Add step
              </button>
            </div>
          </Section>

          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(t => <TagBadge key={t.id} tag={t} onRemove={handleRemoveTag} />)}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input className={fieldCls + ' flex-1'} placeholder="Add a tag…"
                value={newTag} onChange={e => setNewTag(e.target.value)} />
              <button type="submit"
                className="text-sm px-4 py-2 rounded-lg font-semibold bg-accent-bg text-accent hover:bg-accent-border transition-colors">
                Add
              </button>
            </form>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-ink-4 hover:text-ink transition-colors font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 text-sm text-white bg-accent hover:bg-accent-dark disabled:opacity-50 rounded-lg font-semibold transition-colors">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
