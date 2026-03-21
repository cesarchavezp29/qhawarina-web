'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LastUpdate from "../../../components/stats/LastUpdate";
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import { useLocale } from 'next-intl';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

interface InflationData {
  metadata: { generated_at: string };
  monthly_series: Array<{ month: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function InflacionGraficosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const officialKey = isEn ? 'Official (INEI)' : 'Oficial (INEI)';
  const nowcastKey  = isEn ? 'Nowcast (DFM)'   : 'Nowcast (DFM)';

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.monthly_series.map(m => ({
      month: m.month.slice(0, 7),
      [officialKey]: m.official,
      [nowcastKey]:  m.nowcast,
    }));
  }, [data, officialKey, nowcastKey]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated monthly. Try again later.' : 'Los datos se actualizan mensualmente. Intenta de nuevo más tarde.'}</p>
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
          <Link href="/estadisticas/inflacion" className="hover:underline">{isEn ? 'Inflation' : 'Inflación'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Time Series' : 'Evolución Temporal'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Inflation — Historical Series' : 'Inflación — Evolución Temporal'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Inflation Historical Series' : 'Inflación — Evolución Temporal'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Inflation Time Series — Qhawarina' : 'Inflación: Serie Temporal — Qhawarina'}
              text={isEn ? '📊 Peru inflation historical series | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/graficos' : '📊 Serie histórica de inflación en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/graficos'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-2">
          {isEn ? 'Monthly nowcast' : 'Nowcast mensual'} · {data.nowcast.target_period}:{' '}
          <strong style={{ color: '#C65D3E' }}>{data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(3)}%</strong>
        </p>
        <div className="mb-6">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Monthly CPI Change — Nowcast vs Official (% 3M-MA)' : 'Variación Mensual IPC — Nowcast vs Oficial (% 3M-MA)'}
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="month"
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
                tickFormatter={v => `${v?.toFixed(2)}%`}
                label={{ value: isEn ? '% monthly' : '% mensual', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any) => [v != null ? `${Number(v).toFixed(3)}%` : '—']}
              />
              <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
              <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
              <Line type="monotone" dataKey={officialKey} stroke="#C65D3E" strokeWidth={2} dot={false} connectNulls={false} />
              <Line type="monotone" dataKey={nowcastKey}  stroke="#2A9D8F" strokeWidth={2} strokeDasharray="5 3" dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-3" style={{ color: CHART_DEFAULTS.axisStroke }}>
            {isEn
              ? `Coverage: ${chartData.length} months (${chartData[0]?.month ?? '—'} to ${chartData[chartData.length - 1]?.month ?? '—'}). Source: INEI / Qhawarina.`
              : `Cobertura: ${chartData.length} meses (${chartData[0]?.month ?? '—'} hasta ${chartData[chartData.length - 1]?.month ?? '—'}). Fuente: INEI / Qhawarina.`}
          </p>
        </div>

        <div className="text-center">
          <Link href="/estadisticas/inflacion/metodologia" className="text-sm font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
