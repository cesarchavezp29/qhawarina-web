'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from '../../components/stats/LastUpdate';
import EmbedWidget from '../../components/EmbedWidget';
import ShareButton from '../../components/ShareButton';
import ChartShareButton from '../../components/ChartShareButton';
import PageSkeleton from '../../components/PageSkeleton';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: { date: string; score: number; level: string; articles_total: number; articles_political: number; articles_economic: number };
  daily_series?: Array<{ date: string; score: number }>;
  monthly_series?: Array<{ month: string; political_avg: number }>;
}

const PRR_MAX = 300;
const GAUGE_GRADIENT = [
  '#8D99AE 0%',    // MINIMO (gray-blue)
  '#2A9D8F 17%',   // BAJO (teal) — PRR 50
  '#E0A458 27%',   // MODERADO start (amber) — PRR 80
  '#E0A458 40%',   // MODERADO end — PRR 120
  '#C65D3E 53%',   // ELEVADO — PRR 160
  '#9B2226 67%',   // ALTO — PRR 200
  '#6B0000 100%',  // CRITICO — PRR 300
].join(', ');

function zoneColor(prr: number): string {
  if (prr < 50)  return '#8D99AE';
  if (prr < 80)  return '#2A9D8F';
  if (prr < 120) return '#E0A458';
  if (prr < 160) return '#C65D3E';
  if (prr < 200) return '#9B2226';
  return '#6B1518';
}

function RiskBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(PRR_MAX, score)) / PRR_MAX * 100;
  const dotColor = zoneColor(score);
  return (
    <div className="mt-4 mb-1">
      <div
        className="relative h-3 rounded-full overflow-visible"
        style={{ background: `linear-gradient(90deg, ${GAUGE_GRADIENT})` }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md"
          style={{ left: `calc(${pct}% - 8px)`, background: dotColor }}
        />
      </div>
      <div className="flex justify-between mt-1.5 relative">
        <span className="text-xs text-gray-400">0</span>
        <span className="text-xs text-gray-400 absolute" style={{ left: '33%', transform: 'translateX(-50%)' }}>100 (avg)</span>
        <span className="text-xs text-gray-400">300</span>
      </div>
    </div>
  );
}

const LEVEL_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  MINIMO:   { bg: 'bg-gray-50',   text: 'text-gray-600',   border: 'border-gray-300'  },
  BAJO:     { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300' },
  MODERADO: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
  ELEVADO:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  ALTO:     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-300'   },
  CRITICO:  { bg: 'bg-red-100',   text: 'text-red-900',    border: 'border-red-600'   },
};

