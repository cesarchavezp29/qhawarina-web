'use client';

import { useState, useEffect, useMemo } from 'react';
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
    // Dual indices (new)
    political_raw: number;
    political_7d: number;
    political_level: string;
    political_multiplier: number;
    economic_raw: number;
    economic_7d: number;
    economic_level: string;
    economic_multiplier: number;
    // Legacy (kept for backward compat)
    score?: number;
    prr_7d?: number;
    prr_raw?: number;
    level?: string;
    articles_total: number;
    articles_political_relevant?: number;
    articles_economic_relevant?: number;
    political_justification?: string | null;
    economic_justification?: string | null;
    top_political_drivers?: Array<{ title: string; source: string; score: number }> | null;
    top_economic_drivers?: Array<{ title: string; source: string; score: number }> | null;
    // Legacy
    justification?: string | null;
    top_drivers?: Array<{ title: string; source: string; category: string; severity: number }> | null;
  };
  daily_series?: Array<{
    date: string;
    political_raw?: number;
    political_7d?: number;
    economic_raw?: number;
    economic_7d?: number;
    // legacy
    score?: number;
    prr?: number;
    prr_7d?: number;
    score_raw?: number;
    n_articles?: number;
    low_coverage?: boolean;
    provisional?: boolean;
  }>;
  monthly_series?: Array<{ month: string; political_avg: number }>;
  peak_events?: Array<{ date: string; dimension: string; value: number; label: string }>;
}

// ─── RISK LEVEL SYSTEM (6 levels) ────────────────────────────────────────────
// MINIMO / BAJO / NORMAL / ELEVADO / ALTO / CRITICO
// Boundaries aligned with backend classify_level() (mean = 100).

type RiskLevel = 'MINIMO' | 'BAJO' | 'NORMAL' | 'ELEVADO' | 'ALTO' | 'CRITICO' | 'MODERADO';

interface LevelCfg {
  color: string;
  label_es: string;
  label_en: string;
  desc_pol_es: string;
  desc_pol_en: string;
  desc_eco_es: string;
  desc_eco_en: string;
  range: string;
  mult: string;
}

