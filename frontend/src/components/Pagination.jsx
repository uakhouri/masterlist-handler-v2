import React from 'react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
      <button
        className="btn-secondary"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        Prev
      </button>
      <span className="text-sm text-[var(--color-text-muted)]">
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
}
