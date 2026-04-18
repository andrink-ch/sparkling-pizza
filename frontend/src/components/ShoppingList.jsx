import { useEffect, useState } from 'react';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, clearShoppingList } from '../api';

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
      <path d="M2 4h12M5 4V3h6v1M6 7v5M10 7v5M3 4l1 9h8l1-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ShoppingList({ onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try { setItems(await getShoppingList()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function toggleChecked(item) {
    const updated = await updateShoppingItem(item.id, { checked: !item.checked });
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  }

  async function handleDelete(id) {
    await deleteShoppingItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function handleClear() {
    if (!window.confirm('Clear entire shopping list?')) return;
    await clearShoppingList();
    setItems([]);
  }

  function formatItem(item) {
    const parts = [];
    if (item.quantity) parts.push(item.quantity);
    if (item.unit) parts.push(item.unit);
    return parts.length > 0 ? `${parts.join(' ')} ${item.ingredient_name}` : item.ingredient_name;
  }

  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(26,18,8,0.35)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      <div
        className="relative flex flex-col w-full max-w-[320px] h-full animate-slide-right"
        style={{ backgroundColor: '#1C2B1A' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div>
            <h2
              className="font-display text-xl font-semibold"
              style={{ color: '#F5EED8' }}
            >
              Shopping List
            </h2>
            {!loading && items.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(245,238,216,0.4)' }}>
                {unchecked.length} remaining
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(245,238,216,0.5)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#F5EED8';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(245,238,216,0.5)';
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-sm" style={{ color: 'rgba(245,238,216,0.35)' }}>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-2xl italic mb-1" style={{ color: 'rgba(245,238,216,0.25)' }}>
                Empty
              </p>
              <p className="text-xs" style={{ color: 'rgba(245,238,216,0.25)' }}>
                Add recipes from the main list
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {unchecked.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {unchecked.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-2 group rounded-lg px-1 -mx-1 transition-colors">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleChecked(item)}
                        className="w-4 h-4 shrink-0 cursor-pointer rounded"
                        style={{ accentColor: '#C4592A' }}
                      />
                      <span className="flex-1 text-sm" style={{ color: '#F5EED8' }}>
                        {formatItem(item)}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'rgba(245,238,216,0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#C4592A'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,238,216,0.3)'; }}
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {checked.length > 0 && (
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.12em] font-medium mb-2"
                    style={{ color: 'rgba(245,238,216,0.3)' }}
                  >
                    Done
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {checked.map(item => (
                      <li key={item.id} className="flex items-center gap-3 py-2 group rounded-lg px-1 -mx-1 opacity-40">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleChecked(item)}
                          className="w-4 h-4 shrink-0 cursor-pointer"
                          style={{ accentColor: '#C4592A' }}
                        />
                        <span
                          className="flex-1 text-sm line-through"
                          style={{ color: 'rgba(245,238,216,0.6)' }}
                        >
                          {formatItem(item)}
                        </span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'rgba(245,238,216,0.3)' }}
                        >
                          <TrashIcon />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={handleClear}
              className="w-full text-xs py-2 rounded-lg transition-colors font-medium"
              style={{ color: 'rgba(245,238,216,0.35)' }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(196,89,42,0.15)';
                e.currentTarget.style.color = '#EBB898';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(245,238,216,0.35)';
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
