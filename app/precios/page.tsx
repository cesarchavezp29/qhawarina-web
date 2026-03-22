'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';

// ── Design tokens ──────────────────────────────────────────────────────────
const TERRA    = '#C65D3E';
const TEAL     = '#2A9D8F';
const CARD_BG  = '#FFFCF7';
const BORDER   = 'rgba(120,113,108,0.18)';
const INK      = '#2D3142';
const INK3     = '#78716c';

const COLORS = ['#C65D3E', '#2A9D8F', '#6366f1', '#d97706', '#0891b2', '#65a30d'];

const STORE_LABELS: Record<string, string> = {
  plazavea: 'Plaza Vea',
  metro:    'Metro',
  wong:     'Wong',
};

const CATEGORIES_ES: Record<string, string> = {
  carnes:          '🥩 Carnes',
  frutas:          '🍎 Frutas',
  verduras:        '🥦 Verduras',
  lacteos:         '🥛 Lácteos',
  huevos:          '🥚 Huevos',
  pan_harinas:     '🍞 Pan y Harinas',
  arroz_cereales:  '🌾 Arroz y Cereales',
  bebidas:         '🥤 Bebidas',
  aceites_grasas:  '🫙 Aceites',
  pescados_mariscos:'🐟 Pescados',
  azucar_dulces:   '🍬 Azúcar y Dulces',
  limpieza:        '🧹 Limpieza',
  cuidado_personal:'🧴 Cuidado Personal',
  other:           '📦 Otros',
};
const CATEGORIES_EN: Record<string, string> = {
  carnes:          '🥩 Meats',
  frutas:          '🍎 Fruits',
  verduras:        '🥦 Vegetables',
  lacteos:         '🥛 Dairy',
  huevos:          '🥚 Eggs',
  pan_harinas:     '🍞 Bread & Flour',
  arroz_cereales:  '🌾 Rice & Grains',
  bebidas:         '🥤 Beverages',
  aceites_grasas:  '🫙 Oils & Fats',
  pescados_mariscos:'🐟 Fish & Seafood',
  azucar_dulces:   '🍬 Sugar & Sweets',
  limpieza:        '🧹 Cleaning',
  cuidado_personal:'🧴 Personal Care',
  other:           '📦 Other',
};

interface Product {
  id: string;
  sku: string;
  store: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  change: number | null;
}

interface PricePoint { date: string; price: number }

