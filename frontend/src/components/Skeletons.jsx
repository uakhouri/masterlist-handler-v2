import React from 'react';

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="skeleton mb-2 h-4 w-1/3" />
          <div className="skeleton mb-2 h-3 w-1/4" />
          <div className="skeleton h-3 w-1/5" />
        </div>
      ))}
    </div>
  );
}
