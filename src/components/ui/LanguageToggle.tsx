import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

interface LanguageToggleProps {
  className?: string;
  variant?: 'pill' | 'button' | 'compact';
}

export function LanguageToggle({ className, variant = 'pill' }: LanguageToggleProps) {
  const { language, setLanguage, toggleLanguage, isUrdu } = useLanguage();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-sm transition-all hover:bg-muted active:scale-95',
          className
        )}
        title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
        aria-label="Toggle language"
      >
        <Languages className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="font-bold">{isUrdu ? 'English' : 'اردو'}</span>
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-border/80 bg-background/80 p-0.5 shadow-sm backdrop-blur-md',
        className
      )}
      role="group"
      aria-label="Language selection"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200',
          language === 'en'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span>English</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ur')}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all duration-200 font-urdu',
          language === 'ur'
            ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="text-[13px] leading-none">اردو</span>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
      </button>
    </div>
  );
}
