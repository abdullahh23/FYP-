import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

type Toast = { id: string; title: string; description?: string; type?: 'success' | 'error' | 'info' };
type ToastContextValue = { toast: (toast: Omit<Toast, 'id'>) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((item: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...item, id }]);
    window.setTimeout(() => setToasts((current) => current.filter((toastItem) => toastItem.id !== id)), 4200);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3">
        {toasts.map((item) => {
          const Icon = item.type === 'success' ? CheckCircle2 : item.type === 'error' ? XCircle : Info;
          return (
            <div key={item.id} className="glass-panel animate-fade-in rounded-xl p-4">
              <div className="flex gap-3">
                <Icon
                  className={cn(
                    'mt-0.5 h-5 w-5',
                    item.type === 'success' && 'text-emerald-600',
                    item.type === 'error' && 'text-destructive',
                    (!item.type || item.type === 'info') && 'text-accent'
                  )}
                />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
