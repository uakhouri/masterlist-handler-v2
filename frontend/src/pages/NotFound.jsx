import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-[var(--color-text-muted)]">This page doesn&apos;t exist.</p>
      <Link to="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
