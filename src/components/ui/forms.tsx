import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import { cn } from '../../lib/utils';

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('focus-ring h-11 rounded-lg border px-3 text-sm', className)} {...props} />
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn('focus-ring min-h-28 rounded-lg border px-3 py-2 text-sm', className)} {...props} />
  )
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ children, className, ...props }, ref) => (
    <select ref={ref} className={cn('focus-ring h-11 rounded-lg border px-3 text-sm', className)} {...props}>
      {children}
    </select>
  )
);
Select.displayName = 'Select';

export function Toggle({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'focus-ring flex h-11 items-center justify-between rounded-lg border px-3 text-sm font-medium',
        checked ? 'border-primary bg-primary/10 text-primary' : 'bg-white text-muted-foreground dark:bg-card'
      )}
    >
      <span>{label}</span>
      <span className={cn('relative h-5 w-9 rounded-full', checked ? 'bg-primary' : 'bg-muted')}>
        <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow', checked ? 'left-4' : 'left-0.5')} />
      </span>
    </button>
  );
}
