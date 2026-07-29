import React from 'react';

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
      <button
        className="icon-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <span className="badge">
        Page {page} of {pages}
      </span>
      <button
        className="icon-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </nav>
  );
}
