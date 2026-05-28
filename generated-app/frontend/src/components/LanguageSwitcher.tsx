import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation, languages, type Language } from '../i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLang = languages.find(l => l.code === language);
  const filtered = languages.filter(l =>
    !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref} data-testid="language-switcher">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title={t('header.language')}
        aria-label={t('header.language')}
      >
        <Globe size={17} />
        <span className="text-xs font-medium hidden lg:inline">{currentLang?.flag}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-card-bg rounded-lg shadow-lg border border-border z-[100] animate-slide-down overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="text-xs font-medium text-text-tertiary uppercase tracking-wider px-2 py-1 mb-1">
              {t('header.language')}
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search language..."
              className="w-full px-3 py-1.5 text-sm text-text-primary bg-page-bg rounded-md border border-border focus:border-border-focus focus:outline-none"
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code as Language);
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  lang.code === language
                    ? 'bg-selected-bg text-amber-600 font-medium'
                    : 'text-text-primary hover:bg-hover-bg'
                }`}
              >
                <span className="text-base w-6 text-center">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <span className="font-medium">{lang.nativeName}</span>
                  {lang.nativeName !== lang.name && (
                    <span className="text-text-tertiary text-xs ml-1.5">({lang.name})</span>
                  )}
                </div>
                {lang.code === language && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-text-tertiary text-center">No languages found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
