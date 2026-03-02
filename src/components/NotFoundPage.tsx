import { Link } from 'react-router-dom';
import { Button } from './ui/Button.tsx';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-gray-200">404</h1>
      <p className="mt-4 text-lg font-semibold text-gray-700">Page not found</p>
      <p className="mt-1 text-sm text-gray-500">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="mt-6"><Button>Go to Dashboard</Button></Link>
    </div>
  );
}
