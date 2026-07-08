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

const ICON = { size: 16, strokeWidth: 1.75 } as const;

export const DASHBOARD_ITEM: NavDef = {
  to: '/',
  label: 'Overview',
  icon: <LayoutDashboard {...ICON} />,
};

export interface NavGroup {
  title: string;
  items: NavDef[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Instructions',
    items: [
      { to: '/memory', label: 'CLAUDE.md', icon: <FileText {...ICON} /> },
      { to: '/rules', label: 'Rules', icon: <ScrollText {...ICON} /> },
    ],
  },
  {
    title: 'Behavior',
    items: [
      { to: '/settings', label: 'Settings', icon: <SlidersHorizontal {...ICON} /> },
      { to: '/hooks', label: 'Hooks', icon: <Webhook {...ICON} /> },
      { to: '/keybindings', label: 'Keybindings', icon: <Keyboard {...ICON} /> },
      { to: '/statusline', label: 'Statusline', icon: <TerminalSquare {...ICON} /> },
    ],
  },
  {
    title: 'Extensions',
    items: [
      { to: '/agents', label: 'Agents', icon: <Bot {...ICON} /> },
      { to: '/skills', label: 'Skills', icon: <Sparkles {...ICON} /> },
      { to: '/mcp', label: 'MCP Servers', icon: <Plug {...ICON} /> },
      { to: '/plugins', label: 'Plugins', icon: <Package {...ICON} /> },
    ],
  },
];

/** Flat list (incl. overview) for icon lookup elsewhere. */
export const NAV_ITEMS: NavDef[] = [DASHBOARD_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)];

function NavItem({ item }: { item: NavDef }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) =>
        `group flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-120 ${
          isActive
            ? 'bg-(--color-accent)/12 text-(--color-accent)'
            : 'text-(--color-text-secondary) hover:bg-(--color-surface-secondary) hover:text-(--color-text-primary)'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-(--color-accent)' : 'text-(--color-text-tertiary) group-hover:text-(--color-text-secondary)'}>
            {item.icon}
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="w-56 h-screen flex-shrink-0 bg-(--color-panel) border-r border-(--color-border-light) flex flex-col">
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid place-items-center w-7 h-7 rounded-lg bg-(--color-accent) text-white font-mono text-xs font-bold shadow-(--shadow-card)"
        >
          cc
        </span>
        <div className="leading-tight">
          <div className="text-[13px] font-semibold tracking-tight text-(--color-text-primary)">Claude Config</div>
          <div className="text-[11px] text-(--color-text-tertiary) font-mono">inspector</div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 pb-4 overflow-y-auto">
        <NavItem item={DASHBOARD_ITEM} />
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mt-5 first:mt-4">
            <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-(--color-text-tertiary)">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
