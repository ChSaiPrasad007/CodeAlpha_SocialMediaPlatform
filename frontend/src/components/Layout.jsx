import { Home, LogOut, Settings, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import Button from './Button';

const navigation = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/profile', label: 'Profile', icon: UserRound },
  { to: '/settings', label: 'Edit', icon: Settings }
];

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
      isActive ? 'bg-ink text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
    }`;

  return (
    <div className="min-h-screen bg-mist pb-20 text-ink lg:pb-0">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-lg font-black text-white">
            CA
          </span>
          <span>
            <span className="block text-lg font-black text-ink">CodeAlpha</span>
            <span className="block text-xs font-semibold uppercase text-coral">Social</span>
          </span>
        </NavLink>

        <nav className="mt-9 space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 space-y-4">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-slate-300"
          >
            <Avatar user={user} size="sm" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-ink">{user?.username}</span>
              <span className="block truncate text-xs text-slate-500">{user?.email}</span>
            </span>
          </button>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 font-black text-ink">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm text-white">CA</span>
            CodeAlpha
          </NavLink>
          <button
            type="button"
            title="Profile"
            onClick={() => navigate('/profile')}
            className="rounded-lg"
          >
            <Avatar user={user} size="sm" />
          </button>
        </div>
      </header>

      <main className="w-full px-4 py-6 lg:pl-80 lg:pr-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white px-3 py-2 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-bold transition ${
                  isActive ? 'bg-ink text-white' : 'text-slate-500 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="flex min-h-12 flex-col items-center justify-center rounded-lg text-xs font-bold text-slate-500 transition hover:bg-slate-100"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Exit
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
