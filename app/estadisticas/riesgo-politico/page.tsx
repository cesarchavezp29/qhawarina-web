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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

// ─── DATA TYPES ──────────────────────────────────────────────────────────────

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: {
    date: string;
    score: number;
    prr_7d?: number;
    prr_raw?: number;
    level: string;
    articles_total: number;
    articles_political: number;
    articles_economic: number;
    justification?: string | null;
    top_drivers?: Array<{
      title: string;
      source: string;
      category: string;
      severity: number;
    }> | null;
  };
  daily_series?: Array<{
    date: string;
    score: number;
    score_raw?: number;
    prr?: number;
    prr_7d?: number;
    n_articles?: number;
  }>;
  monthly_series?: Array<{ month: string; political_avg: number }>;
}

// ─── RISK LEVEL SYSTEM (5 levels, clean multiplier boundaries) ───────────────
// Boundaries: 100 (1×), 200 (2×), 300 (3×), 500 (5×)
// Replaces the old 6-level system (MÍNIMO/BAJO merged into NORMAL).

type RiskLevel = 'NORMAL' | 'ELEVADO' | 'ALTO' | 'CRITICO' | 'EMERGENCIA';

interface LevelCfg {
  color: string;
  label_es: string;
  label_en: string;
  desc_es: string;
  desc_en: string;
  range: string;
  mult: string;
}

// Colors taken directly from the Qhawarina gauge gradient:
//   #2A9D8F (teal) → #E0A458 (amber) → #C65D3E (terracotta) → #9B2226 (maroon) → #6B0000 (dark)
const LEVELS: Record<RiskLevel, LevelCfg> = {
  NORMAL:     { color: '#2A9D8F', label_es: 'Normal',     label_en: 'Normal',    desc_es: 'Actividad política rutinaria',                   desc_en: 'Routine political activity',                  range: '< 100',    mult: '< 1×' },
  ELEVADO:    { color: '#E0A458', label_es: 'Elevado',    label_en: 'Elevated',  desc_es: 'Tensiones por encima del promedio',              desc_en: 'Above-average political tensions',            range: '100–200',  mult: '1–2×' },
  ALTO:       { color: '#C65D3E', label_es: 'Alto',       label_en: 'High',      desc_es: 'Crisis política significativa',                  desc_en: 'Significant political crisis',                range: '200–300',  mult: '2–3×' },
  CRITICO:    { color: '#9B2226', label_es: 'Crítico',    label_en: 'Critical',  desc_es: 'Crisis grave, múltiples eventos simultáneos',    desc_en: 'Severe crisis, multiple simultaneous events', range: '300–500',  mult: '3–5×' },
  EMERGENCIA: { color: '#6B0000', label_es: 'Emergencia', label_en: 'Emergency', desc_es: 'Crisis histórica extraordinaria',                desc_en: 'Extraordinary historical crisis',             range: '> 500',    mult: '> 5×' },
};

function getRiskLevel(prr: number): RiskLevel {
  if (prr < 100) return 'NORMAL';
  if (prr < 200) return 'ELEVADO';
  if (prr < 300) return 'ALTO';
  if (prr < 500) return 'CRITICO';
  return 'EMERGENCIA';
}

/** "133 PRR → 1.3×" */
function toMult(prr: number): string {
  return (Math.round(prr / 10) / 10).toFixed(1) + '×';
}

// ─── MULTIPLIER SCALE COMPONENT ──────────────────────────────────────────────
// Linear 0–1000 (0–10×). Two dots: open = today, filled = 7d trend.

