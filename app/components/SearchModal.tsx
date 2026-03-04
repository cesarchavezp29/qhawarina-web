'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface SearchItemBase {
  title_es: string;
  subtitle_es: string;
  title_en: string;
  subtitle_en: string;
  href: string;
  icon: string;
  keywords: string[];
}

interface SearchItem {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchItemBase[] = [
  // Main pages
  { title_es: 'Inicio', subtitle_es: 'Dashboard principal con todos los nowcasts', title_en: 'Home', subtitle_en: 'Main dashboard with all nowcasts', href: '/', icon: '🏠', keywords: ['home', 'inicio', 'principal', 'dashboard'] },
  { title_es: 'Datos Abiertos', subtitle_es: 'Descarga todos los datasets de Qhawarina', title_en: 'Open Data', subtitle_en: 'Download all Qhawarina datasets', href: '/datos', icon: '📥', keywords: ['datos', 'descarga', 'csv', 'json', 'data', 'download'] },
  { title_es: 'Escenarios', subtitle_es: 'Análisis contrafactual con 10 escenarios', title_en: 'Scenarios', subtitle_en: 'Counterfactual analysis with 10 scenarios', href: '/escenarios', icon: '🎯', keywords: ['escenarios', 'contrafactual', 'recesion', 'shock', 'scenarios'] },
  { title_es: 'Simuladores', subtitle_es: 'Calculadoras interactivas de impacto económico', title_en: 'Simulators', subtitle_en: 'Interactive economic impact calculators', href: '/simuladores', icon: '🔬', keywords: ['simuladores', 'calculadora', 'impacto', 'simulators', 'calculators'] },
  { title_es: 'Reportes', subtitle_es: 'Reportes diarios y mensuales auto-generados', title_en: 'Reports', subtitle_en: 'Auto-generated daily and monthly reports', href: '/reportes', icon: '📄', keywords: ['reportes', 'diario', 'mensual', 'informe', 'reports', 'daily'] },
  { title_es: 'Metodología', subtitle_es: 'Cómo funcionan los modelos de Qhawarina', title_en: 'Methodology', subtitle_en: "How Qhawarina's models work", href: '/metodologia', icon: '📖', keywords: ['metodologia', 'modelos', 'dfm', 'methodology', 'models'] },
  { title_es: 'Sobre Nosotros', subtitle_es: 'Misión, equipo y tecnología', title_en: 'About Us', subtitle_en: 'Mission, team and technology', href: '/sobre-nosotros', icon: '💡', keywords: ['about', 'nosotros', 'contacto', 'equipo', 'team'] },
  { title_es: 'API Docs', subtitle_es: 'Documentación de la API REST', title_en: 'API Docs', subtitle_en: 'REST API documentation', href: '/api/docs', icon: '⚙️', keywords: ['api', 'rest', 'endpoint', 'key', 'docs'] },
  // Statistics hub
  { title_es: 'Estadísticas', subtitle_es: 'Hub de todos los indicadores económicos', title_en: 'Statistics', subtitle_en: 'Hub of all economic indicators', href: '/estadisticas', icon: '📊', keywords: ['estadisticas', 'indicadores', 'statistics', 'indicators'] },
  { title_es: 'Calendario de Publicaciones', subtitle_es: 'Fechas INEI, BCRP y Qhawarina 2026', title_en: 'Publications Calendar', subtitle_en: 'INEI, BCRP and Qhawarina dates for 2026', href: '/estadisticas/calendario', icon: '📅', keywords: ['calendario', 'publicaciones', 'inei', 'bcrp', 'fechas', 'calendar', 'dates'] },
  // PBI / GDP
  { title_es: 'PBI — Nowcast', subtitle_es: 'Nowcast trimestral del Producto Bruto Interno', title_en: 'GDP — Nowcast', subtitle_en: 'Quarterly Gross Domestic Product nowcast', href: '/estadisticas/pbi', icon: '📈', keywords: ['pbi', 'gdp', 'producto bruto', 'crecimiento', 'trimestral', 'growth'] },
  { title_es: 'PBI — Gráficos', subtitle_es: 'Serie histórica trimestral del PBI', title_en: 'GDP — Charts', subtitle_en: 'Quarterly historical GDP series', href: '/estadisticas/pbi/graficos', icon: '📈', keywords: ['pbi', 'gdp', 'graficos', 'serie historica', 'charts'] },
  { title_es: 'PBI — Sectores', subtitle_es: 'Desagregación por sector económico', title_en: 'GDP — Sectors', subtitle_en: 'Breakdown by economic sector', href: '/estadisticas/pbi/sectores', icon: '🏭', keywords: ['pbi', 'sectores', 'manufactura', 'mineria', 'comercio', 'sectors'] },
  { title_es: 'PBI — Mapa Regional', subtitle_es: 'Distribución departamental con NTL', title_en: 'GDP — Regional Map', subtitle_en: 'Departmental distribution with NTL', href: '/estadisticas/pbi/mapas', icon: '🗺️', keywords: ['pbi', 'regional', 'departamental', 'mapa', 'ntl', 'map'] },
  { title_es: 'PBI — Metodología', subtitle_es: 'Modelo DFM para nowcast del PBI', title_en: 'GDP — Methodology', subtitle_en: 'DFM model for GDP nowcast', href: '/estadisticas/pbi/metodologia', icon: '📖', keywords: ['pbi', 'metodologia', 'dfm', 'gdp', 'methodology'] },
  // Inflación / Inflation
  { title_es: 'Inflación — Nowcast', subtitle_es: 'Nowcast mensual del IPC', title_en: 'Inflation — Nowcast', subtitle_en: 'Monthly CPI nowcast', href: '/estadisticas/inflacion', icon: '💰', keywords: ['inflacion', 'ipc', 'precios', 'mensual', 'inflation', 'cpi'] },
  { title_es: 'Inflación — Gráficos', subtitle_es: 'Serie histórica del IPC', title_en: 'Inflation — Charts', subtitle_en: 'Historical CPI series', href: '/estadisticas/inflacion/graficos', icon: '💰', keywords: ['inflacion', 'graficos', 'ipc', 'charts'] },
  { title_es: 'Inflación — Categorías', subtitle_es: 'IPC por categoría analítica', title_en: 'Inflation — Categories', subtitle_en: 'CPI by analytical category', href: '/estadisticas/inflacion/categorias', icon: '🗂️', keywords: ['inflacion', 'categorias', 'alimentos', 'core', 'subyacente', 'categories'] },
  { title_es: 'Inflación — Mapa Regional', subtitle_es: 'Inflación departamental', title_en: 'Inflation — Regional Map', subtitle_en: 'Departmental inflation', href: '/estadisticas/inflacion/mapas', icon: '🗺️', keywords: ['inflacion', 'regional', 'departamental', 'mapa', 'map'] },
  { title_es: 'Precios Alta Frecuencia', subtitle_es: 'Índice BPP de supermercados (Plaza Vea, Metro, Wong)', title_en: 'High-Frequency Prices', subtitle_en: 'Supermarket BPP index (Plaza Vea, Metro, Wong)', href: '/estadisticas/inflacion/precios-alta-frecuencia', icon: '🛒', keywords: ['precios', 'supermercados', 'bpp', 'plaza vea', 'metro', 'wong', 'prices'] },
  { title_es: 'Inflación — Metodología', subtitle_es: 'DFM de inflación mensual', title_en: 'Inflation — Methodology', subtitle_en: 'Monthly inflation DFM', href: '/estadisticas/inflacion/metodologia', icon: '📖', keywords: ['inflacion', 'metodologia', 'dfm', 'methodology'] },
  // Pobreza / Poverty
  { title_es: 'Pobreza — Nowcast', subtitle_es: 'Nowcast anual de pobreza monetaria', title_en: 'Poverty — Nowcast', subtitle_en: 'Annual monetary poverty nowcast', href: '/estadisticas/pobreza', icon: '🌡️', keywords: ['pobreza', 'monetaria', 'nowcast', 'anual', 'poverty'] },
  { title_es: 'Pobreza — Gráficos', subtitle_es: 'Serie histórica anual de pobreza', title_en: 'Poverty — Charts', subtitle_en: 'Annual historical poverty series', href: '/estadisticas/pobreza/graficos', icon: '📊', keywords: ['pobreza', 'graficos', 'historico', 'poverty', 'charts'] },
  { title_es: 'Pobreza — Mapa Regional', subtitle_es: 'Pobreza departamental con NTL', title_en: 'Poverty — Regional Map', subtitle_en: 'Departmental poverty with NTL', href: '/estadisticas/pobreza/mapas', icon: '🗺️', keywords: ['pobreza', 'mapa', 'departamental', 'regional', 'poverty', 'map'] },
  { title_es: 'Pobreza — Trimestral', subtitle_es: 'Serie trimestral de pobreza departamental', title_en: 'Poverty — Quarterly', subtitle_en: 'Quarterly departmental poverty series', href: '/estadisticas/pobreza/trimestral', icon: '📉', keywords: ['pobreza', 'trimestral', 'poverty', 'quarterly'] },
  { title_es: 'Pobreza — Distritos', subtitle_es: '~1,800 distritos con proxy NTL satelital', title_en: 'Poverty — Districts', subtitle_en: '~1,800 districts with satellite NTL proxy', href: '/estadisticas/pobreza/distritos', icon: '🏘️', keywords: ['pobreza', 'distritos', 'ubigeo', 'ntl', 'distrital', 'districts'] },
  { title_es: 'Pobreza — Metodología', subtitle_es: 'Modelo GBR con NTL para pobreza', title_en: 'Poverty — Methodology', subtitle_en: 'GBR model with NTL for poverty', href: '/estadisticas/pobreza/metodologia', icon: '📖', keywords: ['pobreza', 'metodologia', 'gbr', 'poverty', 'methodology'] },
  // Riesgo político / Political risk
  { title_es: 'Riesgo Político', subtitle_es: 'Índice diario de riesgo político para Perú', title_en: 'Political Risk', subtitle_en: 'Daily political risk index for Peru', href: '/estadisticas/riesgo-politico', icon: '⚡', keywords: ['riesgo', 'politico', 'indice', 'gpt', 'rss', 'diario', 'political', 'risk'] },
  { title_es: 'Riesgo Político — Metodología', subtitle_es: 'Clasificación GPT-4o de feeds RSS', title_en: 'Political Risk — Methodology', subtitle_en: 'GPT-4o classification of RSS feeds', href: '/estadisticas/riesgo-politico/metodologia', icon: '📖', keywords: ['riesgo', 'politico', 'metodologia', 'gpt', 'nlp', 'political', 'methodology'] },
  // Mercado cambiario / FX
  { title_es: 'Mercado Cambiario', subtitle_es: 'TC PEN/USD, intervenciones BCRP, bonos soberanos', title_en: 'FX Market', subtitle_en: 'PEN/USD rate, BCRP interventions, sovereign bonds', href: '/estadisticas/intervenciones', icon: '💱', keywords: ['tipo de cambio', 'tc', 'bcrp', 'intervencion', 'sol', 'usd', 'fx', 'exchange rate'] },
  // Precios diarios / Daily prices
  { title_es: 'Precios Diarios (BPP)', subtitle_es: 'Índice Jevons diario de 3 supermercados', title_en: 'Daily Prices (BPP)', subtitle_en: 'Daily Jevons index from 3 supermarkets', href: '/estadisticas/precios-diarios', icon: '🛒', keywords: ['precios diarios', 'bpp', 'jevons', 'supermercado', 'daily prices'] },
];

function resolveIndex(isEn: boolean): SearchItem[] {
  return SEARCH_INDEX.map(item => ({
    title: isEn ? item.title_en : item.title_es,
    subtitle: isEn ? item.subtitle_en : item.subtitle_es,
    href: item.href,
    icon: item.icon,
    keywords: item.keywords,
  }));
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function score(item: SearchItem, query: string): number {
  const q = query.toLowerCase();
  if (item.title.toLowerCase() === q) return 100;
  if (item.title.toLowerCase().startsWith(q)) return 80;
  if (item.title.toLowerCase().includes(q)) return 60;
  if (item.subtitle.toLowerCase().includes(q)) return 40;
  if (item.keywords.some(k => k.includes(q))) return 20;
  return 0;
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const isEn = useLocale() === 'en';

  const searchIndex = resolveIndex(isEn);

  const results = query.trim()
    ? searchIndex.map(item => ({ item, s: score(item, query) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(x => x.item)
    : searchIndex.slice(0, 6);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setSelectedIdx(0);
  }, []);

  const navigate = useCallback((href: string) => {
    router.push(href);
    close();
  }, [router, close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => { setSelectedIdx(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) navigate(results[selectedIdx].href);
  };

  return (
    <>
      {/* Trigger button (used in Header) */}
      <button
        id="search-trigger"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
        aria-label={isEn ? 'Search (Ctrl+K)' : 'Buscar (Ctrl+K)'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span className="hidden lg:inline">{isEn ? 'Search' : 'Buscar'}</span>
        <kbd className="hidden lg:inline text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isEn ? 'Search pages, indicators, data...' : 'Buscar páginas, indicadores, datos...'}
                className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <kbd className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono shrink-0">Esc</kbd>
            </div>

            {/* Results */}
            <ul className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 && (
                <li className="px-4 py-6 text-center text-gray-400 text-sm">
                  {isEn
                    ? `No results found for "${query}"`
                    : `No se encontraron resultados para "${query}"`}
                </li>
              )}
              {results.map((item, i) => (
                <li key={item.href}>
                  <button
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selectedIdx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${i === selectedIdx ? 'text-blue-800' : 'text-gray-900'}`}>
                        {highlight(item.title, query)}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                    </div>
                    {i === selectedIdx && (
                      <svg className="w-4 h-4 text-blue-500 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↑↓</kbd> {isEn ? 'navigate' : 'navegar'}</span>
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↵</kbd> {isEn ? 'open' : 'abrir'}</span>
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">Esc</kbd> {isEn ? 'close' : 'cerrar'}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
