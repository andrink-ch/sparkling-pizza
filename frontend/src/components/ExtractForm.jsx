import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractRecipe } from '../api';

export default function ExtractForm({ onExtracted }) {
  const [url,     setUrl]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const recipe = await extractRecipe(url.trim());
      setUrl('');
      onExtracted?.();
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not extract recipe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a TikTok or Instagram link…"
          disabled={loading}
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-accent hover:bg-accent-dark disabled:opacity-40 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Importing…
            </>
          ) : (
            <>
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M4 9h10M9 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Import
            </>
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs mt-2 text-red-500 px-1">{error}</p>
      )}
    </div>
  );
}
