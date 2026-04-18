import { useState, useEffect, useCallback } from 'react';
import { getRecipes } from '../api';
import ExtractForm from './ExtractForm';
import RecipeCard from './RecipeCard';
import { SMART_TAGS, getSmartTags } from '../utils/smartTags';

const TAG_ACTIVE = {
  green:   'bg-green-500 text-white',
  blue:    'bg-sky-500 text-white',
  purple:  'bg-violet-500 text-white',
  emerald: 'bg-emerald-500 text-white',
  amber:   'bg-amber-500 text-white',
};
const TAG_IDLE = {
  green:   'bg-green-100 text-green-700 hover:bg-green-200',
  blue:    'bg-sky-100 text-sky-700 hover:bg-sky-200',
  purple:  'bg-violet-100 text-violet-700 hover:bg-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  amber:   'bg-amber-100 text-amber-700 hover:bg-amber-200',
};

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = query ? { q: query } : {};
      const data = await getRecipes(params);
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
      <ExtractForm onExtracted={fetchRecipes} />

      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm placeholder:text-gray-400"
        />

        {availableFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableFilters.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveFilter(activeFilter === t.key ? '' : t.key)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  activeFilter === t.key ? TAG_ACTIVE[t.color] : TAG_IDLE[t.color]
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-300 text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {query || activeFilter ? 'No recipes match.' : 'Paste a link above to add your first recipe.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(r => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
