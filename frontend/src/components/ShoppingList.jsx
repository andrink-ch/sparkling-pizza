import { useEffect, useState, useRef } from 'react';
import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, clearShoppingList } from '../api';

function parseInput(raw) {
  const str = raw.trim();
  // Try to match "2 cups flour" or "200g chicken" or just "milk"
  const m = str.match(/^([\d.,/]+)\s*([a-zA-Z]+)?\s+(.+)$/) ||
            str.match(/^([\d.,/]+)([a-zA-Z]+)\s+(.+)$/);
  if (m) return { quantity: parseFloat(m[1]) || null, unit: m[2] || null, name: m[3] };
  return { quantity: null, unit: null, name: str };
}

export default function ShoppingList() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [input,   setInput]   = useState('');
  const [adding,  setAdding]  = useState(false);
  const inputRef = useRef(null);

  async function load() {
    setLoading(true);
    try { setItems(await getShoppingList()); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setAdding(true);
    try {
      const { quantity, unit, name } = parseInput(val);
      const item = await addShoppingItem(name, quantity, unit);
      setItems(prev => prev.some(i => i.id === item.id) ? prev : [item, ...prev]);
      setInput('');
      inputRef.current?.focus();
    } catch {}
    finally { setAdding(false); }
  }

  async function toggleChecked(item) {
    const updated = await updateShoppingItem(item.id, { checked: !item.checked });
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  }

  async function handleDelete(id) {
    await deleteShoppingItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function handleClear() {
    if (!window.confirm('Clear the entire shopping list?')) return;
    await clearShoppingList();
    setItems([]);
  }

  function fmtItem(item) {
    const parts = [];
    if (item.quantity) parts.push(item.quantity % 1 === 0 ? item.quantity : Number(item.quantity).toFixed(1));
    if (item.unit) parts.push(item.unit);
    return { prefix: parts.join(' '), name: item.ingredient_name };
  }

  const unchecked = items.filter(i => !i.checked);
  const checked   = items.filter(i =>  i.checked);

  return (
    <div className="max-w-xl mx-auto animate-slide-up">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-accent mb-2">Shopping list</p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-display font-bold text-3xl text-ink leading-tight">
            {loading ? 'Loading…' : unchecked.length === 0 && items.length === 0
              ? 'Nothing yet'
              : `${unchecked.length} item${unchecked.length !== 1 ? 's' : ''} to buy`}
          </h1>
          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-ink-3 hover:text-red-400 transition-colors font-medium pb-1 shrink-0"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Add item input */}
      <form onSubmit={handleAdd} className="mb-8">
        <div
          className="flex gap-0 rounded-xl overflow-hidden border-2 transition-all duration-150 focus-within:border-accent"
          style={{ borderColor: '#1F2028', backgroundColor: '#111113' }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Add an item — e.g. &quot;2 cups flour&quot; or &quot;milk&quot;"
            disabled={adding}
            className="flex-1 bg-transparent px-5 py-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding || !input.trim()}
            className="px-5 text-sm font-bold text-white bg-accent hover:bg-accent-dark disabled:opacity-40 transition-colors shrink-0"
          >
            {adding ? '…' : '+ Add'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-ink-3">
          You can type quantities too — e.g. "200g chicken" or "3 eggs"
        </p>
      </form>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-2 text-ink-3 text-sm">
          <svg className="animate-spin w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🛒</p>
          <p className="font-display font-bold text-xl text-ink-3 mb-1">Your list is empty</p>
          <p className="text-sm text-ink-3">Add items above or import from a recipe.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* To buy */}
          {unchecked.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 mb-3">To buy</p>
              <ul className="flex flex-col gap-1">
                {unchecked.map(item => {
                  const { prefix, name } = fmtItem(item);
                  return (
                    <li
                      key={item.id}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl border border-transparent hover:border-border hover:bg-surface transition-all duration-150"
                    >
                      <button
                        onClick={() => toggleChecked(item)}
                        className="shrink-0 w-5 h-5 rounded-full border-2 border-border hover:border-accent transition-colors flex items-center justify-center"
                      />
                      <span className="flex-1 text-sm text-ink min-w-0">
                        {prefix && <span className="font-semibold text-accent mr-1.5">{prefix}</span>}
                        <span className="capitalize">{name}</span>
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-red-400 transition-all text-lg leading-none shrink-0"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Done */}
          {checked.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-3 mb-3">Done</p>
              <ul className="flex flex-col gap-1">
                {checked.map(item => {
                  const { prefix, name } = fmtItem(item);
                  return (
                    <li
                      key={item.id}
                      className="group flex items-center gap-4 px-4 py-3.5 rounded-xl opacity-40 hover:opacity-60 transition-opacity"
                    >
                      <button
                        onClick={() => toggleChecked(item)}
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: '#22C55E' }}
                      >
                        ✓
                      </button>
                      <span className="flex-1 text-sm text-ink-3 line-through min-w-0 capitalize">
                        {prefix && <span className="mr-1.5">{prefix}</span>}
                        {name}
                      </span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-ink-3 hover:text-red-400 transition-all text-lg leading-none shrink-0"
                      >
                        ×
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
