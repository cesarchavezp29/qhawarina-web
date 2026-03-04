'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchItem {
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  keywords: string[];
}

const SEARCH_INDEX: SearchItem[] = [
  // Main pages
  { title: 'Inicio', subtitle: 'Dashboard principal con todos los nowcasts', href: '/', icon: '🏠', keywords: ['home', 'inicio', 'principal'] },
  { title: 'Datos Abiertos', subtitle: 'Descarga todos los datasets de Qhawarina', href: '/datos', icon: '📥', keywords: ['datos', 'descarga', 'csv', 'json', 'data'] },
  { title: 'Escenarios', subtitle: 'Análisis contrafactual con 10 escenarios', href: '/escenarios', icon: '🎯', keywords: ['escenarios', 'contrafactual', 'recesion', 'shock'] },
  { title: 'Simuladores', subtitle: 'Calculadoras interactivas de impacto económico', href: '/simuladores', icon: '🔬', keywords: ['simuladores', 'calculadora', 'impacto'] },
  { title: 'Reportes', subtitle: 'Reportes diarios y mensuales auto-generados', href: '/reportes', icon: '📄', keywords: ['reportes', 'diario', 'mensual', 'informe'] },
  { title: 'Metodología', subtitle: 'Cómo funcionan los modelos de Qhawarina', href: '/metodologia', icon: '📖', keywords: ['metodologia', 'modelos', 'dfm'] },
  { title: 'Sobre Nosotros', subtitle: 'Misión, equipo y tecnología', href: '/sobre-nosotros', icon: '💡', keywords: ['about', 'nosotros', 'contacto', 'equipo'] },
  { title: 'API Docs', subtitle: 'Documentación de la API REST', href: '/api/docs', icon: '⚙️', keywords: ['api', 'rest', 'endpoint', 'key'] },
  // Statistics hub
  { title: 'Estadísticas', subtitle: 'Hub de todos los indicadores económicos', href: '/estadisticas', icon: '📊', keywords: ['estadisticas', 'indicadores'] },
  { title: 'Calendario de Publicaciones', subtitle: 'Fechas INEI, BCRP y Qhawarina 2026', href: '/estadisticas/calendario', icon: '📅', keywords: ['calendario', 'publicaciones', 'inei', 'bcrp', 'fechas'] },
  // PBI
  { title: 'PBI — Nowcast', subtitle: 'Nowcast trimestral del Producto Bruto Interno', href: '/estadisticas/pbi', icon: '📈', keywords: ['pbi', 'gdp', 'producto bruto', 'crecimiento', 'trimestral'] },
  { title: 'PBI — Gráficos', subtitle: 'Serie histórica trimestral del PBI', href: '/estadisticas/pbi/graficos', icon: '📈', keywords: ['pbi', 'gdp', 'graficos', 'serie historica'] },
  { title: 'PBI — Sectores', subtitle: 'Desagregación por sector económico', href: '/estadisticas/pbi/sectores', icon: '🏭', keywords: ['pbi', 'sectores', 'manufactura', 'mineria', 'comercio'] },
  { title: 'PBI — Mapa Regional', subtitle: 'Distribución departamental con NTL', href: '/estadisticas/pbi/mapas', icon: '🗺️', keywords: ['pbi', 'regional', 'departamental', 'mapa', 'ntl'] },
  { title: 'PBI — Metodología', subtitle: 'Modelo DFM para nowcast del PBI', href: '/estadisticas/pbi/metodologia', icon: '📖', keywords: ['pbi', 'metodologia', 'dfm'] },
  // Inflación
  { title: 'Inflación — Nowcast', subtitle: 'Nowcast mensual del IPC', href: '/estadisticas/inflacion', icon: '💰', keywords: ['inflacion', 'ipc', 'precios', 'mensual'] },
  { title: 'Inflación — Gráficos', subtitle: 'Serie histórica del IPC', href: '/estadisticas/inflacion/graficos', icon: '💰', keywords: ['inflacion', 'graficos', 'ipc'] },
  { title: 'Inflación — Categorías', subtitle: 'IPC por categoría analítica', href: '/estadisticas/inflacion/categorias', icon: '🗂️', keywords: ['inflacion', 'categorias', 'alimentos', 'core', 'subyacente'] },
  { title: 'Inflación — Mapa Regional', subtitle: 'Inflación departamental', href: '/estadisticas/inflacion/mapas', icon: '🗺️', keywords: ['inflacion', 'regional', 'departamental', 'mapa'] },
  { title: 'Precios Alta Frecuencia', subtitle: 'Índice BPP de supermercados (Plaza Vea, Metro, Wong)', href: '/estadisticas/inflacion/precios-alta-frecuencia', icon: '🛒', keywords: ['precios', 'supermercados', 'bpp', 'plaza vea', 'metro', 'wong'] },
  { title: 'Inflación — Metodología', subtitle: 'DFM de inflación mensual', href: '/estadisticas/inflacion/metodologia', icon: '📖', keywords: ['inflacion', 'metodologia'] },
  // Pobreza
  { title: 'Pobreza — Nowcast', subtitle: 'Nowcast anual de pobreza monetaria', href: '/estadisticas/pobreza', icon: '🌡️', keywords: ['pobreza', 'monetaria', 'nowcast', 'anual'] },
  { title: 'Pobreza — Gráficos', subtitle: 'Serie histórica anual de pobreza', href: '/estadisticas/pobreza/graficos', icon: '📊', keywords: ['pobreza', 'graficos', 'historico'] },
  { title: 'Pobreza — Mapa Regional', subtitle: 'Pobreza departamental con NTL', href: '/estadisticas/pobreza/mapas', icon: '🗺️', keywords: ['pobreza', 'mapa', 'departamental', 'regional'] },
  { title: 'Pobreza — Trimestral', subtitle: 'Serie trimestral de pobreza departamental', href: '/estadisticas/pobreza/trimestral', icon: '📉', keywords: ['pobreza', 'trimestral'] },
  { title: 'Pobreza — Distritos', subtitle: '~1,800 distritos con proxy NTL satelital', href: '/estadisticas/pobreza/distritos', icon: '🏘️', keywords: ['pobreza', 'distritos', 'ubigeo', 'ntl', 'distrital'] },
  { title: 'Pobreza — Metodología', subtitle: 'Modelo GBR con NTL para pobreza', href: '/estadisticas/pobreza/metodologia', icon: '📖', keywords: ['pobreza', 'metodologia', 'gbr'] },
  // Riesgo político
  { title: 'Riesgo Político', subtitle: 'Índice diario de riesgo político para Perú', href: '/estadisticas/riesgo-politico', icon: '⚡', keywords: ['riesgo', 'politico', 'indice', 'gpt', 'rss', 'diario'] },
  { title: 'Riesgo Político — Metodología', subtitle: 'Clasificación GPT-4o de feeds RSS', href: '/estadisticas/riesgo-politico/metodologia', icon: '📖', keywords: ['riesgo', 'politico', 'metodologia', 'gpt', 'nlp'] },
  // Mercado cambiario
  { title: 'Mercado Cambiario', subtitle: 'TC PEN/USD, intervenciones BCRP, bonos soberanos', href: '/estadisticas/intervenciones', icon: '💱', keywords: ['tipo de cambio', 'tc', 'bcrp', 'intervencion', 'sol', 'usd', 'fx'] },
  // Precios diarios
  { title: 'Precios Diarios (BPP)', subtitle: 'Índice Jevons diario de 3 supermercados', href: '/estadisticas/precios-diarios', icon: '🛒', keywords: ['precios diarios', 'bpp', 'jevons', 'supermercado'] },
];

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

  const results = query.trim()
    ? SEARCH_INDEX.map(item => ({ item, s: score(item, query) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8)
        .map(x => x.item)
    : SEARCH_INDEX.slice(0, 6);

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
        aria-label="Buscar (Ctrl+K)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span className="hidden lg:inline">Buscar</span>
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
                placeholder="Buscar páginas, indicadores, datos..."
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
                  No se encontraron resultados para &quot;{query}&quot;
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
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↑↓</kbd> navegar</span>
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">↵</kbd> abrir</span>
              <span><kbd className="bg-gray-100 border border-gray-200 rounded px-1 font-mono">Esc</kbd> cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
