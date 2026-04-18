import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getRecipe, deleteRecipe, addRecipeToShopping } from '../api';
import RecipeEditModal from './RecipeEditModal';
import { calcTDEE, recommendedPortions, formatQty } from '../utils/nutrition';
import { getSmartTags, TAG_COLORS } from '../utils/smartTags';

export default function RecipeDetail({ userProfile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [shoppingAdded, setShoppingAdded] = useState(false);
  const [portions, setPortions] = useState(1);

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
      setTimeout(() => setShoppingAdded(false), 2000);
    } catch {}
  }

  if (loading) return <div className="text-center py-20 text-gray-300 text-sm">Loading…</div>;
  if (!recipe) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-sm">Recipe not found.</p>
      <Link to="/" className="text-orange-500 text-sm mt-2 inline-block">← Back</Link>
    </div>
  );

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
    ['Calories', scaled.calories, 'kcal'],
    ['Protein',  scaled.protein_g, 'g'],
    ['Carbs',    scaled.carbs_g,   'g'],
    ['Fat',      scaled.fat_g,     'g'],
    ['Fiber',    scaled.fiber_g,   'g'],
    ['Sugar',    scaled.sugar_g,   'g'],
  ].filter(([, v]) => v != null);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-10">

      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link to="/" className="text-xs text-gray-400 hover:text-orange-500 transition-colors">← All recipes</Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{recipe.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-400">
            {totalTime > 0 && <span>{totalTime} min</span>}
            {recipe.servings && <span>{recipe.servings} servings</span>}
            {recipe.source_url && (
              <a
                href={recipe.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-500 transition-colors truncate max-w-[180px]"
              >
                ↗ source
              </a>
            )}
          </div>

          {smartTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {smartTags.map(t => (
                <span key={t.key} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TAG_COLORS[t.color]}`}>
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToShopping}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              shoppingAdded ? 'bg-green-100 text-green-700' : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {shoppingAdded ? '✓ Added' : '+ Shopping list'}
          </button>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Portion picker */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Portions</span>
          {tdee && (
            <span className="text-xs text-gray-400">TDEE {tdee} kcal</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(n => (
            <button
              key={n}
              onClick={() => setPortions(n)}
              className={`relative py-3 rounded-2xl font-semibold text-sm transition-all ${
                portions === n
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-orange-50 shadow-sm'
              }`}
            >
              {n}
              {recommended === n && (
                <span className={`absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] px-1.5 py-px rounded-full font-semibold whitespace-nowrap ${
                  portions === n ? 'bg-white text-orange-500' : 'bg-orange-500 text-white'
                }`}>
                  for you
                </span>
              )}
            </button>
          ))}
        </div>
        {tdee && scaled.calories && (
          <p className="text-xs text-gray-400 text-center">
            {scaled.calories} kcal · {Math.round((scaled.calories / tdee) * 100)}% of your daily intake
          </p>
        )}
      </div>

      {/* Nutrition */}
      {nutrientRows.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Nutrition · {portions} {portions === 1 ? 'portion' : 'portions'}
          </span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {nutrientRows.map(([label, val, unit]) => (
              <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
                <div className="text-base font-bold text-gray-900">{val}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
                <div className="text-[10px] text-gray-300">{unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients?.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Ingredients · {portions} {portions === 1 ? 'portion' : 'portions'}
          </span>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map(ing => {
              const scaledQty = ing.quantity != null ? ing.quantity * scale : null;
              return (
                <li key={ing.id} className="flex items-baseline gap-2.5 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0 mt-2" />
                  <span className="text-gray-800">
                    {scaledQty != null && <span className="font-semibold">{formatQty(scaledQty)} </span>}
                    {ing.unit && <span className="text-gray-500">{ing.unit} </span>}
                    {ing.name}
                    {ing.notes && <span className="text-gray-400 font-normal"> · {ing.notes}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Steps */}
      {recipe.steps?.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Instructions</span>
          <ol className="flex flex-col gap-5">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-500 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>
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
