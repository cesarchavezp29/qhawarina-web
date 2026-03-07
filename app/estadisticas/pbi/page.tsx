'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from "../../components/stats/LastUpdate";
import EmbedWidget from "../../components/EmbedWidget";
import ShareButton from "../../components/ShareButton";
import DataFreshnessWarning from "../../components/DataFreshnessWarning";
import PageSkeleton from "../../components/PageSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

interface GDPData {
  metadata: { generated_at: string; model?: string };
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null; error?: number | null }>;
  nowcast: { target_period: string; value: number };
  backtest_metrics?: { rmse: number; mae: number; r2: number };
}

export default function PBIPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    breadcrumb: 'Statistics',
    title: 'Gross Domestic Product',
    nowcastLabel: 'Quarterly nowcast',
    cardCharts: 'Time Series',
    cardChartsDesc: 'Quarterly GDP historical series',
    cardSectors: 'Economic Sectors',
    cardSectorsDesc: 'Breakdown by productive sector',
    cardMaps: 'Regional Distribution',
    cardMapsDesc: 'Departmental breakdown with NTL',
    methodology: 'View full methodology →',
    error: 'Error loading data.',
    retry: 'Retry',
    dataName: 'GDP data',
    shareText: (period: string, val: string) => `📊 GDP Nowcast Peru ${period}: ${val} YoY | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi`,
  } : {
    breadcrumb: 'Estadísticas',
    title: 'Producto Bruto Interno',
    nowcastLabel: 'Nowcast trimestral',
    cardCharts: 'Evolución Temporal',
    cardChartsDesc: 'Serie histórica trimestral del PBI',
    cardSectors: 'Sectores Económicos',
    cardSectorsDesc: 'Desagregación por sector productivo',
    cardMaps: 'Distribución Regional',
    cardMapsDesc: 'Desagregación departamental con NTL',
    methodology: 'Ver metodología completa →',
    error: 'Error cargando datos.',
    retry: 'Reintentar',
    dataName: 'los datos del PBI',
    shareText: (period: string, val: string) => `📊 Nowcast PBI Perú ${period}: ${val} interanual | Qhawarina\nhttps://qhawarina.pe/estadisticas/pbi`,
  };

  const [data, setData] = useState<GDPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/gdp_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={3} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{T.error} <button onClick={() => window.location.reload()} className="underline">{T.retry}</button></p>
    </div>
  );

  const valStr = `${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(2)}%`;

  // Track Record — last 8 quarters with both official & nowcast values
  const trackRecord = (data.recent_quarters ?? [])
    .filter(q => q.official !== null && q.nowcast !== null)
    .slice(-8)
    .map(q => ({
      quarter: q.quarter,
      [isEn ? 'Nowcast' : 'Nowcast']: q.nowcast,
      [isEn ? 'INEI Official' : 'INEI Oficial']: q.official,
    }));
  const rmse = data.backtest_metrics?.rmse;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{T.breadcrumb}</a>
          {" / "}
          <span className="text-gray-900 font-medium">{isEn ? 'GDP' : 'PBI'}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">{T.title}</h1>
          <div className="flex gap-2">
            <ShareButton title={`${isEn ? 'GDP' : 'PBI'} — Qhawarina`} text={T.shareText(data.nowcast.target_period, valStr)} />
            <EmbedWidget path="/estadisticas/pbi" title={`${isEn ? 'GDP' : 'PBI'} — Nowcasting Qhawarina`} height={600} />
          </div>
        </div>
        <p className="text-lg text-gray-600">{T.nowcastLabel} - {data.nowcast.target_period}: {valStr}</p>
        <div className="mt-4">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>
        <DataFreshnessWarning generatedAt={data.metadata.generated_at} dataName={T.dataName} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/estadisticas/pbi/graficos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📊</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardCharts}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardChartsDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/pbi/sectores">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏭</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardSectors}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardSectorsDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/estadisticas/pbi/mapas">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🗺️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardMaps}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardMapsDesc}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <a href="/estadisticas/pbi/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 {T.methodology}
          </a>
        </div>

        {/* Track Record Chart */}
        {trackRecord.length >= 2 && (
          <div className="mt-10 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Track Record: Nowcast vs INEI Official' : 'Desempeño: Nowcast vs INEI Oficial'}
              </h3>
              {rmse && (
                <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                  RMSE: {rmse.toFixed(2)} pp
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trackRecord} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis dataKey="quarter" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={(v) => `${v}%`}
                  label={{ value: isEn ? 'Growth (% YoY)' : 'Crecimiento (% i.a.)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: number | undefined) => [`${v?.toFixed(2) ?? '—'}%`]}
                />
                <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
                <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
                <Bar dataKey={isEn ? 'Nowcast' : 'Nowcast'} fill={CHART_COLORS.teal} radius={[3, 3, 0, 0]} />
                <Bar dataKey={isEn ? 'INEI Official' : 'INEI Oficial'} fill={CHART_COLORS.ink3} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
