import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractRecipe } from '../api';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 10h12M10 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

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
      setError(err.response?.data?.error || err.message || 'Could not extract recipe');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-1">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted mb-2.5">
        Import from TikTok or Instagram
      </p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste a link…"
            disabled={loading}
            className="w-full bg-surface rounded-xl px-4 py-3 text-sm font-sans text-ink placeholder:text-ink-light focus:outline-none transition-all duration-200 disabled:opacity-50"
            style={{
              border: '1px solid #E2D5BE',
              boxShadow: '0 1px 3px rgba(26,18,8,0.04)',
            }}
            onFocus={e => {
              e.target.style.borderColor = '#C4592A';
              e.target.style.boxShadow = '0 0 0 3px rgba(196,89,42,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#E2D5BE';
              e.target.style.boxShadow = '0 1px 3px rgba(26,18,8,0.04)';
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="bg-terra hover:bg-terra-dark disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          style={{ boxShadow: '0 2px 8px rgba(196,89,42,0.3)' }}
        >
          {loading ? <SpinIcon /> : <ArrowIcon />}
          {loading ? 'Importing…' : 'Import'}
        </button>
      </form>

      {error && (
        <p className="text-xs mt-2 px-1" style={{ color: '#B83A1A' }}>
          {error}
        </p>
      )}
    </div>
  );
}
