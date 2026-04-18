import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractRecipe } from '../api';

export default function ExtractForm({ onExtracted }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setError(err.response?.data?.error || err.message || 'Extraction failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Paste a TikTok or Instagram link…"
          disabled={loading}
          className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 shadow-sm placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-5 py-3 rounded-2xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500 px-1">{error}</p>}
    </form>
  );
}
