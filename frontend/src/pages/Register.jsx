import { Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';

const Register = () => {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await register(form);
      toast.success('Account created');
      navigate('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Registration failed'));
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
            Create your profile and start sharing with your network.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <h2 className="text-2xl font-black text-ink">Register</h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-ocean hover:underline">
              Login
            </Link>
          </p>

          <label className="mt-8 block text-sm font-bold text-slate-700">
            Username
            <input
              type="text"
              required
              minLength={3}
              maxLength={32}
              value={form.username}
              onChange={(event) => setForm((state) => ({ ...state, username: event.target.value }))}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-normal focus:border-ocean focus:bg-white"
              placeholder="codealpha"
            />
          </label>

          <label className="mt-4 block text-sm font-bold text-slate-700">
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
              <UserPlus className="h-4 w-4" aria-hidden="true" />
            )}
            Create Account
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Register;
