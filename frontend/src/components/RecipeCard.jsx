import { useNavigate } from 'react-router-dom';
import { addRecipeToShopping } from '../api';
import { useState } from 'react';
import { getSmartTags } from '../utils/smartTags';

const TAG_STYLES = {
  green:   { backgroundColor: '#D4E7DB', color: '#2A5439' },
  blue:    { backgroundColor: '#D4E0EE', color: '#2A3F6B' },
  purple:  { backgroundColor: '#E4D8F0', color: '#4A2A6B' },
  emerald: { backgroundColor: '#D2EADE', color: '#1E5438' },
  amber:   { backgroundColor: '#EEE0C2', color: '#6B4A10' },
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
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);
  const [hovering, setHovering] = useState(false);
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
      className="card-enter group cursor-pointer rounded-xl overflow-hidden flex flex-col transition-all duration-300"
      style={{
        animationDelay: `${index * 55}ms`,
        backgroundColor: '#FAF6EC',
        boxShadow: hovering
          ? '0 6px 24px rgba(26,18,8,0.13), 0 0 0 1px rgba(196,89,42,0.18)'
          : '0 1px 4px rgba(26,18,8,0.06), 0 0 0 1px rgba(226,213,190,0.8)',
        transform: hovering ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Terracotta accent strip */}
      <div
        className="h-[3px] w-full transition-all duration-300"
        style={{
          background: hovering
            ? 'linear-gradient(90deg, #C4592A, #D97A50)'
            : '#C4592A',
        }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Title */}
        <h3
          className="font-display leading-snug text-ink line-clamp-2"
          style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.01em' }}
        >
          {recipe.title}
        </h3>

        {/* Tags */}
        {smartTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-center gap-2.5 text-[12px] text-muted">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <ClockIcon />
                {totalTime}m
              </span>
            )}
            {recipe.calories && (
              <>
                {totalTime > 0 && <span className="opacity-30">·</span>}
                <span>{recipe.calories} kcal</span>
              </>
            )}
            {recipe.protein_g && (
              <>
                <span className="opacity-30">·</span>
                <span>{recipe.protein_g}g</span>
              </>
            )}
          </div>

          <button
            onClick={handleAddToShopping}
            title={added ? 'Added!' : 'Add to shopping list'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 shrink-0"
            style={{
              backgroundColor: added ? '#D4E7DB' : 'transparent',
              color: added ? '#2A5439' : '#B5A898',
              border: `1.5px solid ${added ? '#4A7A5C' : '#E2D5BE'}`,
            }}
            onMouseEnter={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = '#F5D9C8';
                e.currentTarget.style.color = '#C4592A';
                e.currentTarget.style.borderColor = '#C4592A';
              }
            }}
            onMouseLeave={e => {
              if (!added) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#B5A898';
                e.currentTarget.style.borderColor = '#E2D5BE';
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
