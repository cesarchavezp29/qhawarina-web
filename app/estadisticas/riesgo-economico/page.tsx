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
  ScatterChart, Scatter, LineChart, Line,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

// ─── DATA TYPES ──────────────────────────────────────────────────────────────

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: {
    date: string;
    political_raw: number;
    political_7d: number;
    political_level: string;
    political_multiplier: number;
    economic_raw: number;
    economic_7d: number;
    economic_level: string;
    economic_multiplier: number;
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
    justification?: string | null;
    top_drivers?: Array<{ title: string; source: string; category: string; severity: number }> | null;
  };
  daily_series?: Array<{
    date: string;
    political_raw?: number;
    political_7d?: number;
    economic_raw?: number;
    economic_7d?: number;
    score?: number;
    prr?: number;
    prr_7d?: number;
    score_raw?: number;
    n_articles?: number;
    low_coverage?: boolean;
    provisional?: boolean;
  }>;
  daily_fx_series?: Array<{ date: string; fx: number }>;
  peak_events?: Array<{ date: string; dimension: string; value: number; label: string }>;
  monthly_series?: Array<{ month: string; political_avg: number }>;
}

// ─── RISK LEVEL SYSTEM ───────────────────────────────────────────────────────

type RiskLevel = 'MINIMO' | 'BAJO' | 'NORMAL' | 'ELEVADO' | 'ALTO' | 'CRITICO' | 'MODERADO';

interface LevelCfg {
  color: string;
  label_es: string;
  label_en: string;
  desc_eco_es: string;
  desc_eco_en: string;
  range: string;
  mult: string;
}

