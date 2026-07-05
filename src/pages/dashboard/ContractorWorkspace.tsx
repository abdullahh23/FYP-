import { NavLink } from 'react-router-dom';
import { Bell, BriefcaseBusiness, ClipboardList, LayoutDashboard, MessageSquareText, Search, Settings, UserRoundCog, WalletCards, Home, Package } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const linksByRole = {
  homeowner: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageSquareText },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings }
  ],
  contractor: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/available-projects', label: 'Available Projects', icon: Search },
    { to: '/dashboard/requests', label: 'My Requests', icon: ClipboardList },
    { to: '/dashboard/quotes', label: 'My Quotes', icon: WalletCards },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageSquareText },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/profile', label: 'Profile', icon: UserRoundCog },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings }
  ],
  supplier: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/messages', label: 'Messages', icon: MessageSquareText },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings }
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/settings', label: 'Settings', icon: Settings }
  ]
};

export function ContractorWorkspace({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const role = profile?.role ?? 'homeowner';
  const links = linksByRole[role] || [];
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const HeaderIcon = role === 'contractor' ? BriefcaseBusiness : role === 'supplier' ? Package : Home;

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
      <aside className="rounded-xl border bg-card p-3 shadow-panel lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center gap-2 px-2 py-1.5 font-bold">
          <HeaderIcon className="h-4 w-4 text-primary" />
          {roleLabel}
        </div>
        <nav className="grid gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
