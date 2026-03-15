'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
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
  ScatterChart, Scatter, ZAxis, BarChart, Bar, Cell,
  LineChart, Line, ReferenceDot,
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
  monthly_series?: Array<{
    month: string;
    political_avg: number;
    economic_avg?: number;
    fx_level?: number;
    fx_yoy?: number;
  }>;
  peak_events?: Array<{ date: string; dimension: string; value: number; label: string }>;
}

// ─── RISK LEVEL SYSTEM (6 levels) ────────────────────────────────────────────

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
  MINIMO:   { color: '#8D99AE', label_es: 'Mínimo',  label_en: 'Minimal',  desc_pol_es: 'Gobernanza rutinaria',   desc_pol_en: 'Routine governance',      desc_eco_es: 'Economía estable',     desc_eco_en: 'Stable economy',      range: '< 50',    mult: '< 0.5×'  },
  BAJO:     { color: '#2A9D8F', label_es: 'Bajo',    label_en: 'Low',      desc_pol_es: 'Tensiones menores',      desc_pol_en: 'Minor tensions',          desc_eco_es: 'Presiones leves',      desc_eco_en: 'Mild pressures',      range: '50–90',   mult: '0.5–0.9×'},
  NORMAL:   { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_pol_es: 'Nivel histórico normal', desc_pol_en: 'Near historical average', desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',      range: '90–110',  mult: '0.9–1.1×'},
  ELEVADO:  { color: '#C65D3E', label_es: 'Elevado', label_en: 'Elevated', desc_pol_es: 'Crisis significativa',   desc_pol_en: 'Significant crisis',      desc_eco_es: 'Vulnerabilidad seria', desc_eco_en: 'Serious vulnerability',range: '110–150', mult: '1.1–1.5×'},
  ALTO:     { color: '#9B2226', label_es: 'Alto',    label_en: 'High',     desc_pol_es: 'Crisis grave',           desc_pol_en: 'Severe crisis',           desc_eco_es: 'Crisis económica',     desc_eco_en: 'Economic crisis',     range: '150–200', mult: '1.5–2×'  },
  CRITICO:  { color: '#6B0000', label_es: 'Crítico', label_en: 'Critical', desc_pol_es: 'Ruptura institucional',  desc_pol_en: 'Institutional breakdown', desc_eco_es: 'Colapso sistémico',    desc_eco_en: 'Systemic collapse',   range: '> 200',   mult: '> 2×'    },
  MODERADO: { color: '#E9C46A', label_es: 'Normal',  label_en: 'Normal',   desc_pol_es: 'Nivel histórico normal', desc_pol_en: 'Near historical average', desc_eco_es: 'Economía normal',      desc_eco_en: 'Normal economy',      range: '90–110',  mult: '0.9–1.1×'},
};

function getRiskLevel(prr: number): RiskLevel {
  if (prr < 50)  return 'MINIMO';
  if (prr < 90)  return 'BAJO';
  if (prr < 110) return 'NORMAL';
  if (prr < 150) return 'ELEVADO';
  if (prr < 200) return 'ALTO';
  return 'CRITICO';
}

