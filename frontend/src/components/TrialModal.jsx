import React, { useEffect, useRef } from 'react';
import { getTrialUrl } from '../utils/trialUrl';

export default function TrialModal({ trial, onClose }) {
  const closeRef = useRef(null);
  const trialUrl = trial ? getTrialUrl(trial) : null;

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
        className="card max-h-[85vh] w-full max-w-3xl overflow-y-auto p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge">{trial.nct}</span>
              {trial.phase && <span className="badge">{trial.phase}</span>}
              {trial.study_type && <span className="badge">{trial.study_type}</span>}
            </div>
            <h2 id="trial-modal-title" className="mt-3 text-xl font-semibold leading-snug text-[var(--color-text)]">
              {trial.title || 'Untitled trial'}
            </h2>
            <div className="mt-2 text-sm text-[var(--color-text-muted)]">
              Sponsor: {trial.sponsor || 'N/A'}
            </div>
            {trialUrl && (
              <a
                href={trialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
              >
                View on ClinicalTrials.gov &rarr;
              </a>
            )}
          </div>
          <button ref={closeRef} className="btn-secondary h-fit shrink-0" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Locations</h3>
            {trial.location?.length ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                {trial.location.map((loc, idx) => (
                  <li key={idx}>{loc}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">No locations captured for this trial.</p>
            )}
          </section>

          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Inclusion criteria</h3>
            {trial.inclusion_criteria?.length ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                {trial.inclusion_criteria.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Not specified.</p>
            )}
          </section>

          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Exclusion criteria</h3>
            {trial.exclusion_criteria?.length ? (
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                {trial.exclusion_criteria.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-text-muted)]">Not specified.</p>
            )}
          </section>
        </div>

        <div className="mt-5 text-xs text-[var(--color-text-faint)]">
          Data imported from clinicaltrials.gov using NCT: {trial.nct}
        </div>
      </div>
    </div>
  );
}