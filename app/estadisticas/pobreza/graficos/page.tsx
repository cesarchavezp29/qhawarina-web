'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import {
  ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

const AMBER = '#D97706';

interface PovertyData {
  metadata: { target_year: number; generated_at: string; last_official_enaho_year: number; model_type: string };
  national: { poverty_rate: number; lower_bound: number; upper_bound: number };
  departments: Array<{ code: string; name: string; poverty_rate_2024: number; poverty_rate_2025_proyeccion: number; change_pp: number }>;
  historical_series?: Array<{ year: number; official: number | null; nowcast: number | null }>;
}

interface QuarterlyData {
  metadata: { method: string; frequency: string };
  national_quarterly: Array<{ quarter: string; poverty_rate: number; is_nowcast?: boolean }>;
}

export default function PobrezaGraficosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<PovertyData | null>(null);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [frequency, setFrequency] = useState<'annual' | 'quarterly'>('annual');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json()),
      fetch(`/assets/data/poverty_quarterly.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json()),
    ]).then(([annualD, qData]) => { setData(annualD); setQuarterlyData(qData); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const officialKey = isEn ? 'Official (INEI)' : 'Oficial (INEI)';
  const nowcastKey  = isEn ? `Nowcast ${data?.metadata.target_year ?? ''}` : `Nowcast ${data?.metadata.target_year ?? ''}`;

  // Annual chart data: historical bars + nowcast bar
  const annualChartData = useMemo(() => {
    if (!data) return [];
    const hist = (data.historical_series ?? []).map(h => ({
      year: String(h.year),
      [officialKey]: h.official,
      [nowcastKey]: null as number | null,
      isNowcast: false,
    }));
    hist.push({
      year: String(data.metadata.target_year),
      [officialKey]: null,
      [nowcastKey]: data.national.poverty_rate,
      isNowcast: true,
    });
    return hist;
  }, [data, officialKey, nowcastKey]);

  // Quarterly chart data
  const quarterlyChartData = useMemo(() => {
    if (!quarterlyData) return [];
    return quarterlyData.national_quarterly.map(d => ({
      quarter: d.quarter,
      [isEn ? 'Quarterly (Chow-Lin)' : 'Trimestral (Chow-Lin)']: d.is_nowcast ? null : d.poverty_rate,
      [isEn ? 'Q3–Q4 Nowcast' : 'Nowcast Q3–Q4']: d.is_nowcast ? d.poverty_rate : null,
    }));
  }, [quarterlyData, isEn]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error || !data || !quarterlyData) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated annually. Try again later.' : 'Los datos se actualizan anualmente. Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/pobreza" className="hover:underline">{isEn ? 'Poverty' : 'Pobreza'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Time Series' : 'Evolución Temporal'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Poverty — Historical Series' : 'Pobreza — Evolución Temporal'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Poverty — Historical Charts' : 'Pobreza — Gráficos Históricos'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Poverty Charts — Qhawarina' : 'Gráficos de Pobreza — Qhawarina'}
              text={isEn ? '📊 Peru poverty historical charts | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/graficos' : '📊 Gráficos históricos de pobreza en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/graficos'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-2">
          {isEn ? 'Annual nowcast' : 'Nowcast anual'} · {data.metadata.target_year}:{' '}
          <strong style={{ color: AMBER }}>{data.national.poverty_rate.toFixed(1)}%</strong>
        </p>
        <div className="mb-6">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* Chart card */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Historical Poverty Trend' : 'Evolución Histórica de la Pobreza Monetaria'}
            </h2>
            <div className="flex gap-1">
              {(['annual', 'quarterly'] as const).map(f => (
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
                  {f === 'annual' ? (isEn ? 'Annual' : 'Anual') : (isEn ? 'Quarterly' : 'Trimestral')}
                </button>
              ))}
            </div>
          </div>

          {/* Annual chart */}
          {frequency === 'annual' && annualChartData.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={annualChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
                  <XAxis dataKey="year" tick={{ ...axisTickStyle, fontSize: 9 }} stroke={CHART_DEFAULTS.axisStroke} interval={2} />
                  <YAxis
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => `${v}%`}
                    domain={[0, 65]}
                    label={{ value: isEn ? 'Poverty Rate (%)' : 'Tasa de Pobreza (%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v: any) => [v != null ? `${Number(v).toFixed(1)}%` : '—']}
                  />
                  <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
                  <Bar dataKey={officialKey} radius={[2, 2, 0, 0]}>
                    {annualChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isNowcast ? 'transparent' : '#2D3142'} fillOpacity={0.6} />
                    ))}
                  </Bar>
                  <Bar dataKey={nowcastKey} radius={[2, 2, 0, 0]}>
                    {annualChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.isNowcast ? AMBER : 'transparent'} />
                    ))}
                  </Bar>
                  <ReferenceLine
                    x={String(data.metadata.target_year)}
                    stroke={AMBER}
                    strokeDasharray="4 2"
                    label={{ value: `Nowcast ${data.metadata.target_year}: ${data.national.poverty_rate.toFixed(1)}%`, position: 'insideTopLeft', fontSize: 10, fill: AMBER }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs mt-3 text-center text-gray-500">
                {isEn
                  ? 'Bars = INEI official (2004–2024). Amber bar = Qhawarina 2025 nowcast. COVID errors: 2020 (-10.4pp) and 2021 (+4.6pp) show model limits for unprecedented shocks.'
                  : 'Barras = cifra oficial INEI (2004–2024). Barra ámbar = nowcast Qhawarina 2025. Errores COVID: 2020 (-10.4pp) y 2021 (+4.6pp) muestran límites del modelo ante choques sin precedentes.'}
              </p>
            </>
          )}

          {/* Quarterly chart */}
          {frequency === 'quarterly' && (
            <>
              <ResponsiveContainer width="100%" height={380}>
                <ComposedChart data={quarterlyChartData} margin={{ top: 8, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                  <XAxis
                    dataKey="quarter"
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    angle={-45}
                    textAnchor="end"
                    interval={3}
                    height={55}
                  />
                  <YAxis
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => `${v}%`}
                    domain={['auto', 'auto']}
                    label={{ value: isEn ? 'Poverty Rate (%)' : 'Tasa de Pobreza (%)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v: any) => [v != null ? `${Number(v).toFixed(1)}%` : '—']}
                  />
                  <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
                  <Line type="monotone" dataKey={isEn ? 'Quarterly (Chow-Lin)' : 'Trimestral (Chow-Lin)'} stroke="#2A9D8F" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey={isEn ? 'Q3–Q4 Nowcast' : 'Nowcast Q3–Q4'} stroke={AMBER} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4, fill: AMBER }} connectNulls={true} />
                </ComposedChart>
              </ResponsiveContainer>
              <p className="text-xs mt-3 text-center text-gray-500">
                {isEn
                  ? 'Chow-Lin temporal disaggregation using quarterly GDP and monthly CPI. Amber dashes = Q3–Q4 2025 nowcast.'
                  : 'Desagregación temporal Chow-Lin usando PBI trimestral e IPC mensual. Punteado ámbar = nowcast Q3–Q4 2025.'}
              </p>
            </>
          )}
        </div>

        <div className="text-center">
          <Link href="/estadisticas/pobreza/metodologia" className="text-sm font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
