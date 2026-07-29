import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import axiosClient, { extractErrorMessage } from '../api/axiosClient';

function linesToArray(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(arr) {
  return (arr || []).join('\n');
}

export default function EditTrialModal({ masterlistId, trial, onClose, onSaved }) {
  const firstFieldRef = useRef(null);
  const [form, setForm] = useState(() => ({
    title: trial?.title || '',
    phase: trial?.phase || '',
    study_type: trial?.study_type || '',
    sponsor: trial?.sponsor || '',
    location: arrayToLines(trial?.location),
    inclusion_criteria: arrayToLines(trial?.inclusion_criteria),
    exclusion_criteria: arrayToLines(trial?.exclusion_criteria)
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!trial) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        phase: form.phase.trim(),
        study_type: form.study_type.trim(),
        sponsor: form.sponsor.trim(),
        location: linesToArray(form.location),
        inclusion_criteria: linesToArray(form.inclusion_criteria),
        exclusion_criteria: linesToArray(form.exclusion_criteria)
      };

      const res = await axiosClient.put(`/masterlists/${masterlistId}/trials/${trial.nct}`, payload);
      onSaved(res.data.data);
      toast.success('Trial updated');
      onClose();
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to update trial'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-trial-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[88vh] w-full max-w-2xl overflow-y-auto p-7 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex justify-between gap-4">
          <div>
            <span className="badge">{trial.nct}</span>
            <h2 id="edit-trial-title" className="mt-2 text-xl font-semibold text-[var(--color-text)]">
              Edit trial
            </h2>
          </div>
          <button className="btn-secondary h-fit shrink-0" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
              Overview
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="edit-title" className="field-label">
                  Title
                </label>
                <input
                  ref={firstFieldRef}
                  id="edit-title"
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="edit-sponsor" className="field-label">
                  Sponsor
                </label>
                <input
                  id="edit-sponsor"
                  name="sponsor"
                  type="text"
                  value={form.sponsor}
                  onChange={handleChange}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="edit-phase" className="field-label">
                  Phase
                </label>
                <input
                  id="edit-phase"
                  name="phase"
                  type="text"
                  value={form.phase}
                  onChange={handleChange}
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-study-type" className="field-label">
                  Study type
                </label>
                <input
                  id="edit-study-type"
                  name="study_type"
                  type="text"
                  value={form.study_type}
                  onChange={handleChange}
                  className="field"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <label htmlFor="edit-location" className="field-label">
              Locations <span className="normal-case text-[var(--color-text-faint)]">(one per line)</span>
            </label>
            <textarea
              id="edit-location"
              name="location"
              rows={3}
              value={form.location}
              onChange={handleChange}
              className="field resize-none"
            />
          </section>

          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <label htmlFor="edit-inclusion" className="field-label">
              Inclusion criteria <span className="normal-case text-[var(--color-text-faint)]">(one per line)</span>
            </label>
            <textarea
              id="edit-inclusion"
              name="inclusion_criteria"
              rows={4}
              value={form.inclusion_criteria}
              onChange={handleChange}
              className="field resize-none"
            />
          </section>

          <section className="rounded-lg bg-[var(--color-surface-muted)] p-4">
            <label htmlFor="edit-exclusion" className="field-label">
              Exclusion criteria <span className="normal-case text-[var(--color-text-faint)]">(one per line)</span>
            </label>
            <textarea
              id="edit-exclusion"
              name="exclusion_criteria"
              rows={4}
              value={form.exclusion_criteria}
              onChange={handleChange}
              className="field resize-none"
            />
          </section>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}