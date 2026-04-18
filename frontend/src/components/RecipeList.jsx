import { useState, useEffect, useCallback } from 'react';
import { getRecipes } from '../api';
import ExtractForm from './ExtractForm';
import RecipeCard from './RecipeCard';
import { SMART_TAGS, getSmartTags } from '../utils/smartTags';

const FILTER_STYLES = {
  green:   { active: { bg: '#4A7A5C', text: '#fff' }, idle: { bg: '#D4E7DB', text: '#2A5439' } },
  blue:    { active: { bg: '#3A5A8C', text: '#fff' }, idle: { bg: '#D4E0EE', text: '#2A3F6B' } },
  purple:  { active: { bg: '#6A3A9C', text: '#fff' }, idle: { bg: '#E4D8F0', text: '#4A2A6B' } },
  emerald: { active: { bg: '#2E6B4A', text: '#fff' }, idle: { bg: '#D2EADE', text: '#1E5438' } },
  amber:   { active: { bg: '#8B5A10', text: '#fff' }, idle: { bg: '#EEE0C2', text: '#6B4A10' } },
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="7.5" cy="7.5" r="5.5" />
      <path d="M13 13l3 3" strokeLinecap="round" />
    </svg>
  );
}

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRecipes(query ? { q: query } : {});
      setRecipes(data);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const filtered = activeFilter
    ? recipes.filter(r => getSmartTags(r).some(t => t.key === activeFilter))
    : recipes;

  const availableFilters = SMART_TAGS.filter(t => recipes.some(r => t.fn(r)));

  return (
    <div className="flex flex-col gap-8">
      <ExtractForm onExtracted={fetchRecipes} />

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recipes…"
            className="w-full bg-surface rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-light focus:outline-none transition-all duration-200"
            style={{ border: '1px solid #E2D5BE' }}
            onFocus={e => {
              e.target.style.borderColor = '#C4592A';
              e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E2D5BE';
              e.target.style.boxShadow = 'none';
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-muted text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {availableFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableFilters.map(t => {
              const isActive = activeFilter === t.key;
              const s = FILTER_STYLES[t.color] || FILTER_STYLES.amber;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveFilter(isActive ? '' : t.key)}
                  className="text-[11px] px-3 py-1 rounded-full font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? s.active.bg : s.idle.bg,
                    color: isActive ? s.active.text : s.idle.text,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-ink-light text-sm">
          <svg className="animate-spin w-4 h-4 text-terra" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-3xl text-ink-light italic mb-2">
            {query || activeFilter ? 'No matches' : 'Nothing here yet'}
          </p>
          <p className="text-sm text-muted">
            {query || activeFilter
              ? 'Try a different search or filter.'
              : 'Paste a TikTok or Instagram link above to import your first recipe.'}
          </p>
        </div>
      ) : (
        <>
          {(query || activeFilter) && (
            <p className="text-xs text-muted -mb-5">
              {filtered.length} {filtered.length === 1 ? 'recipe' : 'recipes'}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
