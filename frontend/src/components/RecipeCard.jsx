import { useNavigate } from 'react-router-dom';
import { addRecipeToShopping } from '../api';
import { useState } from 'react';
import { getSmartTags, TAG_COLORS } from '../utils/smartTags';

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  const smartTags = getSmartTags(recipe).slice(0, 2);

  async function handleAddToShopping(e) {
    e.stopPropagation();
    try {
      await addRecipeToShopping(recipe.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {}
  }

  return (
    <div
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-sm">{recipe.title}</h3>
        {totalTime > 0 && (
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{totalTime}m</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1.5">
          {smartTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {smartTags.map(t => (
                <span key={t.key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[t.color]}`}>
                  {t.label}
                </span>
              ))}
            </div>
          )}
          {(recipe.calories || recipe.protein_g) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              {recipe.calories && <span>{recipe.calories} kcal</span>}
              {recipe.calories && recipe.protein_g && <span>·</span>}
              {recipe.protein_g && <span>{recipe.protein_g}g protein</span>}
            </div>
          )}
        </div>

        <button
          onClick={handleAddToShopping}
          className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
            added ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-500'
          }`}
        >
          {added ? '✓' : '+'}
        </button>
      </div>
    </div>
  );
}
