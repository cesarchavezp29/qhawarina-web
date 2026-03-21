'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// Qhawarina palette overrides for category colors
const CAT_COLORS: Record<string, string> = {
  total:          '#2D3142',
  core:           '#C65D3E',
  non_core:       '#2A9D8F',
  food:           '#8B7355',
  tradables:      '#4A7C8C',
  non_tradables:  '#D4956A',
  services:       '#5B8C5A',
  energy:         '#C4A35A',
};

interface Category {
  id: string;
  name_es: string;
  name_en: string;
  color: string;
  description_es: string;
  weight_pct: number | null;
  dates: string[];
  values_monthly: number[];
  values_12m: number[];
  latest_monthly: number;
  latest_12m: number;
  latest_date: string;
}

interface InflationData {
  metadata: { last_update: string; source: string; coverage: string; n_categories: number };
  categories: Category[];
}

type ChartMode = 'monthly' | '12m';

export default function InflacionCategoriasPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>('12m');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/assets/data/inflation_categories.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then((d: InflationData) => {
        setData(d);
        setSelectedIds(d.categories.map(c => c.id));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const toggle = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Pivot category arrays to flat chart data
  const chartData = useMemo(() => {
    if (!data || data.categories.length === 0) return [];
    const totalCat = data.categories.find(c => c.id === 'total') ?? data.categories[0];
    const allDates = totalCat.dates;
    const valueKey = chartMode === 'monthly' ? 'values_monthly' : 'values_12m';
    return allDates.map((date, i) => {
      const pt: Record<string, string | number | null> = { date };
      for (const cat of data.categories) {
        pt[cat.id] = cat.dates[i] === date ? cat[valueKey][i] ?? null : null;
      }
      return pt;
    });
  }, [data, chartMode]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Try again later.' : 'Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  const latestKey = chartMode === 'monthly' ? 'latest_monthly' : 'latest_12m';
  const unit = chartMode === 'monthly'
    ? (isEn ? '% monthly' : '% mensual')
    : (isEn ? '% 12-month (YoY)' : '% 12 meses (YoY)');

  const total = data.categories.find(c => c.id === 'total');

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/inflacion" className="hover:underline">{isEn ? 'Inflation' : 'Inflación'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Categories' : 'Categorías'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Inflation by Category' : 'Inflación por Categoría'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Inflation by Category' : 'Inflación por Categoría'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Inflation by Category — Qhawarina' : 'Inflación por Categoría — Qhawarina'}
              text={isEn ? '📊 Peru inflation breakdown by category | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/categorias' : '📊 Inflación por categoría en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/categorias'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-6 max-w-3xl">
          {isEn
            ? `Breakdown of Lima Metropolitan CPI by analytical categories. Coverage: December 2010 – ${data.metadata.last_update}.`
            : `Desagregación del IPC de Lima Metropolitana por categorías analíticas. Cobertura: diciembre 2010 – ${data.metadata.last_update}.`}
        </p>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {data.categories.map(cat => {
            const active = selectedIds.includes(cat.id);
            const color = CAT_COLORS[cat.id] ?? cat.color;
            const val = cat[latestKey];
            const isInTarget = chartMode === '12m' && val >= 1 && val <= 3;
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: '#FFFCF7',
                  border: `1px solid ${active ? color : '#E8E4DF'}`,
                  borderLeft: `4px solid ${active ? color : '#E8E4DF'}`,
                  opacity: active ? 1 : 0.45,
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 leading-tight">
                    {isEn ? cat.name_en : cat.name_es}
                    {cat.weight_pct && <span className="ml-1 text-gray-400">({cat.weight_pct}%)</span>}
                  </p>
                  {isInTarget && (
                    <span className="text-xs font-semibold shrink-0 ml-1" style={{ color: '#2A9D8F' }}>
                      {isEn ? 'On target' : 'Meta'}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold mt-1" style={{ color }}>
                  {val > 0 ? '+' : ''}{val.toFixed(chartMode === 'monthly' ? 3 : 2)}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{cat.latest_date}</p>
              </button>
            );
          })}
        </div>

        {/* Chart + Controls */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? `CPI by Category (${unit})` : `IPC por Categoría (${unit})`}
            </h2>
            <div className="flex gap-2 items-center">
              {(['12m', 'monthly'] as ChartMode[]).map(f => (
                <button
                  key={f}
                  onClick={() => setChartMode(f)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: chartMode === f ? '#C65D3E' : 'transparent',
                    color: chartMode === f ? 'white' : '#6b7280',
                    border: `2px solid ${chartMode === f ? '#C65D3E' : '#d6d3d1'}`,
                  }}
                >
                  {f === '12m' ? (isEn ? 'YoY (12m)' : 'YoY (12m)') : (isEn ? 'Monthly' : 'Mensual')}
                </button>
              ))}
              <span className="text-gray-300 text-xs mx-1">|</span>
              <button onClick={() => setSelectedIds(data.categories.map(c => c.id))} className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                {isEn ? 'All' : 'Todas'}
              </button>
              <button onClick={() => setSelectedIds([])} className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                {isEn ? 'None' : 'Ninguna'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {isEn ? 'Click category cards above to show/hide lines.' : 'Clic en las tarjetas para mostrar/ocultar líneas.'}
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="date"
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                angle={-45}
                textAnchor="end"
                interval={11}
                height={55}
              />
              <YAxis
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => `${v}%`}
                label={{ value: unit, angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any) => [v != null ? `${Number(v).toFixed(chartMode === 'monthly' ? 3 : 2)}%` : '—']}
              />
              <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
              <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
              {/* BCRP target band for 12m */}
              {chartMode === '12m' && (
                <ReferenceArea y1={1} y2={3} fill="#2A9D8F" fillOpacity={0.05} stroke="none"
                  label={{ value: isEn ? 'BCRP target 1%–3%' : 'Meta BCRP 1%–3%', position: 'insideTopLeft', style: { fontSize: 9, fill: '#2A9D8F' } }}
                />
              )}
              {data.categories.map(cat => selectedIds.includes(cat.id) && (
                <Line
                  key={cat.id}
                  type="monotone"
                  dataKey={cat.id}
                  name={isEn ? cat.name_en : cat.name_es}
                  stroke={CAT_COLORS[cat.id] ?? cat.color}
                  strokeWidth={cat.id === 'total' ? 2.5 : 1.5}
                  dot={false}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-3" style={{ color: CHART_DEFAULTS.axisStroke }}>
            {isEn ? 'Source:' : 'Fuente:'} {data.metadata.source} · {isEn ? 'Coverage:' : 'Cobertura:'} {data.metadata.coverage}
          </p>
        </div>

        {/* Interpretation */}
        <div className="rounded-xl p-5 mb-6" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
            {isEn ? 'Monetary Policy Signals' : 'Señales de Política Monetaria'}
          </h3>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li><strong>{isEn ? 'Core vs Non-Core:' : 'Subyacente vs No Subyacente:'}</strong>{' '}{isEn ? 'Core reflects persistent domestic pressures; non-core captures food and energy volatility.' : 'La subyacente refleja presiones domésticas persistentes; la no subyacente captura la volatilidad de alimentos y energía.'}</li>
            <li><strong>{isEn ? 'Tradables vs Non-tradables:' : 'Transables vs No Transables:'}</strong>{' '}{isEn ? 'Tradables track the exchange rate and imports; non-tradables reflect domestic demand.' : 'Transables siguen el tipo de cambio e importaciones; no transables reflejan la demanda interna.'}</li>
            <li>
              <strong>{isEn ? 'BCRP target: 1%–3% (12m):' : 'Meta BCRP: 1%–3% (12m):'}</strong>{' '}
              {total && (
                <span style={{ color: total.latest_12m >= 1 && total.latest_12m <= 3 ? '#2A9D8F' : '#C65D3E' }}>
                  {isEn ? 'Current CPI total:' : 'IPC total actual:'}{' '}
                  {total.latest_12m > 0 ? '+' : ''}{total.latest_12m.toFixed(2)}%{' '}
                  {total.latest_12m >= 1 && total.latest_12m <= 3 ? (isEn ? '(within target)' : '(dentro de meta)') : (isEn ? '(outside target)' : '(fuera de meta)')}
                </span>
              )}
            </li>
          </ul>
        </div>

        <div className="flex gap-4 text-xs">
          <Link href="/estadisticas/inflacion/metodologia" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'Full methodology →' : 'Metodología completa →'}
          </Link>
          <Link href="/estadisticas/inflacion" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? '← Back to Inflation' : '← Volver a Inflación'}
          </Link>
        </div>
      </div>
    </div>
  );
}
