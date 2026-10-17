import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  BookOpen,
  Activity,
  AlertCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Info,
  X,
  Languages
} from 'lucide-react';
import { SafeUseCase, CatalogResponse, HealthResponse, Locale } from './types';
import { fetchJson } from './api';
import deTranslations from './i18n/de.json';
import enTranslations from './i18n/en.json';
import ruTranslations from './i18n/ru.json';

const translationsMap = {
  de: deTranslations,
  en: enTranslations,
  ru: ruTranslations,
};

export default function App() {
  const [locale, setLocale] = useState<Locale>('de');
  const t = useMemo(() => translationsMap[locale], [locale]);

  // Sync document language and page title with active locale
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = `${t.app.title} – ${t.app.badge}`;
  }, [locale, t]);

  // Health state
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [healthLatency, setHealthLatency] = useState<number | null>(null);

  // Catalog state
  const [catalog, setCatalog] = useState<SafeUseCase[]>([]);
  const [catalogLoading, setCatalogLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<SafeUseCase | null>(null);

  // Accessibility refs for modal Focus-Trap & Focus Return
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch /api/health
  const checkHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    const start = performance.now();
    try {
      const data = await fetchJson<HealthResponse>('/api/health');
      if (data.status !== 'ok' || !Number.isInteger(data.catalogUseCasesCount)) throw new Error('invalid');
      const latency = Math.round(performance.now() - start);
      setHealthLatency(latency);
      setHealth(data);
    } catch (err: any) {
      setHealthError(err.message === 'timeout' ? 'timeout' : 'failed');
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Fetch /api/use-cases
  const loadCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const data = await fetchJson<CatalogResponse>('/api/use-cases');
      if (!Array.isArray(data.useCases) || !data.useCases.every(u => typeof u.id === 'string' && typeof u.name === 'string' && typeof u.language === 'string')) throw new Error('invalid');
      setCatalog(data.useCases);
    } catch (err: any) {
      setCatalogError(err.message === 'timeout' ? 'timeout' : 'failed');
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    loadCatalog();
  }, [checkHealth, loadCatalog]);

  // Open modal with focus tracking
  const handleOpenModal = (item: SafeUseCase, triggerElement: HTMLElement | null) => {
    lastActiveElementRef.current = triggerElement;
    setSelectedCase(item);
  };

  // Close modal and return focus
  const handleCloseModal = useCallback(() => {
    setSelectedCase(null);
    requestAnimationFrame(() => {
      lastActiveElementRef.current?.focus();
    });
  }, []);

  // Modal Focus-Trap & Escape handler
  useEffect(() => {
    if (!selectedCase) return;

    // Focus close button initially
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCase, handleCloseModal]);

  // Filtered catalog
  const filteredUseCases = useMemo(() => {
    return catalog.filter((item) => {
      if (languageFilter !== 'all' && item.language !== languageFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const localizedName = (t.cases as any)?.[item.id]?.name?.toLowerCase() || '';
      const localizedSummary = (t.cases as any)?.[item.id]?.summary?.toLowerCase() || '';
      const rawName = item.name.toLowerCase();
      const id = item.id.toLowerCase();

      return (
        rawName.includes(q) ||
        id.includes(q) ||
        localizedName.includes(q) ||
        localizedSummary.includes(q)
      );
    });
  }, [catalog, languageFilter, searchQuery, t]);

  const getCaseName = (item: SafeUseCase) => {
    return (t.cases as any)?.[item.id]?.name || item.name;
  };

  const getCaseSummary = (item: SafeUseCase) => {
    return (t.cases as any)?.[item.id]?.summary || '';
  };

  const getLanguageLabel = (langCode: string) => {
    return (t.languages as any)?.[langCode] || langCode.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif font-bold text-lg tracking-tight text-stone-900">
                {t.app.title}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                {t.app.badge}
              </span>
            </div>
          </div>

          {/* Language Switcher */}
          <nav aria-label={t.nav.languageAria} className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs font-medium">
            <Languages className="w-3.5 h-3.5 text-stone-500 ml-1 mr-0.5" aria-hidden="true" />
            {(['de', 'en', 'ru'] as Locale[]).map((loc) => {
              const langName = (t.nav.locales as any)?.[loc] || loc.toUpperCase();
              const switchAria = t.nav.switchTo.replace('{lang}', langName);
              return (
                <button
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={`px-2.5 py-1 rounded-md transition-colors uppercase focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden ${
                    locale === loc
                      ? 'bg-white text-stone-900 font-semibold shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-pressed={locale === loc}
                  aria-label={switchAria}
                >
                  {loc}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Short, Lean D0 Notice Banner */}
        <section
          aria-label={t.previewNotice.title}
          className="rounded-xl bg-amber-50/90 border border-amber-200 p-4 text-stone-800 shadow-2xs"
        >
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              <span className="font-semibold text-amber-950 mr-1">
                {t.previewNotice.title}:
              </span>
              {t.previewNotice.description}{' '}
              <span className="font-medium text-amber-900">
                {t.previewNotice.noFakeNotice}
              </span>
            </div>
          </div>
        </section>

        {/* Server Health Card */}
        <section
          aria-label={t.health.title}
          className="rounded-xl bg-white border border-stone-200 p-4 shadow-2xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <Activity className="w-4 h-4 text-stone-600" aria-hidden="true" />
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                {t.health.title}
              </h2>
              <code className="text-[11px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                {t.health.endpoint}
              </code>
            </div>

            <button
              onClick={checkHealth}
              disabled={healthLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-stone-200 text-stone-700 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden transition-colors disabled:opacity-50"
              aria-label={t.health.refreshAria}
            >
              <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{t.health.refresh}</span>
            </button>
          </div>

          {healthError && <p role="status" className="mt-3 text-sm text-red-700">{healthError === 'timeout' ? t.errors.timeout : t.errors.failed}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
            <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
              <span className="text-stone-500 block text-[11px]">{t.health.statusLabel}</span>
              <div className="mt-0.5 flex items-center gap-1.5 font-medium">
                {healthLoading ? (
                  <span className="text-stone-500">{t.health.statusChecking}</span>
                ) : health?.status === 'ok' ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    {t.health.onlineShort}
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                    {t.health.statusError}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
              <span className="text-stone-500 block text-[11px]">{t.health.delivery}</span>
              <span className="mt-0.5 block font-medium text-stone-800">
                {t.health.deliveryValue}
              </span>
            </div>

            <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
              <span className="text-stone-500 block text-[11px]">{t.health.catalogCount}</span>
              <span className="mt-0.5 block font-medium text-stone-800">
                {health?.catalogUseCasesCount ?? (catalog.length || '—')}
              </span>
            </div>

            <div className="bg-stone-50 rounded-lg p-2 border border-stone-100">
              <span className="text-stone-500 block text-[11px]">{t.health.latency}</span>
              <span className="mt-0.5 block font-medium text-stone-800">
                {healthLatency !== null ? `${healthLatency} ms` : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Use Cases Catalog */}
        <section aria-label={t.catalog.title} className="space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900 tracking-tight">
                {t.catalog.title}
              </h2>
              <p className="text-xs text-stone-500">
                {t.catalog.subtitle}
              </p>
            </div>

            <span className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full self-start sm:self-auto">
              {t.catalog.found.replace('{count}', String(filteredUseCases.length))}
            </span>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.catalog.searchPlaceholder}
                aria-label={t.catalog.searchAria}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden transition-all placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label={t.catalog.clearSearchAria}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden rounded p-0.5"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 text-xs font-medium">
              <SlidersHorizontal className="w-3 h-3 text-stone-400 ml-1 mr-0.5" aria-hidden="true" />
              <button
                onClick={() => setLanguageFilter('all')}
                className={`px-2 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden ${
                  languageFilter === 'all'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-pressed={languageFilter === 'all'}
              >
                {t.catalog.filterAll}
              </button>
              <button
                onClick={() => setLanguageFilter('de')}
                className={`px-2 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden ${
                  languageFilter === 'de'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-pressed={languageFilter === 'de'}
              >
                {t.catalog.filterDe}
              </button>
              <button
                onClick={() => setLanguageFilter('it')}
                className={`px-2 py-1 rounded transition-colors focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden ${
                  languageFilter === 'it'
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                aria-pressed={languageFilter === 'it'}
              >
                {t.catalog.filterIt}
              </button>
            </div>
          </div>

          {/* Catalog Loading State */}
          {catalogLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 bg-white rounded-xl border border-stone-200">
              <RefreshCw className="w-5 h-5 text-amber-700 animate-spin" aria-hidden="true" />
              <p className="text-xs text-stone-600">{t.catalog.loading}</p>
            </div>
          )}

          {/* Catalog Error State */}
          {catalogError && (
            <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-2 bg-red-50/60 rounded-xl border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
              <p className="text-xs font-medium text-red-900">{t.catalog.loadError} {catalogError === 'timeout' ? t.errors.timeout : t.errors.failed}</p>
              <button
                onClick={loadCatalog}
                className="mt-1 px-3 py-1 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-hidden transition-colors"
              >
                {t.catalog.retry}
              </button>
            </div>
          )}

          {/* Catalog Empty State */}
          {!catalogLoading && !catalogError && filteredUseCases.length === 0 && (
            <div className="py-10 px-4 text-center bg-white rounded-xl border border-stone-200 space-y-1">
              <h3 className="text-xs font-semibold text-stone-800">{t.catalog.emptyTitle}</h3>
              <p className="text-xs text-stone-500">{t.catalog.emptyMessage}</p>
            </div>
          )}

          {/* Catalog Cards Grid */}
          {!catalogLoading && !catalogError && filteredUseCases.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredUseCases.map((item) => {
                const caseName = getCaseName(item);
                const summary = getCaseSummary(item);
                const detailsAria = t.catalog.detailsAria.replace('{name}', caseName);

                return (
                  <article
                    key={item.id}
                    className="bg-white rounded-xl p-4 border border-stone-200/90 shadow-2xs hover:border-amber-300 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded uppercase">
                          {item.language}
                        </span>
                        <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                          {t.catalog.previewBadge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-bold text-sm text-stone-900">
                          {caseName}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                          {summary}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-stone-400">
                        {item.id}
                      </span>
                      <button
                        onClick={(e) => handleOpenModal(item, e.currentTarget)}
                        className="text-xs font-medium text-amber-800 hover:text-amber-950 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden rounded px-1.5 py-0.5 transition-colors"
                        aria-label={detailsAria}
                      >
                        {t.catalog.detailsButton} &rarr;
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Detail Dialog with Full Accessibility & Focus Trap */}
      {selectedCase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleCloseModal}
        >
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="bg-white rounded-xl max-w-md w-full p-5 shadow-lg border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wider block">
                  {t.modal.title}
                </span>
                <h3 id="modal-title" className="font-serif font-bold text-base text-stone-900 mt-0.5">
                  {getCaseName(selectedCase)}
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                onClick={handleCloseModal}
                className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden transition-colors"
                aria-label={t.modal.closeAria}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.modal.fieldId}</span>
                  <span className="font-mono font-medium text-stone-800">{selectedCase.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.modal.fieldLanguage}</span>
                  <span className="font-medium text-stone-800">{getLanguageLabel(selectedCase.language)} ({selectedCase.language.toUpperCase()})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">{t.modal.fieldVersion}</span>
                  <span className="font-medium text-stone-800">v{selectedCase.version}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-medium text-stone-500 block mb-0.5">
                  {t.modal.fieldDescription}
                </span>
                <p className="text-stone-700 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                  {getCaseSummary(selectedCase)}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-stone-700 space-y-0.5">
                <span className="font-medium text-amber-950 block">
                  {t.modal.planningNotice}
                </span>
                <p className="leading-relaxed">
                  {t.modal.planningText}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-semibold text-emerald-950 block">{t.modal.safetyTitle}</span>
                  <span>{t.modal.safetyText}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:outline-hidden transition-colors"
              >
                {t.modal.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lean Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-stone-500">
          {t.footer.status}
        </div>
      </footer>
    </div>
  );
}
