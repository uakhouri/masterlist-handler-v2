import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-strong)] text-sm font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_6px_16px_-6px_rgba(59,130,246,0.7)]">
            CT
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
            Masterlist Portal
          </span>
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          {isAuthenticated && (
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'text-sm font-medium text-[var(--color-text)]' : 'nav-link'
              }
            >
              Masterlists
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-3 border-l border-[var(--color-border-subtle)] pl-4">
              <span className="avatar" title={user?.name}>
                {initials(user?.name) || '?'}
              </span>
              <button className="btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="icon-btn sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-[var(--color-border-subtle)] px-4 py-3 sm:hidden">
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="avatar" title={user?.name}>
                {initials(user?.name) || '?'}
              </span>
              <span className="text-sm text-[var(--color-text-muted)]">{user?.name}</span>
            </div>
          )}
          {isAuthenticated ? (
            <button className="btn-secondary w-full" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="text-sm font-medium" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
