import React from 'react';

export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[var(--color-accent-strong)] p-9 lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2), transparent 45%)'
            }}
          />
          <div className="relative">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white">
              CT
            </span>
            <h2 className="mt-8 text-2xl font-bold leading-snug text-white">
              Curate clinical trial masterlists, without the busywork.
            </h2>
            <p className="mt-3 text-sm text-white/80">
              Pull trials straight from ClinicalTrials.gov, keep only the sites
              that matter, and export a clean summary whenever you need one.
            </p>
          </div>
          <p className="relative text-xs text-white/60">CT Masterlist Portal</p>
        </div>

        <div className="bg-[var(--color-surface-elevated)] p-8 sm:p-10">
          {eyebrow && (
            <span className="badge-accent mb-4">{eyebrow}</span>
          )}
          <h1 className="text-xl font-semibold text-[var(--color-text)]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
