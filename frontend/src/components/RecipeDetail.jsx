import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe, addRecipeToShopping } from '../api';
import RecipeEditModal from './RecipeEditModal';
import { calcTDEE, recommendedPortions, formatQty } from '../utils/nutrition';
import { getSmartTags } from '../utils/smartTags';

const TAG_STYLES = {
  green:   { backgroundColor: '#D4E7DB', color: '#2A5439' },
  blue:    { backgroundColor: '#D4E0EE', color: '#2A3F6B' },
  purple:  { backgroundColor: '#E4D8F0', color: '#4A2A6B' },
  emerald: { backgroundColor: '#D2EADE', color: '#1E5438' },
  amber:   { backgroundColor: '#EEE0C2', color: '#6B4A10' },
};

function BackIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
      <path d="M6 2H2v10h10V8M8 2h4v4M6 8l5.5-5.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RecipeDetail({ userProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [shoppingAdded, setShoppingAdded] = useState(false);
  const [portions, setPortions] = useState(1);
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  async function load() {
    setLoading(true);
    try { setRecipe(await getRecipe(id)); }
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
    navigate('/');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-2 text-ink-light text-sm">
        <svg className="animate-spin w-4 h-4 text-terra" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading…
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-32">
        <p className="font-display text-3xl italic text-ink-light mb-3">Recipe not found</p>
        <Link to="/" className="text-sm text-terra hover:text-terra-dark transition-colors flex items-center gap-1 justify-center">
          <BackIcon /> All recipes
        </Link>
      </div>
    );
  }

  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  const baseServings = recipe.servings || 1;
  const scale = portions / baseServings;

  const scaled = {
    calories: recipe.calories ? Math.round(recipe.calories * portions) : null,
    protein_g: recipe.protein_g ? Math.round(recipe.protein_g * portions * 10) / 10 : null,
    carbs_g: recipe.carbs_g ? Math.round(recipe.carbs_g * portions * 10) / 10 : null,
    fat_g: recipe.fat_g ? Math.round(recipe.fat_g * portions * 10) / 10 : null,
    fiber_g: recipe.fiber_g ? Math.round(recipe.fiber_g * portions * 10) / 10 : null,
    sugar_g: recipe.sugar_g ? Math.round(recipe.sugar_g * portions * 10) / 10 : null,
  };

  const tdee = userProfile ? calcTDEE(userProfile) : null;
  const recommended = recipe.calories ? recommendedPortions(tdee, recipe.calories) : null;
  const smartTags = getSmartTags(recipe);

  const nutrientRows = [
    ['Cal', scaled.calories, 'kcal'],
    ['Protein', scaled.protein_g, 'g'],
    ['Carbs', scaled.carbs_g, 'g'],
    ['Fat', scaled.fat_g, 'g'],
    ['Fiber', scaled.fiber_g, 'g'],
    ['Sugar', scaled.sugar_g, 'g'],
  ].filter(([, v]) => v != null);

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Back nav */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-terra transition-colors mb-8 group"
      >
        <span className="transition-transform duration-150 group-hover:-translate-x-0.5">
          <BackIcon />
        </span>
        All recipes
      </Link>

      {/* Title block */}
      <div className="mb-8">
        <h1
          className="font-display text-ink leading-tight mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {recipe.title}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted mb-4">
          {totalTime > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 5v3l1.8 1.8" strokeLinecap="round" />
              </svg>
              {totalTime} min
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                <path d="M8 2v6M5 5H2a6 6 0 0012 0h-3" strokeLinecap="round" />
                <path d="M8 14v-2" strokeLinecap="round" />
              </svg>
              {recipe.servings} servings
            </span>
          )}
          {recipe.source_url && (
            <a
              href={recipe.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-terra transition-colors"
            >
              <ExternalIcon />
              Original source
            </a>
          )}
        </div>

        {/* Smart tags */}
        {smartTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {smartTags.map(t => (
              <span
                key={t.key}
                className="text-[11px] px-2.5 py-0.5 rounded-full font-medium"
                style={TAG_STYLES[t.color] || TAG_STYLES.amber}
              >
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAddToShopping}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: shoppingAdded ? '#D4E7DB' : '#C4592A',
              color: shoppingAdded ? '#2A5439' : '#fff',
              boxShadow: shoppingAdded ? 'none' : '0 2px 8px rgba(196,89,42,0.3)',
            }}
          >
            {shoppingAdded ? '✓ Added' : '+ Shopping list'}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted transition-colors duration-200 hover:bg-warm-border hover:text-ink"
            style={{ backgroundColor: '#EDE4D0' }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            style={{ color: '#B83A1A' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDF0E8'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Delete
          </button>
        </div>
      </div>

      <div
        className="h-px w-full mb-8"
        style={{ background: 'linear-gradient(90deg, #E2D5BE, transparent)' }}
      />

      {/* Portion picker */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">Portions</h2>
          {tdee && (
            <span className="text-xs text-muted">TDEE {tdee} kcal/day</span>
          )}
        </div>

        <div className="flex gap-2">
          {[1, 2, 3].map(n => {
            const isActive = portions === n;
            const isRec = recommended === n;
            return (
              <button
                key={n}
                onClick={() => setPortions(n)}
                className="relative flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive ? '#C4592A' : '#FAF6EC',
                  color: isActive ? '#fff' : '#1A1208',
                  border: `1.5px solid ${isActive ? '#C4592A' : '#E2D5BE'}`,
                  boxShadow: isActive ? '0 3px 10px rgba(196,89,42,0.25)' : '0 1px 3px rgba(26,18,8,0.04)',
                }}
              >
                {n}
                {isRec && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap"
                    style={{
                      backgroundColor: isActive ? '#fff' : '#C4592A',
                      color: isActive ? '#C4592A' : '#fff',
                    }}
                  >
                    for you
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tdee && scaled.calories && (
          <p className="text-xs text-muted text-center mt-2.5">
            {scaled.calories} kcal · {Math.round((scaled.calories / tdee) * 100)}% of daily intake
          </p>
        )}
      </section>

      {/* Nutrition */}
      {nutrientRows.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-3">
            Nutrition · {portions} {portions === 1 ? 'portion' : 'portions'}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {nutrientRows.map(([label, val, unit]) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{
                  backgroundColor: '#FAF6EC',
                  border: '1px solid #E2D5BE',
                }}
              >
                <div className="font-display text-xl font-semibold text-ink" style={{ lineHeight: 1 }}>
                  {val}
                </div>
                <div className="text-[10px] text-muted mt-1">{label}</div>
                <div className="text-[9px] text-ink-light">{unit}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-4">
            Ingredients · {portions} {portions === 1 ? 'portion' : 'portions'}
          </h2>
          <ul className="flex flex-col divide-y" style={{ borderColor: '#EDE4D0' }}>
            {recipe.ingredients.map(ing => {
              const scaledQty = ing.quantity != null ? ing.quantity * scale : null;
              return (
                <li key={ing.id} className="flex items-baseline gap-3 py-2.5 text-sm">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 mt-[7px]"
                    style={{ backgroundColor: '#C4592A', opacity: 0.6 }}
                  />
                  <span className="text-ink">
                    {scaledQty != null && (
                      <span className="font-semibold text-terra">{formatQty(scaledQty)} </span>
                    )}
                    {ing.unit && <span className="text-muted">{ing.unit} </span>}
                    {ing.name}
                    {ing.notes && (
                      <span className="text-ink-light text-xs"> · {ing.notes}</span>
                    )}
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
          <h2 className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-5">
            Instructions
          </h2>
          <ol className="flex flex-col gap-4">
            {recipe.steps.map((step, i) => {
              const done = checkedSteps.has(i);
              return (
                <li
                  key={i}
                  className="flex gap-4 cursor-pointer group"
                  onClick={() => toggleStep(i)}
                >
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 mt-0.5"
                    style={{
                      backgroundColor: done ? '#D4E7DB' : '#F5D9C8',
                      color: done ? '#2A5439' : '#C4592A',
                    }}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <p
                    className="text-sm leading-relaxed transition-colors duration-200"
                    style={{
                      color: done ? '#B5A898' : '#1A1208',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {step}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {editing && (
        <RecipeEditModal
          recipe={recipe}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); load(); }}
        />
      )}
    </div>
  );
}
