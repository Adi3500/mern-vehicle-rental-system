const getPages = (current, total) => {
  const windowSize = 5;
  const start = Math.max(1, current - Math.floor(windowSize / 2));
  const end = Math.min(total, start + windowSize - 1);
  const adjustedStart = Math.max(1, end - windowSize + 1);
  return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
};

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const pages = getPages(pagination.page, pagination.totalPages);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        className="button button--ghost button--sm"
        type="button"
        disabled={!pagination.hasPrevPage}
        onClick={() => onPageChange(pagination.page - 1)}
      >
        &larr; Prev
      </button>

      <div className="pagination__numbers">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`pagination__number${page === pagination.page ? ' is-active' : ''}`}
            onClick={() => onPageChange(page)}
            aria-current={page === pagination.page ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        className="button button--ghost button--sm"
        type="button"
        disabled={!pagination.hasNextPage}
        onClick={() => onPageChange(pagination.page + 1)}
      >
        Next &rarr;
      </button>
    </nav>
  );
}