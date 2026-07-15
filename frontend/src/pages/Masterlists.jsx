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
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Masterlists</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Create and manage curated HER2+ breast cancer clinical trial sets.
          </p>
        </div>
        <div className="flex gap-4 text-sm text-[var(--color-text-muted)]">
          <span>
            <strong className="text-slate-100">{pagination.total}</strong> masterlists
          </span>
          <span>
            <strong className="text-slate-100">{totalTrials}</strong> trials (this page)
          </span>
        </div>
      </div>

      <section
        className="card mb-5 p-4"
        style={{ background: 'radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 60%), var(--color-surface-elevated)' }}
      >
        <h2 className="mb-2 text-sm font-semibold">New masterlist</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            name="name"
            placeholder="Masterlist name"
            value={form.name}
            onChange={handleChange}
            required
            className="field flex-1 basis-56"
          />
          <input
            type="text"
            name="cancerType"
            placeholder="Cancer type"
            value={form.cancerType}
            onChange={handleChange}
            required
            className="field flex-1 basis-44"
          />
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
        {error && <div className="mt-2 text-sm text-[var(--color-danger)]">{error}</div>}
      </section>

      <div className="mb-3">
        <input
          type="search"
          placeholder="Search by name or cancer type…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="field max-w-sm"
          aria-label="Search masterlists"
        />
      </div>

      {loading ? (
        <ListSkeleton />
      ) : masterlists.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'No masterlists yet'}
          description={
            search
              ? 'Try a different search term.'
              : 'Use the form above to create your first masterlist.'
          }
        />
      ) : (
        <>
          <ul className="space-y-3">
            {masterlists.map((m) => (
              <li key={m._id} className="card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/masterlists/${m._id}`} className="font-semibold hover:underline">
                    {m.name}
                  </Link>
                  <div className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                    Cancer type: {m.cancerType}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    Trials: {m.trials?.length ?? 0}
                  </div>
                </div>
                <button className="btn-danger shrink-0" onClick={() => handleDelete(m._id, m.name)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <Pagination page={pagination.page} pages={pagination.pages} onChange={loadMasterlists} />
          </div>
        </>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