// ── Debounce hook ─────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function PriceTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: '10px 14px', fontSize: 13,
    }}>
      <div style={{ color: INK3, marginBottom: 4, fontSize: 11 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke, fontWeight: 600 }}>
          {p.name}: S/ {p.value?.toFixed(2)}
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PreciosPage() {
  const isEn = useLocale() === 'en';
  const CATS = isEn ? CATEGORIES_EN : CATEGORIES_ES;

  const [query, setQuery]               = useState('');
  const [storeFilter, setStoreFilter]   = useState('');
  const [catFilter, setCatFilter]       = useState('');
  const [results, setResults]           = useState<Product[]>([]);
  const [selected, setSelected]         = useState<Product[]>([]);
  const [history, setHistory]           = useState<Record<string, PricePoint[]>>({});
  const [loading, setLoading]           = useState(false);
  const [histLoading, setHistLoading]   = useState(false);
  const [meta, setMeta]                 = useState<{ base_date: string; latest_date: string } | null>(null);
  const [showAbsolute, setShowAbsolute] = useState(true);

  const debouncedQuery = useDebounce(query, 300);

  // ── Search ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!debouncedQuery && !storeFilter && !catFilter) {
      setResults([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (storeFilter)    params.set('store', storeFilter);
    if (catFilter)      params.set('category', catFilter);
    params.set('limit', '60');

    fetch(`/api/prices/search?${params}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.products || []);
        if (data.base_date) setMeta({ base_date: data.base_date, latest_date: data.latest_date });
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, storeFilter, catFilter]);

  // ── Load history when selection changes ────────────────────────────────
  useEffect(() => {
    if (!selected.length) { setHistory({}); return; }
    setHistLoading(true);
    const ids = selected.map(p => p.id).join(',');
    fetch(`/api/prices/history?ids=${ids}`)
      .then(r => r.json())
      .then(data => setHistory(data.series || {}))
      .finally(() => setHistLoading(false));
  }, [selected]);

  // ── Chart data ─────────────────────────────────────────────────────────
  const chartData = (() => {
    if (!selected.length) return [];
    const allDates = new Set<string>();
    selected.forEach(p => (history[p.id] || []).forEach(d => allDates.add(d.date)));
    return Array.from(allDates).sort().map(date => {
      const row: any = { date: date.slice(5) }; // MM-DD
      selected.forEach((p, i) => {
        const point = (history[p.id] || []).find(d => d.date === date);
        if (point) {
          if (showAbsolute) {
            row[`p${i}`] = point.price;
          } else {
            // Get base price (first available price for this product)
            const series = history[p.id] || [];
            const base = series[0]?.price;
            row[`p${i}`] = base ? +((point.price / base - 1) * 100).toFixed(2) : null;
          }
        }
      });
      return row;
    });
  })();

  const toggleProduct = (p: Product) => {
    setSelected(prev => {
      const exists = prev.find(x => x.id === p.id);
      if (exists) return prev.filter(x => x.id !== p.id);
      if (prev.length >= 6) return prev;
      return [...prev, p];
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
          {isEn ? 'Supermarket Price Tracker' : 'Seguimiento de Precios de Supermercado'}
        </h1>
        <p className="text-stone-500 max-w-2xl">
          {isEn
            ? 'Track and compare prices for 42,000+ products from Plaza Vea, Metro and Wong. Data scraped daily.'
            : 'Sigue y compara precios de más de 42,000 productos de Plaza Vea, Metro y Wong. Datos actualizados a diario.'}
        </p>
        {meta && (
          <div className="text-xs text-stone-400">
            {isEn ? 'Base' : 'Base'}: {meta.base_date} · {isEn ? 'Latest' : 'Última actualización'}: {meta.latest_date}
          </div>
        )}
      </div>

      {/* ── Compare chart ───────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-bold text-stone-800">
              {isEn ? 'Price comparison' : 'Comparación de precios'}
            </h2>
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setShowAbsolute(true)}
                style={{
                  padding: '4px 10px', borderRadius: 20, border: `1px solid ${BORDER}`,
                  background: showAbsolute ? TERRA : 'transparent',
                  color: showAbsolute ? '#fff' : INK3, cursor: 'pointer',
                }}
              >
                {isEn ? 'S/ price' : 'Precio S/'}
              </button>
              <button
                onClick={() => setShowAbsolute(false)}
                style={{
                  padding: '4px 10px', borderRadius: 20, border: `1px solid ${BORDER}`,
                  background: !showAbsolute ? TERRA : 'transparent',
                  color: !showAbsolute ? '#fff' : INK3, cursor: 'pointer',
                }}
              >
                {isEn ? '% change' : '% cambio'}
              </button>
            </div>
          </div>

          {/* Selected chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selected.map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: COLORS[i] + '18', border: `1px solid ${COLORS[i]}50`,
                borderRadius: 20, padding: '3px 10px', fontSize: 12,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i], display: 'inline-block' }} />
                <span className="font-medium" style={{ color: INK }}>
                  {p.name.length > 35 ? p.name.slice(0, 35) + '…' : p.name}
                </span>
                <span style={{ color: INK3 }}>· {STORE_LABELS[p.store]}</span>
                <button
                  onClick={() => toggleProduct(p)}
                  style={{ marginLeft: 2, color: INK3, cursor: 'pointer', border: 'none', background: 'none', fontSize: 14, lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>

          {histLoading ? (
            <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
              {isEn ? 'Loading…' : 'Cargando…'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: INK3 }} />
                <YAxis
                  tick={{ fontSize: 11, fill: INK3 }}
                  tickFormatter={v => showAbsolute ? `S/${v}` : `${v}%`}
                  width={52}
                />
                {!showAbsolute && <ReferenceLine y={0} stroke="rgba(0,0,0,0.15)" strokeDasharray="4 2" />}
                <Tooltip content={<PriceTooltip />} />
                {selected.map((p, i) => (
                  <Line
                    key={p.id}
                    type="monotone"
                    dataKey={`p${i}`}
                    name={`${p.name.slice(0, 25)} (${STORE_LABELS[p.store]})`}
                    stroke={COLORS[i]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* ── Search & filters ─────────────────────────────────────────── */}
      <div style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '20px 24px' }} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={isEn ? 'Search products…' : 'Buscar productos…'}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 10,
              border: `1px solid ${BORDER}`, fontSize: 14,
              background: '#fff', outline: 'none',
            }}
          />
          <select
            value={storeFilter}
            onChange={e => setStoreFilter(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
              fontSize: 13, background: '#fff', color: INK,
            }}
          >
            <option value="">{isEn ? 'All stores' : 'Todas las tiendas'}</option>
            <option value="plazavea">Plaza Vea</option>
            <option value="metro">Metro</option>
            <option value="wong">Wong</option>
          </select>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
              fontSize: 13, background: '#fff', color: INK,
            }}
          >
            <option value="">{isEn ? 'All categories' : 'Todas las categorías'}</option>
            {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-6 text-stone-400 text-sm">{isEn ? 'Searching…' : 'Buscando…'}</div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <div className="text-xs text-stone-400 mb-2">
              {results.length} {isEn ? 'results' : 'resultados'} · {isEn ? 'Select up to 6 to compare' : 'Selecciona hasta 6 para comparar'}
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {results.map(p => {
                const isSelected = !!selected.find(x => x.id === p.id);
                const selIdx = selected.findIndex(x => x.id === p.id);
                const color = selIdx >= 0 ? COLORS[selIdx] : undefined;
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p)}
                    disabled={!isSelected && selected.length >= 6}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', padding: '8px 12px',
                      borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                      border: isSelected ? `1px solid ${color}` : `1px solid transparent`,
                      background: isSelected ? (color + '12') : 'transparent',
                      opacity: !isSelected && selected.length >= 6 ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? color : INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: INK3 }}>
                        {p.brand && `${p.brand} · `}{STORE_LABELS[p.store]} · {CATS[p.category] || p.category}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: INK }}>S/ {p.price.toFixed(2)}</div>
                      {p.change !== null && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: p.change > 0 ? '#dc2626' : p.change < 0 ? '#16a34a' : INK3 }}>
                          {p.change > 0 ? '+' : ''}{p.change?.toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !results.length && (query || storeFilter || catFilter) && (
          <div className="text-center py-6 text-stone-400 text-sm">
            {isEn ? 'No products found.' : 'No se encontraron productos.'}
          </div>
        )}

        {!query && !storeFilter && !catFilter && (
          <div className="text-center py-4 text-stone-400 text-sm">
            {isEn ? 'Search for a product or filter by store / category.' : 'Busca un producto o filtra por tienda o categoría.'}
          </div>
        )}
      </div>

      {/* ── Coverage note ─────────────────────────────────────────────── */}
      <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px' }}>
        <p className="text-xs text-amber-800">
          {isEn
            ? `Prices scraped daily from Plaza Vea, Metro and Wong (~42,000 products). Base date: ${meta?.base_date || '2026-02-10'}. Days with no scrape are linearly interpolated and flagged. Missing days cannot be recovered retroactively.`
            : `Precios raspados diariamente de Plaza Vea, Metro y Wong (~42,000 productos). Fecha base: ${meta?.base_date || '2026-02-10'}. Los días sin raspado se interpolan linealmente y se marcan. Los días faltantes no se pueden recuperar retroactivamente.`}
        </p>
      </div>
    </div>
  );
}
