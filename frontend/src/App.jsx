import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Masterlists from './pages/Masterlists';
import MasterlistDetail from './pages/MasterlistDetail';
import NotFound from './pages/NotFound';

function AuthRedirect({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Routes>
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <Login />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <Register />
              </AuthRedirect>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Masterlists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masterlists/:id"
            element={
              <ProtectedRoute>
                <MasterlistDetail />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#131826',
              color: '#f4f6fb',
              border: '1px solid #262e42',
              borderRadius: '10px'
            }
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}
