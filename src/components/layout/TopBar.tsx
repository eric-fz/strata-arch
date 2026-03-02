import { Search } from 'lucide-react';
import { UserButton } from '@clerk/clerk-react';
import { ContextSelector } from './ContextSelector.tsx';
import { useAppStore } from '../../store/appStore.ts';

export function TopBar() {
  const setCommandPaletteOpen = useAppStore(s => s.setCommandPaletteOpen);
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 h-14">
      <div />
      <ContextSelector />
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="text-xs text-gray-400 border rounded px-1">&#8984;K</kbd>
        </button>
        <UserButton />
      </div>
    </header>
  );
}
