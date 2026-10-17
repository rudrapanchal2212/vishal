import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../layouts/AuthLayout';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = form.email.trim();

    if (!email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      await login(email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error(
        'Login error:',
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Welcome Back
      </h2>

      <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">
        Sign in to manage your invoices
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="form-label">
            Email Address
          </label>

          <input
            id="email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                email: event.target.value
              }))
            }
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="form-input pr-12"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  password: event.target.value
                }))
              }
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              onClick={() => setShowPass((previous) => !previous)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-slate-400 mt-6">
        New contractor?{' '}
        <Link
          to="/signup"
          className="text-primary-600 font-semibold hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}