export default function RiesgoPoliticoPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    breadcrumb: 'Statistics',
    title: 'Political Risk Index',
    currentLevel: 'Current level',
    articlesTotal: 'Articles analyzed today',
    articlesPolitical: 'Political articles',
    articlesEconomic: 'Economic articles',
    rssFeeds: 'RSS feeds monitored',
    cardMethodology: 'Methodology',
    cardMethodologyDesc: 'Claude Haiku · 11 RSS feeds · 6 sources · components and weights',
    cardDownload: 'Download Data',
    cardDownloadDesc: (days: number) => `Complete daily series — ${days} days of coverage`,
    error: 'Error loading data.',
    retry: 'Retry',
    shareText: (score: number, level: string) => `📊 Political Risk Peru: PRR ${Math.round(score)} (${level}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`,
  } : {
    breadcrumb: 'Estadísticas',
    title: 'Índice de Riesgo Político',
    currentLevel: 'Nivel actual',
    articlesTotal: 'Artículos analizados hoy',
    articlesPolitical: 'Artículos políticos',
    articlesEconomic: 'Artículos económicos',
    rssFeeds: 'Feeds RSS monitoreados',
    cardMethodology: 'Metodología',
    cardMethodologyDesc: 'Claude Haiku · 11 feeds RSS · 6 fuentes · componentes y pesos',
    cardDownload: 'Descargar Datos',
    cardDownloadDesc: (days: number) => `Serie diaria completa — ${days} días de cobertura`,
    error: 'Error cargando datos.',
    retry: 'Reintentar',
    shareText: (score: number, level: string) => `📊 Riesgo político Perú: PRR ${Math.round(score)} (${level}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`,
  };

  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/political_index_daily.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  if (loading) return <PageSkeleton cards={2} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">{T.error} <button onClick={() => window.location.reload()} className="underline">{T.retry}</button></p>
    </div>
  );

  const level = data.current.level;
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES['MODERADO'];

  // Daily PRR trend — full history (all available data)
  const dailyTrend = (data.daily_series ?? [])
    .map(d => ({ date: d.date, score: d.score }));

  // Monthly average trend — all non-zero months
  const monthlyTrend = (data.monthly_series ?? [])
    .filter(m => m.political_avg > 0)
    .map(m => ({
      month: m.month.slice(0, 7),
      score: parseFloat((m.political_avg).toFixed(1)),
    }));

  // PRR thresholds for monthly bar colors
  const barColor = (score: number) =>
    score < 80 ? CHART_COLORS.teal : score < 120 ? CHART_COLORS.amber : CHART_COLORS.red;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{T.breadcrumb}</a>
          {' / '}
          <span className="text-gray-900 font-medium">{T.title}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
          <h1 className="text-4xl font-bold text-gray-900">{T.title}</h1>
          <div className="flex gap-2">
            <ShareButton title={`${isEn ? 'Political Risk' : 'Riesgo Político'} — Qhawarina`} text={T.shareText(data.current.score, level)} />
            <EmbedWidget path="/estadisticas/riesgo-politico" title={`${isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'} — Qhawarina`} height={600} />
          </div>
        </div>

        <div className={`mt-4 px-5 py-4 rounded-xl border-2 ${styles.border} ${styles.bg}`}>
          <div className="flex items-center gap-4 mb-1">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{T.currentLevel}</p>
              <p className={`text-3xl font-bold ${styles.text}`}>{Math.round(data.current.score)} <span className="text-base font-normal text-gray-400">PRR</span></p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${styles.bg} ${styles.text} border ${styles.border}`}>
              {level}
            </div>
          </div>
          <RiskBar score={data.current.score} />
        </div>

        <div className="mt-3">
          <LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* Daily PRR Chart — hero, last 90 days */}
        {dailyTrend.length >= 2 && (
          <div className="mt-10 rounded-lg border p-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Daily Risk Score — full history' : 'Índice diario de riesgo — historia completa'}
              </h3>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/riesgo-politico"
                shareText={isEn
                  ? `📊 Peru Political Risk: PRR ${Math.round(data.current.score)} today (${data.current.level}) — Qhawarina`
                  : `📊 Riesgo político Perú: PRR ${Math.round(data.current.score)} hoy (${data.current.level}) — Qhawarina`}
              />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis dataKey="date" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                  interval={Math.floor(dailyTrend.length / 6)}
                />
                <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                  label={{ value: 'PRR', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: number | undefined) => [`${Math.round(v ?? 0)}`, 'PRR']}
                />
                <ReferenceLine y={100} stroke={CHART_COLORS.amber} strokeDasharray="4 2"
                  label={{ value: isEn ? 'avg (100)' : 'media (100)', position: 'insideTopRight', style: { fontSize: 9, fill: CHART_COLORS.ink3 } }}
                />
                <Area type="monotone" dataKey="score"
                  stroke="#C65D3E" fill="#C65D3E" fillOpacity={0.12}
                  dot={false} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
              {isEn ? 'PRR = Political Risk Rating. Mean = 100 (dashed line). Source: Qhawarina AI-GPR · 11 RSS feeds.'
                : 'PRR = Índice de Riesgo Político. Media = 100 (línea punteada). Fuente: Qhawarina AI-GPR · 11 feeds RSS.'}
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: T.articlesTotal, value: data.current.articles_total.toString() },
            { label: T.articlesPolitical, value: data.current.articles_political.toString() },
            { label: T.articlesEconomic, value: data.current.articles_economic.toString() },
            { label: T.rssFeeds, value: data.metadata.rss_feeds.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/estadisticas/riesgo-politico/metodologia">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📖</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardMethodology}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardMethodologyDesc}</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/datos">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📥</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{T.cardDownload}</h2>
                  <p className="text-sm text-gray-600 mt-1">{T.cardDownloadDesc(data.metadata.coverage_days)}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Monthly Average Trend Chart */}
        {monthlyTrend.length >= 2 && (
          <div className="mt-8 rounded-lg border p-6 relative" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Monthly Average Risk Score' : 'Promedio Mensual del Índice de Riesgo'}
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyTrend} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis dataKey="month" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                  label={{ value: 'PRR', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: number | undefined) => [`${v?.toFixed(1) ?? '—'}`, 'PRR']}
                />
                <ReferenceLine y={100} stroke={CHART_COLORS.amber} strokeDasharray="4 2" />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {monthlyTrend.map((entry, i) => (
                    <Cell key={i} fill={barColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
              {isEn
                ? 'Teal <80 (Bajo) · Amber 80–120 (Moderado) · Red >120 (Elevado+). Mean = 100.'
                : 'Verde <80 (Bajo) · Ámbar 80–120 (Moderado) · Rojo >120 (Elevado+). Media = 100.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
