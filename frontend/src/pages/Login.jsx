import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

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
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in to manage your clinical trial masterlists."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="field-label">
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
          <label htmlFor="password" className="field-label">
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

        <button type="submit" className="btn-primary mt-1 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Login'}
        </button>

        {error && (
          <div role="alert" className="alert-danger">
            {error}
          </div>
        )}

        <div className="pt-1 text-sm text-[var(--color-text-muted)]">
          No account?{' '}
          <Link to="/register" className="font-medium text-[var(--color-accent)] hover:underline">
            Register
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
