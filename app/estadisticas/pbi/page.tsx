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
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ComposedChart, Line,
  AreaChart, Area,
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

interface ContribData {
  metadata: { latest_quarter: string; total_yoy_latest: number | null };
  sector_keys: string[];
  sector_labels: Record<string, string>;
  contributions: Array<Record<string, string | number>>;
  shares: Array<Record<string, string | number>>;
}

// Sector colors — consistent across all 3 charts
const SECTOR_COLORS: Record<string, string> = {
  Servicios:   '#8D99AE',
  Comercio:    '#E0A458',
  Manufactura: '#C65D3E',
  Mineria:     '#2A9D8F',
  Construc:    '#9B2226',
  Agro:        '#4A7C59',
  Electr:      '#7ECFC0',
  Pesca:       '#F0C987',
};

// Sector display order for stacked charts (largest first)
const SECTOR_ORDER = ['Servicios', 'Manufactura', 'Mineria', 'Comercio', 'Construc', 'Agro', 'Electr', 'Pesca'];

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

  const [data, setData]     = useState<GDPData | null>(null);
  const [contrib, setContrib] = useState<ContribData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    const v = new Date().toISOString().slice(0, 13);
    Promise.all([
      fetch(`/assets/data/gdp_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/gdp_contributions.json?v=${v}`).then(r => r.json()).catch(() => null),
    ]).then(([gdp, con]) => {
      setData(gdp);
      setContrib(con);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
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

  // Latest quarter waterfall (Chart 3)
  const latestContribs = contrib
    ? SECTOR_ORDER
        .filter(k => k in SECTOR_COLORS)
        .map(k => ({
          sector: contrib.sector_labels[k] ?? k,
          value: contrib.contributions.at(-1)?.[k] as number ?? 0,
          color: SECTOR_COLORS[k],
        }))
        .filter(d => d.value !== undefined)
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    : [];

  const latestQ    = contrib?.metadata?.latest_quarter ?? '';
  const totalYoY   = contrib?.metadata?.total_yoy_latest;

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

        {/* Track Record Chart — hero */}
        {trackRecord.length >= 2 && (
          <div className="mt-6 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Track Record: Nowcast vs INEI Official' : 'Desempeño: Nowcast vs INEI Oficial'}
              </h3>
              <div className="flex items-center gap-3">
                {rmse && (
                  <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                    RMSE: {rmse.toFixed(2)} pp
                  </span>
                )}
                <ChartShareButton
                  url="https://qhawarina.pe/estadisticas/pbi"
                  shareText={isEn
                    ? `📊 Peru GDP Nowcast: +${data.nowcast.value?.toFixed(1) ?? '?'}% YoY (${data.nowcast.target_period}) — Qhawarina`
                    : `📊 Nowcast PBI Perú: +${data.nowcast.value?.toFixed(1) ?? '?'}% interanual (${data.nowcast.target_period}) — Qhawarina`}
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
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

        {contrib && latestContribs.length > 0 && (
          <>
            {/* Chart 3: Latest quarter waterfall */}
            <div className="mt-8 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                    {isEn ? `Sectoral contribution — ${latestQ}` : `Contribución sectorial — ${latestQ}`}
                  </h3>
                  {totalYoY !== null && totalYoY !== undefined && (
                    <p className="text-sm mt-0.5" style={{ color: CHART_COLORS.ink3 }}>
                      {isEn ? `Total YoY: ${totalYoY > 0 ? '+' : ''}${totalYoY?.toFixed(2)}%` : `Total i.a.: ${totalYoY > 0 ? '+' : ''}${totalYoY?.toFixed(2)}%`}
                    </p>
                  )}
                </div>
                <ChartShareButton
                  url="https://qhawarina.pe/estadisticas/pbi"
                  shareText={isEn
                    ? `📊 Peru GDP ${latestQ}: Services +${contrib.contributions.at(-1)?.['Servicios'] ?? '?'}pp, Construction +${contrib.contributions.at(-1)?.['Construc'] ?? '?'}pp. Total: +${totalYoY?.toFixed(2) ?? '?'}% — Qhawarina`
                    : `📊 PBI Perú ${latestQ}: Servicios +${contrib.contributions.at(-1)?.['Servicios'] ?? '?'}pp, Construcción +${contrib.contributions.at(-1)?.['Construc'] ?? '?'}pp. Total: +${totalYoY?.toFixed(2) ?? '?'}% — Qhawarina`}
                />
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart layout="vertical" data={latestContribs} margin={{ top: 4, right: 60, left: 90, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)} pp`}
                  />
                  <YAxis type="category" dataKey="sector" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} width={85} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v: number | undefined) => [v != null ? `${v > 0 ? '+' : ''}${v.toFixed(2)} pp` : '—', isEn ? 'Contribution' : 'Contribución']}
                  />
                  <ReferenceLine x={0} stroke={CHART_DEFAULTS.axisStroke} />
                  <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                    {latestContribs.map((entry, i) => (
                      <Cell key={i} fill={entry.value >= 0 ? CHART_COLORS.teal : CHART_COLORS.red} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
                {isEn
                  ? `contribution_i = (GDP_i,t − GDP_i,t−4) / GDP_total,t−4 × 100. Source: BCRP (constant 2007 soles).`
                  : `contribución_i = (PBI_i,t − PBI_i,t−4) / PBI_total,t−4 × 100. Fuente: BCRP (soles constantes 2007).`}
              </p>
            </div>

            {/* Chart 2: Contributions over time (stacked bar + line) */}
            {contrib.contributions.length >= 4 && (
              <div className="mt-8 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                    {isEn ? 'Growth contribution by sector (pp)' : 'Contribución al crecimiento del PBI por sector (pp)'}
                  </h3>
                  <ChartShareButton
                    url="https://qhawarina.pe/estadisticas/pbi"
                    shareText={isEn
                      ? `📊 Peru GDP growth decomposition: Servicios leads at +${contrib.contributions.at(-1)?.['Servicios'] ?? '?'}pp in ${latestQ} — Qhawarina`
                      : `📊 Descomposición PBI Perú: Servicios lidera con +${contrib.contributions.at(-1)?.['Servicios'] ?? '?'}pp en ${latestQ} — Qhawarina`}
                  />
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={contrib.contributions} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                    <XAxis dataKey="quarter" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                    <YAxis
                      tick={axisTickStyle}
                      stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}`}
                      label={{ value: 'pp', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(v: number | undefined, name: string | undefined) => [
                        `${(v ?? 0) > 0 ? '+' : ''}${typeof v === 'number' ? v.toFixed(2) : '—'} ${name === (isEn ? 'Total YoY' : 'Total i.a.') ? '%' : 'pp'}`,
                        name ?? '',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
                    <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />
                    {SECTOR_ORDER.map(key => (
                      <Bar key={key} dataKey={key} name={contrib.sector_labels[key] ?? key}
                        fill={SECTOR_COLORS[key]} stackId="a" />
                    ))}
                    <Line
                      type="monotone"
                      dataKey="total_yoy"
                      name={isEn ? 'Total YoY' : 'Total i.a.'}
                      stroke={CHART_COLORS.ink}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART_COLORS.ink }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Chart 1: GDP composition over time (stacked area) */}
            {contrib.shares.length >= 8 && (
              <div className="mt-8 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                      {isEn ? 'GDP composition by sector (%)' : 'Estructura del PBI por sector (%)'}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: CHART_COLORS.ink3 }}>
                      {isEn ? 'Servicios: 45.6% (2006) → 50.3% (2025)' : 'Servicios: 45.6% (2006) → 50.3% (2025) · Minería: 15.5% → 11.8%'}
                    </p>
                  </div>
                  <ChartShareButton
                    url="https://qhawarina.pe/estadisticas/pbi"
                    shareText={isEn
                      ? `📊 Peru GDP structure: Services now ${contrib.shares.at(-1)?.['Servicios'] ?? '?'}% of GDP (2025) — structural shift over 20 years. Qhawarina`
                      : `📊 Estructura PBI Perú: Servicios representa ${contrib.shares.at(-1)?.['Servicios'] ?? '?'}% del PBI (2025) — transformación estructural 20 años. Qhawarina`}
                  />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={contrib.shares} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                    <XAxis
                      dataKey="quarter"
                      tick={axisTickStyle}
                      stroke={CHART_DEFAULTS.axisStroke}
                      interval={15}
                    />
                    <YAxis
                      tick={axisTickStyle}
                      stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={v => `${v.toFixed(0)}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(v: number | undefined, name: string | undefined) => [`${v?.toFixed(1) ?? '—'}%`, name ?? '']}
                    />
                    <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
                    {SECTOR_ORDER.map(key => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={contrib.sector_labels[key] ?? key}
                        stackId="1"
                        fill={SECTOR_COLORS[key]}
                        stroke={SECTOR_COLORS[key]}
                        fillOpacity={0.85}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
                <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
                  {isEn
                    ? 'share_i,t = GDP_i,t / GDP_total,t × 100. Source: BCRP (constant 2007 soles).'
                    : 'participación_i,t = PBI_i,t / PBI_total,t × 100. Fuente: BCRP (soles constantes 2007).'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
