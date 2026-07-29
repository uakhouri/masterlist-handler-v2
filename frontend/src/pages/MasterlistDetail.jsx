import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient, { extractErrorMessage } from '../api/axiosClient';
import TrialModal from '../components/TrialModal';
import EditTrialModal from '../components/EditTrialModal';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import { getTrialUrl } from '../utils/trialUrl';

export default function MasterlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [masterlist, setMasterlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [nctInput, setNctInput] = useState('');
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [editingTrial, setEditingTrial] = useState(null);
  const [trialSearch, setTrialSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const loadMasterlist = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/masterlists/${id}`);
      setMasterlist(res.data.data);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to load masterlist'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTrials = async (e) => {
    e.preventDefault();
    if (!nctInput.trim()) return;

    setError('');
    setAdding(true);
    try {
      const raw = nctInput.split(',').map((s) => s.trim()).filter(Boolean);
      const body = raw.length === 1 ? { nct: raw[0] } : { ncts: raw };

      const res = await axiosClient.post(`/masterlists/${id}/trials`, body);
      setMasterlist(res.data.data);
      setNctInput('');

      const { added, skipped } = res.data.summary || {};
      if (added?.length) toast.success(`Added ${added.length} trial${added.length > 1 ? 's' : ''}`);
      if (skipped?.length) {
        toast.error(
          `Skipped: ${skipped.map((s) => `${s.nct} (${s.reason})`).join(', ')}`,
          { duration: 6000 }
        );
      }
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to add trial(s)'));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTrial = async (nct) => {
    const ok = await confirm({ title: `Remove trial ${nct}?`, confirmLabel: 'Remove' });
    if (!ok) return;

    try {
      const res = await axiosClient.delete(`/masterlists/${id}/trials/${nct}`);
      setMasterlist(res.data.data);
      toast.success('Trial removed');
    } catch (err) {
      console.error(err);
      toast.error(extractErrorMessage(err, 'Failed to remove trial'));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axiosClient.get(`/masterlists/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${masterlist.name.replace(/[^a-z0-9\-_]+/gi, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error(extractErrorMessage(err, 'Failed to export masterlist'));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteMasterlist = async () => {
    const ok = await confirm({
      title: 'Delete this masterlist?',
      description: 'This will permanently remove the masterlist and all its trials.',
      confirmLabel: 'Delete'
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/masterlists/${id}`);
      toast.success('Masterlist deleted');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(extractErrorMessage(err, 'Failed to delete masterlist'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-4 w-1/4" />
        <div className="card mt-4 h-32" />
      </div>
    );
  }

  if (!masterlist) {
    return (
      <EmptyState title="Masterlist not found" description={error || 'It may have been deleted.'} />
    );
  }

  const visibleTrials = trialSearch
    ? masterlist.trials.filter(
      (t) =>
        t.nct.toLowerCase().includes(trialSearch.toLowerCase()) ||
        (t.title || '').toLowerCase().includes(trialSearch.toLowerCase())
    )
    : masterlist.trials;

  return (
    <div>
      <Link to="/" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All masterlists
      </Link>

      <div className="page-header mt-2">
        <div>
          <h1 className="page-title">{masterlist.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="badge-accent">{masterlist.cancerType}</span>
            <span className="badge">
              {masterlist.trials?.length ?? 0} trial{masterlist.trials?.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <div className="flex h-fit shrink-0 gap-2">
          <button className="btn-secondary" onClick={handleExport} disabled={exporting}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            {exporting ? 'Exporting…' : 'Export to Word'}
          </button>
          <button className="btn-danger" onClick={handleDeleteMasterlist}>
            Delete
          </button>
        </div>
      </div>

      <section className="card mb-6 p-5 sm:p-6">
        <h2 className="mb-3 text-base font-semibold text-[var(--color-text)]">Add trial(s) by NCT ID</h2>
        <form onSubmit={handleAddTrials} className="flex flex-col gap-3">
          <textarea
            rows={2}
            placeholder="Enter NCT id or comma-separated NCT ids, e.g. NCT00001372, NCT01234567"
            value={nctInput}
            onChange={(e) => setNctInput(e.target.value)}
            className="field resize-none"
          />
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={adding}>
              {adding ? 'Adding…' : 'Add Trial(s)'}
            </button>
            {error && <div className="text-sm text-[var(--color-danger)]">{error}</div>}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-text)]">Trials in this masterlist</h2>
            {masterlist.trials?.length > 0 && (
              <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">
                Grouped by study type, then phase.
              </p>
            )}
          </div>
          {masterlist.trials?.length > 0 && (
            <div className="relative w-full max-w-xs">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Filter by NCT or title…"
                value={trialSearch}
                onChange={(e) => setTrialSearch(e.target.value)}
                className="field pl-9"
                aria-label="Filter trials"
              />
            </div>
          )}
        </div>

        {masterlist.trials?.length === 0 ? (
          <EmptyState title="No trials yet" description="Add some using NCT ids above." />
        ) : visibleTrials.length === 0 ? (
          <EmptyState title="No trials match your filter" />
        ) : (
          <ul className="space-y-4">
            {visibleTrials.map((t) => (
              <li key={t.nct} className="card p-5 hover:border-[var(--color-accent)]/40">
                <div className="flex justify-between gap-4">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setSelectedTrial(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTrial(t)}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="badge">{t.nct}</span>
                      {t.phase && <span className="badge">{t.phase}</span>}
                      {t.study_type && <span className="badge">{t.study_type}</span>}
                    </div>
                    <div className="mt-2 font-semibold leading-snug text-[var(--color-text)]">
                      {t.title || 'Untitled trial'}
                    </div>
                    <div className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                      Sponsor: {t.sponsor || 'N/A'}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-faint)]">
                      <span>
                        {t.location?.length
                          ? `${t.location.length} location${t.location.length > 1 ? 's' : ''} (Canada / Bethesda, MD)`
                          : 'No qualifying locations captured'}
                      </span>
                      {getTrialUrl(t) && (
                        <a
                          href={getTrialUrl(t)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-[var(--color-accent)] hover:underline"
                        >
                          View on ClinicalTrials.gov &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex h-fit shrink-0 flex-col items-stretch gap-2 self-center sm:flex-row">
                    <button
                      className="btn-secondary"
                      onClick={() => setEditingTrial(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteTrial(t.nct)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedTrial && <TrialModal trial={selectedTrial} onClose={() => setSelectedTrial(null)} />}
      {editingTrial && (
        <EditTrialModal
          masterlistId={id}
          trial={editingTrial}
          onClose={() => setEditingTrial(null)}
          onSaved={(updated) => setMasterlist(updated)}
        />
      )}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}