function toMult(prr: number): string {
  return (prr / 100).toFixed(1) + '×';
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

/** "2025-01" => "Ene 25" / "Jan 25" */
function fmtMonth(monthStr: string, isEn: boolean): string {
  try {
    const [y, m] = monthStr.split('-').map(Number);
    const dt = new Date(y, m - 1, 1);
    const mon = dt.toLocaleDateString(isEn ? 'en-US' : 'es-PE', { month: 'short' });
    const yr = String(y).slice(2);
    return mon.charAt(0).toUpperCase() + mon.slice(1, 3) + ' ' + yr;
  } catch {
    return monthStr;
  }
}

function irpBarColor(val: number): string {
  if (val < 90)  return '#2A9D8F';
  if (val < 110) return '#E9C46A';
  if (val < 150) return '#C65D3E';
  return '#9B2226';
}

function quarterColor(monthStr: string): string {
  const m = parseInt(monthStr.split('-')[1] ?? '1', 10);
  if (m <= 3)  return '#2A9D8F';
  if (m <= 6)  return '#E9C46A';
  if (m <= 9)  return '#C65D3E';
  return '#9B2226';
}

// ─── MULTIPLIER SCALE COMPONENT ──────────────────────────────────────────────

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
      <div className="relative" style={{ marginBottom: '44px' }}>
        <div className="flex h-4 rounded-full overflow-hidden">
          <div style={{ width: '10%', background: '#2A9D8F' }} />
          <div style={{ width: '10%', background: '#E0A458' }} />
          <div style={{ width: '10%', background: '#C65D3E' }} />
          <div style={{ width: '20%', background: '#9B2226' }} />
          <div style={{ width: '50%', background: '#5C0000' }} />
        </div>
        {ticks.map((t) => (
          <div key={t.pct} className="absolute top-0 h-4" style={{ left: `${t.pct}%` }}>
            <div className="w-px h-full bg-white opacity-50" />
            <div
              className="absolute top-5 text-center"
              style={{ transform: t.pct >= 100 ? 'translateX(-100%)' : 'translateX(-50%)', whiteSpace: 'nowrap' }}
            >
              <div className="text-xs font-semibold text-gray-700">{t.top}</div>
              <div className="text-gray-400" style={{ fontSize: '10px' }}>{t.sub}</div>
            </div>
          </div>
        ))}
        <div
          className="absolute"
          style={{ left: `calc(${rawPct}% - 10px)`, top: '-3px', zIndex: 10 }}
          title={`${isEn ? 'Today' : 'Hoy'}: IRP ${Math.round(rawPrr)}`}
        >
          <div className="w-5 h-5 rounded-full border-2 bg-white shadow-md" style={{ borderColor: '#1F2937' }} />
        </div>
        <div
          className="absolute"
          style={{ left: `calc(${avgPct}% - 10px)`, top: '-3px', zIndex: 9 }}
          title={`${isEn ? '7d trend' : 'Tendencia 7d'}: IRP ${Math.round(avg7d)}`}
        >
          <div className="w-5 h-5 rounded-full shadow-md" style={{ background: '#1F2937' }} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 bg-white flex-shrink-0" style={{ borderColor: '#1F2937' }} />
          <span>{isEn ? 'Today' : 'Hoy'}: {toMult(rawPrr)} (IRP {Math.round(rawPrr)})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: '#1F2937' }} />
          <span>{isEn ? '7d trend' : 'Tendencia 7d'}: {toMult(avg7d)} (IRP {Math.round(avg7d)})</span>
        </div>
      </div>
    </div>
  );
}

