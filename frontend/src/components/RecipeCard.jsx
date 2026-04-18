import { useNavigate } from 'react-router-dom';
import { addRecipeToShopping } from '../api';
import { useState } from 'react';
import { getSmartTags } from '../utils/smartTags';

const TAG_PILL = {
  green:   'bg-emerald-50 text-emerald-700',
  blue:    'bg-blue-50 text-blue-700',
  purple:  'bg-violet-50 text-violet-700',
  emerald: 'bg-teal-50 text-teal-700',
  amber:   'bg-amber-50 text-amber-700',
};

function ClockIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3 shrink-0">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 5v3l1.8 1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function RecipeCard({ recipe, index = 0 }) {
  const navigate  = useNavigate();
  const [added,   setAdded]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const totalTime  = (recipe.prep_time_min || 0) + (recipe.cook_time_min || 0);
  const smartTags  = getSmartTags(recipe).slice(0, 2);

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
      className="card-enter bg-surface rounded-xl cursor-pointer overflow-hidden flex flex-col transition-all duration-200"
      style={{
        animationDelay: `${index * 50}ms`,
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent top bar */}
      <div className="h-[2px] bg-accent" />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3 className="font-display font-semibold text-ink leading-snug line-clamp-2" style={{ fontSize: '15px' }}>
          {recipe.title}
        </h3>

        {/* Tags */}
        {smartTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {smartTags.map(t => (
              <span key={t.key} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${TAG_PILL[t.color] || TAG_PILL.amber}`}>
                {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-[12px] text-ink-4">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <ClockIcon />{totalTime}m
              </span>
            )}
            {recipe.calories && (
              <>
                {totalTime > 0 && <span>·</span>}
                <span>{recipe.calories} kcal</span>
              </>
            )}
            {recipe.protein_g && (
              <>
                <span>·</span>
                <span>{recipe.protein_g}g</span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToShopping}
            title={added ? 'Added!' : 'Add to shopping list'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 shrink-0 border"
            style={{
              backgroundColor: added ? '#F0FDF4' : 'transparent',
              color:            added ? '#16A34A'  : '#A1A1AA',
              borderColor:      added ? '#BBF7D0'  : '#E4E4E7',
            }}
            onMouseEnter={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = '#FFF3EE';
                e.currentTarget.style.color = '#FF5500';
                e.currentTarget.style.borderColor = '#FFD0B8';
              }
            }}
            onMouseLeave={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1AA';
                e.currentTarget.style.borderColor = '#E4E4E7';
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
