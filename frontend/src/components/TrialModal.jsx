import React, { useEffect, useRef } from 'react';

export default function TrialModal({ trial, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (trial) closeRef.current?.focus();
  }, [trial]);

  useEffect(() => {
    if (!trial) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [trial, onClose]);

  if (!trial) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[80vh] w-full max-w-3xl overflow-y-auto p-6"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 60%), var(--color-surface-elevated)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-[var(--color-text-muted)]">{trial.nct}</div>
            <h2 id="trial-modal-title" className="mt-1 mb-2 text-lg font-semibold">
              {trial.title}
            </h2>
            <div className="text-sm text-[var(--color-text-muted)]">
              Phase: {trial.phase || 'N/A'} &middot; Study type: {trial.study_type || 'N/A'}
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Sponsor: {trial.sponsor || 'N/A'}
            </div>
          </div>
          <button ref={closeRef} className="btn-secondary h-fit shrink-0" onClick={onClose}>
            Close
          </button>
        </div>

        <hr className="my-3 border-[var(--color-border-subtle)]" />

        <section className="mb-4">
          <h3 className="mb-1 text-sm font-semibold">Locations</h3>
          {trial.location?.length ? (
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {trial.location.map((loc, idx) => (
                <li key={idx}>{loc}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">No locations captured for this trial.</p>
          )}
        </section>

        <section className="mb-4">
          <h3 className="mb-1 text-sm font-semibold">Inclusion criteria</h3>
          {trial.inclusion_criteria?.length ? (
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {trial.inclusion_criteria.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Not specified.</p>
          )}
        </section>

        <section className="mb-2">
          <h3 className="mb-1 text-sm font-semibold">Exclusion criteria</h3>
          {trial.exclusion_criteria?.length ? (
            <ul className="list-disc space-y-0.5 pl-5 text-sm">
              {trial.exclusion_criteria.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Not specified.</p>
          )}
        </section>

        <div className="text-xs text-[var(--color-text-muted)]">
          Data imported from clinicaltrials.gov using NCT: {trial.nct}
        </div>
      </div>
    </div>
  );
}