// ─── READING CARD ─────────────────────────────────────────────────────────────

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
      <p
        className="text-5xl font-bold tabular-nums leading-none"
        style={{ color: color, fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.round(prr)}
      </p>
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

export default function RiesgoPoliticoPage() {
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

  // ── Draggable label state (all positions in px relative to chartContainerRef) ──
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  const [dotPositions, setDotPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [labelPositions, setLabelPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // After chart renders, read dot pixel positions from DOM, set initial label positions
  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      const container = chartContainerRef.current;
      if (!container) return;
      const svg = container.querySelector('svg');
      if (!svg) return;
      const circles = Array.from(svg.querySelectorAll('circle.recharts-reference-dot-dot'));
      const containerRect = container.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const offX = svgRect.left - containerRect.left;
      const offY = svgRect.top - containerRect.top;
      const peaks = (data.peak_events ?? []).filter((e: any) => e.dimension === 'political' && e.label);
      const dots: Record<string, { x: number; y: number }> = {};
      circles.forEach((el, i) => {
        if (i < peaks.length) {
          dots[peaks[i].date] = {
            x: parseFloat(el.getAttribute('cx') ?? '0') + offX,
            y: parseFloat(el.getAttribute('cy') ?? '0') + offY,
          };
        }
      });
      setDotPositions(dots);
      setLabelPositions(prev => {
        const next = { ...prev };
        peaks.forEach((_: any, i: number) => {
          const date = peaks[i].date;
          if (!next[date] && dots[date]) {
            next[date] = { x: dots[date].x, y: Math.max(4, dots[date].y - 48 - (i % 3) * 24) };
          }
        });
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const rect = chartContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setLabelPositions(prev => ({
        ...prev,
        [dragging]: {
          x: e.clientX - rect.left - dragOffset.current.dx,
          y: e.clientY - rect.top - dragOffset.current.dy,
        },
      }));
    };
    const handleUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging]);

  const handleLabelDragStart = (id: string, posX: number, posY: number, e: React.MouseEvent) => {
    e.preventDefault();
    const rect = chartContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragOffset.current = { dx: e.clientX - rect.left - posX, dy: e.clientY - rect.top - posY };
    setDragging(id);
  };

  // ── Memos (must be before early returns to satisfy Rules of Hooks) ───────────
  const irpFxData = useMemo(() => {
    if (!data) return [];
    const fxByDate: Record<string, number> = {};
    for (const f of data.daily_fx_series ?? []) fxByDate[f.date] = f.fx;
    return (data.daily_series ?? [])
      .filter((d) => d.political_7d != null && fxByDate[d.date] != null)
      .map((d, i, arr) => ({
        x: d.political_7d as number,
        y: fxByDate[d.date],
        t: i / arr.length,
      }));
  }, [data]);

  const irpFxReg = useMemo(() => {
    if (irpFxData.length < 2) return null;
    const n = irpFxData.length;
    const mx = irpFxData.reduce((s, d) => s + d.x, 0) / n;
    const my = irpFxData.reduce((s, d) => s + d.y, 0) / n;
    const sxy = irpFxData.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0);
    const sxx = irpFxData.reduce((s, d) => s + (d.x - mx) ** 2, 0);
    const syy = irpFxData.reduce((s, d) => s + (d.y - my) ** 2, 0);
    if (sxx === 0 || syy === 0) return null;
    const slope = sxy / sxx;
    const intercept = my - slope * mx;
    const minX = Math.min(...irpFxData.map((d) => d.x));
    const maxX = Math.max(...irpFxData.map((d) => d.x));
    const r = sxy / Math.sqrt(sxx * syy);
    return { slope, intercept, minX, maxX, r };
  }, [irpFxData]);

  const monthlyScatterDataMemo = useMemo(() => {
    if (!data) return [];
    const currentYM = new Date().toISOString().slice(0, 7);
    return (data.monthly_series ?? [])
      .filter((m) => m.political_avg != null && m.fx_yoy != null && m.month < currentYM)
      .map((m) => ({
        x: m.political_avg,
        y: m.fx_yoy as number,
        month: m.month,
        color: quarterColor(m.month),
      }));
  }, [data]);

  const monthlyScatterReg = useMemo(() => {
    if (monthlyScatterDataMemo.length < 2) return null;
    const n = monthlyScatterDataMemo.length;
    const mx = monthlyScatterDataMemo.reduce((s, d) => s + d.x, 0) / n;
    const my = monthlyScatterDataMemo.reduce((s, d) => s + d.y, 0) / n;
    const sxy = monthlyScatterDataMemo.reduce((s, d) => s + (d.x - mx) * (d.y - my), 0);
    const sxx = monthlyScatterDataMemo.reduce((s, d) => s + (d.x - mx) ** 2, 0);
    const syy = monthlyScatterDataMemo.reduce((s, d) => s + (d.y - my) ** 2, 0);
    if (sxx === 0 || syy === 0) return null;
    const slope = sxy / sxx;
    const intercept = my - slope * mx;
    const minX = Math.min(...monthlyScatterDataMemo.map((d) => d.x));
    const maxX = Math.max(...monthlyScatterDataMemo.map((d) => d.x));
    const r = sxy / Math.sqrt(sxx * syy);
    return { slope, intercept, minX, maxX, r };
  }, [monthlyScatterDataMemo]);

  if (loading) return <PageSkeleton cards={4} />;
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

  const polPeaks = (data.peak_events ?? []).filter(
    (e) => e.dimension === 'political' && e.label
  );

  const maxPrr = Math.max(
    ...chartData.map((d) => Math.max(d.political_7d ?? 0, d.political_raw ?? 0)),
    200
  );
  const yTicks = [0, 100, 200, 300, 500].filter((t) => t <= maxPrr + 150);
  if (maxPrr > 500 && !yTicks.includes(Math.ceil(maxPrr / 100) * 100)) {
    yTicks.push(Math.ceil(maxPrr / 100) * 100);
  }

  // ── A2: Distribución mensual del IRP ────────────────────────────────────────
  const currentYearMonth = new Date().toISOString().slice(0, 7); // "2026-03"
  const monthlyBarData = (data.monthly_series ?? [])
    .filter((m) => m.month < currentYearMonth)  // exclude incomplete current month
    .map((m) => ({
      month: m.month,
      label: fmtMonth(m.month, isEn),
      value: m.political_avg,
      color: irpBarColor(m.political_avg),
    }));

  // monthlyScatterData and all useMemo hooks are computed before early returns above
  const monthlyScatterData = monthlyScatterDataMemo;

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

        {/* ── View toggle: Daily / Monthly ─────────────────────── */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isEn ? 'Daily' : 'Diario'}
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {isEn ? 'Monthly' : 'Mensual'}
          </button>
        </div>

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

        {/* ══ SECTION 2: POLITICAL READING CARDS (2×2) ════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <ReadingCard
            title={isEn ? 'POLITICAL RISK · TODAY' : 'RIESGO POLÍTICO · HOY'}
            subtitle={currentDateStr}
            prr={rawPrr}
            level={polLevel}
            accentColor="#C65D3E"
            isEn={isEn}
            indexLabel="IRP"
          />
          <ReadingCard
            title={isEn ? 'POLITICAL RISK · 7 DAYS' : 'RIESGO POLÍTICO · 7 DÍAS'}
            subtitle={isEn ? `${polMult.toFixed(1)}× the average` : `${polMult.toFixed(1)}× el promedio`}
            prr={avg7d}
            level={polLevel}
            accentColor="#C65D3E"
            isEn={isEn}
            indexLabel="IRP"
          />
          {/* Risk level card */}
          <div
            className="rounded-xl border-2 p-5 flex flex-col"
            style={{ borderColor: '#C65D3E44', background: '#C65D3E0A' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'RISK LEVEL' : 'NIVEL DE RIESGO'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? 'Based on 7d trend' : 'Basado en tendencia 7d'}
            </p>
            <p className="text-5xl font-bold leading-none mt-3" style={{ color: LEVELS[polLevel as RiskLevel]?.color ?? '#C65D3E' }}>
              {isEn ? (LEVELS[polLevel as RiskLevel]?.label_en ?? polLevel) : (LEVELS[polLevel as RiskLevel]?.label_es ?? polLevel)}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {LEVELS[polLevel as RiskLevel]?.desc_pol_es ?? ''}
            </p>
          </div>
          {/* Political multiplier card */}
          <div
            className="rounded-xl border-2 p-5 flex flex-col"
            style={{ borderColor: '#C65D3E44', background: '#C65D3E0A' }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
              {isEn ? 'POLITICAL MULTIPLIER' : 'MULTIPLICADOR POLÍTICO'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEn ? '7-day rolling average' : 'Promedio móvil 7 días'}
            </p>
            <p className="text-5xl font-bold leading-none mt-3" style={{ color: '#C65D3E' }}>
              {polMult.toFixed(1)}×
            </p>
            <p className="text-xs text-gray-400 mt-2">IRP · {isEn ? 'mean = 100' : 'media = 100'}</p>
          </div>
        </div>

        {viewMode === 'daily' && (<>

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
            <div ref={chartContainerRef} style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 40, right: 16, left: 8, bottom: 8 }}>
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
                      political_7d:  isEn ? 'Political 7d'   : 'Político 7d',
                      political_raw: isEn ? 'Political daily' : 'Político diario',
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
                <Area
                  type="monotone"
                  dataKey="political_7d"
                  stroke="#C65D3E"
                  fill="#C65D3E"
                  fillOpacity={0.08}
                  dot={false}
                  strokeWidth={2.5}
                />
                {/* Fixed peak dots on the smoothed line */}
                {polPeaks.map((peak) => {
                  const val = chartData.find((d: any) => d.date === peak.date)?.political_7d ?? peak.value;
                  return (
                    <ReferenceDot key={peak.date} x={peak.date} y={val}
                      r={4} fill="#C65D3E" stroke="white" strokeWidth={1.5} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>

            {/* SVG overlay — dashed lines from label to dot (pointer-events: none) */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
              {polPeaks.map((peak) => {
                const lp = labelPositions[peak.date];
                const dp = dotPositions[peak.date];
                if (!lp || !dp) return null;
                return (
                  <line key={peak.date}
                    x1={lp.x} y1={lp.y + 11} x2={dp.x} y2={dp.y}
                    stroke="#C65D3E" strokeWidth={0.8} strokeDasharray="3,2" strokeOpacity={0.6} />
                );
              })}
            </svg>

            {/* HTML draggable labels — all positions in px relative to container */}
            {polPeaks.map((peak) => {
              const pos = labelPositions[peak.date];
              if (!pos) return null; // hidden until dotPositions effect runs
              const active = dragging === peak.date;
              return (
                <div
                  key={peak.date}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translateX(-50%)',
                    cursor: active ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    background: 'white',
                    border: `1px solid ${active ? '#C65D3E' : '#C65D3Eaa'}`,
                    borderRadius: 3,
                    padding: '2px 6px',
                    fontSize: 9,
                    fontWeight: 600,
                    color: '#C65D3E',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => handleLabelDragStart(peak.date, pos.x, pos.y, e)}
                >
                  {peak.label}
                </div>
              );
            })}
            </div>
          </div>
        )}

        {/* ══ SECTION 5c: INTERPRETATION TABLE ════════════════════════════ */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'How to read the index' : 'Cómo interpretar el índice'}
          </h3>
          <p className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
            {isEn
              ? <>Example: a value of <strong>150</strong> indicates activity <strong>1.5× the average</strong> (50% above normal). A value of <strong>45</strong> indicates activity <strong>0.5× the average</strong> (half of normal). Mean&nbsp;=&nbsp;100.</>
              : <>Ejemplo: un valor de <strong>150</strong> indica actividad <strong>1.5× el promedio</strong> (50% por encima de lo normal). Un valor de <strong>45</strong> indica actividad <strong>0.5× el promedio</strong> (la mitad de lo normal). Media&nbsp;=&nbsp;100.</>
            }
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E8E4DC' }}>
                  {[isEn ? 'Level' : 'Nivel', isEn ? 'Multiplier' : 'Múltiplo', isEn ? 'Interpretation' : 'Significado'].map((h) => (
                    <th key={h} className="text-left py-1.5 pr-4 font-semibold" style={{ color: CHART_COLORS.ink3 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ['< 50',    '< 0.5×', '#8D99AE', isEn ? 'Minimum'  : 'Mínimo',  isEn ? 'Routine governance, no notable tension'        : 'Gobernanza rutinaria, sin tensión notable'],
                  ['50–90',   '0.5–0.9×','#2A9D8F', isEn ? 'Low'      : 'Bajo',    isEn ? 'Minor tensions below historical norm'          : 'Tensiones menores, por debajo de la norma histórica'],
                  ['90–110',  '0.9–1.1×','#2D3142', isEn ? 'Normal'   : 'Normal',  isEn ? 'Historical normal level'                       : 'Nivel histórico normal'],
                  ['110–150', '1.1–1.5×','#E0A458', isEn ? 'Elevated' : 'Elevado', isEn ? 'Significant crisis, above-average activity'     : 'Crisis significativa, actividad por encima del promedio'],
                  ['150–200', '1.5–2×',  '#C65D3E', isEn ? 'High'     : 'Alto',    isEn ? 'Severe crisis, intense political disruption'    : 'Crisis grave, perturbación política intensa'],
                  ['> 200',   '> 2×',    '#9B2226', isEn ? 'Critical' : 'Crítico', isEn ? 'Institutional breakdown, extreme political risk': 'Ruptura institucional, riesgo político extremo'],
                ] as [string, string, string, string, string][]).map(([range, mult, color, level, desc]) => (
                  <tr key={range} style={{ borderBottom: '1px solid #F0EDE8' }}>
                    <td className="py-1.5 pr-4 font-semibold" style={{ color }}>{level}</td>
                    <td className="py-1.5 pr-4 font-mono" style={{ color: CHART_COLORS.ink }}>{mult}</td>
                    <td className="py-1.5" style={{ color: CHART_COLORS.ink3 }}>{desc}</td>
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

        {/* ══ SECTION A1: IRP vs TIPO DE CAMBIO (scatter) ═════════════════ */}
        {irpFxData.length >= 10 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Does political instability move the dollar?' : '¿La inestabilidad política mueve el dólar?'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn
                ? 'Each dot = 1 day. Older = gray, recent = terracotta. Line = linear trend.'
                : 'Cada punto = 1 día. Más antiguo = gris, reciente = terracota. Línea = tendencia lineal.'
              }
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="IRP"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  domain={[0, 'auto']}
                  label={{
                    value: isEn ? 'IRP 7d smooth' : 'IRP suavizado 7d',
                    position: 'insideBottom',
                    offset: -12,
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
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
                <ZAxis range={[20, 20]} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any, name?: string) => [
                    name === 'IRP' ? Math.round(v) : Number(v).toFixed(4),
                    name,
                  ]}
                  labelFormatter={() => ''}
                />
                <Scatter
                  data={irpFxData}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const t: number = payload?.t ?? 0;
                    // Interpolate: gray (#ccc) → terracotta (#C65D3E)
                    const r = Math.round(204 + (198 - 204) * t);
                    const g = Math.round(204 + (93  - 204) * t);
                    const b = Math.round(204 + (62  - 204) * t);
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill={`rgb(${r},${g},${b})`}
                        fillOpacity={0.75}
                        stroke="none"
                      />
                    );
                  }}
                />
                {irpFxReg && (() => {
                  const { slope, intercept, minX, maxX } = irpFxReg;
                  const trendData = [
                    { x: minX, y: intercept + slope * minX },
                    { x: maxX, y: intercept + slope * maxX },
                  ];
                  return (
                    <Line
                      data={trendData}
                      type="linear"
                      dataKey="y"
                      stroke="#C65D3E"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  );
                })()}
              </ScatterChart>
            </ResponsiveContainer>
            {irpFxReg && (
              <p className="text-xs text-gray-400 mt-2">
                {isEn
                  ? `Correlation: r = ${irpFxReg.r.toFixed(2)} — ${irpFxReg.r > 0 ? 'higher IRP is associated with a more expensive dollar' : 'higher IRP is associated with a cheaper dollar'}`
                  : `Correlación: r = ${irpFxReg.r.toFixed(2)} — ${irpFxReg.r > 0 ? 'mayor IRP se asocia con dólar más caro' : 'mayor IRP se asocia con dólar más barato'}`
                }
              </p>
            )}
          </div>
        )}

        </>)}

        {/* ══ SECTION A2: DISTRIBUCIÓN MENSUAL DEL IRP ════════════════════ */}
        {viewMode === 'monthly' && (<>

        {monthlyBarData.length >= 2 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Monthly IRP distribution' : 'Distribución mensual del IRP'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn ? 'Monthly average IRP. Color = risk level.' : 'Promedio mensual del IRP. Color = nivel de riesgo.'}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyBarData} margin={{ top: 4, right: 16, left: 8, bottom: 44 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={(props: any) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={4} textAnchor="end"
                              transform="rotate(-40)"
                              fontSize={axisTickStyle.fontSize}
                              fontFamily={axisTickStyle.fontFamily}
                              fill={axisTickStyle.fill}>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                  stroke={CHART_DEFAULTS.axisStroke}
                  interval={0}
                  height={52}
                />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={(v: number) => String(Math.round(v))}
                  label={{
                    value: 'IRP',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                    offset: 8,
                  }}
                />
                <ReferenceLine y={100} stroke={CHART_COLORS.amber} strokeDasharray="4 2" />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [Math.round(v), isEn ? 'IRP monthly avg' : 'IRP promedio mensual']}
                />
                <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                  {monthlyBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
              <span><span style={{ color: '#2A9D8F' }}>■</span> {isEn ? '< 90 (Low)' : '< 90 (Bajo)'}</span>
              <span><span style={{ color: '#E9C46A' }}>■</span> 90–110 (Normal)</span>
              <span><span style={{ color: '#C65D3E' }}>■</span> {isEn ? '110–150 (Elevated)' : '110–150 (Elevado)'}</span>
              <span><span style={{ color: '#9B2226' }}>■</span> {isEn ? '> 150 (High)' : '> 150 (Alto)'}</span>
            </div>
            {/* Monthly peak events */}
            {(() => {
              const peakMap: Record<string, string> = {};
              for (const e of data.peak_events ?? []) {
                if (e.dimension === 'political' && e.label) {
                  peakMap[e.date.slice(0, 7)] = e.label;
                }
              }
              const entries = monthlyBarData
                .filter(m => peakMap[m.month])
                .map(m => ({ month: m.label, event: peakMap[m.month], value: m.value, color: m.color }))
                .reverse();
              if (entries.length === 0) return null;
              return (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {isEn ? 'Peak events' : 'Eventos pico'}
                  </p>
                  <div className="space-y-1">
                    {entries.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 text-xs">
                        <span className="text-gray-400 w-16 flex-shrink-0">{e.month}</span>
                        <span className="font-mono w-8 flex-shrink-0 text-right" style={{ color: e.color }}>{Math.round(e.value)}</span>
                        <span className="text-gray-600">{e.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ SECTION A3: IRP MENSUAL vs DEPRECIACIÓN DEL SOL ════════════ */}
        {monthlyScatterData.length >= 3 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Monthly IRP vs Annual sol depreciation (%)' : 'IRP mensual vs Depreciación anual del sol (%)'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn
                ? 'Each dot = 1 month. Color = quarter. Line = linear trend.'
                : 'Cada punto = 1 mes. Color = trimestre. Línea = tendencia lineal.'
              }
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
                />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="IRP"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  domain={['auto', 'auto']}
                  label={{
                    value: isEn ? 'IRP monthly avg' : 'IRP promedio mensual',
                    position: 'insideBottom',
                    offset: -12,
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name={isEn ? 'FX YoY (%)' : 'TC YoY (%)'}
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                  label={{
                    value: isEn ? 'FX YoY (%)' : 'Deprec. anual (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                    offset: 8,
                  }}
                />
                <ZAxis range={[30, 30]} />
                <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any, name?: string) => [
                    name === 'IRP' ? Math.round(v) : `${Number(v).toFixed(2)}%`,
                    name,
                  ]}
                  labelFormatter={() => ''}
                />
                <Scatter
                  data={monthlyScatterData}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={payload?.color ?? '#C65D3E'}
                        fillOpacity={0.8}
                        stroke="white"
                        strokeWidth={1}
                      />
                    );
                  }}
                />
                {monthlyScatterReg && (() => {
                  const { slope, intercept, minX, maxX } = monthlyScatterReg;
                  const trendData = [
                    { x: minX, y: intercept + slope * minX },
                    { x: maxX, y: intercept + slope * maxX },
                  ];
                  return (
                    <Line
                      data={trendData}
                      type="linear"
                      dataKey="y"
                      stroke="#9B2226"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  );
                })()}
              </ScatterChart>
            </ResponsiveContainer>
            {monthlyScatterReg && (
              <p className="text-xs text-gray-400 mt-2">
                {isEn
                  ? `Correlation: r = ${monthlyScatterReg.r.toFixed(2)} — ${monthlyScatterReg.r > 0 ? 'higher monthly IRP is associated with greater annual depreciation' : 'higher monthly IRP is associated with sol appreciation'}`
                  : `Correlación: r = ${monthlyScatterReg.r.toFixed(2)} — ${monthlyScatterReg.r > 0 ? 'mayor IRP mensual se asocia con mayor depreciación anual' : 'mayor IRP mensual se asocia con apreciación del sol'}`
                }
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
              <span><span style={{ color: '#2A9D8F' }}>●</span> Q1 (Ene–Mar)</span>
              <span><span style={{ color: '#E9C46A' }}>●</span> Q2 (Abr–Jun)</span>
              <span><span style={{ color: '#C65D3E' }}>●</span> Q3 (Jul–Sep)</span>
              <span><span style={{ color: '#9B2226' }}>●</span> Q4 (Oct–Dic)</span>
            </div>
          </div>
        )}

        </>)}

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
            ? 'Coverage: ~110 articles/day from 16 Peruvian media outlets (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).'
            : 'Cobertura: ~110 artículos/día de 16 medios peruanos (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).'}
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
