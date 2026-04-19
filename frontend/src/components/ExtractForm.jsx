import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractRecipe, extractRecipeText } from '../api';

const TAB = { link: 'link', text: 'text' };

export default function ExtractForm({ onExtracted }) {
  const [tab,     setTab]     = useState(TAB.link);
  const [url,     setUrl]     = useState('');
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let recipe;
      if (tab === TAB.link) {
        if (!url.trim()) return;
        recipe = await extractRecipe(url.trim());
      } else {
        if (!text.trim()) return;
        recipe = await extractRecipeText(text.trim(), url.trim());
      }
      setUrl(''); setText('');
      onExtracted?.();
      navigate(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not extract recipe');
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = !loading && (tab === TAB.link ? url.trim() : text.trim().length >= 10);

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex gap-0 mb-4 p-0.5 rounded-lg bg-bg border border-border w-fit">
        {[
          { key: TAB.link, icon: '↗', label: 'Link' },
          { key: TAB.text, icon: '✎', label: 'Paste text' },
        ].map(({ key, icon, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(''); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150"
              style={{
                backgroundColor: active ? '#FF5500' : 'transparent',
                color:           active ? '#fff'    : '#4A5568',
              }}
            >
              <span className="text-[13px] leading-none">{icon}</span>
              {label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {tab === TAB.link ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@…  or  instagram.com/reel/…"
              disabled={loading}
              autoFocus
              className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50 font-mono"
            />
            <SubmitBtn loading={loading} disabled={!canSubmit} />
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Paste the recipe text here — copy the description from TikTok, the caption, or any recipe text.\n\nExample:\n"Creamy pasta: 200g spaghetti, 100g pancetta, 2 eggs, 50g parmesan…"`}
              disabled={loading}
              rows={6}
              autoFocus
              className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50 resize-none leading-relaxed"
            />
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="Source URL (optional — for reference)"
                disabled={loading}
                className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-xs text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all disabled:opacity-50 font-mono"
              />
              <SubmitBtn loading={loading} disabled={!canSubmit} />
            </div>
          </>
        )}

        {loading && (
          <div className="flex items-center gap-2.5 px-1 pt-1">
            <svg className="animate-spin w-3.5 h-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span className="text-xs text-ink-3">Analysing with AI — this takes ~10 seconds…</span>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-950/50 border border-red-800/50 text-sm text-red-400 leading-relaxed">
            {error}
          </div>
        )}
      </form>

      {/* Hint for text mode */}
      {tab === TAB.text && !error && (
        <p className="mt-3 text-[11px] text-ink-3 leading-relaxed">
          <span className="text-accent font-semibold">Tip:</span> On TikTok, tap the video → tap the description → copy all text. Paste it here and AI will extract the full recipe.
        </p>
      )}
      {tab === TAB.link && !error && (
        <p className="mt-3 text-[11px] text-ink-3">
          If the link fails, switch to <button type="button" onClick={() => setTab(TAB.text)} className="text-accent hover:underline font-semibold">Paste text</button> and copy the video description manually.
        </p>
      )}
    </div>
  );
}

function SubmitBtn({ loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="bg-accent hover:bg-accent-dark disabled:opacity-40 text-white px-5 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
      style={{ boxShadow: !disabled ? '0 0 16px rgba(255,85,0,0.25)' : 'none' }}
    >
      {loading ? 'Analysing…' : (
        <>
          Analyse
          <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-3.5 h-3.5">
            <path d="M4 9h10M9 4l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </button>
  );
}
