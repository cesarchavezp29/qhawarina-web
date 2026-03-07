'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from "../../components/stats/LastUpdate";
import EmbedWidget from "../../components/EmbedWidget";
import ShareButton from "../../components/ShareButton";
import ChartShareButton from "../../components/ChartShareButton";
import DataFreshnessWarning from "../../components/DataFreshnessWarning";
import PageSkeleton from "../../components/PageSkeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

interface PovertyData {
  metadata: { target_year: number; generated_at: string };
  national?: { poverty_rate: number };
  departments: Array<{
    code: string; name: string;
    poverty_rate_2024: number; poverty_rate_2025_nowcast: number; change_pp: number;
  }>;
}

export default function PobrezaPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    breadcrumb: 'Statistics',
    title: 'Monetary Poverty',
    nowcastLabel: 'Annual nowcast',
    cardCharts: 'Time Series',
    cardChartsDesc: 'Annual poverty historical series',
    cardMaps: 'Regional Distribution',
    cardMapsDesc: 'Departmental nowcast with NTL',
    cardDistricts: 'District Explorer',
    cardDistrictsDesc: '~1,800 districts with NTL proxy',
    methodology: 'View full methodology →',
    error: 'Error loading data.',
    retry: 'Retry',
    dataName: 'poverty data',
  } : {
    breadcrumb: 'Estadísticas',
    title: 'Pobreza Monetaria',
    nowcastLabel: 'Nowcast anual',
    cardCharts: 'Evolución Temporal',
    cardChartsDesc: 'Serie histórica anual de pobreza',
    cardMaps: 'Distribución Regional',
    cardMapsDesc: 'Nowcast departamental con NTL',
    cardDistricts: 'Explorador Distrital',
    cardDistrictsDesc: '~1,800 distritos con proxy NTL',
    methodology: 'Ver metodología completa →',
    error: 'Error cargando datos.',
    retry: 'Reintentar',
    dataName: 'los datos de pobreza',
  };

  const [data, setData] = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`)
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

  const nationalRate = data.national?.poverty_rate
    ?? data.departments.reduce((sum, d) => sum + d.poverty_rate_2025_nowcast, 0) / data.departments.length;

  // Department rankings sorted descending by 2024 official rate
  const deptRanking = [...data.departments]
    .sort((a, b) => b.poverty_rate_2024 - a.poverty_rate_2024)
    .map(d => ({
      name: d.name,
      [isEn ? '2024' : '2024']: d.poverty_rate_2024,
      [isEn ? '2025 Nowcast' : 'Nowcast 2025']: d.poverty_rate_2025_nowcast,
    }));

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{T.breadcrumb}</a>
          {" / "}
          <span className="text-gray-900 font-medium">{T.title}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">{T.title}</h1>
          <div className="flex gap-2">
            <ShareButton title={`${isEn ? 'Poverty' : 'Pobreza'} — Qhawarina`} text={isEn ? `📊 Poverty projection Peru ${data.metadata.target_year}: ${nationalRate.toFixed(1)}% national | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza` : `📊 Proyección pobreza Perú ${data.metadata.target_year}: ${nationalRate.toFixed(1)}% nacional | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza`} />
            <EmbedWidget path="/estadisticas/pobreza" title={`${isEn ? 'Poverty' : 'Pobreza'} — Nowcasting Qhawarina`} height={600} />
          </div>
        </div>
        <p className="text-lg text-gray-600">{T.nowcastLabel} - {data.metadata.target_year}: {nationalRate.toFixed(1)}%</p>
        <div className="mt-4">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>
        <DataFreshnessWarning generatedAt={data.metadata.generated_at} dataName={T.dataName} />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/estadisticas/pobreza/graficos">
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

          <Link href="/estadisticas/pobreza/mapas">
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

          <Link href="/estadisticas/pobreza/distritos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏘️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardDistricts}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardDistrictsDesc}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <a href="/estadisticas/pobreza/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 {T.methodology}
          </a>
        </div>

        {/* Department Rankings Chart */}
        {deptRanking.length > 0 && (
          <div className="mt-10 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                {isEn
                  ? 'Poverty by Department — 2025 Projection'
                  : 'Pobreza por Departamento — Proyección 2025'}
              </h3>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/pobreza"
                shareText={(() => {
                  const top = data.departments.slice().sort((a, b) => b.poverty_rate_2025_nowcast - a.poverty_rate_2025_nowcast)[0];
                  return isEn
                    ? `📊 Peru Poverty by Dept (2025 nowcast): ${top ? `${top.name} ${top.poverty_rate_2025_nowcast.toFixed(1)}%` : ''} — Qhawarina`
                    : `📊 Pobreza por departamento Perú (nowcast 2025): ${top ? `${top.name} ${top.poverty_rate_2025_nowcast.toFixed(1)}%` : ''} — Qhawarina`;
                })()}
              />
            </div>
            <p className="text-xs mb-4" style={{ color: CHART_COLORS.ink3 }}>
              {isEn ? 'Sorted by 2024 official rate (INEI). Amber = 2025 nowcast.' : 'Ordenado por tasa oficial 2024 (INEI). Ámbar = nowcast 2025.'}
            </p>
            <ResponsiveContainer width="100%" height={620}>
              <BarChart
                layout="vertical"
                data={deptRanking}
                margin={{ top: 4, right: 40, left: 90, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 50]}
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  width={85}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: number | undefined, name: string | undefined) => [`${v?.toFixed(1) ?? '—'}%`, name ?? '']}
                />
                <Bar dataKey="2024" fill={CHART_COLORS.ink3} radius={[0, 3, 3, 0]} />
                <Bar dataKey={isEn ? '2025 Nowcast' : 'Nowcast 2025'} fill={CHART_COLORS.amber} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
