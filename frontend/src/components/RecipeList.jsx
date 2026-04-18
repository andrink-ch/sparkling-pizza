import { useState, useEffect, useCallback } from 'react';
import { getRecipes } from '../api';
import ExtractForm from './ExtractForm';
import RecipeCard from './RecipeCard';
import { SMART_TAGS, getSmartTags } from '../utils/smartTags';

const FILTER_ACTIVE = {
  green:   'bg-emerald-600 text-white',
  blue:    'bg-blue-600 text-white',
  purple:  'bg-violet-600 text-white',
  emerald: 'bg-teal-600 text-white',
  amber:   'bg-amber-500 text-white',
};
const FILTER_IDLE = {
  green:   'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  blue:    'bg-blue-50 text-blue-700 hover:bg-blue-100',
  purple:  'bg-violet-50 text-violet-700 hover:bg-violet-100',
  emerald: 'bg-teal-50 text-teal-700 hover:bg-teal-100',
  amber:   'bg-amber-50 text-amber-700 hover:bg-amber-100',
};

export default function RecipeList() {
  const [recipes,      setRecipes]      = useState([]);
  const [query,        setQuery]        = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading,      setLoading]      = useState(true);

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
    <div className="flex flex-col gap-6">
      {/* Import form */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-4 mb-3">
          Import recipe
        </p>
        <ExtractForm onExtracted={fetchRecipes} />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-4 pointer-events-none">
            <circle cx="7.5" cy="7.5" r="5.5" />
            <path d="M13 13l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search recipes…"
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-3 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {availableFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableFilters.map(t => {
              const active = activeFilter === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveFilter(active ? '' : t.key)}
                  className={`text-[11px] px-3 py-1 rounded-full font-semibold transition-colors ${active ? FILTER_ACTIVE[t.color] : FILTER_IDLE[t.color]}`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-ink-4 text-sm">
          <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl font-semibold text-ink-4 mb-2">
            {query || activeFilter ? 'No matches' : 'No recipes yet'}
          </p>
          <p className="text-sm text-ink-4">
            {query || activeFilter
              ? 'Try a different search or filter.'
              : 'Paste a TikTok or Instagram link above to import your first recipe.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
