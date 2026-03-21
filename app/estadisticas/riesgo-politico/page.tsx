'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from '../../components/stats/LastUpdate';
import EmbedWidget from '../../components/EmbedWidget';
import ShareButton from '../../components/ShareButton';
import CiteButton from '../../components/CiteButton';
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
        {indexLabel ?? 'IRP'}
      </p>
    </div>
  );
}

// ─── WATERMARK ────────────────────────────────────────────────────────────────

const WATERMARK_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.06'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RiesgoPoliticoPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [monthlyPeaks, setMonthlyPeaks] = useState<Record<string, { irp: number; ire: number; irp_event: string; ire_event: string }>>({});

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
    fetch('/assets/data/risk_index_monthly_peaks.json')
      .then(r => r.json())
      .then((peaks: any) => {
        const map: Record<string, any> = {};
        for (const m of peaks.months ?? []) {
          map[m.month] = { irp: m.irp_7d_peak, ire: m.ire_7d_peak, irp_event: m.irp_event, ire_event: m.ire_event };
        }
        setMonthlyPeaks(map);
      })
      .catch(() => {});
  }, []);

  // ── Draggable label state (all positions in px relative to chartContainerRef) ──
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [chartRange, setChartRange] = useState<'1m' | '3m' | '1y' | 'all'>('all');
  const [chartDisplay, setChartDisplay] = useState<'chart' | 'table'>('chart');

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">
          {isEn ? 'Error loading data.' : 'Error cargando datos.'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {isEn
            ? 'The pipeline runs daily at 9:00 PM PET. Data may be temporarily unavailable.'
            : 'El pipeline corre diariamente a las 9:00 PM PET. Los datos pueden estar temporalmente no disponibles.'}
        </p>
        <button onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium"
          style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  // ── Partial day detection ────────────────────────────────────────────────────
  // When today has < 300 articles (9PM pipeline hasn't run), use yesterday as primary.
  const todayArticles = data.current.articles_total ?? 0;
  const isPartialDay = todayArticles < 300;
  const series = data.daily_series ?? [];
  // "yesterday" = second-to-last entry in series (last complete day)
  const yesterdayRow = series.length >= 2 ? series[series.length - 2] : null;

  // ── Derived values ──────────────────────────────────────────────────────────
  // When partial day, primary = yesterday's 7d smoothed; today shown as secondary
  const rawPrr   = isPartialDay && yesterdayRow
    ? (yesterdayRow.political_7d ?? yesterdayRow.prr_7d ?? 0)
    : (data.current.political_raw ?? data.current.prr_raw ?? data.current.score ?? 0);
  const avg7d    = isPartialDay && yesterdayRow
    ? (yesterdayRow.political_7d ?? yesterdayRow.prr_7d ?? 0)
    : (data.current.political_7d  ?? data.current.prr_7d  ?? data.current.score ?? 0);
  const polLevel = (isPartialDay && yesterdayRow)
    ? getRiskLevel(avg7d)
    : (data.current.political_level ?? data.current.level ?? 'MODERADO') as RiskLevel;
  const polMult  = data.current.political_multiplier ?? (avg7d / 100);
  const ecoRaw   = isPartialDay && yesterdayRow
    ? (yesterdayRow.economic_7d ?? 0)
    : (data.current.economic_raw ?? 0);
  const eco7d    = isPartialDay && yesterdayRow
    ? (yesterdayRow.economic_7d ?? 0)
    : (data.current.economic_7d  ?? 0);
  const ecoLevel = isPartialDay && yesterdayRow
    ? getRiskLevel(eco7d)
    : (data.current.economic_level ?? 'MODERADO') as RiskLevel;
  const ecoMult  = data.current.economic_multiplier ?? (eco7d / 100);
  const mult      = toMult(rawPrr);
  const multTrend = toMult(avg7d);
  const primaryDateStr = isPartialDay && yesterdayRow ? yesterdayRow.date : data.current.date;

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

  // Range-filtered chart data for time range buttons
  const chartRangeData = (() => {
    const days = chartRange === '1m' ? 30 : chartRange === '3m' ? 90 : chartRange === '1y' ? 365 : chartData.length;
    return chartData.slice(-days);
  })();

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
    .map((m) => {
      const peakVal = monthlyPeaks[m.month]?.irp;
      const value = peakVal ?? m.political_avg;
      return {
        month: m.month,
        label: fmtMonth(m.month, isEn),
        value,
        avg: m.political_avg,
        color: irpBarColor(value),
      };
    });

  // monthlyScatterData and all useMemo hooks are computed before early returns above
  const monthlyScatterData = monthlyScatterDataMemo;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK_BG }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:text-blue-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </Link>
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
            <CiteButton indicator={isEn ? 'Political Risk Index (IRP)' : 'Índice de Riesgo Político (IRP)'} isEn={isEn} />
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

        {/* ── Partial day banner ─────────────────────────────────────────── */}
        {isPartialDay && (
          <div className="mb-5 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm"
            style={{ background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E' }}>
            <span>⏳</span>
            <div>
              <strong>{isEn ? 'Partial day' : 'Día parcial'}</strong>
              {' — '}
              {isEn
                ? `Only ${todayArticles} articles collected so far. Full data at 9:00 PM PET.`
                : `Solo ${todayArticles} artículos recopilados hasta ahora. Datos completos a las 9:00 PM PET.`}
              {' '}
              <span style={{ opacity: 0.7 }}>
                {isEn ? 'Showing yesterday\'s completed values as primary.' : 'Se muestran los valores del último día completo como referencia.'}
              </span>
            </div>
          </div>
        )}

        {/* ══ SECTION 2: IRP + IRE CARDS — equal weight ════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* IRP primary */}
          <ReadingCard
            title={isPartialDay
              ? (isEn ? 'POLITICAL RISK · LAST COMPLETE DAY' : 'RIESGO POLÍTICO · ÚLTIMO DÍA COMPLETO')
              : (isEn ? 'POLITICAL RISK · TODAY' : 'RIESGO POLÍTICO · HOY')}
            subtitle={formatDate(primaryDateStr, isEn)}
            prr={rawPrr}
            level={polLevel}
            accentColor="#C65D3E"
            isEn={isEn}
            indexLabel="IRP"
          />
          {/* IRE — same visual weight, not a link */}
          <ReadingCard
            title={isPartialDay
              ? (isEn ? 'ECONOMIC RISK · LAST COMPLETE DAY' : 'RIESGO ECONÓMICO · ÚLTIMO DÍA COMPLETO')
              : (isEn ? 'ECONOMIC RISK · TODAY' : 'RIESGO ECONÓMICO · HOY')}
            subtitle={formatDate(primaryDateStr, isEn)}
            prr={eco7d}
            level={ecoLevel}
            accentColor="#2A9D8F"
            isEn={isEn}
            indexLabel="IRE"
          />
        </div>

        {/* Partial day today's raw secondary display */}
        {isPartialDay && (
          <div className="flex gap-4 mb-5">
            <div className="flex-1 rounded-lg px-4 py-3 text-sm" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: '#8D99AE' }}>
                {isEn ? 'IRP today (partial)' : 'IRP hoy (parcial)'}
              </span>
              <div className="text-2xl font-bold mt-1" style={{ color: '#C65D3E' }}>
                {Math.round(data.current.political_raw ?? 0)}
                <span className="text-xs font-normal ml-1" style={{ color: '#8D99AE' }}>/ {todayArticles} arts.</span>
              </div>
            </div>
            <div className="flex-1 rounded-lg px-4 py-3 text-sm" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
              <span className="text-xs uppercase tracking-wider font-bold" style={{ color: '#8D99AE' }}>
                {isEn ? 'IRE today (partial)' : 'IRE hoy (parcial)'}
              </span>
              <div className="text-2xl font-bold mt-1" style={{ color: '#2A9D8F' }}>
                {Math.round(data.current.economic_raw ?? 0)}
                <span className="text-xs font-normal ml-1" style={{ color: '#8D99AE' }}>/ {todayArticles} arts.</span>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'daily' && (<>

        {/* ══ SECTION 3: MULTIPLIER SCALE ═════════════════════════════════ */}
        <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
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
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {isEn ? 'IRP history (Jan 2025 – present)' : 'Historial IRP (ene. 2025 – presente)'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  {isEn
                    ? 'Each point is one day. Bold line shows weekly trend. Terracotta = political risk.'
                    : 'Cada punto es un día. La línea gruesa muestra tendencia semanal. Terracota = riesgo político.'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  {(['1m', '3m', '1y', 'all'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartRange(r)}
                      className="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                      style={{
                        background: chartRange === r ? '#2D3142' : 'transparent',
                        color: chartRange === r ? '#FAF8F4' : '#8D99AE',
                        border: '1px solid',
                        borderColor: chartRange === r ? '#2D3142' : '#E8E4DC',
                      }}
                    >
                      {r === 'all' ? (isEn ? 'All' : 'Todo') : r}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-0.5 ml-1">
                  {(['chart', 'table'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartDisplay(mode)}
                      className="px-2 py-1 rounded text-xs font-medium transition-colors"
                      style={{
                        background: chartDisplay === mode ? '#C65D3E' : 'transparent',
                        color: chartDisplay === mode ? '#fff' : '#8D99AE',
                        border: '1px solid',
                        borderColor: chartDisplay === mode ? '#C65D3E' : '#E8E4DC',
                      }}
                      title={mode === 'chart' ? (isEn ? 'Chart view' : 'Ver gráfico') : (isEn ? 'Table view' : 'Ver tabla')}
                    >
                      {mode === 'chart' ? '📈' : '📋'}
                    </button>
                  ))}
                </div>
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
            {chartDisplay === 'table' && (
              <div className="overflow-auto max-h-72 rounded-lg border border-gray-100">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0" style={{ background: '#FAF8F4' }}>
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-500 border-b border-gray-100">{isEn ? 'Date' : 'Fecha'}</th>
                      <th className="text-right py-2 px-3 font-semibold border-b border-gray-100" style={{ color: '#C65D3E' }}>IRP {isEn ? '(daily)' : '(diario)'}</th>
                      <th className="text-right py-2 px-3 font-semibold border-b border-gray-100" style={{ color: '#C65D3E' }}>IRP 7d</th>
                      <th className="text-right py-2 px-3 font-semibold border-b border-gray-100" style={{ color: '#2A9D8F' }}>IRE 7d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...chartRangeData].reverse().map((row, i) => (
                      <tr key={row.date} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="py-1.5 px-3 text-gray-600">{row.date}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums" style={{ color: '#C65D3E' }}>
                          {row.political_raw != null ? Math.round(row.political_raw) : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right tabular-nums font-medium" style={{ color: '#C65D3E' }}>
                          {row.political_7d != null ? Math.round(row.political_7d) : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right tabular-nums" style={{ color: '#2A9D8F' }}>
                          {row.economic_7d != null ? Math.round(row.economic_7d) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {chartDisplay === 'chart' && (<>
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
              <AreaChart data={chartRangeData} margin={{ top: 40, right: 16, left: 8, bottom: 8 }}>
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
                  interval={Math.floor(chartRangeData.length / 6)}
                />
                <YAxis
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  ticks={yTicks}
                  tickFormatter={(v: number) => v === 0 ? '0' : `${(v / 100).toFixed(0)}×`}
                  label={{
                    value: '× prom.',
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
                  strokeOpacity={0.5}
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
              {polPeaks.map((peak, idx) => {
                const lp = labelPositions[peak.date];
                const dp = dotPositions[peak.date];
                if (!lp || !dp) return null;
                let staggerY = idx % 2 === 0 ? 20 : -30;
                if (idx > 0) {
                  const prevDate = new Date(polPeaks[idx-1].date).getTime();
                  const thisDate = new Date(peak.date).getTime();
                  if (Math.abs(thisDate - prevDate) < 45 * 24 * 60 * 60 * 1000) {
                    staggerY += idx % 2 === 0 ? 15 : -15;
                  }
                }
                return (
                  <line key={peak.date}
                    x1={lp.x} y1={lp.y + staggerY + 11} x2={dp.x} y2={dp.y}
                    stroke="#C65D3E" strokeWidth={0.8} strokeDasharray="3,2" strokeOpacity={0.6} />
                );
              })}
            </svg>

            {/* HTML draggable labels — all positions in px relative to container */}
            {polPeaks.map((peak, idx) => {
              const pos = labelPositions[peak.date];
              if (!pos) return null;
              let staggerY = idx % 2 === 0 ? 20 : -30;
              if (idx > 0) {
                const prevDate = new Date(polPeaks[idx-1].date).getTime();
                const thisDate = new Date(peak.date).getTime();
                if (Math.abs(thisDate - prevDate) < 45 * 24 * 60 * 60 * 1000) {
                  staggerY += idx % 2 === 0 ? 15 : -15;
                }
              }
              const active = dragging === peak.date;
              const labelText = peak.label;
              const isLong = labelText.length > 25;
              return (
                <div
                  key={peak.date}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y + staggerY}px`,
                    transform: 'translateX(-50%)',
                    cursor: active ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    background: 'white',
                    border: `1px solid ${active ? '#C65D3E' : '#C65D3Eaa'}`,
                    borderRadius: 3,
                    padding: '2px 6px',
                    fontSize: isLong ? 8 : 9,
                    fontWeight: 600,
                    color: '#C65D3E',
                    boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                  onMouseDown={(e) => handleLabelDragStart(peak.date, pos.x, pos.y + staggerY, e)}
                >
                  {labelText}
                </div>
              );
            })}
            </div>
            </>)}
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'What\'s driving today\'s index?' : '¿Qué impulsa el índice hoy?'}
              </h3>
              <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                {formatDate(data.current.date, isEn)}
              </span>
            </div>
            {(() => {
              // Group articles by event using keyword clusters
              const polDrivers = (data.current.top_political_drivers ?? []);
              const ecoDrivers = (data.current.top_economic_drivers ?? []);
              if (polDrivers.length === 0 && ecoDrivers.length === 0) return null;

              // Keyword → event label mapping (Spanish)
              const EVENT_CLUSTERS: { keywords: string[]; label_es: string; label_en: string }[] = [
                { keywords: ['voto de confianza', 'gabinete', 'premier', 'consejo de ministros', 'balcázar', 'arroyo', 'miralles'], label_es: 'Voto de confianza / gabinete', label_en: 'Confidence vote / cabinet' },
                { keywords: ['cerrón', 'tribunal constitucional', 'tc ', ' tc'], label_es: 'Caso Cerrón / TC', label_en: 'Cerrón case / Constitutional Tribunal' },
                { keywords: ['andrea vidal', 'asesinato', 'asesora del congreso', 'crimen'], label_es: 'Asesinato asesora Andrea Vidal', label_en: 'Murder of congressional advisor Andrea Vidal' },
                { keywords: ['petroperú', 'petroperu'], label_es: 'Crisis Petroperú', label_en: 'Petroperú crisis' },
                { keywords: ['camisea', 'gas natural'], label_es: 'Crisis gas natural', label_en: 'Natural gas crisis' },
                { keywords: ['keiko', 'fujimori'], label_es: 'Caso Keiko Fujimori', label_en: 'Keiko Fujimori case' },
                { keywords: ['castillo', 'pedro castillo'], label_es: 'Caso Pedro Castillo', label_en: 'Pedro Castillo case' },
                { keywords: ['paro', 'huelga', 'protesta', 'marcha'], label_es: 'Paros / protestas', label_en: 'Strikes / protests' },
                { keywords: ['congreso', 'interpelac', 'cens'], label_es: 'Conflicto Ejecutivo–Congreso', label_en: 'Executive–Congress conflict' },
                { keywords: ['narco', 'crimen organizado', 'organizado'], label_es: 'Crimen organizado en política', label_en: 'Organized crime in politics' },
              ];

              function clusterArticles(articles: { title: string; source: string; score: number }[]) {
                const used = new Set<number>();
                const groups: { label_es: string; label_en: string; articles: typeof articles; maxScore: number }[] = [];
                for (const cluster of EVENT_CLUSTERS) {
                  const matched = articles.filter((a, i) => {
                    if (used.has(i)) return false;
                    const t = a.title.toLowerCase();
                    return cluster.keywords.some((k) => t.includes(k));
                  });
                  if (matched.length > 0) {
                    matched.forEach((a) => used.add(articles.indexOf(a)));
                    groups.push({
                      label_es: cluster.label_es,
                      label_en: cluster.label_en,
                      articles: matched,
                      maxScore: Math.max(...matched.map((a) => a.score)),
                    });
                  }
                }
                // Remaining unclustered — show individually
                articles.forEach((a, i) => {
                  if (!used.has(i)) {
                    groups.push({ label_es: a.title.slice(0, 60), label_en: a.title.slice(0, 60), articles: [a], maxScore: a.score });
                  }
                });
                return groups.sort((a, b) => b.maxScore - a.maxScore);
              }

              const polGroups = clusterArticles(polDrivers);
              const ecoGroups = clusterArticles(ecoDrivers);

              function dotColor(score: number) {
                if (score >= 70) return '#9B2226';
                if (score >= 55) return '#C65D3E';
                if (score >= 35) return '#E9C46A';
                return '#8D99AE';
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Political events */}
                  {polGroups.length > 0 && (
                    <div className="rounded-lg p-4" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#C65D3E' }}>
                        {isEn ? 'Political drivers (IRP)' : 'Impulsores políticos (IRP)'}
                      </div>
                      <div className="flex flex-col gap-3">
                        {polGroups.slice(0, 5).map((g, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor(g.maxScore) }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium leading-snug" style={{ color: '#2D3142' }}>
                                  {isEn ? g.label_en : g.label_es}
                                </span>
                                <span className="text-xs flex-shrink-0 font-mono px-1.5 py-0.5 rounded"
                                  style={{ background: dotColor(g.maxScore) + '18', color: dotColor(g.maxScore) }}>
                                  {g.articles.length} art.
                                </span>
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                                {g.articles.slice(0, 2).map(a => a.source).join(', ')}
                                {' · '}pol={g.maxScore}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Economic events */}
                  {ecoGroups.length > 0 && (
                    <div className="rounded-lg p-4" style={{ background: '#FAF8F4', border: '1px solid #E8E4DC' }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#2A9D8F' }}>
                        {isEn ? 'Economic drivers (IRE)' : 'Impulsores económicos (IRE)'}
                      </div>
                      <div className="flex flex-col gap-3">
                        {ecoGroups.slice(0, 5).map((g, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dotColor(g.maxScore) }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium leading-snug" style={{ color: '#2D3142' }}>
                                  {isEn ? g.label_en : g.label_es}
                                </span>
                                <span className="text-xs flex-shrink-0 font-mono px-1.5 py-0.5 rounded"
                                  style={{ background: dotColor(g.maxScore) + '18', color: dotColor(g.maxScore) }}>
                                  {g.articles.length} art.
                                </span>
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                                {g.articles.slice(0, 2).map(a => a.source).join(', ')}
                                {' · '}eco={g.maxScore}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ SECTION: HISTORICAL COMPARISON ══════════════════════════════ */}
        {(() => {
          const allValues = (data.daily_series ?? [])
            .map((d) => d.political_7d ?? d.prr_7d ?? d.score ?? 0)
            .filter((v) => v > 0);
          if (allValues.length < 30) return null;
          const todayVal = avg7d;
          const sorted = [...allValues].sort((a, b) => a - b);
          const rank = sorted.filter((v) => v <= todayVal).length;
          const percentile = Math.round((rank / sorted.length) * 100);
          // Find 2 similar days (within 15% of today's value, excluding last 14 days)
          const todayIdx = (data.daily_series ?? []).length - 1;
          const similar = (data.daily_series ?? [])
            .slice(0, todayIdx - 14)
            .filter((d) => {
              const v = d.political_7d ?? d.prr_7d ?? 0;
              return v > 0 && Math.abs(v - todayVal) / Math.max(todayVal, 1) < 0.15;
            })
            .sort((a, b) => {
              const va = a.political_7d ?? a.prr_7d ?? 0;
              const vb = b.political_7d ?? b.prr_7d ?? 0;
              return Math.abs(va - todayVal) - Math.abs(vb - todayVal);
            })
            .slice(0, 2);
          // Consecutive days above average
          const series = [...(data.daily_series ?? [])].reverse();
          let consecutive = 0;
          for (const d of series) {
            const v = d.political_7d ?? d.prr_7d ?? 0;
            if (v >= 100) consecutive++; else break;
          }
          // YoY: find entry ~365 days ago
          const yoyDate = new Date(primaryDateStr);
          yoyDate.setFullYear(yoyDate.getFullYear() - 1);
          const yoyStr = yoyDate.toISOString().slice(0, 10);
          const yoyRow = (data.daily_series ?? []).find((d) => d.date === yoyStr)
            ?? (data.daily_series ?? []).filter((d) => d.date <= yoyStr).slice(-1)[0];
          const yoyVal = yoyRow ? (yoyRow.political_7d ?? yoyRow.prr_7d ?? null) : null;
          const yoyPct = yoyVal != null && yoyVal > 0 ? ((todayVal - yoyVal) / yoyVal * 100) : null;
          return (
            <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'Historical context' : 'Contexto histórico'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: '#C65D3E' }}>{percentile}°</p>
                  <p className="text-xs mt-1 text-gray-400">
                    {isEn ? 'percentile since Jan 2025' : 'percentil desde ene. 2025'}
                  </p>
                </div>
                {consecutive > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: consecutive >= 5 ? '#9B2226' : '#C65D3E' }}>
                      {consecutive}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      {isEn ? 'days above average' : 'días sobre el promedio'}
                    </p>
                  </div>
                )}
                {yoyPct != null && (
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: yoyPct > 0 ? '#C65D3E' : '#2A9D8F' }}>
                      {yoyPct > 0 ? '+' : ''}{yoyPct.toFixed(0)}%
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      {isEn ? 'vs same day last year' : 'vs mismo día año pasado'}
                    </p>
                    <p className="text-xs mt-0.5 text-gray-400">
                      {isEn ? `Last year: IRP ${Math.round(yoyVal!)}` : `Año pasado: IRP ${Math.round(yoyVal!)}`}
                    </p>
                  </div>
                )}
              </div>
              {similar.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">
                    {isEn
                      ? `IRP ${Math.round(todayVal)} is comparable to:`
                      : `IRP ${Math.round(todayVal)} es comparable a:`}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {similar.map((d, i) => {
                      const v = d.political_7d ?? d.prr_7d ?? 0;
                      const evtPeak = (data.peak_events ?? []).find((e) =>
                        e.dimension === 'political' && Math.abs(new Date(e.date).getTime() - new Date(d.date).getTime()) < 7 * 86400000
                      );
                      const [y, m, day] = d.date.split('-').map(Number);
                      const dateLabel = new Date(y, m - 1, day).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
                      return (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: '#C65D3E' }} />
                          <span>
                            <strong>{dateLabel}</strong>
                            {' '}(IRP {Math.round(v)})
                            {evtPeak && <span style={{ color: '#8D99AE' }}> — {evtPeak.label}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══ SECTION A1: IRP vs TIPO DE CAMBIO (scatter) ═════════════════ */}
        {irpFxData.length >= 10 && (
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Does political instability move the dollar?' : '¿La inestabilidad política mueve el dólar?'}
            </h3>
            {irpFxReg && Math.abs(irpFxReg.r) < 0.15 && (
              <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg text-xs"
                style={{ background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E' }}>
                <span className="flex-shrink-0">⚠</span>
                <span>
                  {isEn
                    ? `Daily correlation is not significant (r = ${irpFxReg.r.toFixed(2)}). Individual daily movements reflect many factors beyond political risk. Switch to Monthly view for a clearer relationship (r ≈ 0.46).`
                    : `La correlación diaria no es significativa (r = ${irpFxReg.r.toFixed(2)}). Los movimientos diarios reflejan muchos factores más allá del riesgo político. Cambia a vista Mensual para una relación más clara (r ≈ 0.46).`}
                </span>
              </div>
            )}
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
            {irpFxReg && (
              <p className="text-xs text-gray-400 mt-1">
                {isEn
                  ? `R² = ${(irpFxReg.r ** 2).toFixed(2)} — correlation is positive but modest. Many other factors affect the exchange rate.`
                  : `R² = ${(irpFxReg.r ** 2).toFixed(2)} — la correlación es positiva pero modesta. Muchos otros factores afectan el tipo de cambio.`
                }
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {isEn
                ? 'See monthly view for a stronger correlation (r ≈ 0.46).'
                : 'Ver vista mensual para una correlación más fuerte (r ≈ 0.46).'}
            </p>
          </div>
        )}

        </>)}

        {/* ══ SECTION A2: DISTRIBUCIÓN MENSUAL DEL IRP ════════════════════ */}
        {viewMode === 'monthly' && (<>

        {/* Monthly hero cards */}
        {(() => {
          const currentYM = new Date().toISOString().slice(0, 7);
          const completedMonths = (data.monthly_series ?? []).filter(m => m.month < currentYM);
          const currentMonthData = (data.monthly_series ?? []).find(m => m.month === currentYM);
          const lastCompleted = completedMonths[completedMonths.length - 1];
          const prevCompleted = completedMonths[completedMonths.length - 2];

          const lastVal = lastCompleted?.political_avg ?? 0;
          const prevVal = prevCompleted?.political_avg ?? 0;
          const currentVal = currentMonthData?.political_avg ?? 0;
          const changePct = prevVal > 0 ? ((lastVal - prevVal) / prevVal * 100).toFixed(1) : null;
          const currentMonthLabel = currentYM ? fmtMonth(currentYM, isEn) : '';
          const lastMonthLabel = lastCompleted ? fmtMonth(lastCompleted.month, isEn) : '';

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Primary: last COMPLETE month */}
              <div className="rounded-xl border-2 p-5 flex flex-col" style={{ borderColor: '#C65D3E44', background: '#C65D3E0A' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {lastMonthLabel}
                </p>
                <p className="text-4xl font-bold leading-none mt-3" style={{ color: '#C65D3E' }}>
                  {Math.round(lastVal)}
                </p>
                {changePct !== null && (
                  <p className="text-xs mt-2" style={{ color: Number(changePct) > 0 ? '#C65D3E' : '#2A9D8F' }}>
                    {Number(changePct) > 0 ? '▲' : '▼'} {Math.abs(Number(changePct))}% {isEn ? 'vs prior month' : 'vs mes anterior'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">IRP · {isEn ? 'monthly average' : 'promedio mensual'}</p>
              </div>
              {/* Secondary: current partial month (only shown if data exists) */}
              {currentMonthData && (
                <div className="rounded-xl border p-5 flex flex-col" style={{ borderColor: '#E8E4DC', background: '#FAF8F4' }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    {currentMonthLabel} · {isEn ? 'partial' : 'parcial'}
                  </p>
                  <p className="text-4xl font-bold leading-none mt-3" style={{ color: '#8D99AE' }}>
                    {Math.round(currentVal)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">IRP · {isEn ? 'month-to-date avg' : 'promedio hasta hoy'}</p>
                </div>
              )}
            </div>
          );
        })()}

        {monthlyBarData.length >= 2 && (
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Monthly IRP — peak value (7d)' : 'IRP mensual — valor pico (7 días)'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn ? 'Peak 7-day smoothed IRP per month. Color = risk level.' : 'Pico mensual del IRP suavizado 7 días. Color = nivel de riesgo.'}
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
            <p className="text-xs text-gray-400 mt-2 italic">
              {isEn
                ? 'Bars show monthly peak (7d smoothed). Political crises are sharp events — monthly averages flatten them; peaks capture the true intensity.'
                : 'Las barras muestran el pico mensual suavizado 7 días. Las crisis políticas son eventos agudos — los promedios los aplanan; los picos capturan la intensidad real.'}
            </p>
            {/* Monthly peak events */}
            {(() => {
              const peakMap: Record<string, string> = {};
              for (const e of data.peak_events ?? []) {
                if (e.dimension === 'political' && e.label) {
                  peakMap[e.date.slice(0, 7)] = e.label;
                }
              }
              // Deduplicate consecutive months with identical event labels (e.g. "Censura Jerí" I/II)
              const rawEntries = monthlyBarData
                .filter(m => peakMap[m.month])
                .map(m => ({ month: m.label, event: peakMap[m.month], value: m.value, color: m.color }));
              const labelCount: Record<string, number> = {};
              const labelSeen: Record<string, number> = {};
              for (const e of rawEntries) labelCount[e.event] = (labelCount[e.event] ?? 0) + 1;
              const entries = rawEntries.map(e => {
                if (labelCount[e.event] > 1) {
                  labelSeen[e.event] = (labelSeen[e.event] ?? 0) + 1;
                  const suffix = labelSeen[e.event] === 1 ? ' I' : labelSeen[e.event] === 2 ? ' II' : ` ${labelSeen[e.event]}`;
                  return { ...e, event: e.event + suffix };
                }
                return e;
              }).reverse();
              if (entries.length === 0) return null;
              return (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {isEn ? 'Peak events (most recent first)' : 'Eventos pico (más reciente primero)'}
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
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
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
            <p className="text-xs text-gray-400 mt-1">
              {isEn
                ? 'Monthly correlation is stronger than daily — political crises sustained over a month tend to move the sol more.'
                : 'La correlación mensual es más clara que la diaria — las crisis sostenidas durante un mes tienden a mover más el sol.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {isEn
                ? 'Negative values = sol depreciated vs the dollar. Higher IRP months tend to coincide with greater depreciation.'
                : 'Valores negativos = el sol se depreció frente al dólar. Los meses con IRP más alto tienden a coincidir con mayor depreciación.'}
            </p>
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
            { label: isEn ? 'Articles analyzed today' : 'Artículos analizados hoy', value: data.current.articles_total },
            { label: isEn ? 'Politically relevant' : 'Políticamente relevantes', value: data.current.articles_political_relevant ?? '—' },
            { label: isEn ? 'Media outlets monitored' : 'Medios monitoreados', value: 16 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mb-6 px-1">
          {isEn
            ? `Coverage: ${data.current.articles_total?.toLocaleString() ?? '~800'} articles today from 16 Peruvian media outlets (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).`
            : `Cobertura: ${data.current.articles_total?.toLocaleString() ?? '~800'} artículos hoy de 16 medios peruanos (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).`}
        </p>

        {/* ══ SECTION: ALERT CTA ════════════════════════════════════════════ */}
        <div className="mb-6 rounded-xl border border-dashed p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: '#C65D3E55', background: '#fdf3f0' }}>
          <div className="text-2xl flex-shrink-0">🔔</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#2D3142' }}>
              {isEn ? 'Get alerts when political risk spikes' : 'Recibe alertas cuando el riesgo político se dispare'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
              {isEn
                ? 'Email us to be notified when IRP exceeds 200 (high risk).'
                : 'Escríbenos para recibir alertas cuando el IRP supere 200 (riesgo alto).'}
            </p>
          </div>
          <a
            href={`mailto:hola@qhawarina.pe?subject=${encodeURIComponent(isEn ? 'IRP Alert Request' : 'Solicitud de alerta IRP')}&body=${encodeURIComponent(isEn ? 'Please notify me when IRP exceeds 200.\n\nName: \nOrganization: ' : 'Por favor, notifícame cuando el IRP supere 200.\n\nNombre: \nOrganización: ')}`}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#C65D3E', color: '#fff' }}
          >
            {isEn ? 'Request alerts' : 'Solicitar alertas'}
          </a>
        </div>

        {/* ══ SECTION 7: LINKS ════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link href="/estadisticas/riesgo-politico/metodologia" className="flex-1">
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
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
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
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
          <Link href="/estadisticas/riesgo-economico" className="flex-1">
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-teal-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">📈</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Economic Risk Index (IRE)' : 'Índice de Riesgo Económico (IRE)'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn ? `Today: ${toMult(ecoRaw)} · 7d: ${toMult(eco7d)}` : `Hoy: ${toMult(ecoRaw)} · 7d: ${toMult(eco7d)}`}
                </p>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">→</span>
            </div>
          </Link>
          <Link href="/escenarios" className="flex-1">
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-purple-400 hover:shadow-sm transition-all flex items-center gap-4">
              <span className="text-xl flex-shrink-0">🔮</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {isEn ? 'Scenarios' : 'Escenarios'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isEn ? 'Macro impact simulation' : 'Simulación de impacto macroeconómico'}
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
