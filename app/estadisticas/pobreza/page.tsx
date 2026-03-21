'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from '../../components/stats/LastUpdate';
import CiteButton from '../../components/CiteButton';
import ShareButton from '../../components/ShareButton';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from 'recharts';
import { CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../lib/chartTheme';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

const AMBER = '#D97706';

// Known-good department names (JSON has double-UTF8 encoding bugs for some)
const DEPT_NAMES: Record<string, string> = {
  '01': 'Amazonas',    '02': 'Áncash',       '03': 'Apurímac',
  '04': 'Arequipa',   '05': 'Ayacucho',     '06': 'Cajamarca',
  '07': 'Callao',     '08': 'Cusco',        '09': 'Huancavelica',
  '10': 'Huánuco',    '11': 'Ica',          '12': 'Junín',
  '13': 'La Libertad','14': 'Lambayeque',   '15': 'Lima',
  '16': 'Loreto',     '17': 'Madre de Dios','18': 'Moquegua',
  '19': 'Pasco',      '20': 'Piura',        '21': 'Puno',
  '22': 'San Martín', '23': 'Tacna',        '24': 'Tumbes',
  '25': 'Ucayali',
};
function deptName(code: string, fallback: string): string {
  return DEPT_NAMES[code] ?? fallback;
}

interface PovertyData {
  metadata: {
    generated_at: string;
    target_year: number;
    last_official_enaho_year: number;
    departments: number;
    districts: number;
    model_type: string;
    training_window: string;
    methodology_note: string;
  };
  national: {
    poverty_rate: number;
    lower_bound: number;
    upper_bound: number;
    rmse_pp: number;
    unit: string;
  };
  departments: Array<{
    code: string;
    name: string;
    poverty_rate_2024: number;
    poverty_rate_2025_proyeccion: number;
    lower_bound: number;
    upper_bound: number;
    change_pp: number;
  }>;
  historical_series: Array<{
    year: number;
    official: number | null;
    nowcast: number | null;
    error: number | null;
  }>;
  backtest_metrics: {
    rmse: number;
    mae: number;
    r2: number;
    relative_rmse_vs_ar1: number;
  };
}

type SortKey = 'name' | 'poverty_rate_2024' | 'poverty_rate_2025_proyeccion' | 'change_pp';

export default function PobrezaPage() {
  const isEn = useLocale() === 'en';
  const [data, setData]       = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('poverty_rate_2025_proyeccion');
  const [sortAsc, setSortAsc] = useState(false);
  const [methOpen, setMethOpen] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── All useMemo hooks BEFORE early returns ──────────────────────────────
  const historicalChartData = useMemo(() => {
    if (!data) return [];
    // historical years: official bars + backtest nowcast line (2012-2024)
    const hist = data.historical_series.map(h => ({
      year:       h.year,
      official:   h.official ?? null,
      nowcast_bt: h.nowcast ?? null,   // backtest — both official & nowcast filled
      nowcast_25: null as number | null,
    }));
    // append 2025 nowcast as a separate bar (not in historical_series)
    hist.push({
      year:       data.metadata.target_year,
      official:   null,
      nowcast_bt: null,
      nowcast_25: data.national.poverty_rate,
    });
    return hist;
  }, [data]);

  const sortedDepts = useMemo(() => {
    if (!data) return [];
    return [...data.departments].sort((a, b) => {
      const va = a[sortKey] as string | number;
      const vb = b[sortKey] as string | number;
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [data, sortKey, sortAsc]);

  const extremeDepts = useMemo(() => {
    if (!data || data.departments.length === 0) return null;
    const sorted = [...data.departments].sort((a, b) => b.poverty_rate_2025_proyeccion - a.poverty_rate_2025_proyeccion);
    return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
  }, [data]);

  // Get 2024 official national rate from historical series
  const official2024 = useMemo(() => {
    if (!data) return null;
    const row = data.historical_series.find(h => h.year === data.metadata.last_official_enaho_year);
    return row?.official ?? null;
  }, [data]);

  // ── Early returns ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 rounded w-1/3 mb-4" style={{ background: '#E8E4DF' }} />
        <div className="h-4 rounded w-1/2 mb-10" style={{ background: '#E8E4DF' }} />
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1,2].map(i => <div key={i} className="h-40 rounded-xl" style={{ background: '#E8E4DF' }} />)}
        </div>
        <div className="h-64 rounded-xl" style={{ background: '#E8E4DF' }} />
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F4' }}>
      <p style={{ color: '#9B2226' }}>
        {isEn ? 'Error loading data.' : 'Error cargando datos.'}
        {' '}
        <button onClick={() => window.location.reload()} className="underline">
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </p>
    </div>
  );

  // ── Derived values ──────────────────────────────────────────────────────
  const nat         = data.national;
  const changePP    = official2024 != null ? nat.poverty_rate - official2024 : null;
  const changeColor = changePP == null ? '#8D99AE' : changePP < 0 ? '#2A9D8F' : changePP > 0 ? '#9B2226' : '#8D99AE';
  const ciHalf      = ((nat.upper_bound - nat.lower_bound) / 2).toFixed(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === 'name'); }
  };
  const sortIndicator = (k: SortKey) => sortKey !== k ? ' ↕' : sortAsc ? ' ↑' : ' ↓';

  const lastUpdated = (() => {
    try {
      return new Date(data.metadata.generated_at)
        .toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return data.metadata.generated_at.slice(0, 10); }
  })();

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: '#8D99AE' }}>
          <Link href="/estadisticas" className="hover:underline">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </Link>
          {' / '}
          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>
            {isEn ? 'Poverty' : 'Pobreza Monetaria'}
          </span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Monetary Poverty' : 'Pobreza Monetaria'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Poverty Nowcast (GBR)' : 'Nowcast de Pobreza (GBR)'} isEn={isEn} />
            <ShareButton
              title={`${isEn ? 'Poverty Nowcast' : 'Nowcast de Pobreza'} — Qhawarina`}
              text={
                isEn
                  ? `📊 Peru Poverty Nowcast ${data.metadata.target_year} | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`
                  : `📊 Nowcast pobreza Perú ${data.metadata.target_year} | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`
              }
            />
          </div>
        </div>
        <p className="text-sm mb-2" style={{ color: '#8D99AE' }}>
          {isEn
            ? `Nowcast ${data.metadata.target_year} · Model: ${data.metadata.model_type} · Training: ${data.metadata.training_window}`
            : `Nowcast ${data.metadata.target_year} · Modelo: ${data.metadata.model_type} · Entrenamiento: ${data.metadata.training_window}`}
        </p>
        <div className="mb-6">
          <LastUpdate date={lastUpdated} />
        </div>

        {/* ── Hero cards ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Nowcast card */}
          <div className="rounded-xl p-6 flex flex-col"
            style={{ background: '#FFFCF7', border: `1px solid ${AMBER}55` }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#8D99AE' }}>
              {isEn ? `Poverty Nowcast ${data.metadata.target_year}` : `Pobreza Proyectada ${data.metadata.target_year}`}
            </p>
            <p className="text-6xl font-bold leading-none mt-3 mb-2" style={{ color: AMBER }}>
              {nat.poverty_rate.toFixed(1)}%
            </p>
            {changePP != null && (
              <p className="text-xl font-semibold mb-1" style={{ color: changeColor }}>
                {changePP > 0 ? '+' : ''}{changePP.toFixed(1)} pp vs {data.metadata.last_official_enaho_year}
              </p>
            )}
            <p className="text-sm mb-4" style={{ color: '#8D99AE' }}>
              {isEn ? `Uncertainty: ±${ciHalf} pp  ·  CI 95%: [${nat.lower_bound.toFixed(1)}%–${nat.upper_bound.toFixed(1)}%]`
                     : `Incertidumbre: ±${ciHalf} pp  ·  IC 95%: [${nat.lower_bound.toFixed(1)}%–${nat.upper_bound.toFixed(1)}%]`}
            </p>
            <p className="text-xs mt-auto pt-3" style={{ borderTop: '1px solid #E8E4DF', color: '#8D99AE' }}>
              {isEn
                ? 'Based on departmental economic indicators. Not a direct poverty measurement.'
                : 'Basado en indicadores económicos departamentales. No es una medición directa.'}
            </p>
          </div>

          {/* Extreme departments */}
          {extremeDepts && (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl p-4 flex-1"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Highest poverty' : 'Mayor pobreza'}
                </p>
                <p className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
                  {deptName(extremeDepts.highest.code, extremeDepts.highest.name)}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#9B2226' }}>
                  {extremeDepts.highest.poverty_rate_2025_proyeccion.toFixed(1)}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: extremeDepts.highest.change_pp > 0 ? '#9B2226' : '#2A9D8F' }}>
                  {extremeDepts.highest.change_pp > 0 ? '+' : ''}{extremeDepts.highest.change_pp.toFixed(1)} pp vs 2024
                </p>
              </div>
              <div className="rounded-xl p-4 flex-1"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Lowest poverty' : 'Menor pobreza'}
                </p>
                <p className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
                  {deptName(extremeDepts.lowest.code, extremeDepts.lowest.name)}
                </p>
                <p className="text-2xl font-bold" style={{ color: '#2A9D8F' }}>
                  {extremeDepts.lowest.poverty_rate_2025_proyeccion.toFixed(1)}%
                </p>
                <p className="text-xs mt-0.5" style={{ color: extremeDepts.lowest.change_pp > 0 ? '#9B2226' : '#2A9D8F' }}>
                  {extremeDepts.lowest.change_pp > 0 ? '+' : ''}{extremeDepts.lowest.change_pp.toFixed(1)} pp vs 2024
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Historical chart ─────────────────────────────────────────────── */}
        <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Historical Poverty Trend' : 'Evolución Histórica de la Pobreza Monetaria'}
          </h2>
          <p className="text-xs mb-4" style={{ color: '#8D99AE' }}>
            {isEn
              ? 'Dark bars = INEI official (2004–2024). Teal line = model backtest (2012–2024). Amber bar = 2025 nowcast.'
              : 'Barras oscuras = oficial INEI (2004–2024). Línea teal = backtest del modelo (2012–2024). Barra ámbar = nowcast 2025.'}
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={historicalChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke}
                strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
              <XAxis dataKey="year" tick={{ ...axisTickStyle, fontSize: 9 }}
                stroke={CHART_DEFAULTS.axisStroke} interval={2} />
              <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={(v: number) => `${v}%`} domain={[0, 65]} />
              <Tooltip contentStyle={tooltipContentStyle}
                formatter={(v: any) => [v != null ? `${Number(v).toFixed(1)}%` : '—']} />
              {/* Official bars 2004–2024 */}
              <Bar dataKey="official" name={isEn ? 'Official (INEI)' : 'Oficial (INEI)'}
                fill={CHART_COLORS.ink} fillOpacity={0.6} radius={[2, 2, 0, 0]} />
              {/* 2025 nowcast bar */}
              <Bar dataKey="nowcast_25" name={`Nowcast ${data.metadata.target_year}`}
                fill={AMBER} radius={[2, 2, 0, 0]} />
              {/* Backtest line 2012–2024 */}
              <Line type="monotone" dataKey="nowcast_bt"
                name={isEn ? 'Model backtest' : 'Backtest modelo'}
                stroke={CHART_COLORS.teal} strokeWidth={1.5} strokeDasharray="4 2"
                dot={{ r: 2.5, fill: CHART_COLORS.teal, strokeWidth: 0 }}
                connectNulls={false} />
              <ReferenceLine
                x={data.metadata.target_year}
                stroke={AMBER} strokeDasharray="4 2"
                label={{ value: `${nat.poverty_rate.toFixed(1)}%`, position: 'insideTopLeft', fontSize: 10, fill: AMBER }}
              />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-center mt-2" style={{ color: '#8D99AE' }}>
            {isEn
              ? `IC 95%: [${nat.lower_bound.toFixed(1)}% – ${nat.upper_bound.toFixed(1)}%]  ·  MAE histórico: ${data.backtest_metrics.mae.toFixed(2)} pp  ·  R²: ${data.backtest_metrics.r2.toFixed(2)}`
              : `IC 95%: [${nat.lower_bound.toFixed(1)}% – ${nat.upper_bound.toFixed(1)}%]  ·  MAE histórico: ${data.backtest_metrics.mae.toFixed(2)} pp  ·  R²: ${data.backtest_metrics.r2.toFixed(2)}`}
          </p>
        </div>

        {/* ── Department table ─────────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid #E8E4DF' }}>
          <div className="p-5" style={{ borderBottom: '1px solid #E8E4DF', background: '#FFFCF7' }}>
            <h2 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Poverty by Department' : 'Pobreza por Departamento'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
              {isEn ? 'Click column headers to sort.' : 'Haz clic en las cabeceras para ordenar.'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide"
                  style={{ borderBottom: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: '#FAF8F4', color: '#8D99AE' }}>
                  {([
                    ['name',                         isEn ? 'Department'   : 'Departamento'],
                    ['poverty_rate_2024',             isEn ? '2024 (INEI)'  : '2024 (INEI)'],
                    ['poverty_rate_2025_proyeccion',  'Nowcast 2025'],
                    ['change_pp',                    isEn ? 'Change'        : 'Cambio'],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k}
                      className="px-4 py-3 text-left cursor-pointer select-none hover:text-gray-700"
                      onClick={() => handleSort(k)}>
                      {label}
                      <span className="ml-1" style={{ color: sortKey === k ? AMBER : '#d1d5db' }}>
                        {sortIndicator(k)}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDepts.map((dept, i) => (
                  <tr key={dept.code}
                    style={{ borderBottom: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: i % 2 === 0 ? '#FFFCF7' : '#FAF8F4' }}>
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#1a1a1a' }}>{deptName(dept.code, dept.name)}</td>
                    <td className="px-4 py-2.5" style={{ color: '#8D99AE' }}>
                      {dept.poverty_rate_2024.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: AMBER }}>
                      {dept.poverty_rate_2025_proyeccion.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-semibold"
                      style={{ color: dept.change_pp < 0 ? '#2A9D8F' : dept.change_pp > 0 ? '#9B2226' : '#8D99AE' }}>
                      {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)} pp
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Backtest + model stats ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {([
            [isEn ? 'MAE' : 'MAE',   `${data.backtest_metrics.mae.toFixed(2)} pp`],
            [isEn ? 'RMSE' : 'RMSE', `${data.backtest_metrics.rmse.toFixed(2)} pp`],
            ['R²',                    data.backtest_metrics.r2.toFixed(2)],
            [isEn ? 'Departments' : 'Departamentos', String(data.metadata.departments)],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="rounded-xl p-4 text-center"
              style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: '#8D99AE' }}>{label}</p>
              <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* ── Methodology (collapsible) ──────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden mb-8" style={{ border: '1px solid #E8E4DF' }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
            style={{ background: '#FFFCF7' }}
            onClick={() => setMethOpen(o => !o)}>
            <span className="font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Methodology' : 'Metodología'}
            </span>
            <span style={{ color: '#8D99AE' }}>{methOpen ? '−' : '+'}</span>
          </button>
          {methOpen && (
            <div className="px-5 pb-5 pt-4 text-sm space-y-3"
              style={{ borderTop: '1px solid #E8E4DF', color: '#2D3142' }}>
              <p className="leading-relaxed" style={{ color: '#8D99AE' }}>
                {data.metadata.methodology_note}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#8D99AE' }}>
                    {isEn ? 'MODEL' : 'MODELO'}
                  </p>
                  <ul className="text-xs space-y-0.5" style={{ color: '#2D3142' }}>
                    <li>{data.metadata.model_type}</li>
                    <li>{isEn ? 'Training: ' : 'Entrenamiento: '}{data.metadata.training_window}</li>
                    <li>MAE = {data.backtest_metrics.mae.toFixed(2)} pp · RMSE = {data.backtest_metrics.rmse.toFixed(2)} pp</li>
                    <li>R² = {data.backtest_metrics.r2.toFixed(2)} · RMSE vs AR(1): {data.backtest_metrics.relative_rmse_vs_ar1.toFixed(3)}</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: '#8D99AE' }}>
                    {isEn ? 'VARIABLES' : 'VARIABLES'}
                  </p>
                  <ul className="text-xs space-y-0.5" style={{ color: '#2D3142' }}>
                    <li>{isEn ? 'Electricity consumption' : 'Consumo eléctrico'}</li>
                    <li>{isEn ? 'Credit outstanding' : 'Crédito'}</li>
                    <li>{isEn ? 'Government capex & spending' : 'Capex y gasto público'}</li>
                    <li>{isEn ? 'Mining production' : 'Producción minera'}</li>
                    <li>{isEn ? 'Tax revenue (SUNAT)' : 'Recaudación tributaria (SUNAT)'}</li>
                    <li>{isEn ? 'Inflation (CPI)' : 'Inflación (IPC)'}</li>
                    <li>{isEn ? 'Monthly GDP index (BCRP)' : 'PBI mensual (BCRP)'}</li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg text-xs mt-2" style={{ background: '#FEF3C7', color: '#92400E' }}>
                <strong>{isEn ? 'Disclaimer: ' : 'Aviso: '}</strong>
                {isEn
                  ? "This nowcast is an estimate, not a direct poverty measurement. The official figure comes from INEI's ENAHO survey, published annually."
                  : 'Este nowcast es una estimación, no una medición directa de pobreza. La cifra oficial proviene de la ENAHO del INEI, publicada anualmente.'}
              </div>
            </div>
          )}
        </div>

        {/* ── Sub-page nav ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { href: '/estadisticas/pobreza/graficos',  labelEs: 'Evolución Temporal',    labelEn: 'Time Series',        descEs: 'Serie histórica anual',                 descEn: 'Annual historical series',      color: '#C65D3E' },
            { href: '/estadisticas/pobreza/mapas',     labelEs: 'Distribución Regional', labelEn: 'Regional Map',       descEs: 'Mapa coroplético departamental',         descEn: 'Departmental choropleth map',   color: '#2A9D8F' },
            { href: '/estadisticas/pobreza/distritos', labelEs: 'Explorador Distrital',  labelEn: 'District Explorer',  descEs: `~${data.metadata.districts.toLocaleString()} distritos`, descEn: `~${data.metadata.districts.toLocaleString()} districts`, color: '#8B7355' },
          ].map(card => (
            <Link key={card.href} href={card.href}>
              <div className="rounded-xl p-5 transition-all hover:shadow-sm cursor-pointer"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderLeft: `4px solid ${card.color}` }}>
                <h2 className="text-base font-bold mb-1" style={{ color: '#1a1a1a' }}>
                  {isEn ? card.labelEn : card.labelEs}
                </h2>
                <p className="text-sm" style={{ color: '#8D99AE' }}>
                  {isEn ? card.descEn : card.descEs}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/estadisticas/pobreza/metodologia"
            className="text-sm font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </Link>
        </div>

      </div>
    </div>
  );
}
