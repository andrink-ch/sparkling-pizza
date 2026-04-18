export default function SearchBar({ query, onQueryChange, selectedTag, onTagChange, tags }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <input
        type="text"
        value={query}
        onChange={e => onQueryChange(e.target.value)}
        placeholder="Search recipes or ingredients..."
        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <select
        value={selectedTag}
        onChange={e => onTagChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
      >
        <option value="">All tags</option>
        {tags.map(t => (
          <option key={t.id} value={t.name}>
            {t.name} ({t.recipe_count})
          </option>
        ))}
      </select>
    </div>
  );
}
