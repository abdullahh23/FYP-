import { NavLink } from 'react-router-dom';
import { Bell, BriefcaseBusiness, ClipboardList, LayoutDashboard, MessageSquareText, Search, Settings, UserRoundCog, WalletCards, Home, Package } from 'lucide-react';
import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function ContractorWorkspace({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { tx, isUrdu } = useLanguage();
  const role = profile?.role ?? 'homeowner';

  const linksByRole = {
    homeowner: [
      { to: '/dashboard', label: tx.dashboard, icon: LayoutDashboard, end: true },
      { to: '/dashboard/messages', label: tx.nav.messages, icon: MessageSquareText },
      { to: '/dashboard/notifications', label: tx.nav.notifications, icon: Bell },
      { to: '/dashboard/settings', label: tx.nav.settings, icon: Settings }
    ],
    contractor: [
      { to: '/dashboard', label: tx.dashboard, icon: LayoutDashboard, end: true },
      { to: '/dashboard/available-projects', label: tx.nav.availableProjects, icon: Search },
      { to: '/dashboard/requests', label: isUrdu ? 'موصولہ درخواستیں' : 'My Requests', icon: ClipboardList },
      { to: '/dashboard/quotes', label: tx.contractor.myQuotes, icon: WalletCards },
      { to: '/dashboard/messages', label: tx.nav.messages, icon: MessageSquareText },
      { to: '/dashboard/notifications', label: tx.nav.notifications, icon: Bell },
      { to: '/dashboard/profile', label: tx.nav.profile, icon: UserRoundCog },
      { to: '/dashboard/settings', label: tx.nav.settings, icon: Settings }
    ],
    supplier: [
      { to: '/dashboard', label: tx.dashboard, icon: LayoutDashboard, end: true },
      { to: '/dashboard/messages', label: tx.nav.messages, icon: MessageSquareText },
      { to: '/dashboard/notifications', label: tx.nav.notifications, icon: Bell },
      { to: '/dashboard/settings', label: tx.nav.settings, icon: Settings }
    ],
    admin: [
      { to: '/dashboard', label: tx.dashboard, icon: LayoutDashboard, end: true },
      { to: '/dashboard/settings', label: tx.nav.settings, icon: Settings }
    ]
  };

  const links = linksByRole[role] || [];
  const roleDisplay = tx.roles[role] || role;
  const HeaderIcon = role === 'contractor' ? BriefcaseBusiness : role === 'supplier' ? Package : Home;

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
      <aside className="rounded-2xl border bg-card p-3 shadow-panel lg:sticky lg:top-24 lg:self-start">
        <div className="mb-3 flex items-center gap-2 px-2.5 py-1.5 font-bold text-sm">
          <HeaderIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{roleDisplay}</span>
        </div>
        <nav className="grid gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-muted-foreground hover:bg-muted'
                )
              }
            >
              <link.icon className="h-4 w-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
