import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface Props {
  open: boolean;
  projectTitle: string;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteProjectModal({ open, projectTitle, onClose, onConfirm, loading }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-bold">Delete Project</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Are you sure you want to delete <strong className="text-foreground">&ldquo;{projectTitle}&rdquo;</strong>? This will permanently remove the
          project, estimates, quotations, chats, notifications, and all related records. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            onClick={onConfirm}
            loading={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete Project
          </Button>
        </div>
      </div>
    </div>
  );
}
