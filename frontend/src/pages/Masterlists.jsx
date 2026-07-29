import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient, { extractErrorMessage } from '../api/axiosClient';
import { ListSkeleton } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import { useConfirm } from '../hooks/useConfirm';
import { useDebouncedValue } from '../hooks/useDebouncedValue';

export default function Masterlists() {
  const [masterlists, setMasterlists] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ name: '', cancerType: '' });
  const [searchInput, setSearchInput] = useState('');
  const search = useDebouncedValue(searchInput);
  const { confirm, dialogProps } = useConfirm();

  const loadMasterlists = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/masterlists', {
        params: { page, limit: 10, search: search || undefined }
      });
      setMasterlists(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to load masterlists'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterlists(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await axiosClient.post('/masterlists', form);
      setForm({ name: '', cancerType: '' });
      setShowCreateForm(false);
      toast.success('Masterlist created');
      setMasterlists((prev) => [res.data.data, ...prev]);
      setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
    } catch (err) {
      console.error(err);
      setError(extractErrorMessage(err, 'Failed to create masterlist'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm({
      title: 'Delete masterlist?',
      description: `"${name}" and all of its trials will be permanently removed.`,
      confirmLabel: 'Delete'
    });
    if (!ok) return;

    try {
      await axiosClient.delete(`/masterlists/${id}`);
      setMasterlists((prev) => prev.filter((m) => m._id !== id));
      toast.success('Masterlist deleted');
    } catch (err) {
      console.error(err);
      toast.error(extractErrorMessage(err, 'Failed to delete masterlist'));
    }
  };

  const totalTrials = masterlists.reduce((sum, m) => sum + (m.trials?.length ?? 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Masterlists</h1>
          <p className="page-subtitle">
            Create and manage curated clinical trial sets sourced from ClinicalTrials.gov.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateForm((v) => !v)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New masterlist
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <div className="stat-pill">
          <span className="text-xs font-medium text-[var(--color-text-faint)]">Masterlists</span>
          <span className="text-lg font-semibold text-[var(--color-text)]">{pagination.total}</span>
        </div>
        <div className="stat-pill">
          <span className="text-xs font-medium text-[var(--color-text-faint)]">Trials (this page)</span>
          <span className="text-lg font-semibold text-[var(--color-text)]">{totalTrials}</span>
        </div>
      </div>

      {showCreateForm && (
        <section className="card mb-6 p-5 sm:p-6">
          <h2 className="mb-4 text-base font-semibold text-[var(--color-text)]">New masterlist</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 basis-56">
              <label htmlFor="ml-name" className="field-label">
                Name
              </label>
              <input
                id="ml-name"
                type="text"
                name="name"
                placeholder="e.g. HER2+ MBC — First Line"
                value={form.name}
                onChange={handleChange}
                required
                className="field"
                autoFocus
              />
            </div>
            <div className="flex-1 basis-44">
              <label htmlFor="ml-cancer-type" className="field-label">
                Cancer type
              </label>
              <input
                id="ml-cancer-type"
                type="text"
                name="cancerType"
                placeholder="e.g. Breast cancer"
                value={form.cancerType}
                onChange={handleChange}
                required
                className="field"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
          </form>
          {error && (
            <div className="alert-danger mt-3">
              {error}
            </div>
          )}
        </section>
      )}

      <div className="mb-5">
        <div className="relative max-w-sm">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
            width="16"
            height="16"
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
            placeholder="Search by name, cancer type, or trial…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="field pl-9"
            aria-label="Search masterlists"
          />
        </div>
      </div>

      {loading ? (
        <ListSkeleton />
      ) : masterlists.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'No masterlists yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Use the "New masterlist" button above to create your first one.'
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {masterlists.map((m) => (
              <li
                key={m._id}
                className="card group relative flex flex-col gap-3 p-5 transition-colors hover:border-[var(--color-accent)]/40"
              >
                <button
                  className="icon-btn absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100 hover:!text-[var(--color-danger)]"
                  onClick={() => handleDelete(m._id, m.name)}
                  aria-label={`Delete ${m.name}`}
                  title="Delete masterlist"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
                  </svg>
                </button>

                <Link to={`/masterlists/${m._id}`} className="min-w-0 pr-8 no-underline">
                  <h2 className="truncate text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                    {m.name}
                  </h2>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-accent">{m.cancerType}</span>
                  <span className="badge">
                    {m.trials?.length ?? 0} trial{m.trials?.length === 1 ? '' : 's'}
                  </span>
                </div>

                <Link
                  to={`/masterlists/${m._id}`}
                  className="mt-1 text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open masterlist &rarr;
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Pagination page={pagination.page} pages={pagination.pages} onChange={loadMasterlists} />
          </div>
        </>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
