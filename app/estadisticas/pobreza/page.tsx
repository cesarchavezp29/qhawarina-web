'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from "../../components/stats/LastUpdate";
import EmbedWidget from "../../components/EmbedWidget";
import ShareButton from "../../components/ShareButton";
import DataFreshnessWarning from "../../components/DataFreshnessWarning";
import PageSkeleton from "../../components/PageSkeleton";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, ReferenceLine, Cell, Legend,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PovertyData {
  metadata: {
    target_year: number;
    vintage_month: string;
    months_available: number;
    model: string;
    blend_alpha: number;
    last_updated: string;
    methodology_version: string;
  };
  national: {
    poverty_nowcast: number;
    poverty_2024_official: number;
    change_pp: number;
    lower_ci: number;
    upper_ci: number;
    pressure_current: string;
    pressure_score: number;
  };
  departments: Array<{
    department: string;
    dept_code: string;
    poverty_nowcast: number;
    poverty_2024_official: number;
    change_pp: number;
    lower_ci: number;
    upper_ci: number;
    pressure_label: string;
  }>;
  monthly_series: Array<{
    month: string;
    national_rolling3m: number;
    national_monthly: number;
    pressure_score: number;
    pressure_label: string;
  }>;
  historical_annual: Array<{ year: number; official: number; nowcast: null }>;
  revision_path: Array<{ vintage: string; national_nowcast: number }>;
  backtest: {
    model: string;
    validation_years: string;
    rmse: number;
    mae: number;
    directional_accuracy: number;
    vintage_mae: { Q1: number; Q2: number; Q3: number; Q4: number };
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const AMBER       = '#D97706';
const AMBER_LIGHT = '#FDE68A';
const AMBER_MID   = '#E0A458';

const PRESSURE_COLORS: Record<string, string> = {
  mejora_significativa:  '#16a34a',
  mejora_moderada:       '#4ade80',
  estable:               '#9ca3af',
  deterioro_moderado:    '#f97316',
  deterioro_significativo: '#ef4444',
};

const PRESSURE_ICONS: Record<string, string> = {
  mejora_significativa:  '↓↓',
  mejora_moderada:       '↓',
  estable:               '→',
  deterioro_moderado:    '↑',
  deterioro_significativo: '↑↑',
};

const MO_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MO_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtMonth(m: string, isEn: boolean) {
  const idx = parseInt(m.split('-')[1], 10) - 1;
  return isEn ? MO_EN[idx] : MO_ES[idx];
}

function fmtVintage(vm: string, isEn: boolean) {
  // "2025-09" → "septiembre 2025" / "September 2025"
  const [yr, mo] = vm.split('-');
  const months_es = ['enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  const idx = parseInt(mo, 10) - 1;
  return isEn ? `${months_en[idx]} ${yr}` : `${months_es[idx]} ${yr}`;
}

function pressureLabelText(label: string, isEn: boolean) {
  const map: Record<string, [string, string]> = {
    mejora_significativa:  ['Mejora significativa', 'Significant improvement'],
    mejora_moderada:       ['Mejora moderada',       'Moderate improvement'],
    estable:               ['Estable',               'Stable'],
    deterioro_moderado:    ['Deterioro moderado',    'Moderate deterioration'],
    deterioro_significativo: ['Deterioro significativo', 'Significant deterioration'],
  };
  return (map[label] ?? ['Estable', 'Stable'])[isEn ? 1 : 0];
}

type SortKey = 'department' | 'poverty_2024_official' | 'poverty_nowcast' | 'change_pp';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PobrezaPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const [data, setData]       = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('poverty_nowcast');
  const [sortAsc, setSortAsc] = useState(false);
  const [methOpen, setMethOpen] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── All useMemo hooks BEFORE early returns ────────────────────────────────

  const monthlyChartData = useMemo(() => {
    if (!data) return [];
    return data.monthly_series.map(m => ({
      label:     fmtMonth(m.month, isEn),
      rolling3m: m.national_rolling3m,
      monthly:   m.national_monthly,
      lower:     data.national.lower_ci,
      upper:     data.national.upper_ci,
    }));
  }, [data, isEn]);

  const historicalChartData = useMemo(() => {
    if (!data) return [];
    const hist = data.historical_annual.map(h => ({
      year:        h.year,
      official:    h.official,
      nowcast:     null as number | null,
      is_nowcast:  false,
    }));
    hist.push({
      year:       data.metadata.target_year,
      official:   null as unknown as number,
      nowcast:    data.national.poverty_nowcast,
      is_nowcast: true,
    });
    return hist;
  }, [data]);

  const sortedDepts = useMemo(() => {
    if (!data) return [];
    const sorted = [...data.departments].sort((a, b) => {
      const va = a[sortKey] as string | number;
      const vb = b[sortKey] as string | number;
      if (typeof va === 'string') return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
    return sorted;
  }, [data, sortKey, sortAsc]);

  const extremeDepts = useMemo(() => {
    if (!data || data.departments.length === 0) return null;
    const sorted = [...data.departments].sort((a, b) => b.poverty_nowcast - a.poverty_nowcast);
    return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
  }, [data]);

  // ── Early returns ──────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton cards={4} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">
        {isEn ? 'Error loading data.' : 'Error cargando datos.'}
        {' '}
        <button onClick={() => window.location.reload()} className="underline">
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </p>
    </div>
  );

  const nat       = data.national;
  const latest    = data.monthly_series[data.monthly_series.length - 1];
  const vintageStr = fmtVintage(data.metadata.vintage_month, isEn);
  const changeDir  = nat.change_pp < 0 ? 'down' : nat.change_pp > 0 ? 'up' : 'flat';
  const changeColor = changeDir === 'down' ? '#16a34a' : changeDir === 'up' ? '#ef4444' : '#9ca3af';

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === 'department'); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1" style={{ color: AMBER }}>{sortAsc ? '↑' : '↓'}</span>;
  }

  const lastUpdated = new Date(data.metadata.last_updated)
    .toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb + title */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-amber-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </a>
          {' / '}
          <span className="text-gray-900 font-medium">
            {isEn ? 'Poverty' : 'Pobreza Monetaria'}
          </span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">
            {isEn ? 'Monetary Poverty' : 'Pobreza Monetaria'}
          </h1>
          <div className="flex gap-2">
            <ShareButton
              title={`${isEn ? 'Poverty' : 'Pobreza'} — Qhawarina`}
              text={isEn
                ? `Poverty nowcast Peru 2025: ${nat.poverty_nowcast.toFixed(1)}% national (${nat.change_pp > 0 ? '+' : ''}${nat.change_pp.toFixed(1)}pp vs 2024) | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`
                : `Nowcast pobreza Perú 2025: ${nat.poverty_nowcast.toFixed(1)}% nacional (${nat.change_pp > 0 ? '+' : ''}${nat.change_pp.toFixed(1)}pp vs 2024) | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`}
            />
            <EmbedWidget
              path="/estadisticas/pobreza"
              title={`${isEn ? 'Poverty' : 'Pobreza'} — Nowcast Qhawarina`}
              height={600}
            />
          </div>
        </div>
        <LastUpdate date={lastUpdated} />
        <DataFreshnessWarning generatedAt={data.metadata.last_updated} dataName={isEn ? 'poverty data' : 'los datos de pobreza'} />

        {/* ── Section 1: Hero cards ────────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Left: Poverty nowcast */}
          <div className="rounded-xl border-2 p-6 flex flex-col bg-white"
               style={{ borderColor: `${AMBER}66` }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'POVERTY NOWCAST 2025' : 'POBREZA PROYECTADA 2025'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn
                ? `Based on data Jan–${fmtMonth(data.metadata.vintage_month, true)} 2025 (${data.metadata.months_available} of 12 months)`
                : `Basado en datos Ene–${fmtMonth(data.metadata.vintage_month, false)} 2025 (${data.metadata.months_available} de 12 meses)`}
            </p>
            <p className="text-6xl font-bold leading-none mt-4" style={{ color: AMBER }}>
              {nat.poverty_nowcast.toFixed(1)}%
            </p>
            <p className="text-2xl font-semibold mt-2" style={{ color: changeColor }}>
              {nat.change_pp > 0 ? '+' : ''}{nat.change_pp.toFixed(1)} pp vs 2024
            </p>
            <p className="text-xs text-gray-400 mt-2">
              IC 95%: [{nat.lower_ci.toFixed(1)}% – {nat.upper_ci.toFixed(1)}%]
            </p>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              {isEn
                ? `Model: GBR + persistence (α=${data.metadata.blend_alpha}). Monthly update.`
                : `Modelo: GBR + persistencia (α=${data.metadata.blend_alpha}). Actualización mensual.`}
            </p>
          </div>

          {/* Right: Pressure */}
          <div className="rounded-xl border-2 p-6 flex flex-col bg-white"
               style={{ borderColor: `${PRESSURE_COLORS[latest?.pressure_label ?? 'estable']}44` }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'RECENT CONDITIONS' : 'CONDICIONES RECIENTES'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? `Last signal: ${fmtMonth(latest?.month ?? '', true)} 2025` : `Última señal: ${fmtMonth(latest?.month ?? '', false)} 2025`}
            </p>
            <p className="text-5xl font-bold leading-none mt-4"
               style={{ color: PRESSURE_COLORS[latest?.pressure_label ?? 'estable'] }}>
              {PRESSURE_ICONS[latest?.pressure_label ?? 'estable']}
            </p>
            <p className="text-2xl font-semibold mt-2"
               style={{ color: PRESSURE_COLORS[latest?.pressure_label ?? 'estable'] }}>
              {pressureLabelText(latest?.pressure_label ?? 'estable', isEn)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {isEn ? 'Pressure score' : 'Índice de presión'}: {latest?.pressure_score >= 0 ? '+' : ''}{latest?.pressure_score.toFixed(3)}
            </p>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              {isEn ? 'Weighted index: GDP, public spending, capex.' : 'Índice ponderado: PBI, gasto público, capex.'}
            </p>
          </div>
        </div>

        {/* ── R6: Highlight cards ──────────────────────────────────────────── */}
        {extremeDepts && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                {isEn ? 'Highest poverty' : 'Mayor pobreza'}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">{extremeDepts.highest.department}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: '#ef4444' }}>
                {extremeDepts.highest.poverty_nowcast.toFixed(1)}%
              </p>
              <p className="text-xs mt-0.5" style={{ color: extremeDepts.highest.change_pp > 0 ? '#ef4444' : '#16a34a' }}>
                {extremeDepts.highest.change_pp > 0 ? '+' : ''}{extremeDepts.highest.change_pp.toFixed(1)} pp vs 2024
              </p>
            </div>
            <div className="rounded-lg border p-4 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-bold">
                {isEn ? 'Lowest poverty' : 'Menor pobreza'}
              </p>
              <p className="text-lg font-bold text-gray-900 mt-1">{extremeDepts.lowest.department}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: '#16a34a' }}>
                {extremeDepts.lowest.poverty_nowcast.toFixed(1)}%
              </p>
              <p className="text-xs mt-0.5" style={{ color: extremeDepts.lowest.change_pp > 0 ? '#ef4444' : '#16a34a' }}>
                {extremeDepts.lowest.change_pp > 0 ? '+' : ''}{extremeDepts.lowest.change_pp.toFixed(1)} pp vs 2024
              </p>
            </div>
          </div>
        )}

        {/* ── Section 2: Monthly rolling 3m chart ─────────────────────────── */}
        <div className="mt-8 rounded-lg border p-6 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'Poverty nowcast — rolling quarterly average' : 'Pobreza nowcast — promedio móvil trimestral'}
          </h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? 'Thick line = 3-month rolling avg. Dashed = monthly estimate. Band = 95% CI from annual model.'
              : 'Línea gruesa = promedio móvil 3 meses. Punteada = estimación mensual. Banda = IC 95% del nowcast anual.'}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis dataKey="label" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
              <YAxis
                domain={['auto', 'auto']}
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any, name?: string) => [`${v != null ? Number(v).toFixed(1) : '—'}%`, name ?? '']}
              />
              {/* CI band — constant across months (R1) */}
              <ReferenceArea
                y1={nat.lower_ci}
                y2={nat.upper_ci}
                fill={AMBER}
                fillOpacity={0.08}
              />
              {/* Annual anchor */}
              <ReferenceLine
                y={nat.poverty_nowcast}
                stroke={AMBER}
                strokeDasharray="6 3"
                strokeWidth={1}
                label={{ value: `${nat.poverty_nowcast.toFixed(1)}%`, position: 'right', fontSize: 10, fill: AMBER }}
              />
              {/* Monthly estimate */}
              <Line
                type="monotone"
                dataKey="monthly"
                name={isEn ? 'Monthly est.' : 'Mensual'}
                stroke={AMBER_MID}
                strokeWidth={1}
                strokeDasharray="4 2"
                dot={false}
              />
              {/* Rolling 3m — headline */}
              <Line
                type="monotone"
                dataKey="rolling3m"
                name={isEn ? 'Rolling 3m' : 'Promedio 3m'}
                stroke={AMBER}
                strokeWidth={2.5}
                dot={{ r: 3, fill: AMBER }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── Section 3: Historical annual chart ──────────────────────────── */}
        <div className="mt-6 rounded-lg border p-6 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'Historical poverty trend' : 'Evolución histórica de la pobreza monetaria'}
          </h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? 'Bars = INEI official (2004-2024). Amber bar = Qhawarina 2025 nowcast.'
              : 'Barras = cifra oficial INEI (2004-2024). Barra ámbar = nowcast Qhawarina 2025.'}
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={historicalChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ ...axisTickStyle, fontSize: 9 }}
                stroke={CHART_DEFAULTS.axisStroke}
                interval={2}
              />
              <YAxis
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}%`}
                domain={[0, 65]}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any, name?: string) =>
                  [`${v != null ? Number(v).toFixed(1) : '—'}%`, name ?? '']
                }
              />
              {/* Official bars 2004-2024 */}
              <Bar dataKey="official" name={isEn ? 'Official (INEI)' : 'Oficial (INEI)'} radius={[2, 2, 0, 0]}>
                {historicalChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.is_nowcast ? 'transparent' : CHART_COLORS.ink3} fillOpacity={0.75} />
                ))}
              </Bar>
              {/* Nowcast 2025 bar */}
              <Bar dataKey="nowcast" name={isEn ? 'Nowcast 2025' : 'Nowcast 2025'} radius={[2, 2, 0, 0]}>
                {historicalChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.is_nowcast ? AMBER : 'transparent'} />
                ))}
              </Bar>
              {/* CI reference area for 2025 column */}
              <ReferenceLine
                x={data.metadata.target_year}
                stroke={AMBER}
                strokeDasharray="4 2"
                strokeWidth={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-center mt-2" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? `Nowcast IC 95%: [${nat.lower_ci.toFixed(1)}% – ${nat.upper_ci.toFixed(1)}%]`
              : `Nowcast IC 95%: [${nat.lower_ci.toFixed(1)}% – ${nat.upper_ci.toFixed(1)}%]`}
          </p>
        </div>

        {/* ── Section 4: Department table ──────────────────────────────────── */}
        <div className="mt-6 rounded-lg border bg-white overflow-hidden" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <div className="p-5 border-b" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
            <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
              {isEn ? 'Poverty by Department' : 'Pobreza por Departamento'}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: CHART_COLORS.ink3 }}>
              {isEn ? 'Click column headers to sort.' : 'Haz clic en las cabeceras para ordenar.'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-gray-500 border-b" style={{ borderColor: CHART_DEFAULTS.gridStroke, background: '#FAFAFA' }}>
                  {([
                    ['department',         isEn ? 'Department'  : 'Departamento'],
                    ['poverty_2024_official', isEn ? '2024 Official' : 'Oficial 2024'],
                    ['poverty_nowcast',    isEn ? 'Nowcast 2025' : 'Nowcast 2025'],
                    ['change_pp',          isEn ? 'Change'      : 'Cambio'],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k}
                        className="px-4 py-3 text-left cursor-pointer hover:text-gray-800 select-none"
                        onClick={() => handleSort(k)}>
                      {label}<SortIcon k={k} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">
                    {isEn ? 'Pressure' : 'Presión'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDepts.map((d, i) => (
                  <tr key={d.dept_code}
                      className={`border-b ${i % 2 === 0 ? '' : 'bg-gray-50'}`}
                      style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{d.department}</td>
                    <td className="px-4 py-2.5 text-gray-600">{d.poverty_2024_official.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: AMBER }}>
                      {d.poverty_nowcast.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-semibold"
                        style={{ color: d.change_pp < 0 ? '#16a34a' : d.change_pp > 0 ? '#ef4444' : '#9ca3af' }}>
                      {d.change_pp > 0 ? '+' : ''}{d.change_pp.toFixed(1)} pp
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ background: PRESSURE_COLORS[d.pressure_label] ?? '#9ca3af' }}>
                        {PRESSURE_ICONS[d.pressure_label]} {pressureLabelText(d.pressure_label, isEn)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 5: Methodology (collapsible) ────────────────────────── */}
        <div className="mt-6 rounded-lg border bg-white overflow-hidden" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            onClick={() => setMethOpen(o => !o)}
          >
            <span className="font-semibold text-gray-800">
              {isEn ? 'Methodology' : 'Metodología'}
            </span>
            <span className="text-gray-400 text-lg">{methOpen ? '−' : '+'}</span>
          </button>
          {methOpen && (
            <div className="px-5 pb-5 border-t text-sm text-gray-700 space-y-3" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {isEn ? 'MODEL' : 'MODELO'}
                  </p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li>Gradient Boosting Regressor + persistencia (α={data.metadata.blend_alpha})</li>
                    <li>{isEn ? 'Training: departmental panel 2004–2024' : 'Entrenamiento: panel departamental 2004–2024'}</li>
                    <li>{isEn ? 'Validation: rolling-origin temporal' : 'Validación: rolling-origin temporal'}</li>
                    <li>MAE = {data.backtest.mae.toFixed(1)} pp &nbsp;|&nbsp; Dir. = {(data.backtest.directional_accuracy * 100).toFixed(0)}%</li>
                    <li>{isEn ? 'Current vintage: data through' : 'Vintage actual: datos hasta'} {vintageStr}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {isEn ? 'VARIABLES' : 'VARIABLES'}
                  </p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li>{isEn ? 'Electricity consumption' : 'Consumo eléctrico'}</li>
                    <li>{isEn ? 'Credit outstanding' : 'Crédito'}</li>
                    <li>{isEn ? 'Government capex & spending' : 'Capex y gasto público'}</li>
                    <li>{isEn ? 'Mining production' : 'Producción minera'}</li>
                    <li>{isEn ? 'Tax revenue (SUNAT)' : 'Recaudación tributaria'}</li>
                    <li>{isEn ? 'Inflation (CPI)' : 'Inflación (IPC)'}</li>
                    <li>{isEn ? 'Monthly GDP index (BCRP)' : 'PBI mensual (BCRP)'}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg text-xs text-gray-600" style={{ background: '#FEF3C7' }}>
                <strong>{isEn ? 'Disclaimer: ' : 'Aviso: '}</strong>
                {isEn
                  ? 'The nowcast poverty rate is an estimate based on monthly departmental economic indicators, not a direct poverty measurement. The official figure comes from INEI\'s ENAHO, published annually. The rolling quarterly average smooths the monthly series to reduce noise.'
                  : 'La tasa de pobreza nowcast es una estimación basada en indicadores económicos mensuales departamentales, no una medición directa. La cifra oficial proviene de la ENAHO del INEI, publicada anualmente. El promedio móvil trimestral suaviza la serie mensual para reducir ruido.'}
              </div>

              {/* R5: Revision path */}
              {data.revision_path.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {isEn ? 'FORECAST REVISION PATH — 2025' : 'REVISIÓN DEL NOWCAST 2025'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.revision_path.map(r => (
                      <div key={r.vintage} className="text-xs px-2 py-1 rounded border" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
                        <span className="text-gray-500">{r.vintage}:</span>{' '}
                        <span className="font-medium" style={{ color: AMBER }}>{r.national_nowcast.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Section 6: Footer stats ──────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            [isEn ? 'Monthly series' : 'Series mensuales', '10'],
            [isEn ? 'Departments'    : 'Departamentos',    '24'],
            [isEn ? 'Vintage'        : 'Vintage',          vintageStr],
            [isEn ? 'Model'          : 'Modelo',           'GBR + persistencia'],
          ].map(([label, val]) => (
            <div key={label} className="rounded-lg border p-4 bg-white text-center" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{val}</p>
            </div>
          ))}
        </div>

        {/* ── Sub-page navigation cards ────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/estadisticas/pobreza/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEn ? 'Time Series' : 'Evolución Temporal'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEn ? 'Annual poverty historical series' : 'Serie histórica anual de pobreza'}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/pobreza/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEn ? 'Regional Map' : 'Distribución Regional'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEn ? 'Departmental prediction by region' : 'Predicción departamental por región'}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/pobreza/distritos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏘️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEn ? 'District Explorer' : 'Explorador Distrital'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEn ? '~1,800 districts (NTL 2024 weights)' : '~1,800 distritos (pesos NTL 2024)'}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <a href="/estadisticas/pobreza/metodologia" className="text-amber-700 hover:text-amber-900 font-medium">
            📖 {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </a>
        </div>

      </div>
    </div>
  );
}
