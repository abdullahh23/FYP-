import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notifications';
import { Button } from '../ui/button';

export function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const key = ['notifications', user?.id];
  const notifications = useQuery({ queryKey: key, queryFn: () => listNotifications(user!.id), enabled: Boolean(user?.id) });
  const unread = notifications.data?.filter((item) => !item.read_at).length ?? 0;

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`notifications-${user.id}-${crypto.randomUUID()}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => queryClient.invalidateQueries({ queryKey: ['notifications', user.id] })).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, user?.id]);

  async function readAll() {
    if (!user?.id) return;
    await markAllNotificationsRead(user.id);
    queryClient.invalidateQueries({ queryKey: key });
  }

  async function openNotification(item: { id: string; read_at: string | null; entity_type: string | null }) {
    if (!item.read_at) await markNotificationRead(item.id);
    queryClient.invalidateQueries({ queryKey: key });
    setOpen(false);
    if (item.entity_type === 'conversation') navigate('/dashboard/messages');
    else if (item.entity_type === 'quotation') navigate('/dashboard/requests');
    else if (item.entity_type === 'project') navigate('/dashboard');
    else navigate('/dashboard/notifications');
  }

  return (
    <div className="relative">
      <Button type="button" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Notifications">
        <Bell className="h-4 w-4" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">{Math.min(unread, 9)}</span>}
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg border bg-card p-3 shadow-panel">
          <div className="flex items-center justify-between px-1 pb-3"><p className="font-bold">Notifications</p><button type="button" onClick={readAll} className="flex items-center gap-1 text-xs font-semibold text-primary"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button></div>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {notifications.data?.length ? notifications.data.map((item) => (
              <button key={item.id} type="button" onClick={() => openNotification(item)} className={`w-full rounded-lg p-3 text-left hover:bg-muted ${item.read_at ? 'opacity-65' : 'bg-primary/[0.06]'}`}>
                <p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
              </button>
            )) : <p className="p-6 text-center text-sm text-muted-foreground">You are all caught up.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
