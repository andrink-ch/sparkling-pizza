export default function TagBadge({ tag, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      {tag.name}
      {onRemove && (
        <button
          onClick={() => onRemove(tag)}
          className="text-gray-400 hover:text-gray-600 leading-none"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
