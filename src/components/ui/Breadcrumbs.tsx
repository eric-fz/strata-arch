import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {c.href ? (
            <Link to={c.href} className="hover:text-gray-700 transition-colors">{c.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