function MultiplierScale({
  rawPrr,
  avg7d,
  isEn,
}: {
  rawPrr: number;
  avg7d: number;
  isEn: boolean;
}) {
  const MAX = 1000;
  const rawPct = Math.min((rawPrr / MAX) * 100, 98);
  const avgPct = Math.min((avg7d / MAX) * 100, 98);

  const ticks = [
    { pct: 10,  top: '1×',  sub: isEn ? 'Normal'    : 'Normal'    },
    { pct: 20,  top: '2×',  sub: isEn ? 'Elevated'  : 'Elevado'   },
    { pct: 30,  top: '3×',  sub: isEn ? 'High'      : 'Alto'      },
    { pct: 50,  top: '5×',  sub: isEn ? 'Critical'  : 'Crítico'   },
    { pct: 100, top: '10×', sub: isEn ? 'Emergency' : 'Emergencia'},
  ];

  return (
    <div>
      {/* Bar + ticks + dots */}
      <div className="relative" style={{ marginBottom: '44px' }}>
        {/* Colored segments */}
        <div className="flex h-4 rounded-full overflow-hidden">
          <div style={{ width: '10%', background: '#2A9D8F' }} />
          <div style={{ width: '10%', background: '#E0A458' }} />
          <div style={{ width: '10%', background: '#C65D3E' }} />
          <div style={{ width: '20%', background: '#9B2226' }} />
          <div style={{ width: '50%', background: '#5C0000' }} />
        </div>

        {/* Tick marks + labels */}
        {ticks.map((t) => (
          <div
            key={t.pct}
            className="absolute top-0 h-4"
            style={{ left: `${t.pct}%` }}
          >
            {/* Tick line */}
            <div className="w-px h-full bg-white opacity-50" />
            {/* Label block below bar */}
            <div
              className="absolute top-5 text-center"
              style={{
                transform:
                  t.pct >= 100
                    ? 'translateX(-100%)'
                    : 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div className="text-xs font-semibold text-gray-700">{t.top}</div>
              <div className="text-gray-400" style={{ fontSize: '10px' }}>{t.sub}</div>
            </div>
          </div>
        ))}

        {/* Today — open circle (on top of bar) */}
        <div
          className="absolute"
          style={{ left: `calc(${rawPct}% - 10px)`, top: '-3px', zIndex: 10 }}
          title={`${isEn ? 'Today' : 'Hoy'}: PRR ${Math.round(rawPrr)}`}
        >
          <div
            className="w-5 h-5 rounded-full border-2 bg-white shadow-md"
            style={{ borderColor: '#1F2937' }}
          />
        </div>

        {/* 7d trend — filled circle */}
        <div
          className="absolute"
          style={{ left: `calc(${avgPct}% - 10px)`, top: '-3px', zIndex: 9 }}
          title={`${isEn ? '7d trend' : 'Tendencia 7d'}: PRR ${Math.round(avg7d)}`}
        >
          <div
            className="w-5 h-5 rounded-full shadow-md"
            style={{ background: '#1F2937' }}
          />
        </div>
      </div>

      {/* Dot legend */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border-2 bg-white flex-shrink-0"
            style={{ borderColor: '#1F2937' }}
          />
          <span>
            {isEn ? 'Today' : 'Hoy'}: {toMult(rawPrr)} (PRR {Math.round(rawPrr)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: '#1F2937' }}
          />
          <span>
            {isEn ? '7d trend' : 'Tendencia 7d'}: {toMult(avg7d)} (PRR {Math.round(avg7d)})
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── READING CARD ─────────────────────────────────────────────────────────────
// Self-contained: own number, multiplier, badge. No ambiguity.

function ReadingCard({
  title,
  subtitle,
  prr,
  isEn,
}: {
  title: string;
  subtitle: string;
  prr: number;
  isEn: boolean;
}) {
  const level = getRiskLevel(prr);
  const cfg = LEVELS[level];
  const mult = toMult(prr);

  return (
    <div
      className="rounded-xl border-2 p-5 flex flex-col"
      style={{ borderColor: cfg.color + '44', background: cfg.color + '0A' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: cfg.color + '18', color: cfg.color }}
        >
          {isEn ? cfg.label_en : cfg.label_es}
        </span>
      </div>

      {/* Big number */}
      <p
        className="text-5xl font-bold tabular-nums leading-none"
        style={{ color: cfg.color, fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(prr)}
      </p>

      {/* THE key insight */}
      <p className="text-base font-semibold mt-1.5" style={{ color: cfg.color }}>
        {isEn ? `${mult} the average` : `${mult} el promedio`}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        PRR · {isEn ? 'mean = 100' : 'media = 100'}
      </p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RiesgoPoliticoPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `/assets/data/political_index_daily.json?v=${new Date()
        .toISOString()
        .slice(0, 13)}`
    )
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) return <PageSkeleton cards={2} />;
  if (error || !data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">
        {isEn ? 'Error loading data.' : 'Error cargando datos.'}{' '}
        <button onClick={() => window.location.reload()} className="underline">
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </p>
    </div>
  );

  // ── Derived values ──────────────────────────────────────────────────────────
  const rawPrr = data.current.prr_raw ?? data.current.score;
  const avg7d  = data.current.prr_7d  ?? data.current.score;
  const mult      = toMult(rawPrr);
  const multTrend = toMult(avg7d);

  const currentDateStr = (() => {
    try {
      const [y, m, d] = data.current.date.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(
        isEn ? 'en-US' : 'es-PE',
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch {
      return data.current.date;
    }
  })();

  // ── Chart data ──────────────────────────────────────────────────────────────
  const dailyTrend = (data.daily_series ?? []).map((d) => ({
    date: d.date,
    trend: d.prr_7d ?? d.score,
    daily: d.prr   ?? d.score_raw ?? d.score,
  }));

  // Y-axis ticks in PRR, formatted as multipliers
  const maxPrr = Math.max(...dailyTrend.map((d) => Math.max(d.trend, d.daily)), 200);
  const yTicks = [0, 100, 200, 300, 500].filter((t) => t <= maxPrr + 150);
  if (maxPrr > 500 && !yTicks.includes(Math.ceil(maxPrr / 100) * 100)) {
    yTicks.push(Math.ceil(maxPrr / 100) * 100);
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/estadisticas" className="hover:text-blue-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </a>
          {' / '}
          <span className="text-gray-900 font-medium">
            {isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'}
          </span>
        </nav>

        {/* ══ SECTION 1: HEADER ════════════════════════════════════════════ */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'}
            </h1>
            <p className="text-gray-500 text-base max-w-xl leading-relaxed">
              {isEn
                ? <>
                    Measures the intensity of political and economic news in Peru.{' '}
                    A normal day&nbsp;=&nbsp;100.{' '}
                    <strong className="text-gray-700">Today = {mult} the normal level.</strong>
                  </>
                : <>
                    Mide la intensidad de noticias políticas y económicas en Perú.{' '}
                    Un día normal&nbsp;=&nbsp;100.{' '}
                    <strong className="text-gray-700">Hoy = {mult} lo normal.</strong>
                  </>
              }
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <ShareButton
              title={`${isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'} — Qhawarina`}
              text={
                isEn
                  ? `📊 Peru Political Risk: ${mult} the normal level today (PRR ${Math.round(rawPrr)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`
                  : `📊 Riesgo político Perú: ${mult} lo normal hoy (PRR ${Math.round(rawPrr)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`
              }
            />
            <EmbedWidget
              path="/estadisticas/riesgo-politico"
              title={`${isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'} — Qhawarina`}
              height={600}
            />
          </div>
        </div>

        {/* ══ SECTION 2: TWO READING CARDS ════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <ReadingCard
            title={isEn ? 'TODAY' : 'HOY'}
            subtitle={currentDateStr}
            prr={rawPrr}
            isEn={isEn}
          />
          <ReadingCard
            title={isEn ? '7-DAY TREND' : 'TENDENCIA 7 DÍAS'}
            subtitle={isEn ? 'Rolling average' : 'Promedio móvil'}
            prr={avg7d}
            isEn={isEn}
          />
        </div>

        {/* ══ SECTION 3: MULTIPLIER SCALE ═════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            {isEn ? 'Reference scale (0 – 10× the average)' : 'Escala de referencia (0 – 10× el promedio)'}
          </p>
          <MultiplierScale rawPrr={rawPrr} avg7d={avg7d} isEn={isEn} />
        </div>

        <div className="mb-6">
          <LastUpdate
            date={new Date(data.metadata.generated_at).toLocaleDateString(
              isEn ? 'en-US' : 'es-PE',
              { day: 'numeric', month: 'short', year: 'numeric' }
            )}
          />
        </div>

        {/* ══ SECTION 4: CHART ════════════════════════════════════════════ */}
        {dailyTrend.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            {/* Chart header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {isEn ? 'Full history' : 'Historial completo'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  {isEn
                    ? 'Each point is one day. The bold line shows the weekly trend. Spikes above 5× (500 PRR) correspond to acute political crises.'
                    : 'Cada punto es un día. La línea gruesa muestra la tendencia semanal. Picos superiores a 5× (500 PRR) corresponden a crisis políticas agudas.'
                  }
                </p>
              </div>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/riesgo-politico"
                shareText={
                  isEn
                    ? `📊 Peru Political Risk: ${mult} the normal level (PRR ${Math.round(rawPrr)}) — Qhawarina`
                    : `📊 Riesgo político Perú: ${mult} lo normal (PRR ${Math.round(rawPrr)}) — Qhawarina`
                }
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#C65D3E" strokeWidth="2.5" /></svg>
                <span>{isEn ? '7-day trend' : 'Tendencia 7d'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#C65D3E" strokeWidth="1" strokeOpacity="0.5" /></svg>
                <span>{isEn ? 'Daily PRR' : 'PRR diario'}</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={dailyTrend}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                {/* Zone background bands — subtle context, not dominant visual */}
                <ReferenceArea y1={0}   y2={100} fill="#2A9D8F" fillOpacity={0.03} stroke="none" />
                <ReferenceArea y1={100} y2={200} fill="#E0A458" fillOpacity={0.03} stroke="none" />
                <ReferenceArea y1={200} y2={300} fill="#C65D3E" fillOpacity={0.05} stroke="none" />
                <ReferenceArea y1={300} y2={500} fill="#9B2226" fillOpacity={0.08} stroke="none" />
                <ReferenceArea y1={500}          fill="#6B0000" fillOpacity={0.12} stroke="none" />

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
                />
                <XAxis
                  dataKey="date"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  interval={Math.floor(dailyTrend.length / 6)}
                />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  ticks={yTicks}
                  tickFormatter={(v: number) =>
                    v === 0 ? '0' : `${(v / 100).toFixed(0)}×`
                  }
                  label={{
                    value: isEn ? '× avg' : '× media',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                    offset: 8,
                  }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={((v: number | undefined, name?: string) => [
                    `${Math.round(v ?? 0)} PRR (${toMult(v ?? 0)})`,
                    name === 'trend'
                      ? (isEn ? '7d trend' : 'Tendencia 7d')
                      : (isEn ? 'Daily PRR' : 'PRR diario'),
                  ]) as any}
                />

                {/* avg = 100 reference */}
                <ReferenceLine
                  y={100}
                  stroke={CHART_COLORS.amber}
                  strokeDasharray="4 2"
                  label={{
                    value: isEn ? 'avg (1×)' : 'media (1×)',
                    position: 'insideTopRight',
                    style: { fontSize: 9, fill: CHART_COLORS.ink3 },
                  }}
                />


                {/* Raw daily PRR — thin, muted */}
                <Area
                  type="monotone"
                  dataKey="daily"
                  stroke="#C65D3E"
                  fill="none"
                  dot={false}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                />
                {/* 7-day trend — bold with fill */}
                <Area
                  type="monotone"
                  dataKey="trend"
                  stroke="#C65D3E"
                  fill="#C65D3E"
                  fillOpacity={0.10}
                  dot={false}
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ══ SECTION 5: INTERPRETATION TABLE ════════════════════════════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {isEn ? 'How to interpret this index' : '¿Cómo se interpreta?'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isEn
              ? <>
                  Example: a PRR of{' '}
                  <strong>{Math.round(avg7d)}</strong> means that this week&apos;s
                  political activity was{' '}
                  <strong>{multTrend} more intense</strong> than a normal day.
                </>
              : <>
                  Ejemplo: un PRR de{' '}
                  <strong>{Math.round(avg7d)}</strong> significa que la actividad
                  política de la semana fue{' '}
                  <strong>{multTrend} más intensa</strong> que un día promedio.
                </>
            }
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">
                    {isEn ? 'Level' : 'Nivel'}
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">
                    PRR
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">
                    {isEn ? 'Multiplier' : 'Múltiplo'}
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {isEn ? 'What it means' : 'Qué significa'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(LEVELS) as [RiskLevel, LevelCfg][]).map(([key, cfg]) => (
                  <tr key={key} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: cfg.color + '18', color: cfg.color }}
                      >
                        {isEn ? cfg.label_en : cfg.label_es}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 font-mono text-xs">{cfg.range}</td>
                    <td className="py-3 pr-4 text-gray-500 text-xs font-medium">{cfg.mult}</td>
                    <td className="py-3 text-gray-600 text-sm">
                      {isEn ? cfg.desc_en : cfg.desc_es}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ SECTION 5b: HAIKU JUSTIFICATION ════════════════════════════ */}
        {data.current.justification && (
          <div
            className="mb-6 rounded-lg p-5"
            style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CHART_COLORS.ink2 }}>
                {isEn ? '¿Why this level?' : '¿Por qué este nivel?'}
              </h3>
              <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                {formatDate(data.current.date, isEn)}
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: CHART_COLORS.ink1 }}>
              "{data.current.justification}"
            </p>
            {data.current.top_drivers && data.current.top_drivers.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: CHART_COLORS.ink3 }}>
                  {isEn ? 'Main signals' : 'Principales señales'}
                </p>
                <ul className="space-y-1.5">
                  {data.current.top_drivers.map((d, i) => {
                    const dotColor = d.severity >= 0.8 ? '#9B2226' : d.severity >= 0.5 ? '#C65D3E' : '#E0A458';
                    return (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: CHART_COLORS.ink2 }}>
                        <span
                          className="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full"
                          style={{ background: dotColor, marginTop: '4px' }}
                        />
                        <span className="font-mono text-xs w-8 flex-shrink-0" style={{ color: dotColor }}>
                          {d.severity.toFixed(1)}
                        </span>
                        <span className="leading-tight">{d.title}</span>
                        <span className="flex-shrink-0 ml-1" style={{ color: CHART_COLORS.ink3 }}>({d.source})</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ══ SECTION 6: DATA BOXES ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: isEn ? 'Articles today'  : 'Artículos hoy',   value: data.current.articles_total     },
            { label: isEn ? 'Political'        : 'Políticos',       value: data.current.articles_political },
            { label: isEn ? 'Economic'         : 'Económicos',      value: data.current.articles_economic  },
            { label: isEn ? 'RSS feeds'        : 'Feeds RSS',       value: data.metadata.rss_feeds         },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-6 px-1">
          {isEn
            ? 'Coverage: ~110 articles/day from 6 Peruvian media outlets (La República, El Comercio, Gestión, RPP, Ideeleradio, Infobae Peru).'
            : 'Cobertura: ~110 artículos/día de 6 medios peruanos (La República, El Comercio, Gestión, RPP, Ideeleradio, Infobae Perú).'}
        </p>

        {/* ══ SECTION 7: LINKS ════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/estadisticas/riesgo-politico/metodologia" className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">📖</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Full methodology' : 'Metodología completa'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn
                    ? 'Formulas · LLM classifier · AI-GPR reference'
                    : 'Fórmulas · clasificador LLM · referencia AI-GPR'}
                </p>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">→</span>
            </div>
          </Link>
          <Link href="/datos" className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">📥</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Download data' : 'Descargar datos'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn
                    ? `Complete daily series — ${data.metadata.coverage_days} days`
                    : `Serie diaria completa — ${data.metadata.coverage_days} días`}
                </p>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">→</span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
