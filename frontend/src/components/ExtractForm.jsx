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
      {loading && (
        <div className="flex items-center gap-3 mb-4 px-1">
          <svg className="animate-spin w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          <span className="text-sm text-ink-2">Extracting recipe — this takes ~10 seconds…</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a TikTok or Instagram link…"
          disabled={loading}
          className="flex-1 bg-surf2 border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-accent hover:bg-accent-dark disabled:opacity-40 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap"
          style={{ boxShadow: (!loading && url.trim()) ? '0 0 20px rgba(255,85,0,0.25)' : 'none' }}
        >
          {loading ? (
            'Importing…'
          ) : (
            <>
              Import
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
                <path d="M4 9h10M9 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="mt-3 px-4 py-3 rounded-lg bg-red-950/50 border border-red-800/50 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
