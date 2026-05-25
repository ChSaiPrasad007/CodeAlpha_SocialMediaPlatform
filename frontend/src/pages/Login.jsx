import { Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';

const Login = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await login(form);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-mist px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft md:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-ink p-8 text-white md:p-10">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white text-lg font-black text-ink">
            CA
          </div>
          <h1 className="mt-8 text-3xl font-black">CodeAlpha Social</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
            Sign in to your workspace and continue the conversation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <h2 className="text-2xl font-black text-ink">Login</h2>
          <p className="mt-2 text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-bold text-ocean hover:underline">
              Create an account
            </Link>
          </p>

          <label className="mt-8 block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal focus:border-ocean focus:bg-white"
              placeholder="you@example.com"
            />
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal focus:border-ocean focus:bg-white"
              placeholder="Minimum 6 characters"
            />
          </label>

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden="true" />
            )}
            Login
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Login;
