'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import LastUpdate from '../../../components/stats/LastUpdate';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ReferenceArea,
} from 'recharts';
import { CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

interface GDPData {
  metadata: { generated_at: string };
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  quarterly_series: Array<{ quarter: string; official: number | null; nowcast: number | null; nowcast_full: number | null }>;
  annual_series: Array<{ year: number; official: number | null; nowcast: number | null; nowcast_full: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function PBIGraficosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<GDPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [frequency, setFrequency] = useState<'quarterly' | 'annual'>('quarterly');

  useEffect(() => {
    fetch(`/assets/data/gdp_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const quarterlyData = useMemo(() => (data?.quarterly_series ?? []).map(q => ({
    quarter: q.quarter,
    [isEn ? 'Official (INEI)' : 'Oficial (INEI)']: q.official,
    [isEn ? 'Nowcast excl. COVID' : 'Nowcast sin COVID']: q.nowcast,
    [isEn ? 'Nowcast incl. COVID' : 'Nowcast con COVID']: q.nowcast_full,
  })), [data, isEn]);

  const annualData = useMemo(() => (data?.annual_series ?? []).map(a => ({
    year: String(a.year),
    [isEn ? 'Official (INEI)' : 'Oficial (INEI)']: a.official,
    [isEn ? 'Nowcast excl. COVID' : 'Nowcast sin COVID']: a.nowcast,
    [isEn ? 'Nowcast incl. COVID' : 'Nowcast con COVID']: a.nowcast_full,
  })), [data, isEn]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated quarterly. Try again later.' : 'Los datos se actualizan trimestralmente. Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  const officialKey = isEn ? 'Official (INEI)' : 'Oficial (INEI)';
  const nowcastKey  = isEn ? 'Nowcast excl. COVID' : 'Nowcast sin COVID';
  const fullKey     = isEn ? 'Nowcast incl. COVID' : 'Nowcast con COVID';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pbi" className="hover:underline">{isEn ? 'GDP' : 'PBI'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Time Series' : 'Evolución Temporal'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'GDP — Historical Series' : 'PBI — Evolución Temporal'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'GDP Historical Series (Nowcasting)' : 'PBI — Evolución Temporal (Nowcasting)'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'GDP Time Series — Qhawarina' : 'PBI: Serie Temporal — Qhawarina'}
              text={isEn ? '📊 Peru GDP historical series | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/graficos' : '📊 Serie histórica de PBI en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi/graficos'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-2">
          {isEn ? 'Quarterly nowcast' : 'Nowcast trimestral'} · {data.nowcast.target_period}:{' '}
          <strong style={{ color: '#C65D3E' }}>{data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(2)}%</strong>
        </p>
        <div className="mb-6">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* Chart card */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>

          {/* Frequency toggle — MW style */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Historical Series' : 'Evolución Temporal'}
            </h2>
            <div className="flex gap-1">
              {(['quarterly', 'annual'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: frequency === f ? '#C65D3E' : 'transparent',
                    color: frequency === f ? 'white' : '#6b7280',
                    border: `2px solid ${frequency === f ? '#C65D3E' : '#d6d3d1'}`,
                  }}
                >
                  {f === 'quarterly' ? (isEn ? 'Quarterly' : 'Trimestral') : (isEn ? 'Annual' : 'Anual')}
                </button>
              ))}
            </div>
          </div>

          {/* Quarterly Chart */}
          {frequency === 'quarterly' && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={quarterlyData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis
                  dataKey="quarter"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  angle={-45}
                  textAnchor="end"
                  interval={7}
                  height={55}
                />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `${v}%`}
                  label={{ value: isEn ? '% YoY' : '% i.a.', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [v != null ? `${Number(v).toFixed(2)}%` : '—']}
                />
                <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
                <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
                <ReferenceArea x1="2020-Q1" x2="2021-Q4" fill="#DC262608" stroke="none" label={{ value: 'COVID-19', position: 'insideTopLeft', style: { fontSize: 9, fill: '#DC2626' } }} />
                <Line type="monotone" dataKey={officialKey} stroke="#C65D3E" strokeWidth={2} dot={false} connectNulls={false} />
                <Line type="monotone" dataKey={nowcastKey} stroke="#2A9D8F" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
                <Line type="monotone" dataKey={fullKey} stroke="#D4956A" strokeWidth={1.5} strokeDasharray="3 3" dot={false} connectNulls={true} opacity={0.7} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Annual Chart */}
          {frequency === 'annual' && (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={annualData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis dataKey="year" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `${v}%`}
                  label={{ value: isEn ? '% YoY' : '% i.a.', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [v != null ? `${Number(v).toFixed(2)}%` : '—']}
                />
                <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
                <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
                <ReferenceArea x1="2020" x2="2021" fill="#DC262608" stroke="none" label={{ value: 'COVID-19', position: 'insideTopLeft', style: { fontSize: 9, fill: '#DC2626' } }} />
                <Line type="monotone" dataKey={officialKey} stroke="#C65D3E" strokeWidth={2} dot={{ r: 4, fill: '#C65D3E' }} connectNulls={false} />
                <Line type="monotone" dataKey={nowcastKey} stroke="#2A9D8F" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: '#2A9D8F' }} connectNulls={false} />
                <Line type="monotone" dataKey={fullKey} stroke="#D4956A" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 3, fill: '#D4956A' }} connectNulls={true} opacity={0.7} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* COVID methodology note — MW callout style */}
        <div className="rounded-xl p-4 mb-8" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <p className="text-xs" style={{ color: '#1a1a1a' }}>
            {isEn ? (
              <><strong>COVID-19 structural break (2020-Q1 — 2021-Q4):</strong>{' '}
              The DFM model was trained excluding this period. The <span style={{ color: '#2A9D8F' }}>teal dashed line</span> omits COVID (clean break).
              The <span style={{ color: '#D4956A' }}>orange line</span> shows model extrapolation without retraining (~2.77% fixed) — interpret with caution.
              </>
            ) : (
              <><strong>Quiebre estructural COVID-19 (2020-Q1 — 2021-Q4):</strong>{' '}
              El modelo DFM fue entrenado excluyendo este período. La <span style={{ color: '#2A9D8F' }}>línea teal punteada</span> omite el período COVID.
              La <span style={{ color: '#D4956A' }}>línea naranja</span> muestra la extrapolación sin reentrenamiento (~2.77% fijo) — interpretar con cautela.
              </>
            )}
          </p>
        </div>

        <div className="text-center">
          <Link href="/estadisticas/pbi/metodologia" className="text-sm font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
