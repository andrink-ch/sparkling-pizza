import { useState } from 'react';
import { updateRecipe, updateIngredients, addTagToRecipe, removeTagFromRecipe } from '../api';
import TagBadge from './TagBadge';

const inputCls = 'w-full rounded-lg px-3 py-2 text-sm text-ink bg-parchment focus:outline-none transition-all duration-200';
const inputStyle = {
  border: '1.5px solid #E2D5BE',
  fontFamily: 'Outfit, system-ui, sans-serif',
};

function focusStyle(e) {
  e.target.style.borderColor = '#C4592A';
  e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.1)';
}
function blurStyle(e) {
  e.target.style.borderColor = '#E2D5BE';
  e.target.style.boxShadow = 'none';
}

function SectionLabel({ children }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-3">
      {children}
    </h3>
  );
}

export default function RecipeEditModal({ recipe, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:         recipe.title || '',
    description:   recipe.description || '',
    servings:      recipe.servings || '',
    prep_time_min: recipe.prep_time_min || '',
    cook_time_min: recipe.cook_time_min || '',
    steps:         recipe.steps || [],
    calories:      recipe.calories || '',
    protein_g:     recipe.protein_g || '',
    fiber_g:       recipe.fiber_g || '',
    sugar_g:       recipe.sugar_g || '',
    fat_g:         recipe.fat_g || '',
    carbs_g:       recipe.carbs_g || '',
  });
  const [ingredients, setIngredients] = useState(recipe.ingredients?.map(i => ({ ...i })) || []);
  const [tags, setTags] = useState(recipe.tags || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setStep(i, val) { setForm(f => { const s = [...f.steps]; s[i] = val; return { ...f, steps: s }; }); }
  function addStep() { setForm(f => ({ ...f, steps: [...f.steps, ''] })); }
  function removeStep(i) { setForm(f => ({ ...f, steps: f.steps.filter((_, j) => j !== i) })); }
  function setIng(i, key, val) { setIngredients(p => { const n = [...p]; n[i] = { ...n[i], [key]: val }; return n; }); }
  function addIngredient() { setIngredients(p => [...p, { name: '', quantity: '', unit: '', notes: '' }]); }
  function removeIngredient(i) { setIngredients(p => p.filter((_, j) => j !== i)); }

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
    setSaving(true);
    setError('');
    try {
      await updateRecipe(recipe.id, {
        ...form,
        servings:      form.servings === '' ? null : Number(form.servings),
        prep_time_min: form.prep_time_min === '' ? null : Number(form.prep_time_min),
        cook_time_min: form.cook_time_min === '' ? null : Number(form.cook_time_min),
        calories:      form.calories === '' ? null : Number(form.calories),
        protein_g:     form.protein_g === '' ? null : Number(form.protein_g),
        fiber_g:       form.fiber_g === '' ? null : Number(form.fiber_g),
        sugar_g:       form.sugar_g === '' ? null : Number(form.sugar_g),
        fat_g:         form.fat_g === '' ? null : Number(form.fat_g),
        carbs_g:       form.carbs_g === '' ? null : Number(form.carbs_g),
        steps:         form.steps.filter(s => s.trim()),
      });
      await updateIngredients(recipe.id,
        ingredients
          .filter(i => i.name.trim())
          .map(i => ({
            name:     i.name,
            quantity: i.quantity === '' ? null : Number(i.quantity),
            unit:     i.unit || null,
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
      style={{ backgroundColor: 'rgba(26,18,8,0.45)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden animate-slide-up"
        style={{
          backgroundColor: '#FAF6EC',
          border: '1px solid #E2D5BE',
          boxShadow: '0 24px 64px rgba(26,18,8,0.2)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #EDE4D0' }}
        >
          <h2 className="font-display text-2xl font-semibold text-ink">Edit Recipe</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-warm-border transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-7 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="text-sm rounded-lg p-3" style={{ backgroundColor: '#FDF0E8', color: '#B83A1A', border: '1px solid #EBB898' }}>
              {error}
            </div>
          )}

          <section>
            <SectionLabel>Basic info</SectionLabel>
            <div className="flex flex-col gap-2.5">
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="Recipe title"
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
              />
              <textarea
                className={inputCls}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder="Description (optional)"
                rows={2}
                value={form.description}
                onChange={e => setField('description', e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
              />
              <div className="grid grid-cols-3 gap-2">
                {[['servings', 'Servings'], ['prep_time_min', 'Prep (min)'], ['cook_time_min', 'Cook (min)']].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-[11px] text-muted mb-1 block">{label}</label>
                    <input
                      type="number"
                      className={inputCls}
                      style={inputStyle}
                      value={form[key]}
                      onChange={e => setField(key, e.target.value)}
                      onFocus={focusStyle} onBlur={blurStyle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionLabel>Nutrition per serving</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {[['calories','Calories'],['protein_g','Protein (g)'],['fiber_g','Fiber (g)'],['sugar_g','Sugar (g)'],['fat_g','Fat (g)'],['carbs_g','Carbs (g)']].map(([key, label]) => (
                <div key={key}>
                  <label className="text-[11px] text-muted mb-1 block">{label}</label>
                  <input
                    type="number"
                    className={inputCls}
                    style={inputStyle}
                    value={form[key]}
                    onChange={e => setField(key, e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionLabel>Ingredients</SectionLabel>
            <div className="flex flex-col gap-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className={inputCls + ' flex-1'}
                    style={inputStyle}
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={e => setIng(i, 'name', e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  <input
                    type="number"
                    className={inputCls + ' !w-16'}
                    style={inputStyle}
                    placeholder="Qty"
                    value={ing.quantity || ''}
                    onChange={e => setIng(i, 'quantity', e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  <input
                    className={inputCls + ' !w-16'}
                    style={inputStyle}
                    placeholder="Unit"
                    value={ing.unit || ''}
                    onChange={e => setIng(i, 'unit', e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  <input
                    className={inputCls + ' flex-1'}
                    style={inputStyle}
                    placeholder="Notes"
                    value={ing.notes || ''}
                    onChange={e => setIng(i, 'notes', e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  <button
                    onClick={() => removeIngredient(i)}
                    className="text-muted hover:text-terra text-lg leading-none transition-colors shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addIngredient}
                className="text-sm text-terra hover:text-terra-dark text-left transition-colors font-medium"
              >
                + Add ingredient
              </button>
            </div>
          </section>

          <section>
            <SectionLabel>Steps</SectionLabel>
            <div className="flex flex-col gap-2">
              {form.steps.map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span
                    className="text-xs font-bold mt-2.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#F5D9C8', color: '#C4592A', fontSize: '10px' }}
                  >
                    {i + 1}
                  </span>
                  <textarea
                    className={inputCls + ' flex-1'}
                    style={{ ...inputStyle, resize: 'none' }}
                    rows={2}
                    value={step}
                    onChange={e => setStep(i, e.target.value)}
                    onFocus={focusStyle} onBlur={blurStyle}
                  />
                  <button
                    onClick={() => removeStep(i)}
                    className="text-muted hover:text-terra text-lg leading-none transition-colors mt-1.5"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addStep}
                className="text-sm text-terra hover:text-terra-dark text-left transition-colors font-medium"
              >
                + Add step
              </button>
            </div>
          </section>

          <section>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map(t => <TagBadge key={t.id} tag={t} onRemove={handleRemoveTag} />)}
            </div>
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                className={inputCls + ' flex-1'}
                style={inputStyle}
                placeholder="Add a tag…"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onFocus={focusStyle} onBlur={blurStyle}
              />
              <button
                type="submit"
                className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ backgroundColor: '#F5D9C8', color: '#C4592A' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#EBB898'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F5D9C8'; }}
              >
                Add
              </button>
            </form>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3 justify-end"
          style={{ borderTop: '1px solid #EDE4D0' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted hover:text-ink transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            style={{
              backgroundColor: '#C4592A',
              boxShadow: '0 2px 8px rgba(196,89,42,0.3)',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#A84420'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#C4592A'; }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
