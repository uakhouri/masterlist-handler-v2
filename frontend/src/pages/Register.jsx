import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    const { password } = form;
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.password]);

  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-sky-500', 'bg-green-500'][
    passwordStrength
  ];

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);

    if (result.success) {
      toast.success('Account created!');
      navigate('/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <AuthLayout
      eyebrow="Create account"
      title="Create an account"
      subtitle="Sign up to start curating clinical trial masterlists."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange}
            className="field"
            required
          />
        </div>
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
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            className="field"
            required
            minLength={6}
          />
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full ${strengthColor} transition-all`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">{strengthLabel}</span>
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary mt-1 w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Register'}
        </button>

        {error && (
          <div role="alert" className="alert-danger">
            {error}
          </div>
        )}

        <div className="pt-1 text-sm text-[var(--color-text-muted)]">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
