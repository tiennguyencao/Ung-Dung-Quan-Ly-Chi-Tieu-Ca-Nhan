import { Languages } from 'lucide-react';
import useLanguage from '../../hooks/useLanguage.js';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface p-1"
      role="group"
      aria-label={language === 'vi' ? 'Chọn ngôn ngữ' : 'Choose language'}
    >
      {!compact && <Languages size={15} className="mx-1 text-muted" aria-hidden="true" />}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${language === 'en' ? 'bg-ink text-white' : 'text-charcoal hover:bg-paper'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        aria-pressed={language === 'vi'}
        className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${language === 'vi' ? 'bg-ink text-white' : 'text-charcoal hover:bg-paper'}`}
      >
        VI
      </button>
    </div>
  );
}
