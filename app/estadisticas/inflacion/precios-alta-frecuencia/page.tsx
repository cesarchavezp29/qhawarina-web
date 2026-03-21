'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';
import CiteButton from '../../../components/CiteButton';
import ShareButton from '../../../components/ShareButton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../../lib/chartTheme';
import PageSkeleton from '../../../components/PageSkeleton';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

function fmtDate(d: string) {
  const [, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${months[parseInt(m) - 1]}`;
}

interface SupermarketData {
  metadata: { method: string; base_date: string; stores: string[]; total_skus: number | null };
  daily_series: Array<{ date: string; index_all: number; n_products: number }>;
}

export default function PreciosAltaFrecuenciaPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<SupermarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/supermarket_daily_index.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.daily_series.map(d => ({
      date: fmtDate(d.date),
      [isEn ? 'Price Index' : 'Índice de Precios']: d.index_all,
    }));
  }, [data, isEn]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error) return (
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

  if (!data || data.daily_series.length === 0) return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/inflacion" className="hover:underline">{isEn ? 'Inflation' : 'Inflación'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'High-Frequency Prices' : 'Precios Alta Frecuencia'}</span>
        </nav>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
          {isEn ? 'High-Frequency Prices' : 'Precios de Alta Frecuencia'}
        </h1>
        <p className="text-gray-500">{isEn ? 'No data available yet.' : 'No hay datos disponibles aún.'}</p>
      </div>
    </div>
  );

  const latest = data.daily_series[data.daily_series.length - 1];
  const change = latest.index_all - 100;
  const indexKey = isEn ? 'Price Index' : 'Índice de Precios';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <Link href="/estadisticas/inflacion" className="hover:underline">{isEn ? 'Inflation' : 'Inflación'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'High-Frequency Prices' : 'Precios Alta Frecuencia'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'High-Frequency Prices' : 'Precios de Alta Frecuencia'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'High-Frequency Prices' : 'Precios de Alta Frecuencia'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'High-Frequency Prices — Qhawarina' : 'Precios Alta Frecuencia — Qhawarina'}
              text={isEn ? '📊 Peru daily supermarket price index | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/precios-alta-frecuencia' : '📊 Índice de precios diarios en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion/precios-alta-frecuencia'}
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-2">
          {isEn ? 'Daily index' : 'Índice diario'} · {latest.date}:{' '}
          <strong style={{ color: '#C65D3E' }}>{latest.index_all.toFixed(2)}</strong>
          {' '}
          <span style={{ color: change >= 0 ? '#C65D3E' : '#2A9D8F' }}>
            ({change > 0 ? '+' : ''}{change.toFixed(2)}% {isEn ? 'vs base' : 'vs base'})
          </span>
        </p>
        <div className="mb-6">
          <LastUpdate date="16-Feb-2026" />
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: isEn ? 'Current Index' : 'Índice Actual', value: latest.index_all.toFixed(2), sub: `${change > 0 ? '+' : ''}${change.toFixed(2)}% ${isEn ? 'since' : 'desde'} ${data.metadata.base_date}`, valueColor: change >= 0 ? '#C65D3E' : '#2A9D8F' },
            { label: isEn ? 'Monitored Products' : 'Productos Monitoreados', value: (data.metadata.total_skus ?? 0).toLocaleString(), sub: isEn ? 'unique SKUs' : 'SKUs únicos', valueColor: '#2D3142' },
            { label: isEn ? 'Supermarkets' : 'Supermercados', value: data.metadata.stores.length.toString(), sub: data.metadata.stores.join(', '), valueColor: '#2D3142' },
          ].map(card => (
            <div key={card.label} className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.valueColor }}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Daily Index Evolution (Base = 100)' : 'Evolución Diaria del Índice (Base = 100)'}
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="date"
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                angle={-45}
                textAnchor="end"
                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
                height={55}
              />
              <YAxis
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                domain={['auto', 'auto']}
                label={{ value: isEn ? 'Index' : 'Índice', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any) => [v != null ? Number(v).toFixed(2) : '—']}
              />
              <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily, paddingTop: 8 }} />
              <ReferenceLine y={100} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" label={{ value: isEn ? 'Base 100' : 'Base 100', position: 'right', style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke } }} />
              <Line type="monotone" dataKey={indexKey} stroke="#2A9D8F" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-3" style={{ color: CHART_DEFAULTS.axisStroke }}>
            {isEn
              ? `Coverage: ${data.daily_series.length} days since ${data.daily_series[0].date}. Method: ${data.metadata.method}`
              : `Cobertura: ${data.daily_series.length} días desde ${data.daily_series[0].date}. Método: ${data.metadata.method}`}
          </p>
        </div>

        {/* Methodology note */}
        <div className="rounded-xl p-5 mb-8" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
            {isEn ? 'Methodological Note' : 'Nota Metodológica'}
          </h3>
          <ul className="space-y-1.5 text-xs text-gray-700">
            <li><strong>{isEn ? 'BPP for Peru:' : 'BPP para Perú:'}</strong>{' '}{isEn ? 'Inspired by the MIT Billion Prices Project. Monitors supermarket prices online daily.' : 'Inspirado en el Billion Prices Project del MIT. Monitorea precios de supermercados en línea diariamente.'}</li>
            <li><strong>{isEn ? 'Jevons Index:' : 'Índice Jevons:'}</strong>{' '}{isEn ? 'Geometric mean of price ratios for matched products between dates.' : 'Media geométrica de ratios de precios para productos comparables entre fechas.'}</li>
            <li><strong>{isEn ? 'Limitations:' : 'Limitaciones:'}</strong>{' '}{isEn ? `Supermarkets only, biased toward Lima, excludes services (~50% of CPI). Covers ${(data.metadata.total_skus ?? 0).toLocaleString()} SKUs.` : `Solo supermercados, sesgado hacia Lima, excluye servicios (~50% del IPC). Cubre ${(data.metadata.total_skus ?? 0).toLocaleString()} SKUs.`}</li>
          </ul>
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
