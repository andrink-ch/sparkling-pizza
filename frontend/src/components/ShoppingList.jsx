import { useEffect, useState } from 'react';
import { getShoppingList, updateShoppingItem, deleteShoppingItem, clearShoppingList } from '../api';

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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xs h-full flex flex-col shadow-2xl">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Shopping List</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="text-center text-gray-300 text-sm py-10">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Nothing here yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {unchecked.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {unchecked.map(item => (
                    <li key={item.id} className="flex items-center gap-3 py-2 group">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => toggleChecked(item)}
                        className="accent-orange-500 w-4 h-4 shrink-0 cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-gray-800">{formatItem(item)}</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {checked.length > 0 && (
                <div>
                  <p className="text-xs text-gray-300 uppercase tracking-wider mb-2">Done</p>
                  <ul className="flex flex-col gap-0.5">
                    {checked.map(item => (
                      <li key={item.id} className="flex items-center gap-3 py-2 group opacity-40">
                        <input
                          type="checkbox"
                          checked={true}
                          onChange={() => toggleChecked(item)}
                          className="accent-orange-500 w-4 h-4 shrink-0 cursor-pointer"
                        />
                        <span className="flex-1 text-sm line-through text-gray-500">{formatItem(item)}</span>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-base leading-none"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleClear}
              className="w-full text-xs text-gray-400 hover:text-red-500 py-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
