import { useState, useEffect, useCallback } from 'react';
import { getRecipes } from '../api';
import ExtractForm from './ExtractForm';
import RecipeCard from './RecipeCard';
import { SMART_TAGS, getSmartTags } from '../utils/smartTags';

const FILTER_ACTIVE = {
  green:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  blue:    'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  purple:  'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  emerald: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
  amber:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
};
const FILTER_IDLE = {
  green:   'bg-transparent text-ink-2 border border-border hover:border-emerald-500/30 hover:text-emerald-400',
  blue:    'bg-transparent text-ink-2 border border-border hover:border-blue-500/30 hover:text-blue-400',
  purple:  'bg-transparent text-ink-2 border border-border hover:border-violet-500/30 hover:text-violet-400',
  emerald: 'bg-transparent text-ink-2 border border-border hover:border-teal-500/30 hover:text-teal-400',
  amber:   'bg-transparent text-ink-2 border border-border hover:border-amber-500/30 hover:text-amber-400',
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

      {/* Import hero card */}
      <div
        className="rounded-xl p-6 border border-border relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111113 0%, #16181E 100%)' }}
      >
        {/* Glow */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,85,0,0.4), transparent)' }}
        />
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,85,0,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-1">
            Import a recipe
          </p>
          <p className="text-sm text-ink-2 mb-4">
            Paste any TikTok or Instagram link — AI extracts the full recipe instantly.
          </p>
          <ExtractForm onExtracted={fetchRecipes} />
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none">
            <circle cx="7.5" cy="7.5" r="5.5" />
            <path d="M13 13l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your recipes…"
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink-2 text-lg leading-none"
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
                  className={`text-[11px] px-3 py-1 rounded-full font-semibold transition-all ${active ? FILTER_ACTIVE[t.color] : FILTER_IDLE[t.color]}`}
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
        <div className="flex items-center justify-center py-20 gap-2 text-ink-3 text-sm">
          <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display font-bold text-2xl text-ink-3 mb-2">
            {query || activeFilter ? 'No matches' : 'No recipes yet'}
          </p>
          <p className="text-sm text-ink-3">
            {query || activeFilter
              ? 'Try a different search or clear the filter.'
              : 'Import your first recipe above.'}
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
