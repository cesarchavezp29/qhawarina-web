'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from "../../components/stats/LastUpdate";
import CiteButton from '../../components/CiteButton';
import ShareButton from '../../components/ShareButton';
import PageSkeleton from '../../components/PageSkeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle } from '../../lib/chartTheme';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

interface InflationData {
  metadata: { generated_at: string };
  recent_months: Array<{ month: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function InflacionPage() {
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

  if (loading) return <PageSkeleton cards={2} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">
          {isEn ? 'Data is updated monthly. Try again later.' : 'Los datos se actualizan mensualmente. Intenta de nuevo más tarde.'}
        </p>
        <button onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  const valStr = `${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(3)}%`;

  const nowcastKey = isEn ? 'Nowcast (DFM)' : 'Nowcast (DFM)';
  const officialKey = isEn ? 'INEI Official' : 'INEI Oficial';

  const recentMonths = (data.recent_months ?? []).slice(-12).map(m => ({
    month: m.month.slice(0, 7),
    [nowcastKey]: m.nowcast,
    [officialKey]: m.official,
  }));

  const navCards = [
    { href: '/estadisticas/inflacion/graficos',               labelEs: 'Evolución Temporal',         labelEn: 'Time Series',               descEs: 'Serie histórica mensual de inflación',        descEn: 'Monthly inflation historical series',        borderColor: '#C65D3E' },
    { href: '/estadisticas/inflacion/categorias',             labelEs: 'Categorías',                  labelEn: 'Categories',                descEs: 'Core, alimentos, transables y más',           descEn: 'Core, food, tradables and more',             borderColor: '#2A9D8F' },
    { href: '/estadisticas/inflacion/mapas',                  labelEs: 'Distribución Regional',       labelEn: 'Regional Distribution',     descEs: 'IPC estimado por ciudades',                   descEn: 'Estimated CPI by cities',                   borderColor: '#8B7355' },
    { href: '/estadisticas/inflacion/precios-alta-frecuencia', labelEs: 'Precios Alta Frecuencia',   labelEn: 'High-Frequency Prices',     descEs: 'Índice diario de supermercados',              descEn: 'Daily supermarket price index',              borderColor: '#4A7C8C' },
  ];

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Inflation' : 'Inflación'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Inflation' : 'Inflación'}
          </h1>
          <div className="flex gap-2 flex-shrink-0">
            <CiteButton indicator={isEn ? 'Inflation Nowcast (DFM)' : 'Nowcast de Inflación (DFM)'} isEn={isEn} />
            <ShareButton
              title={`${isEn ? 'Inflation' : 'Inflación'} — Qhawarina`}
              text={
                isEn
                  ? `📊 Peru Inflation Nowcast: ${valStr} (${data.nowcast.target_period}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion`
                  : `📊 Nowcast de inflación Perú: ${valStr} (${data.nowcast.target_period}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/inflacion`
              }
            />
          </div>
        </div>
        <p className="text-base text-gray-600 mb-1">
          {isEn ? 'Monthly nowcast' : 'Nowcast mensual'} · {data.nowcast.target_period}:{' '}
          <strong style={{ color: '#C65D3E' }}>{valStr}</strong>
        </p>
        <div className="mb-6">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* Hero chart */}
        {recentMonths.length >= 2 && (
          <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Nowcast vs INEI Official — recent months (% monthly)' : 'Nowcast vs INEI Oficial — últimos meses (% mensual)'}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentMonths} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis dataKey="month" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `${v?.toFixed(2)}%`}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [`${v != null ? Number(v).toFixed(3) : '—'}%`]}
                />
                <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
                <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
                <Bar dataKey={nowcastKey} fill="#2A9D8F" radius={[3, 3, 0, 0]} />
                <Bar dataKey={officialKey} fill="#2D3142" radius={[3, 3, 0, 0]} fillOpacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs mt-3" style={{ color: CHART_DEFAULTS.axisStroke }}>
              {isEn
                ? 'DFM nowcast (3M MA target) vs INEI official monthly CPI. RMSE ≈ 0.32 pp. Source: INEI / Qhawarina.'
                : 'Nowcast DFM (objetivo MA3M) vs IPC mensual oficial INEI. RMSE ≈ 0.32 pp. Fuente: INEI / Qhawarina.'}
            </p>
          </div>
        )}

        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {navCards.map(card => (
            <Link key={card.href} href={card.href}>
              <div
                className="rounded-xl p-5 transition-all hover:shadow-md cursor-pointer"
                style={{
                  background: '#FFFCF7',
                  border: '1px solid #E8E4DF',
                  borderLeft: `4px solid ${card.borderColor}`,
                }}
              >
                <h2 className="text-base font-bold mb-1" style={{ color: '#1a1a1a' }}>
                  {isEn ? card.labelEn : card.labelEs}
                </h2>
                <p className="text-sm text-gray-600">{isEn ? card.descEn : card.descEs}</p>
              </div>
            </Link>
          ))}
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
