import { Link } from 'react-router-dom';
import Button from '../components/Button';

const NotFound = () => (
  <main className="grid min-h-screen place-items-center bg-mist px-4">
    <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-soft">
      <p className="text-sm font-black uppercase text-coral">404</p>
      <h1 className="mt-2 text-2xl font-black text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you requested does not exist.</p>
      <Button as={Link} to="/" className="mt-6">
        Back to Feed
      </Button>
    </section>
  </main>
);

export default NotFound;
