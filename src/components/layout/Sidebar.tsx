import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bot, FileText, Network, Paperclip, FlaskConical,
  Package, CalendarDays, GitPullRequest, Rocket, ClipboardCheck, Settings,
  PanelLeftClose, PanelLeft, ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore.ts';
import { useState, type ReactNode } from 'react';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Product',
    items: [
      { label: 'Families', path: '/families', icon: <Bot className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Engineering',
    items: [
      { label: 'Requirements', path: '/requirements', icon: <FileText className="h-4 w-4" /> },
      { label: 'Architecture', path: '/architecture', icon: <Network className="h-4 w-4" /> },
      { label: 'Artifacts', path: '/artifacts', icon: <Paperclip className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Validation',
    items: [
      { label: 'Verification', path: '/verification', icon: <FlaskConical className="h-4 w-4" /> },
      { label: 'Reviews', path: '/reviews', icon: <ClipboardCheck className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Supply Chain',
    items: [
      { label: 'BOM', path: '/bom', icon: <Package className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Program',
    items: [
      { label: 'Planning', path: '/planning', icon: <CalendarDays className="h-4 w-4" /> },
      { label: 'Changes', path: '/changes', icon: <GitPullRequest className="h-4 w-4" /> },
      { label: 'Releases', path: '/releases', icon: <Rocket className="h-4 w-4" /> },
    ],
  },
];

function SidebarGroup({ group, collapsed }: { group: NavGroup; collapsed: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      {!collapsed && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600"
        >
          {group.label}
          <ChevronDown className={`h-3 w-3 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
      )}
      {(collapsed || open) && (
        <div className="space-y-0.5">
          {group.items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const collapsed = useAppStore(s => s.sidebarCollapsed);
  const toggle = useAppStore(s => s.toggleSidebar);

  return (
    <aside className={`flex flex-col border-r border-gray-200 bg-white transition-all ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className={`flex items-center border-b border-gray-200 h-14 ${collapsed ? 'justify-center px-2' : 'px-4 gap-2'}`}>
        <div className="h-7 w-7 rounded-md bg-primary-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">S</span>
        </div>
        {!collapsed && <span className="font-bold text-gray-900 text-lg">Strata</span>}
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-3">
        {groups.map(g => <SidebarGroup key={g.label} group={g} collapsed={collapsed} />)}
      </nav>
      <div className="border-t border-gray-200 px-2 py-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
            } ${collapsed ? 'justify-center' : ''}`
          }
        >
          <Settings className="h-4 w-4" />
          {!collapsed && 'Settings'}
        </NavLink>
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 w-full justify-center mt-1"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
