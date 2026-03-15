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
const AMBER_MID   = '#E0A458';

const PRESSURE_COLORS: Record<string, string> = {
  mejora_significativa:  '#16a34a',
  mejora_moderada:       '#4ade80',
  estable:               '#9ca3af',
  deterioro_moderado:    '#f97316',
  deterioro_significativo: '#ef4444',
};

const PRESSURE_ICONS: Record<string, string> = {
  mejora_significativa:  'vv',
  mejora_moderada:       'v',
  estable:               '-',
  deterioro_moderado:    '^',
  deterioro_significativo: '^^',
};

const MO_ES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MO_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtMonth(m: string, isEn: boolean) {
  const parts = m.split('-');
  const idx = parts.length >= 2 ? parseInt(parts[1], 10) - 1 : -1;
  if (idx < 0 || idx > 11) return '';
  return isEn ? MO_EN[idx] : MO_ES[idx];
}

function fmtVintage(vm: string, isEn: boolean) {
  const parts = vm.split('-');
  if (parts.length < 2) return vm;
  const [yr, mo] = parts;
  const months_es = ['enero','febrero','marzo','abril','mayo','junio',
                     'julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const months_en = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  const idx = parseInt(mo, 10) - 1;
  if (idx < 0 || idx > 11) return vm;
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

  const [data, setData]         = useState<PovertyData | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [sortKey, setSortKey]   = useState<SortKey>('poverty_nowcast');
  const [sortAsc, setSortAsc]   = useState(false);
  const [methOpen, setMethOpen] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── All useMemo hooks BEFORE early returns ────────────────────────────────

  // UX-1: Tighter monthly band — use std(monthly − rolling3m) * 1.96
  const monthlyBandSE = useMemo(() => {
    if (!data || data.monthly_series.length < 2) return 2;
    const devs = data.monthly_series.map(m => m.national_monthly - m.national_rolling3m);
    const mean = devs.reduce((s, d) => s + d, 0) / devs.length;
    const variance = devs.reduce((s, d) => s + (d - mean) ** 2, 0) / devs.length;
    return Math.sqrt(variance) * 1.96;
  }, [data]);

  const monthlyChartData = useMemo(() => {
    if (!data) return [];
    return data.monthly_series.map(m => ({
      label:     fmtMonth(m.month, isEn),
      rolling3m: m.national_rolling3m,
      monthly:   m.national_monthly,
      // Tighter band (UX-1): rolling3m ± 1.96*SE(monthly-rolling3m)
      lower:     parseFloat((m.national_rolling3m - monthlyBandSE).toFixed(2)),
      upper:     parseFloat((m.national_rolling3m + monthlyBandSE).toFixed(2)),
    }));
  }, [data, isEn, monthlyBandSE]);

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
    return [...data.departments].sort((a, b) => {
      const va = a[sortKey] as string | number;
      const vb = b[sortKey] as string | number;
      if (typeof va === 'string') {
        return sortAsc ? va.localeCompare(vb as string) : (vb as string).localeCompare(va);
      }
      return sortAsc ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
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

  // ── Derived values (safe — data is guaranteed non-null here) ──────────────
  const nat        = data.national;
  const latest     = data.monthly_series[data.monthly_series.length - 1];
  const vintageStr = fmtVintage(data.metadata.vintage_month, isEn);
  const changeDir  = nat.change_pp < 0 ? 'down' : nat.change_pp > 0 ? 'up' : 'flat';
  const changeColor = changeDir === 'down' ? '#16a34a' : changeDir === 'up' ? '#ef4444' : '#9ca3af';

  // UX-1: uncertainty of CHANGE = half-width of annual CI (simpler, interpretable)
  const changeUncertainty = ((nat.upper_ci - nat.lower_ci) / 2).toFixed(1);

  // Sort handlers (plain functions, not nested components)
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(key === 'department'); }
  };

  const sortIndicator = (k: SortKey) => {
    if (sortKey !== k) return ' ↕';
    return sortAsc ? ' ↑' : ' ↓';
  };

  const lastUpdated = (() => {
    try {
      return new Date(data.metadata.last_updated)
        .toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return data.metadata.last_updated.slice(0, 10);
    }
  })();

  const pressureKey = latest?.pressure_label ?? 'estable';
  const pressureColor = PRESSURE_COLORS[pressureKey] ?? '#9ca3af';
  const pressureIcon  = PRESSURE_ICONS[pressureKey] ?? '-';

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
                : `Nowcast pobreza Peru 2025: ${nat.poverty_nowcast.toFixed(1)}% nacional (${nat.change_pp > 0 ? '+' : ''}${nat.change_pp.toFixed(1)}pp vs 2024) | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`}
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
            {/* UX-1: Show change with uncertainty, not raw CI */}
            <p className="text-2xl font-semibold mt-2" style={{ color: changeColor }}>
              {nat.change_pp > 0 ? '+' : ''}{nat.change_pp.toFixed(1)} pp vs 2024
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isEn ? `Uncertainty: \u00b1${changeUncertainty} pp` : `Incertidumbre: \u00b1${changeUncertainty} pp`}
            </p>
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              {isEn
                ? `Model: GBR + persistence (\u03b1=${data.metadata.blend_alpha}). Monthly update.`
                : `Modelo: GBR + persistencia (\u03b1=${data.metadata.blend_alpha}). Actualizaci\u00f3n mensual.`}
            </p>
          </div>

          {/* Right: Pressure — UX-4 footnote added */}
          <div className="rounded-xl border-2 p-6 flex flex-col bg-white"
               style={{ borderColor: `${pressureColor}44` }}>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'RECENT CONDITIONS' : 'CONDICIONES RECIENTES'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn
                ? `Last signal: ${fmtMonth(latest?.month ?? '', true)} 2025`
                : `\u00daltima se\u00f1al: ${fmtMonth(latest?.month ?? '', false)} 2025`}
            </p>
            <p className="text-5xl font-bold leading-none mt-4 font-mono" style={{ color: pressureColor }}>
              {pressureIcon}
            </p>
            <p className="text-2xl font-semibold mt-2" style={{ color: pressureColor }}>
              {pressureLabelText(pressureKey, isEn)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {isEn ? 'Pressure score' : '\u00cdndice de presi\u00f3n'}:{' '}
              {latest?.pressure_score != null
                ? `${latest.pressure_score >= 0 ? '+' : ''}${latest.pressure_score.toFixed(3)}`
                : '—'}
            </p>
            {/* UX-4: Pressure tracker explanation */}
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
              {isEn
                ? 'Weighted index of monthly economic activity — mainly monthly GDP and public spending. Does not measure poverty directly.'
                : 'El \u00edndice de presi\u00f3n resume se\u00f1ales de actividad econ\u00f3mica mensual, principalmente PBI mensual y gasto p\u00fablico. No mide pobreza directamente.'}
            </p>
          </div>
        </div>

        {/* UX-3: Revision path — small card if entries exist */}
        {data.revision_path.length > 0 && (
          <div className="mt-4 rounded-lg border p-4 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              {isEn ? 'FORECAST REVISION PATH — 2025' : 'EVOLUCI\u00d3N DEL NOWCAST 2025'}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {data.revision_path.map((r, i) => (
                <span key={r.vintage} className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">{r.vintage}:</span>
                  <span className="font-semibold" style={{ color: AMBER }}>{r.national_nowcast.toFixed(1)}%</span>
                  {i < data.revision_path.length - 1 && (
                    <span className="text-gray-300 text-xs">--&gt;</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

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
          {/* UX-2: Explanatory text */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            {isEn
              ? 'Early-release estimate of monetary poverty based on monthly departmental economic indicators, ahead of official INEI publication.'
              : 'Estimaci\u00f3n temprana de la pobreza monetaria basada en indicadores econ\u00f3micos mensuales departamentales, antes de la publicaci\u00f3n oficial del INEI.'}
          </p>
          <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'Poverty nowcast \u2014 rolling quarterly average' : 'Pobreza nowcast \u2014 promedio m\u00f3vil trimestral'}
          </h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? 'Thick line = 3-month rolling avg. Dashed = monthly estimate. Band = +/-1.96 SE around rolling average.'
              : 'L\u00ednea gruesa = promedio m\u00f3vil 3 meses. Punteada = estimaci\u00f3n mensual. Banda = +/-1.96 SE alrededor del promedio m\u00f3vil.'}
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis dataKey="label" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
              <YAxis
                domain={['auto', 'auto']}
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any, name?: string) => [
                  `${v != null ? Number(v).toFixed(1) : '\u2014'}%`,
                  name ?? '',
                ]}
              />
              {/* UX-1: Tighter CI band — rolling3m ± 1.96*SE(monthly-rolling3m) */}
              <ReferenceArea
                y1={monthlyChartData[0]?.lower ?? nat.lower_ci}
                y2={monthlyChartData[0]?.upper ?? nat.upper_ci}
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
                name={isEn ? 'Rolling 3m avg' : 'Promedio 3m'}
                stroke={AMBER}
                strokeWidth={2.5}
                dot={{ r: 3, fill: AMBER }}
                activeDot={{ r: 5 }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value) => <span style={{ color: CHART_COLORS.ink3 }}>{value}</span>}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── Section 3: Historical annual chart ──────────────────────────── */}
        <div className="mt-6 rounded-lg border p-6 bg-white" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'Historical poverty trend' : 'Evoluci\u00f3n hist\u00f3rica de la pobreza monetaria'}
          </h3>
          <p className="text-xs mt-0.5 mb-4" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? 'Bars = INEI official (2004-2024). Amber bar = Qhawarina 2025 nowcast.'
              : 'Barras = cifra oficial INEI (2004-2024). Barra \u00e1mbar = nowcast Qhawarina 2025.'}
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
                tickFormatter={(v: number) => `${v}%`}
                domain={[0, 65]}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any, name?: string) => [
                  `${v != null ? Number(v).toFixed(1) : '\u2014'}%`,
                  name ?? '',
                ]}
              />
              {/* Official bars 2004-2024 */}
              <Bar dataKey="official" name={isEn ? 'Official (INEI)' : 'Oficial (INEI)'} radius={[2, 2, 0, 0]}>
                {historicalChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.is_nowcast ? 'transparent' : CHART_COLORS.ink3} fillOpacity={0.75} />
                ))}
              </Bar>
              {/* Nowcast 2025 bar */}
              <Bar dataKey="nowcast" name="Nowcast 2025" radius={[2, 2, 0, 0]}>
                {historicalChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.is_nowcast ? AMBER : 'transparent'} />
                ))}
              </Bar>
              <ReferenceLine
                x={data.metadata.target_year}
                stroke={AMBER}
                strokeDasharray="4 2"
                strokeWidth={1}
                label={{ value: `Nowcast ${data.metadata.target_year}: ${nat.poverty_nowcast.toFixed(1)}%`, position: 'insideTopLeft', fontSize: 10, fill: AMBER, dy: -4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          {/* UX-1: Show CI in chart caption, not hero card */}
          <p className="text-xs text-center mt-2" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? `2025 nowcast IC 95%: [${nat.lower_ci.toFixed(1)}% \u2013 ${nat.upper_ci.toFixed(1)}%] | Backtest MAE: ${data.backtest.mae.toFixed(1)} pp`
              : `Nowcast 2025 IC 95%: [${nat.lower_ci.toFixed(1)}% \u2013 ${nat.upper_ci.toFixed(1)}%] | MAE hist\u00f3rico: ${data.backtest.mae.toFixed(1)} pp`}
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
                <tr className="text-xs uppercase tracking-wide text-gray-500 border-b"
                    style={{ borderColor: CHART_DEFAULTS.gridStroke, background: '#FAFAFA' }}>
                  {([
                    ['department',            isEn ? 'Department'      : 'Departamento'],
                    ['poverty_2024_official',  isEn ? '2024 Official'   : 'Oficial 2024'],
                    ['poverty_nowcast',        'Nowcast 2025'],
                    ['change_pp',              isEn ? 'Change'          : 'Cambio'],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k}
                        className="px-4 py-3 text-left cursor-pointer hover:text-gray-800 select-none"
                        onClick={() => handleSort(k)}>
                      {label}
                      <span className="ml-1" style={{ color: sortKey === k ? AMBER : '#d1d5db' }}>
                        {sortIndicator(k)}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left">
                    {isEn ? 'Pressure' : 'Presi\u00f3n'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDepts.map((dept, i) => (
                  <tr key={dept.dept_code}
                      className={`border-b ${i % 2 === 0 ? '' : 'bg-gray-50'}`}
                      style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
                    <td className="px-4 py-2.5 font-medium text-gray-900">{dept.department}</td>
                    <td className="px-4 py-2.5 text-gray-600">{dept.poverty_2024_official.toFixed(1)}%</td>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: AMBER }}>
                      {dept.poverty_nowcast.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2.5 font-semibold"
                        style={{ color: dept.change_pp < 0 ? '#16a34a' : dept.change_pp > 0 ? '#ef4444' : '#9ca3af' }}>
                      {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)} pp
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ background: PRESSURE_COLORS[dept.pressure_label] ?? '#9ca3af' }}>
                        {pressureLabelText(dept.pressure_label, isEn)}
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
              {isEn ? 'Methodology' : 'Metodolog\u00eda'}
            </span>
            <span className="text-gray-400 text-lg">{methOpen ? '-' : '+'}</span>
          </button>
          {methOpen && (
            <div className="px-5 pb-5 border-t text-sm text-gray-700 space-y-3" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {isEn ? 'MODEL' : 'MODELO'}
                  </p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li>Gradient Boosting Regressor + persistencia (&alpha;={data.metadata.blend_alpha})</li>
                    <li>{isEn ? 'Training: departmental panel 2004\u20132024' : 'Entrenamiento: panel departamental 2004\u20132024'}</li>
                    <li>{isEn ? 'Validation: rolling-origin temporal' : 'Validaci\u00f3n: rolling-origin temporal'}</li>
                    <li>MAE = {data.backtest.mae.toFixed(1)} pp | Dir. = {(data.backtest.directional_accuracy * 100).toFixed(0)}%</li>
                    <li>{isEn ? 'Current vintage: data through' : 'Vintage actual: datos hasta'} {vintageStr}</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {isEn ? 'VARIABLES' : 'VARIABLES'}
                  </p>
                  <ul className="space-y-0.5 text-xs text-gray-600">
                    <li>{isEn ? 'Electricity consumption' : 'Consumo el\u00e9ctrico'}</li>
                    <li>{isEn ? 'Credit outstanding' : 'Cr\u00e9dito'}</li>
                    <li>{isEn ? 'Government capex & spending' : 'Capex y gasto p\u00fablico'}</li>
                    <li>{isEn ? 'Mining production' : 'Producci\u00f3n minera'}</li>
                    <li>{isEn ? 'Tax revenue (SUNAT)' : 'Recaudaci\u00f3n tributaria'}</li>
                    <li>{isEn ? 'Inflation (CPI)' : 'Inflaci\u00f3n (IPC)'}</li>
                    <li>{isEn ? 'Monthly GDP index (BCRP)' : 'PBI mensual (BCRP)'}</li>
                  </ul>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg text-xs text-gray-600" style={{ background: '#FEF3C7' }}>
                <strong>{isEn ? 'Disclaimer: ' : 'Aviso: '}</strong>
                {isEn
                  ? "The nowcast poverty rate is an estimate based on monthly departmental economic indicators, not a direct poverty measurement. The official figure comes from INEI's ENAHO, published annually."
                  : 'La tasa de pobreza nowcast es una estimaci\u00f3n basada en indicadores econ\u00f3micos mensuales departamentales, no una medici\u00f3n directa. La cifra oficial proviene de la ENAHO del INEI, publicada anualmente.'}
              </div>

              {/* R5: Revision path in methodology if not shown above */}
              {data.revision_path.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  {isEn
                    ? 'Forecast revision path will appear here as monthly vintages accumulate.'
                    : 'El historial de revisiones del nowcast aparecer\u00e1 aqu\u00ed a medida que se acumulen los vintages mensuales.'}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Section 6: Footer stats ──────────────────────────────────────── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {([
            [isEn ? 'Monthly series' : 'Series mensuales', '10'],
            [isEn ? 'Departments'    : 'Departamentos',    '24'],
            [isEn ? 'Vintage'        : 'Vintage',          vintageStr],
            [isEn ? 'Model'          : 'Modelo',           'GBR + persistencia'],
          ] as [string, string][]).map(([label, val]) => (
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
                    {isEn ? 'Time Series' : 'Evoluci\u00f3n Temporal'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEn ? 'Annual poverty historical series' : 'Serie hist\u00f3rica anual de pobreza'}
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
                    {isEn ? 'Regional Map' : 'Distribuci\u00f3n Regional'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEn ? 'Departmental prediction by region' : 'Predicci\u00f3n departamental por regi\u00f3n'}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/pobreza/distritos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📍</div>
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
            {isEn ? 'View full methodology ->' : 'Ver metodolog\u00eda completa ->'}
          </a>
        </div>

      </div>
    </div>
  );
}
