import { useQuery } from '@tanstack/react-query';
import { ContractorWorkspace } from './ContractorWorkspace';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { listNotifications } from '../../services/notifications';

export function ContractorNotificationsPage() {
  const { user, profile } = useAuth();
  const notifications = useQuery({ queryKey: ['notifications', user?.id], queryFn: () => listNotifications(user!.id), enabled: Boolean(user?.id) });

  const desc = profile?.role === 'homeowner'
    ? 'New messages, contractor quotes, supplier quotations, and project updates.'
    : 'New requests, chat messages, accepted quotes, and project updates.';

  return (
    <ContractorWorkspace>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-muted-foreground">{desc}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Live notifications from Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {notifications.data?.length ? notifications.data.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{item.title}</p>
                  <Badge tone={item.read_at ? 'neutral' : 'success'}>{item.read_at ? 'Read' : 'New'}</Badge>
                </div>
                {item.body && <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString()}</p>
              </div>
            )) : <p className="rounded-xl border p-8 text-center text-muted-foreground">No notifications yet.</p>}
          </CardContent>
        </Card>
      </div>
    </ContractorWorkspace>
  );
}
