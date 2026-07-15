import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient, { extractErrorMessage } from '../api/axiosClient';
import TrialModal from '../components/TrialModal';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';

export default function MasterlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [masterlist, setMasterlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [nctInput, setNctInput] = useState('');
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [trialSearch, setTrialSearch] = useState('');
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
      <div className="mb-3 flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-semibold">{masterlist.name}</h1>
          <div className="text-sm text-[var(--color-text-muted)]">
            Cancer type: {masterlist.cancerType}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            Trials: {masterlist.trials?.length ?? 0}
          </div>
        </div>
        <button className="btn-danger h-fit" onClick={handleDeleteMasterlist}>
          Delete Masterlist
        </button>
      </div>

      <Link to="/" className="text-sm text-[var(--color-accent)]">
        &larr; Back to all masterlists
      </Link>

      <section
        className="card mt-5 mb-6 p-4"
        style={{ background: 'radial-gradient(circle at top left, rgba(74,222,128,0.16), transparent 60%), var(--color-surface-elevated)' }}
      >
        <h2 className="mb-2 text-sm font-semibold">Add trial(s) by NCT ID</h2>
        <form onSubmit={handleAddTrials} className="flex flex-col gap-2">
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
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Trials in this masterlist</h2>
          {masterlist.trials?.length > 0 && (
            <input
              type="search"
              placeholder="Filter by NCT or title…"
              value={trialSearch}
              onChange={(e) => setTrialSearch(e.target.value)}
              className="field max-w-xs"
              aria-label="Filter trials"
            />
          )}
        </div>

        {masterlist.trials?.length === 0 ? (
          <EmptyState title="No trials yet" description="Add some using NCT ids above." />
        ) : visibleTrials.length === 0 ? (
          <EmptyState title="No trials match your filter" />
        ) : (
          <ul className="space-y-3">
            {visibleTrials.map((t) => (
              <li key={t.nct} className="card p-4">
                <div className="flex justify-between gap-4">
                  <div
                    className="min-w-0 flex-1 cursor-pointer"
                    onClick={() => setSelectedTrial(t)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTrial(t)}
                  >
                    <div className="font-semibold">
                      {t.nct} &mdash; {t.title}
                    </div>
                    <div className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                      Phase: {t.phase || 'N/A'} &middot; Study: {t.study_type || 'N/A'} &middot; Sponsor:{' '}
                      {t.sponsor || 'N/A'}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {t.location?.length
                        ? `${t.location.length} Canadian location${t.location.length > 1 ? 's' : ''}`
                        : 'No Canadian locations captured'}
                    </div>
                  </div>
                  <button
                    className="btn-danger h-fit self-center shrink-0"
                    onClick={() => handleDeleteTrial(t.nct)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedTrial && <TrialModal trial={selectedTrial} onClose={() => setSelectedTrial(null)} />}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
