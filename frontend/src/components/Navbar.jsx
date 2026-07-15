import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-baseline gap-1.5 no-underline">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            CT Masterlist
          </span>
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          {user && (
            <span className="text-sm text-[var(--color-text-muted)]">
              Signed in as <span className="text-slate-200">{user.name}</span>
            </span>
          )}
          {isAuthenticated ? (
            <button className="btn-danger" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm hover:underline">
                Login
              </Link>
              <Link to="/register" className="text-sm hover:underline">
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="btn-secondary sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-2 border-t border-[var(--color-border-subtle)] px-4 py-3 sm:hidden">
          {user && (
            <span className="text-sm text-[var(--color-text-muted)]">
              Signed in as <span className="text-slate-200">{user.name}</span>
            </span>
          )}
          {isAuthenticated ? (
            <button className="btn-danger w-full" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="text-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="text-sm" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
