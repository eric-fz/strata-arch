import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore.ts';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Families', path: '/families' },
  { label: 'Requirements', path: '/requirements' },
  { label: 'Traceability Matrix', path: '/requirements/traceability' },
  { label: 'Architecture', path: '/architecture' },
  { label: 'Artifacts', path: '/artifacts' },
  { label: 'Verification', path: '/verification' },
  { label: 'BOM', path: '/bom' },
  { label: 'Planning', path: '/planning' },
  { label: 'Changes', path: '/changes' },
  { label: 'Releases', path: '/releases' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Settings', path: '/settings' },
];

export function CommandPalette() {
  const open = useAppStore(s => s.commandPaletteOpen);
  const setOpen = useAppStore(s => s.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) { setQuery(''); inputRef.current?.focus(); }
  }, [open]);

  if (!open) return null;

  const filtered = query
    ? NAV_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS;

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            onKeyDown={e => {
              if (e.key === 'Escape') setOpen(false);
              if (e.key === 'Enter' && filtered.length > 0) go(filtered[0].path);
            }}
          />
          <kbd className="text-xs text-gray-400 border rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-64 overflow-y-auto p-2">
          {filtered.map(item => (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700"
            >
              {item.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-sm text-gray-400 text-center">No results</p>
          )}
        </div>
      </div>
    </div>
  );
}
