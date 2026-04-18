import { useNavigate } from 'react-router-dom';
import { addRecipeToShopping } from '../api';
import { useState } from 'react';
import { getSmartTags } from '../utils/smartTags';

const TAG_PILL = {
  green:   'bg-emerald-500/15 text-emerald-400',
  blue:    'bg-blue-500/15 text-blue-400',
  purple:  'bg-violet-500/15 text-violet-400',
  emerald: 'bg-teal-500/15 text-teal-400',
  amber:   'bg-amber-500/15 text-amber-400',
};

export default function RecipeCard({ recipe, index = 0 }) {
  const navigate  = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const totalTime = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  const smartTags = getSmartTags(recipe).slice(0, 2);

  async function handleAddToShopping(e) {
    e.stopPropagation();
    try {
      await addRecipeToShopping(recipe.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch {}
  }

  return (
    <article
      onClick={() => navigate(`/recipes/${recipe.id}`)}
      className="card-enter rounded-xl cursor-pointer overflow-hidden flex flex-col transition-all duration-200"
      style={{
        animationDelay: `${index * 50}ms`,
        backgroundColor: '#111113',
        border: hovered ? '1px solid rgba(255,85,0,0.25)' : '1px solid #1F2028',
        boxShadow: hovered
          ? '0 4px 24px rgba(0,0,0,0.5), 0 0 0 0px rgba(255,85,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Orange top bar */}
      <div
        className="h-[2px] w-full transition-all duration-300"
        style={{ background: hovered ? 'linear-gradient(90deg, #FF5500, #FF8040)' : '#FF5500' }}
      />

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2" style={{ fontSize: '15px' }}>
          {recipe.title}
        </h3>

        {smartTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {smartTags.map(t => (
              <span key={t.key} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${TAG_PILL[t.color] || TAG_PILL.amber}`}>
                {t.label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-ink-3">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3">
                  <circle cx="8" cy="8" r="6.5" /><path d="M8 5v3l1.8 1.8" strokeLinecap="round" />
                </svg>
                {totalTime}m
              </span>
            )}
            {recipe.calories && <><span className="opacity-30">·</span><span>{recipe.calories} kcal</span></>}
            {recipe.protein_g && <><span className="opacity-30">·</span><span>{recipe.protein_g}g</span></>}
          </div>

          <button
            onClick={handleAddToShopping}
            title={added ? 'Added!' : 'Add to shopping list'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 shrink-0"
            style={{
              backgroundColor: added ? 'rgba(34,197,94,0.15)' : 'transparent',
              color:            added ? '#22C55E' : '#4A5568',
              border:           `1px solid ${added ? 'rgba(34,197,94,0.3)' : '#1F2028'}`,
            }}
            onMouseEnter={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = 'rgba(255,85,0,0.12)';
                e.currentTarget.style.color = '#FF5500';
                e.currentTarget.style.borderColor = 'rgba(255,85,0,0.3)';
              }
            }}
            onMouseLeave={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#4A5568';
                e.currentTarget.style.borderColor = '#1F2028';
              }
            }}
          >
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </article>
  );
}
