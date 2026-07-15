import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="card w-full max-w-md p-7">
        <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
        <p className="mb-5 text-sm text-[var(--color-text-muted)]">
          Sign in to manage HER2+ breast cancer masterlists.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-[var(--color-text-muted)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="field"
              required
            />
          </div>

          <button type="submit" className="btn-primary mt-1" disabled={loading}>
            {loading ? 'Signing in…' : 'Login'}
          </button>

          {error && (
            <div role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <div className="pt-1 text-sm text-[var(--color-text-muted)]">
            No account? <Link to="/register" className="text-[var(--color-accent)]">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
