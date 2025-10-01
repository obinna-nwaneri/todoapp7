import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <h1 className="text-5xl font-bold text-slate-900">404</h1>
    <p className="mt-4 text-lg text-slate-600">We couldn't find the page you're looking for.</p>
    <Button asChild className="mt-6">
      <Link to="/app/dashboard">Return to dashboard</Link>
    </Button>
  </div>
);
