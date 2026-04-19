import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import { getRecipe, deleteRecipe, addRecipeToShopping } from '../api';
import RecipeEditModal from './RecipeEditModal';
import { calcTDEE, recommendedPortions, formatQty } from '../utils/nutrition';
import { getSmartTags } from '../utils/smartTags';

const TAG_PILL = {
  green:   'bg-emerald-500/15 text-emerald-400',
  blue:    'bg-blue-500/15 text-blue-400',
  purple:  'bg-violet-500/15 text-violet-400',
  emerald: 'bg-teal-500/15 text-teal-400',
  amber:   'bg-amber-500/15 text-amber-400',
};

function Spinner() {
  return (
    <div className="flex items-center justify-center py-32 gap-2 text-ink-3 text-sm">
      <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      Loading…
    </div>
  );
}

export default function RecipeDetail() {
  const { userProfile } = useOutletContext() || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe,        setRecipe]        = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [editing,       setEditing]       = useState(false);
  const [shoppingAdded, setShoppingAdded] = useState(false);
  const [portions,      setPortions]      = useState(1);
  const [checkedSteps,  setCheckedSteps]  = useState(new Set());

  async function load() {
    setLoading(true);
    try   { setRecipe(await getRecipe(id)); }
    catch { setRecipe(null); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => {
    if (!recipe?.calories || !recipe?.servings || !userProfile) return;
    const rec = recommendedPortions(calcTDEE(userProfile), recipe.calories);
    if (rec) setPortions(rec);
  }, [recipe, userProfile]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${recipe.title}"?`)) return;
    await deleteRecipe(id);
    navigate('/app');
  }

  async function handleAddToShopping() {
    try {
      await addRecipeToShopping(recipe.id);
      setShoppingAdded(true);
      setTimeout(() => setShoppingAdded(false), 2200);
    } catch {}
  }

  function toggleStep(i) {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  if (loading) return <Spinner />;
  if (!recipe) return (
    <div className="text-center py-32">
      <p className="font-display font-bold text-2xl text-ink-3 mb-3">Recipe not found</p>
      <Link to="/app" className="text-sm text-accent hover:text-accent-dark transition-colors">← Back</Link>
    </div>
  );

  const totalTime    = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  const baseServings = recipe.servings || 1;
  const scale        = portions / baseServings;

  const scaled = {
    calories:  recipe.calories  ? Math.round(recipe.calories  * portions) : null,
    protein_g: recipe.protein_g ? Math.round(recipe.protein_g * portions * 10) / 10 : null,
    carbs_g:   recipe.carbs_g   ? Math.round(recipe.carbs_g   * portions * 10) / 10 : null,
    fat_g:     recipe.fat_g     ? Math.round(recipe.fat_g     * portions * 10) / 10 : null,
    fiber_g:   recipe.fiber_g   ? Math.round(recipe.fiber_g   * portions * 10) / 10 : null,
    sugar_g:   recipe.sugar_g   ? Math.round(recipe.sugar_g   * portions * 10) / 10 : null,
  };

  const tdee        = userProfile ? calcTDEE(userProfile) : null;
  const recommended = recipe.calories ? recommendedPortions(tdee, recipe.calories) : null;
  const smartTags   = getSmartTags(recipe);

  const nutrientRows = [
    ['Cal',     scaled.calories,   'kcal'],
    ['Protein', scaled.protein_g,  'g'],
    ['Carbs',   scaled.carbs_g,    'g'],
    ['Fat',     scaled.fat_g,      'g'],
    ['Fiber',   scaled.fiber_g,    'g'],
    ['Sugar',   scaled.sugar_g,    'g'],
  ].filter(([, v]) => v != null);

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Back */}
      <Link to="/app" className="inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-accent transition-colors mb-6 group">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5">
          <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All recipes
      </Link>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-ink leading-tight mb-3" style={{ fontSize: 'clamp(24px, 5vw, 36px)' }}>
          {recipe.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3 mb-3">
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3l1.8 1.8" strokeLinecap="round" />
              </svg>
              {totalTime} min
            </span>
          )}
          {recipe.servings && <span>{recipe.servings} servings</span>}
          {recipe.source_url && (
            <a href={recipe.source_url} target="_blank" rel="noopener noreferrer"
               className="hover:text-accent transition-colors flex items-center gap-1">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                <path d="M6 2H2v10h10V8M8 2h4v4M6 8l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Source
            </a>
          )}
        </div>

        {smartTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {smartTags.map(t => (
              <span key={t.key} className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${TAG_PILL[t.color] || TAG_PILL.amber}`}>
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddToShopping}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: shoppingAdded ? 'rgba(34,197,94,0.12)' : '#FF5500',
              color:           shoppingAdded ? '#22C55E' : '#fff',
              border:          `1px solid ${shoppingAdded ? 'rgba(34,197,94,0.3)' : '#FF5500'}`,
              boxShadow:       shoppingAdded ? 'none' : '0 0 16px rgba(255,85,0,0.2)',
            }}
          >
            {shoppingAdded ? '✓ Added' : '+ Shopping list'}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-ink-2 bg-surface hover:bg-surf2 border border-border transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="h-px bg-border mb-8" />

      {/* Portions */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3">Portions</p>
          {tdee && <span className="text-xs text-ink-3">TDEE {tdee} kcal</span>}
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map(n => {
            const active = portions === n;
            const isRec  = recommended === n;
            return (
              <button
                key={n}
                onClick={() => setPortions(n)}
                className="relative flex-1 py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: active ? '#FF5500' : '#111113',
                  color:           active ? '#fff'    : '#8B9AB0',
                  border:          `1px solid ${active ? '#FF5500' : '#1F2028'}`,
                  boxShadow:       active ? '0 0 16px rgba(255,85,0,0.25)' : 'none',
                }}
              >
                {n}
                {isRec && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                    style={{ backgroundColor: active ? '#fff' : '#FF5500', color: active ? '#FF5500' : '#fff' }}>
                    for you
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tdee && scaled.calories && (
          <p className="text-xs text-ink-3 text-center mt-2.5">
            {scaled.calories} kcal · {Math.round((scaled.calories / tdee) * 100)}% of daily intake
          </p>
        )}
      </section>

      {/* Nutrition */}
      {nutrientRows.length > 0 && (
        <section className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3 mb-3">
            Nutrition · {portions} {portions === 1 ? 'portion' : 'portions'}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {nutrientRows.map(([label, val, unit]) => (
              <div key={label} className="bg-surface rounded-lg p-3 text-center border border-border">
                <div className="font-display text-xl font-bold text-ink leading-tight">{val}</div>
                <div className="text-[10px] text-ink-3 mt-1">{label}</div>
                <div className="text-[9px] text-ink-3">{unit}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <section className="mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3 mb-3">
            Ingredients · {portions} {portions === 1 ? 'portion' : 'portions'}
          </p>
          <ul className="divide-y divide-border">
            {recipe.ingredients.map(ing => {
              const scaledQty = ing.quantity != null ? ing.quantity * scale : null;
              return (
                <li key={ing.id} className="flex items-baseline gap-3 py-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-[7px] opacity-60" />
                  <span className="text-ink-2">
                    {scaledQty != null && <span className="font-semibold text-accent">{formatQty(scaledQty)} </span>}
                    {ing.unit && <span className="text-ink-3">{ing.unit} </span>}
                    {ing.name}
                    {ing.notes && <span className="text-ink-3 text-xs"> · {ing.notes}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Steps */}
      {recipe.steps?.length > 0 && (
        <section className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-3 mb-5">Instructions</p>
          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step, i) => {
              const done = checkedSteps.has(i);
              return (
                <li key={i} className="flex gap-4 cursor-pointer group" onClick={() => toggleStep(i)}>
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 mt-0.5"
                    style={{
                      backgroundColor: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,85,0,0.12)',
                      color:           done ? '#22C55E' : '#FF5500',
                    }}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <p className="text-sm leading-relaxed pt-0.5 transition-colors duration-200"
                    style={{ color: done ? '#2D3748' : '#8B9AB0', textDecoration: done ? 'line-through' : 'none' }}>
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {editing && (
        <RecipeEditModal recipe={recipe} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load(); }} />
      )}
    </div>
  );
}
