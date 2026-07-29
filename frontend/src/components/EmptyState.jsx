import React from 'react';

export default function EmptyState({ title, description, action }) {
  return (
    <div className="card-flat flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-hover)] text-[var(--color-text-faint)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h18M3 12h18M3 17h10" />
        </svg>
      </div>
      <div className="text-base font-semibold text-[var(--color-text)]">{title}</div>
      {description && <p className="max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>}
      {action}
    </div>
  );
}