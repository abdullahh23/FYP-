import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Home, LogOut, Menu, Moon, Package, Sun, UserRoundCog, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { cn, initials } from '../../lib/utils';
import { NotificationBell } from '../notifications/NotificationBell';

const navByRole = {
  homeowner: [{ to: '/dashboard', label: 'Homeowner', icon: Home }],
  contractor: [{ to: '/dashboard', label: 'Contractor', icon: UserRoundCog }],
  supplier: [{ to: '/dashboard', label: 'Supplier', icon: Package }],
  admin: [{ to: '/dashboard', label: 'Dashboard', icon: Home }]
};

export function AppShell() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [open, setOpen] = useState(false);
  const links = profile?.role ? navByRole[profile.role] : [];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <span>BuildWise AI</span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" size="icon" onClick={() => setDark((value) => !value)} aria-label="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{initials(profile?.name)}</span>
                <div className="text-sm">
                  <p className="font-semibold">{profile?.name ?? 'BuildWise User'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          </div>
        </div>
        {open && (
          <div className="border-t bg-background p-4 md:hidden">
            <div className="grid gap-2">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 font-semibold hover:bg-muted">
                  {link.label}
                </NavLink>
              ))}
              <Button variant="secondary" onClick={() => setDark((value) => !value)}>
                Toggle theme
              </Button>
              <Button variant="secondary" onClick={handleSignOut}>
                Sign out
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
