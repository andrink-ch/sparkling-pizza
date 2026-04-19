import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractRecipe, extractRecipeText } from '../api';

export default function ExtractForm({ onExtracted }) {
  const [url,      setUrl]      = useState('');
  const [text,     setText]     = useState('');
  const [showText, setShowText] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const recipe = showText
        ? await extractRecipeText(text.trim(), url.trim())
        : await extractRecipe(url.trim());
      setUrl(''); setText('');
      onExtracted?.();
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not extract recipe');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && (showText ? text.trim().length >= 10 : url.trim().length > 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">

      {!showText ? (
        /* ── URL input ── */
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste TikTok or Instagram link here…"
            disabled={loading}
            autoFocus
            className="flex-1 bg-bg border-2 border-border rounded-xl px-4 py-3.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!canSubmit}
            className="shrink-0 bg-accent hover:bg-accent-dark disabled:opacity-40 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all"
            style={{ boxShadow: canSubmit ? '0 0 20px rgba(255,85,0,0.3)' : 'none' }}
          >
            {loading ? '…' : 'Go'}
          </button>
        </div>
      ) : (
        /* ── Text paste ── */
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste the recipe description or caption from TikTok here…"
            disabled={loading}
            rows={5}
            autoFocus
            className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-all disabled:opacity-50 resize-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="Source URL (optional)"
              disabled={loading}
              className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSubmit}
              className="shrink-0 bg-accent hover:bg-accent-dark disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ boxShadow: canSubmit ? '0 0 20px rgba(255,85,0,0.3)' : 'none' }}
            >
              {loading ? '…' : 'Analyse'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-xs text-ink-3">
          <svg className="animate-spin w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Analysing with AI — takes ~10 seconds…
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-950/50 border border-red-800/50 text-sm text-red-400 leading-relaxed">
          {error}
          {!showText && (
            <button
              type="button"
              onClick={() => { setShowText(true); setError(''); }}
              className="block mt-1.5 text-xs text-accent hover:underline font-semibold"
            >
              Try pasting the description instead →
            </button>
          )}
        </div>
      )}

      {/* Toggle */}
      {!error && (
        <button
          type="button"
          onClick={() => { setShowText(v => !v); setError(''); }}
          className="text-[11px] text-ink-3 hover:text-ink-2 transition-colors text-left"
        >
          {showText ? '← Back to link input' : 'Link not working? Paste the recipe text instead'}
        </button>
      )}
    </form>
  );
}
