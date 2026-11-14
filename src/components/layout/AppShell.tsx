import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Home, LogOut, Menu, Moon, Package, Sun, UserRoundCog, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn, initials } from '../../lib/utils';
import { NotificationBell } from '../notifications/NotificationBell';
import { LanguageToggle } from '../ui/LanguageToggle';

export function AppShell() {
  const { profile, signOut } = useAuth();
  const { tx, isUrdu } = useLanguage();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [open, setOpen] = useState(false);

  const navByRole = {
    homeowner: [{ to: '/dashboard', label: tx.nav.homeowner, icon: Home }],
    contractor: [{ to: '/dashboard', label: tx.nav.contractor, icon: UserRoundCog }],
    supplier: [{ to: '/dashboard', label: tx.nav.supplier, icon: Package }],
    admin: [{ to: '/dashboard', label: tx.nav.dashboard, icon: Home }]
  };

  const links = profile?.role ? navByRole[profile.role] : [];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const roleDisplay = profile?.role ? (tx.roles[profile.role] || profile.role) : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight font-extrabold">{tx.brandName}</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <NotificationBell />
            <div className="hidden items-center gap-2 md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDark((value) => !value)}
                aria-label={tx.toggleTheme}
                title={tx.toggleTheme}
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-1.5 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {initials(profile?.name)}
                </span>
                <div className={cn('text-sm', isUrdu && 'text-right')}>
                  <p className="font-semibold leading-tight">{profile?.name ?? (isUrdu ? 'بلڈ وائز صارف' : 'BuildWise User')}</p>
                  <p className="text-xs text-muted-foreground">{roleDisplay}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                aria-label={tx.signOut}
                title={tx.signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Open menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        {open && (
          <div className="border-t bg-background p-4 md:hidden">
            <div className="grid gap-2.5">
              <div className="mb-2 flex items-center justify-between border-b pb-2">
                <span className="text-xs font-semibold text-muted-foreground">Language / زبان</span>
                <LanguageToggle />
              </div>
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold hover:bg-muted"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              ))}
              <Button variant="secondary" className="justify-start gap-2" onClick={() => setDark((value) => !value)}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {tx.toggleTheme}
              </Button>
              <Button variant="secondary" className="justify-start gap-2" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                {tx.signOut}
              </Button>
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
