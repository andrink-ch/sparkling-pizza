import { useEffect, useState } from 'react';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, clearShoppingList } from '../api';

export default function ShoppingList({ onClose }) {
  const [items,   setItems]   = useState([]);
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
    if (item.unit)     parts.push(item.unit);
    return parts.length ? `${parts.join(' ')} ${item.ingredient_name}` : item.ingredient_name;
  }

  const unchecked = items.filter(i => !i.checked);
  const checked   = items.filter(i => i.checked);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      <div className="relative flex flex-col w-full max-w-[300px] h-full animate-slide-right bg-surface border-l border-border shadow-modal">
        {/* Top accent line */}
        <div className="h-[2px] bg-accent shrink-0" />

        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-display font-bold text-ink text-lg">Shopping list</h2>
            {!loading && items.length > 0 && (
              <p className="text-xs text-ink-3 mt-0.5">{unchecked.length} remaining</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surf2 transition-colors text-xl">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-ink-3 text-sm">
              <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display font-bold text-xl text-ink-3 mb-1">Empty</p>
              <p className="text-xs text-ink-3">Add recipes from the main list</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {unchecked.length > 0 && (
                <ul className="flex flex-col divide-y divide-border">
                  {unchecked.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-2.5 group">
                      <input type="checkbox" checked={false} onChange={() => toggleChecked(item)} className="w-4 h-4 shrink-0 cursor-pointer rounded" />
                      <span className="flex-1 text-sm text-ink-2">{formatItem(item)}</span>
                      <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-3 hover:text-red-500 text-base leading-none">×</button>
                    </li>
                  ))}
                </ul>
              )}
              {checked.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 mb-2">Done</p>
                  <ul className="flex flex-col divide-y divide-border">
                    {checked.map(item => (
                      <li key={item.id} className="flex items-center gap-3 py-2.5 group opacity-35">
                        <input type="checkbox" checked={true} onChange={() => toggleChecked(item)} className="w-4 h-4 shrink-0 cursor-pointer" />
                        <span className="flex-1 text-sm text-ink-3 line-through">{formatItem(item)}</span>
                        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-3 hover:text-red-500 text-base leading-none">×</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-border shrink-0">
            <button onClick={handleClear} className="w-full text-xs py-2 rounded-lg text-ink-3 hover:text-red-500 hover:bg-red-950/30 transition-colors font-medium">
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