const LEVELS: Record<RiskLevel, LevelCfg> = {
  MINIMO:   { color: '#8D99AE', label_es: 'Mínimo',  label_en: 'Minimal',  desc_eco_es: 'Economía estable',     desc_eco_en: 'Stable economy',         range: '< 50',    mult: '< 0.5×'  },
  BAJO:     { color: '#2A9D8F', label_es: 'Bajo',    label_en: 'Low',      desc_eco_es: 'Presiones leves',      desc_eco_en: 'Mild pressures',          range: '50–90',   mult: '0.5–0.9×'},
  NORMAL:   { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',          range: '90–110',  mult: '0.9–1.1×'},
  ELEVADO:  { color: '#C65D3E', label_es: 'Elevado', label_en: 'Elevated', desc_eco_es: 'Vulnerabilidad seria', desc_eco_en: 'Serious vulnerability',   range: '110–150', mult: '1.1–1.5×'},
  ALTO:     { color: '#9B2226', label_es: 'Alto',    label_en: 'High',     desc_eco_es: 'Crisis económica',     desc_eco_en: 'Economic crisis',         range: '150–200', mult: '1.5–2×'  },
  CRITICO:  { color: '#6B0000', label_es: 'Crítico', label_en: 'Critical', desc_eco_es: 'Colapso sistémico',    desc_eco_en: 'Systemic collapse',       range: '> 200',   mult: '> 2×'    },
  MODERADO: { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',          range: '90–110',  mult: '0.9–1.1×'},
};

function getRiskLevel(ire: number): RiskLevel {
  if (ire < 50)  return 'MINIMO';
  if (ire < 90)  return 'BAJO';
  if (ire < 110) return 'NORMAL';
  if (ire < 150) return 'ELEVADO';
  if (ire < 200) return 'ALTO';
  return 'CRITICO';
}

function toMult(v: number): string {
  return (Math.round(v / 10) / 10).toFixed(1) + '×';
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

function MultiplierScale({
  rawIre,
  avg7d,
  isEn,
}: {
  rawIre: number;
  avg7d: number;
  isEn: boolean;
}) {
  const MAX = 1000;
  const rawPct = Math.min((rawIre / MAX) * 100, 98);
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
      <div className="relative" style={{ marginBottom: '44px' }}>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div style={{ width: '10%', background: '#2A9D8F' }} />
          <div style={{ width: '10%', background: '#E0A458' }} />
          <div style={{ width: '10%', background: '#C65D3E' }} />
          <div style={{ width: '20%', background: '#9B2226' }} />
          <div style={{ width: '50%', background: '#5C0000' }} />
        </div>

        {ticks.map((t) => (
          <div
            key={t.pct}
            className="absolute top-0 h-4"
            style={{ left: `${t.pct}%` }}
          >
            <div className="w-px h-full bg-white opacity-50" />
            <div
              className="absolute top-5 text-center"
              style={{
                transform: t.pct >= 100 ? 'translateX(-100%)' : 'translateX(-50%)',
                whiteSpace: 'nowrap',
              }}
            >
              <div className="text-xs font-semibold text-gray-700">{t.top}</div>
              <div className="text-gray-400" style={{ fontSize: '10px' }}>{t.sub}</div>
            </div>
          </div>
        ))}

        <div
          className="absolute"
          style={{ left: `calc(${rawPct}% - 10px)`, top: '-3px', zIndex: 10 }}
          title={`${isEn ? 'Today' : 'Hoy'}: IRE ${Math.round(rawIre)}`}
        >
          <div className="w-5 h-5 rounded-full border-2 bg-white shadow-md" style={{ borderColor: '#1F2937' }} />
        </div>

        <div
          className="absolute"
          style={{ left: `calc(${avgPct}% - 10px)`, top: '-3px', zIndex: 9 }}
          title={`${isEn ? '7d trend' : 'Tendencia 7d'}: IRE ${Math.round(avg7d)}`}
        >
          <div className="w-5 h-5 rounded-full shadow-md" style={{ background: '#1F2937' }} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 bg-white flex-shrink-0" style={{ borderColor: '#1F2937' }} />
          <span>{isEn ? 'Today' : 'Hoy'}: {toMult(rawIre)} (IRE {Math.round(rawIre)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: '#1F2937' }} />
          <span>{isEn ? '7d trend' : 'Tendencia 7d'}: {toMult(avg7d)} (IRE {Math.round(avg7d)})</span>
        </div>
      </div>
    </div>
  );
}

// ─── READING CARD ─────────────────────────────────────────────────────────────

function ReadingCard({
  title,
  subtitle,
  ire,
  level: levelOverride,
  accentColor,
  isEn,
  indexLabel,
}: {
  title: string;
  subtitle: string;
  ire: number;
  level?: string;
  accentColor?: string;
  isEn: boolean;
  indexLabel?: string;
}) {
  const level = (levelOverride as RiskLevel) ?? getRiskLevel(ire);
  const cfg = LEVELS[level] ?? LEVELS['MODERADO'];
  const color = accentColor ?? cfg.color;
  const mult = toMult(ire);

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

      <p
        className="text-5xl font-bold tabular-nums leading-none"
        style={{ color: color, fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(ire)}
      </p>

      <p className="text-base font-semibold mt-1.5" style={{ color: color }}>
        {isEn ? `${mult} the average` : `${mult} el promedio`}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {indexLabel ?? 'IRE'} · {isEn ? 'mean = 100' : 'media = 100'}
      </p>
    </div>
  );
}

// ─── LINEAR REGRESSION HELPER ─────────────────────────────────────────────────

function computeRegression(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return null;
  const n = points.length;
  const xBar = points.reduce((s, p) => s + p.x, 0) / n;
  const yBar = points.reduce((s, p) => s + p.y, 0) / n;
  const num = points.reduce((s, p) => s + (p.x - xBar) * (p.y - yBar), 0);
  const den = points.reduce((s, p) => s + (p.x - xBar) ** 2, 0);
  if (den === 0) return null;
  const slope = num / den;
  const intercept = yBar - slope * xBar;
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  return { slope, intercept, minX, maxX };
}

// ── Custom peak label: multi-line box above reference line ───────────────────
function PeakLabel({ viewBox, label, color }: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
  label: string;
  color: string;
}) {
  const { x = 0, y = 0 } = viewBox ?? {};
  const words = label.split(' ');
  const lines = words.length <= 2
    ? words
    : [words[0], words.slice(1).join(' ')];
  const lh = 11;
  const pad = 3;
  const boxH = lines.length * lh + pad * 2;
  const maxChars = Math.max(...lines.map(l => l.length));
  const boxW = maxChars * 5.5 + pad * 2;
  const bx = x - boxW / 2;
  const by = Math.max(4, y - boxH - 6);
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

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RiesgoEconomicoPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `/assets/data/political_index_daily.json?v=${new Date().toISOString().slice(0, 13)}`
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
  const ecoRaw   = data.current.economic_raw   ?? 0;
  const eco7d    = data.current.economic_7d    ?? 0;
  const ecoLevel = data.current.economic_level ?? 'MODERADO';
  const ecoMult  = data.current.economic_multiplier ?? (eco7d / 100);
  const mult     = toMult(ecoRaw);
  const mult7d   = toMult(eco7d);

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
    economic_7d:  d.economic_7d,
    economic_raw: d.economic_raw,
  }));

  const maxIre = Math.max(
    ...chartData.map((d) => Math.max(d.economic_7d ?? 0, d.economic_raw ?? 0)),
    200
  );
  const yTicks = [0, 100, 200, 300, 500].filter((t) => t <= maxIre + 150);

  // ── Peak events for economic dimension ──────────────────────────────────────
  const ecoPeaks = (data.peak_events ?? []).filter(
    (e) => e.dimension === 'economic' && e.label
  );

  // ── Scatter: IRE vs FX ───────────────────────────────────────────────────────
  const fxMap = new Map<string, number>();
  for (const f of data.daily_fx_series ?? []) {
    fxMap.set(f.date, f.fx);
  }

  const scatterRaw = (data.daily_series ?? [])
    .filter((d) => d.economic_7d != null && fxMap.has(d.date))
    .map((d, i, arr) => ({
      ire: d.economic_7d as number,
      fx:  fxMap.get(d.date) as number,
      date: d.date,
      recency: i / arr.length, // 0 = oldest, 1 = newest
    }));

  const regression = computeRegression(scatterRaw.map((p) => ({ x: p.ire, y: p.fx })));

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
            {isEn ? 'Economic Risk Index' : 'Índice de Riesgo Económico'}
          </span>
        </nav>

        {/* ══ SECTION 1: HEADER ════════════════════════════════════════════ */}
        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEn ? 'Economic Risk Index' : 'Índice de Riesgo Económico'}
            </h1>
            <p className="text-gray-500 text-base max-w-xl leading-relaxed">
              {isEn
                ? <>
                    Measures the intensity of economic news in Peru.{' '}
                    A normal day&nbsp;=&nbsp;100.{' '}
                    <strong className="text-gray-700">Today = {mult} the normal level.</strong>
                  </>
                : <>
                    Mide la intensidad de noticias económicas en Perú.{' '}
                    Un día normal&nbsp;=&nbsp;100.{' '}
                    <strong className="text-gray-700">Hoy = {mult} lo normal.</strong>
                  </>
              }
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <ShareButton
              title={`${isEn ? 'Economic Risk Index' : 'Índice de Riesgo Económico'} — Qhawarina`}
              text={
                isEn
                  ? `📊 Peru Economic Risk: ${mult} the normal level today (IRE ${Math.round(ecoRaw)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-economico`
                  : `📊 Riesgo económico Perú: ${mult} lo normal hoy (IRE ${Math.round(ecoRaw)}) | Qhawarina\nhttps://qhawarina.pe/estadisticas/riesgo-economico`
              }
            />
            <EmbedWidget
              path="/estadisticas/riesgo-economico"
              title={`${isEn ? 'Economic Risk Index' : 'Índice de Riesgo Económico'} — Qhawarina`}
              height={600}
            />
          </div>
        </div>

        {/* ══ SECTION 2: FOUR READING CARDS (2×2) ═════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Economic today */}
          <ReadingCard
            title={isEn ? 'ECONOMIC RISK · TODAY' : 'RIESGO ECONÓMICO · HOY'}
            subtitle={currentDateStr}
            ire={ecoRaw}
            level={ecoLevel}
            accentColor="#2A9D8F"
            isEn={isEn}
            indexLabel="IRE"
          />
          {/* Economic 7d */}
          <ReadingCard
            title={isEn ? 'ECONOMIC RISK · 7 DAYS' : 'RIESGO ECONÓMICO · 7 DÍAS'}
            subtitle={isEn ? `${ecoMult.toFixed(1)}× the average` : `${ecoMult.toFixed(1)}× el promedio`}
            ire={eco7d}
            level={ecoLevel}
            accentColor="#2A9D8F"
            isEn={isEn}
            indexLabel="IRE"
          />
          {/* IRE level card */}
          <div
            className="rounded-xl border-2 p-5 flex flex-col"
            style={{ borderColor: '#2A9D8F44', background: '#2A9D8F0A' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'RISK LEVEL' : 'NIVEL DE RIESGO'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? 'Based on 7d trend' : 'Basado en tendencia 7d'}
            </p>
            <p className="text-5xl font-bold leading-none mt-3" style={{ color: LEVELS[ecoLevel as RiskLevel]?.color ?? '#2A9D8F' }}>
              {isEn ? (LEVELS[ecoLevel as RiskLevel]?.label_en ?? ecoLevel) : (LEVELS[ecoLevel as RiskLevel]?.label_es ?? ecoLevel)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {LEVELS[ecoLevel as RiskLevel]?.desc_eco_es ?? ''}
            </p>
          </div>
          {/* IRE multiplier card */}
          <div
            className="rounded-xl border-2 p-5 flex flex-col"
            style={{ borderColor: '#2A9D8F44', background: '#2A9D8F0A' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'ECONOMIC MULTIPLIER' : 'MULTIPLICADOR ECONÓMICO'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? '7-day rolling average' : 'Promedio móvil 7 días'}
            </p>
            <p className="text-5xl font-bold leading-none mt-3" style={{ color: '#2A9D8F' }}>
              {ecoMult.toFixed(1)}×
            </p>
            <p className="text-xs text-gray-400 mt-2">IRE · {isEn ? 'mean = 100' : 'media = 100'}</p>
          </div>
        </div>

        {/* ══ SECTION 3: MULTIPLIER SCALE ═════════════════════════════════ */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            {isEn ? 'Economic risk scale (0 – 10× the average)' : 'Escala de riesgo económico (0 – 10× el promedio)'}
          </p>
          <MultiplierScale rawIre={ecoRaw} avg7d={eco7d} isEn={isEn} />
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
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {isEn ? 'Full history' : 'Historial completo'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  {isEn
                    ? 'Each point is one day. Bold line shows weekly trend. Teal = economic risk.'
                    : 'Cada punto es un día. La línea gruesa muestra tendencia semanal. Verde = riesgo económico.'
                  }
                </p>
              </div>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/riesgo-economico"
                shareText={
                  isEn
                    ? `📊 Peru Economic Risk: ${mult} the normal level (IRE ${Math.round(ecoRaw)}) — Qhawarina`
                    : `📊 Riesgo económico Perú: ${mult} lo normal (IRE ${Math.round(ecoRaw)}) — Qhawarina`
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#2A9D8F" strokeWidth="2.5" /></svg>
                <span>{isEn ? 'Economic 7d' : 'Económico 7d'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="24" height="10"><line x1="0" y1="5" x2="24" y2="5" stroke="#2A9D8F" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 2" /></svg>
                <span>{isEn ? 'Economic daily' : 'Económico diario'}</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartData}
                margin={{ top: 70, right: 16, left: 8, bottom: 8 }}
              >
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
                  tickFormatter={(v: number) => v === 0 ? '0' : `${(v / 100).toFixed(0)}×`}
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
                      economic_7d:  isEn ? 'Economic 7d'    : 'Económico 7d',
                      economic_raw: isEn ? 'Economic daily' : 'Económico diario',
                    };
                    return [
                      `${Math.round(v ?? 0)} (${toMult(v ?? 0)})`,
                      labels[name ?? ''] ?? name,
                    ];
                  }) as any}
                />

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

                {/* Economic peak event reference lines */}
                {ecoPeaks.map((peak) => (
                  <ReferenceLine
                    key={peak.date}
                    x={peak.date}
                    stroke="#2A9D8F"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                    label={<PeakLabel label={peak.label} color="#2A9D8F" />}
                  />
                ))}

                <Area
                  type="monotone"
                  dataKey="economic_raw"
                  stroke="#2A9D8F"
                  fill="none"
                  dot={false}
                  strokeWidth={1}
                  strokeOpacity={0.4}
                  strokeDasharray="4 2"
                />
                <Area
                  type="monotone"
                  dataKey="economic_7d"
                  stroke="#2A9D8F"
                  fill="#2A9D8F"
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
                  Example: a value of <strong>{Math.round(eco7d)}</strong> means that this week&apos;s
                  economic activity was <strong>{mult7d} more intense</strong> than a normal day (mean&nbsp;=&nbsp;100).
                </>
              : <>
                  Ejemplo: un valor de <strong>{Math.round(eco7d)}</strong> significa que la actividad
                  económica de la semana fue <strong>{mult7d} más intensa</strong> que un día promedio (media&nbsp;=&nbsp;100).
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
                  <th className="text-left py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide" style={{ color: '#2A9D8F' }}>
                    {isEn ? 'Economic' : 'Económico'}
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
                      {isEn ? cfg.desc_eco_en : cfg.desc_eco_es}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ SECTION 5b: ECONOMIC JUSTIFICATION ══════════════════════════ */}
        {data.current.economic_justification && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Why this level?' : '¿Por qué este nivel?'}
              </h3>
              <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                {formatDate(data.current.date, isEn)}
              </span>
            </div>

            <div className="mb-4 rounded-lg p-4" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#2A9D8F' }}>
                  {isEn ? 'Economic Risk' : 'Riesgo Económico'} · {ecoMult.toFixed(1)}×
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#2D3142' }}>
                &quot;{data.current.economic_justification}&quot;
              </p>
              {data.current.top_economic_drivers && (
                <ul className="space-y-1">
                  {data.current.top_economic_drivers.slice(0, 5).map((d, i) => {
                    const dotColor = d.score >= 70 ? '#0e7490' : d.score >= 40 ? '#2A9D8F' : '#6ee7b7';
                    return (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#2D3142' }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                        <span className="font-mono w-7 flex-shrink-0" style={{ color: dotColor }}>{d.score}</span>
                        <span className="truncate">{d.title}</span>
                        <span className="flex-shrink-0" style={{ color: '#8D99AE' }}>({d.source})</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ══ SECTION 6: IRE vs TIPO DE CAMBIO SCATTER ════════════════════ */}
        {scatterRaw.length >= 10 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'IRE vs Exchange Rate (USD/PEN)' : 'IRE vs Tipo de Cambio (USD/PEN)'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn
                ? 'Each dot = 1 day. Older = gray, recent = teal. Line = linear trend.'
                : 'Cada punto = 1 día. Más antiguo = gris, reciente = verde. Línea = tendencia lineal.'
              }
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                <XAxis
                  type="number"
                  dataKey="ire"
                  name="IRE"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  domain={[0, 'auto']}
                  label={{
                    value: isEn ? 'IRE 7d smooth' : 'IRE suavizado 7d',
                    position: 'insideBottom',
                    offset: -4,
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="fx"
                  name={isEn ? 'FX PEN/USD' : 'TC PEN/USD'}
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  domain={['auto', 'auto']}
                  tickFormatter={(v: number) => v.toFixed(2)}
                  label={{
                    value: 'PEN/USD',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                    offset: 8,
                  }}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any, name?: string) => [
                    name === 'IRE' ? Math.round(v) : Number(v).toFixed(4),
                    name,
                  ]}
                  labelFormatter={() => ''}
                />
                <Scatter
                  data={scatterRaw}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const recency: number = payload?.recency ?? 0;
                    // Interpolate: gray (#9CA3AF) → teal (#2A9D8F)
                    const r1 = 156, g1 = 163, b1 = 175;
                    const r2 = 42,  g2 = 157, b2 = 143;
                    const r = Math.round(r1 + (r2 - r1) * recency);
                    const g = Math.round(g1 + (g2 - g1) * recency);
                    const b = Math.round(b1 + (b2 - b1) * recency);
                    const fill = `rgb(${r},${g},${b})`;
                    return <circle cx={cx} cy={cy} r={3} fill={fill} fillOpacity={0.7} stroke="none" />;
                  }}
                />
                {/* Regression trendline rendered as two-point line */}
                {regression && (() => {
                  const { slope, intercept, minX, maxX } = regression;
                  const trendData = [
                    { ire: minX, fx: intercept + slope * minX },
                    { ire: maxX, fx: intercept + slope * maxX },
                  ];
                  return (
                    <Line
                      data={trendData}
                      type="linear"
                      dataKey="fx"
                      stroke="#C65D3E"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  );
                })()}
              </ScatterChart>
            </ResponsiveContainer>
            {regression && (
              <p className="text-xs text-gray-400 mt-2">
                {isEn
                  ? `Trend: each +100 IRE ≈ ${(regression.slope * 100).toFixed(3)} PEN/USD change`
                  : `Tendencia: cada +100 IRE ≈ ${(regression.slope * 100).toFixed(3)} PEN/USD`
                }
              </p>
            )}
          </div>
        )}

        {/* ══ SECTION 7: DATA BOXES ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: isEn ? 'Articles today'  : 'Artículos hoy',  value: data.current.articles_total },
            { label: isEn ? 'Economic'         : 'Económicos',     value: data.current.articles_economic_relevant ?? '—' },
            { label: isEn ? 'Coverage days'   : 'Días cobertura', value: data.metadata.coverage_days },
            { label: isEn ? 'RSS feeds'        : 'Feeds RSS',      value: data.metadata.rss_feeds },
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

        {/* ══ SECTION 8: LINKS ════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/estadisticas/riesgo-politico" className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">🏛️</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Political Risk Index (IRP)' : 'Índice de Riesgo Político (IRP)'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn ? 'See political risk' : 'Ver riesgo político'}
                </p>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">→</span>
            </div>
          </Link>
          <Link href="/estadisticas/riesgo-politico/metodologia" className="flex-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">📖</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Full methodology' : 'Metodología completa'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn ? 'Formulas · LLM classifier · AI-GPR reference' : 'Fórmulas · clasificador LLM · referencia AI-GPR'}
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
