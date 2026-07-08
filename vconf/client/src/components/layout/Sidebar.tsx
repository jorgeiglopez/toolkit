import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  SlidersHorizontal,
  Bot,
  Sparkles,
  Webhook,
  Plug,
  ScrollText,
  Package,
  Keyboard,
  TerminalSquare,
} from 'lucide-react';

export interface NavDef {
  to: string;
  label: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavDef[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  { to: '/memory', label: 'CLAUDE.md', icon: <FileText size={18} strokeWidth={1.5} /> },
  { to: '/settings', label: 'Settings', icon: <SlidersHorizontal size={18} strokeWidth={1.5} /> },
  { to: '/agents', label: 'Agents', icon: <Bot size={18} strokeWidth={1.5} /> },
  { to: '/skills', label: 'Skills', icon: <Sparkles size={18} strokeWidth={1.5} /> },
  { to: '/hooks', label: 'Hooks', icon: <Webhook size={18} strokeWidth={1.5} /> },
  { to: '/mcp', label: 'MCP Servers', icon: <Plug size={18} strokeWidth={1.5} /> },
  { to: '/rules', label: 'Rules', icon: <ScrollText size={18} strokeWidth={1.5} /> },
  { to: '/plugins', label: 'Plugins', icon: <Package size={18} strokeWidth={1.5} /> },
  { to: '/keybindings', label: 'Keybindings', icon: <Keyboard size={18} strokeWidth={1.5} /> },
  { to: '/statusline', label: 'Statusline', icon: <TerminalSquare size={18} strokeWidth={1.5} /> },
];

function NavItem({ item }: { item: NavDef }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
          isActive
            ? 'bg-(--color-accent)/10 text-(--color-accent)'
            : 'text-(--color-text-secondary) hover:bg-(--color-surface-secondary) hover:text-(--color-text-primary)'
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="w-56 h-screen flex-shrink-0 bg-(--color-surface) border-r border-(--color-border-light) flex flex-col">
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔍</span>
          <span className="text-base font-bold tracking-tight text-(--color-text-primary)">Claude Config</span>
        </div>
        <p className="text-xs text-(--color-text-tertiary) mt-0.5">Configuration Viewer</p>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>
    </aside>
  );
}