const LEVELS: Record<RiskLevel, LevelCfg> = {
  MINIMO:   { color: '#8D99AE', label_es: 'Mínimo',  label_en: 'Minimal',  desc_pol_es: 'Gobernanza rutinaria',   desc_pol_en: 'Routine governance',      desc_eco_es: 'Economía estable',     desc_eco_en: 'Stable economy',      range: '< 50',     mult: '< 0.5×'  },
  BAJO:     { color: '#2A9D8F', label_es: 'Bajo',    label_en: 'Low',      desc_pol_es: 'Tensiones menores',      desc_pol_en: 'Minor tensions',          desc_eco_es: 'Presiones leves',      desc_eco_en: 'Mild pressures',      range: '50–90',    mult: '0.5–0.9×'},
  NORMAL:   { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_pol_es: 'Nivel histórico normal', desc_pol_en: 'Near historical average', desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',      range: '90–110',   mult: '0.9–1.1×'},
  ELEVADO:  { color: '#C65D3E', label_es: 'Elevado', label_en: 'Elevated', desc_pol_es: 'Crisis significativa',   desc_pol_en: 'Significant crisis',      desc_eco_es: 'Vulnerabilidad seria', desc_eco_en: 'Serious vulnerability',range: '110–150',  mult: '1.1–1.5×'},
  ALTO:     { color: '#9B2226', label_es: 'Alto',    label_en: 'High',     desc_pol_es: 'Crisis grave',           desc_pol_en: 'Severe crisis',           desc_eco_es: 'Crisis económica',     desc_eco_en: 'Economic crisis',     range: '150–200',  mult: '1.5–2×'  },
  CRITICO:  { color: '#6B0000', label_es: 'Crítico', label_en: 'Critical', desc_pol_es: 'Ruptura institucional',  desc_pol_en: 'Institutional breakdown', desc_eco_es: 'Colapso sistémico',    desc_eco_en: 'Systemic collapse',   range: '> 200',    mult: '> 2×'    },
  // legacy alias — keep so old cached JSON doesn't break
  MODERADO: { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_pol_es: 'Nivel histórico normal', desc_pol_en: 'Near historical average', desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',      range: '90–110',   mult: '0.9–1.1×'},
};

function getRiskLevel(prr: number): RiskLevel {
  if (prr < 50)  return 'MINIMO';
  if (prr < 90)  return 'BAJO';
  if (prr < 110) return 'NORMAL';
  if (prr < 150) return 'ELEVADO';
  if (prr < 200) return 'ALTO';
  return 'CRITICO';
}

/** "133 PRR → 1.3×" */
function toMult(prr: number): string {
  return (Math.round(prr / 10) / 10).toFixed(1) + '×';
}

function formatDate(dateStr: string, isEn: boolean): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(
      isEn ? 'en-US' : 'es-PE',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  } catch {
    return dateStr;
  }
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
          title={`${isEn ? 'Today' : 'Hoy'}: IRP ${Math.round(rawPrr)}`}
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
          title={`${isEn ? '7d trend' : 'Tendencia 7d'}: IRP ${Math.round(avg7d)}`}
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
            {isEn ? 'Today' : 'Hoy'}: {toMult(rawPrr)} (IRP {Math.round(rawPrr)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ background: '#1F2937' }}
          />
          <span>
            {isEn ? '7d trend' : 'Tendencia 7d'}: {toMult(avg7d)} (IRP {Math.round(avg7d)})
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
  level: levelOverride,
  accentColor,
  isEn,
  indexLabel,
}: {
  title: string;
  subtitle: string;
  prr: number;
  level?: string;
  accentColor?: string;
  isEn: boolean;
  indexLabel?: string;
}) {
  const level = (levelOverride as RiskLevel) ?? getRiskLevel(prr);
  const cfg = LEVELS[level] ?? LEVELS['MODERADO'];
  const color = accentColor ?? cfg.color;
  const mult = toMult(prr);

  return (
    <div
      className="rounded-xl border-2 p-5 flex flex-col"
      style={{ borderColor: color + '44', background: color + '0A' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
          style={{ background: color + '18', color: color }}
        >
          {isEn ? cfg.label_en : cfg.label_es}
        </span>
      </div>

      {/* Big number */}
      <p
        className="text-5xl font-bold tabular-nums leading-none"
        style={{ color: color, fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(prr)}
      </p>

      {/* THE key insight */}
      <p className="text-base font-semibold mt-1.5" style={{ color: color }}>
        {isEn ? `${mult} the average` : `${mult} el promedio`}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {indexLabel ?? 'IRP'} · {isEn ? 'mean = 100' : 'media = 100'}
      </p>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

// ── Custom peak label: multi-line box above reference line ───────────────────
function PeakLabel({ viewBox, label, color }: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  label: string;
  color: string;
}) {
  const { x = 0, y = 0 } = viewBox ?? {};
  const words = label.split(' ');
  // Split into lines of max 1 word each for shortest lines, or 2 if label is long
  const lines = words.length <= 2
    ? words                                    // "Vacancia Boluarte" → 2 lines
    : [words[0], words.slice(1).join(' ')];    // 3+ words → first / rest
  const lh = 11;
  const pad = 3;
  const boxH = lines.length * lh + pad * 2;
  const maxChars = Math.max(...lines.map(l => l.length));
  const boxW = maxChars * 5.5 + pad * 2;
  const bx = x - boxW / 2;
  const by = y - boxH - 6;
  return (
    <g>
      <rect x={bx} y={by} width={boxW} height={boxH} rx={2}
            fill="white" stroke={color} strokeWidth={0.8} opacity={0.92} />
      {lines.map((line, i) => (
        <text key={i}
              x={x}
              y={by + pad + (i + 1) * lh - 1}
              textAnchor="middle"
              fill={color}
              fontSize={8}
              fontWeight={600}
              fontFamily="system-ui, sans-serif">
          {line}
        </text>
      ))}
    </g>
  );
}

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
  const rawPrr   = data.current.political_raw ?? data.current.prr_raw ?? data.current.score ?? 0;
  const avg7d    = data.current.political_7d  ?? data.current.prr_7d  ?? data.current.score ?? 0;
  const polLevel = data.current.political_level ?? data.current.level ?? 'MODERADO';
  const polMult  = data.current.political_multiplier ?? (avg7d / 100);
  const ecoRaw   = data.current.economic_raw ?? 0;
  const eco7d    = data.current.economic_7d  ?? 0;
  const ecoLevel = data.current.economic_level ?? 'MODERADO';
  const ecoMult  = data.current.economic_multiplier ?? (eco7d / 100);
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
  const chartData = (data.daily_series ?? []).map((d) => ({
    date: d.date,
    political_7d:  d.political_7d  ?? d.prr_7d  ?? d.score,
    political_raw: d.political_raw ?? d.prr      ?? d.score_raw ?? d.score,
    economic_7d:   d.economic_7d,
    economic_raw:  d.economic_raw,
  }));
  // Keep backward-compat alias used by MultiplierScale
  const dailyTrend = chartData;

  // Political peak events
  const polPeaks = (data.peak_events ?? []).filter(
    (e) => e.dimension === 'political' && e.label
  );

  // Y-axis ticks in PRR, formatted as multipliers
  const maxPrr = Math.max(
    ...chartData.map((d) =>
      Math.max(d.political_7d ?? 0, d.political_raw ?? 0)
    ),
    200
  );
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
                    Mide la intensidad de noticias políticas en Perú.{' '}
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
                  ? `📊 Peru Political Risk: ${mult} the normal level today (IRP ${Math.round(rawPrr)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`
                  : `📊 Riesgo político Perú: ${mult} lo normal hoy (IRP ${Math.round(rawPrr)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-politico`
              }
            />
            <EmbedWidget
              path="/estadisticas/riesgo-politico"
              title={`${isEn ? 'Political Risk Index' : 'Índice de Riesgo Político'} — Qhawarina`}
              height={600}
            />
          </div>
        </div>

        {/* ══ SECTION 2: POLITICAL READING CARDS ══════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Political today */}
          <ReadingCard
            title={isEn ? 'POLITICAL RISK · TODAY' : 'RIESGO POLÍTICO · HOY'}
            subtitle={currentDateStr}
            prr={rawPrr}
            level={polLevel}
            accentColor="#C65D3E"
            isEn={isEn}
            indexLabel="IRP"
          />
          {/* Political 7d */}
          <ReadingCard
            title={isEn ? 'POLITICAL RISK · 7 DAYS' : 'RIESGO POLÍTICO · 7 DÍAS'}
            subtitle={isEn ? `${polMult.toFixed(1)}× the average` : `${polMult.toFixed(1)}× el promedio`}
            prr={avg7d}
            level={polLevel}
            accentColor="#C65D3E"
            isEn={isEn}
            indexLabel="IRP"
          />
        </div>

        {/* ── Link to economic risk page ──────────────────────────────────── */}
        <div className="mb-5">
          <Link href="/estadisticas/riesgo-economico">
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-teal-400 hover:shadow-sm transition-all flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base flex-shrink-0">📈</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {isEn ? 'Economic Risk Index (IRE)' : 'Índice de Riesgo Económico (IRE)'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isEn
                      ? `Today: ${toMult(ecoRaw)} · 7d: ${toMult(eco7d)}`
                      : `Hoy: ${toMult(ecoRaw)} · 7d: ${toMult(eco7d)}`}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">
                {isEn ? 'See economic risk →' : 'Ver riesgo económico →'}
              </span>
            </div>
          </Link>
        </div>

        {/* ══ SECTION 3: MULTIPLIER SCALE ═════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            {isEn ? 'Political risk scale (0 – 10× the average)' : 'Escala de riesgo político (0 – 10× el promedio)'}
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
        {chartData.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            {/* Chart header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {isEn ? 'Full history' : 'Historial completo'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  {isEn
                    ? 'Each point is one day. Bold line shows weekly trend. Terracotta = political risk.'
                    : 'Cada punto es un día. La línea gruesa muestra tendencia semanal. Terracota = riesgo político.'
                  }
                </p>
              </div>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/riesgo-politico"
                shareText={
                  isEn
                    ? `📊 Peru Political Risk: ${mult} the normal level (IRP ${Math.round(rawPrr)}) — Qhawarina`
                    : `📊 Riesgo político Perú: ${mult} lo normal (IRP ${Math.round(rawPrr)}) — Qhawarina`
                }
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#C65D3E" strokeWidth="2.5" /></svg>
                <span>{isEn ? 'Political 7d' : 'Político 7d'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#C65D3E" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 2" /></svg>
                <span>{isEn ? 'Political daily' : 'Político diario'}</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
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
                  interval={Math.floor(chartData.length / 6)}
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
                  formatter={((v: number | undefined, name?: string) => {
                    const labels: Record<string, string> = {
                      political_7d:  isEn ? 'Political 7d'   : 'Político 7d',
                      political_raw: isEn ? 'Political daily' : 'Político diario',
                    };
                    return [
                      `${Math.round(v ?? 0)} (${toMult(v ?? 0)})`,
                      labels[name ?? ''] ?? name,
                    ];
                  }) as any}
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

                {/* Political peak event reference lines */}
                {polPeaks.map((peak) => (
                  <ReferenceLine
                    key={peak.date}
                    x={peak.date}
                    stroke="#C65D3E"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    label={<PeakLabel label={peak.label} color="#C65D3E" />}
                  />
                ))}

                {/* Political: Raw daily — thin, muted */}
                <Area
                  type="monotone"
                  dataKey="political_raw"
                  stroke="#C65D3E"
                  fill="none"
                  dot={false}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="4 2"
                />
                {/* Political: 7-day trend — bold with fill */}
                <Area
                  type="monotone"
                  dataKey="political_7d"
                  stroke="#C65D3E"
                  fill="#C65D3E"
                  fillOpacity={0.08}
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
                  Example: a value of{' '}
                  <strong>{Math.round(avg7d)}</strong> means that this week&apos;s
                  political activity was{' '}
                  <strong>{multTrend} more intense</strong> than a normal day (mean&nbsp;=&nbsp;100).
                </>
              : <>
                  Ejemplo: un valor de{' '}
                  <strong>{Math.round(avg7d)}</strong> significa que la actividad
                  de la semana fue{' '}
                  <strong>{multTrend} más intensa</strong> que un día promedio (media&nbsp;=&nbsp;100).
                </>
            }
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-24">
                    {isEn ? 'Level' : 'Nivel'}
                  </th>
                  <th className="text-left py-2 pr-3 text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">
                    {isEn ? 'Multiplier' : 'Múltiplo'}
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" style={{ color: '#C65D3E' }}>
                    {isEn ? 'Political' : 'Político'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Object.entries(LEVELS) as [RiskLevel, LevelCfg][]).filter(([key]) => key !== 'MODERADO').map(([key, cfg]) => (
                  <tr key={key} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: cfg.color + '18', color: cfg.color }}
                      >
                        {isEn ? cfg.label_en : cfg.label_es}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-gray-500 text-xs font-medium">{cfg.mult}</td>
                    <td className="py-3 text-gray-600 text-xs">
                      {isEn ? cfg.desc_pol_en : cfg.desc_pol_es}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ SECTION 5b: DUAL JUSTIFICATION ══════════════════════════════ */}
        {(data.current.political_justification || data.current.economic_justification || data.current.justification) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Why this level?' : '¿Por qué este nivel?'}
              </h3>
              <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                {formatDate(data.current.date, isEn)}
              </span>
            </div>

            {/* Political justification */}
            {(data.current.political_justification ?? data.current.justification) && (
              <div className="mb-4 rounded-lg p-4" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#C65D3E' }}>
                    {isEn ? 'Political Risk' : 'Riesgo Político'} · {polMult.toFixed(1)}×
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#2D3142' }}>
                  &quot;{data.current.political_justification ?? data.current.justification}&quot;
                </p>
                {(data.current.top_political_drivers ?? data.current.top_drivers) && (
                  <ul className="space-y-1">
                    {(data.current.top_political_drivers
                      ? data.current.top_political_drivers.slice(0, 5).map((d) => ({ title: d.title, source: d.source, numScore: d.score }))
                      : (data.current.top_drivers ?? []).slice(0, 5).map((d) => ({ title: d.title, source: d.source, numScore: d.severity * 100 }))
                    ).map((d, i) => {
                      const dotColor = d.numScore >= 70 ? '#9B2226' : d.numScore >= 40 ? '#C65D3E' : '#E0A458';
                      return (
                        <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#2D3142' }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                          <span className="font-mono w-7 flex-shrink-0" style={{ color: dotColor }}>{Math.round(d.numScore)}</span>
                          <span className="truncate">{d.title}</span>
                          <span className="flex-shrink-0" style={{ color: '#8D99AE' }}>({d.source})</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

          </div>
        )}

        {/* ══ SECTION 6: DATA BOXES ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {[
            { label: isEn ? 'Articles today' : 'Artículos hoy',  value: data.current.articles_total },
            { label: isEn ? 'Political'      : 'Políticos',       value: data.current.articles_political_relevant ?? (data.current as any).articles_political ?? '—' },
            { label: isEn ? 'RSS feeds'      : 'Feeds RSS',       value: data.metadata.rss_feeds },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-6 px-1">
          {isEn
            ? 'Coverage: ~110 articles/day from 6 Peruvian media outlets (La República, El Comercio, Gestión, RPP, Andina, Correo).'
            : 'Cobertura: ~110 artículos/día de 6 medios peruanos (La República, El Comercio, Gestión, RPP, Andina, Correo).'}
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
