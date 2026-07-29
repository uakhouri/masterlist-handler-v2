import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-3 text-center">
      <span className="badge-accent mb-2">404</span>
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}
