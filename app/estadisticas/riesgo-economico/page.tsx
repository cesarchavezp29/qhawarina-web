'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import LastUpdate from '../../components/stats/LastUpdate';
import EmbedWidget from '../../components/EmbedWidget';
import ShareButton from '../../components/ShareButton';
import ChartShareButton from '../../components/ChartShareButton';
import CiteButton from '../../components/CiteButton';
import PageSkeleton from '../../components/PageSkeleton';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line,
  BarChart, Bar, Cell, ReferenceDot,
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
  monthly_series?: Array<{
    month: string;
    political_avg: number;
    economic_avg?: number;
    fx_level?: number;
    fx_yoy?: number;
  }>;
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
  return (v / 100).toFixed(1) + '×';
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

function ireBarColor(val: number): string {
  if (val < 90)  return '#2A9D8F';
  if (val < 110) return '#E9C46A';
  if (val < 150) return '#C65D3E';
  return '#9B2226';
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
        {indexLabel ?? 'IRE'}
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

// ─── SECTOR KEYWORD PATTERNS ──────────────────────────────────────────────────

const SECTOR_PATTERNS: Array<{ key: string; label_es: string; label_en: string; color: string; pattern: RegExp }> = [
  { key: 'energia',     label_es: 'Energía',       label_en: 'Energy',    color: '#E9C46A', pattern: /gas\b|gnv|petróleo|electricidad|combustible|camisea|petroper|energ[eé]t/i },
  { key: 'mineria',     label_es: 'Minería',        label_en: 'Mining',    color: '#9B2226', pattern: /min[eé]r|pataz|cobre|oro\b|zinc|las bambas|tía maría|tia maria|southern|senace|antamina/i },
  { key: 'transporte',  label_es: 'Transporte',     label_en: 'Transport', color: '#457B9D', pattern: /transportistas?|bloqueo.{0,30}(carretera|v[ií]a|ruta)|paro.{0,20}transport|carretera.{0,30}bloqueo/i },
  { key: 'comercio',    label_es: 'Comercio Ext.',  label_en: 'Trade',     color: '#2A9D8F', pattern: /arancel|exporta|importa|comercio exterior|tlc|trump/i },
  { key: 'fiscal',      label_es: 'Fiscal',         label_en: 'Fiscal',    color: '#C65D3E', pattern: /presupuest|deuda|bono|fiscal|mef\b|ministerio de econom/i },
  { key: 'financiero',  label_es: 'Financiero',     label_en: 'Financial', color: '#6A4C93', pattern: /bcrp|tipo de cambio|tasa de inter[eé]s|cr[eé]dito|banco central|inflaci[oó]n|sol.{0,10}d[oó]lar/i },
  { key: 'laboral',     label_es: 'Laboral',        label_en: 'Labour',    color: '#8D99AE', pattern: /huelga|empleo|desempleo|trabajo|sindicato|sueldo|salario/i },
  { key: 'agro',        label_es: 'Agro',           label_en: 'Agro',      color: '#52B788', pattern: /canasta b[aá]sica|precio.{0,20}aliment|producci[oó]n agr[ií]c|agropec|cosecha|agricult/i },
];

// ─── WATERMARK ────────────────────────────────────────────────────────────────

const WATERMARK_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.06'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function RiesgoEconomicoPage() {
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
      const peaks = (data.peak_events ?? []).filter((e: any) => e.dimension === 'economic' && e.label);
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
  const sectorData = useMemo(() => {
    if (!data) return [];
    // Prefer eco_sector_titles (all eco>20 articles) over top_economic_drivers (top 10 only)
    const sectorTitles: string[] = (data.current as any).eco_sector_titles ?? [];
    const driverTitles: string[] = (data.current.top_economic_drivers ?? []).map((d: any) => d.title);
    const titles = sectorTitles.length > 0 ? sectorTitles : driverTitles;
    const counts: Record<string, number> = {};
    for (const s of SECTOR_PATTERNS) counts[s.key] = 0;
    let unclassified = 0;
    for (const title of titles) {
      let matched = false;
      for (const s of SECTOR_PATTERNS) {
        if (s.pattern.test(title)) {
          counts[s.key] = (counts[s.key] ?? 0) + 1;
          matched = true;
          break;
        }
      }
      if (!matched) unclassified++;
    }
    const result = SECTOR_PATTERNS
      .map((s) => ({
        sector: isEn ? s.label_en : s.label_es,
        count: counts[s.key] ?? 0,
        color: s.color,
      }))
      .filter((s) => s.count > 0);
    if (unclassified > 0) {
      result.push({ sector: isEn ? 'Other' : 'Otros', count: unclassified, color: '#8D99AE' });
    }
    return result;
  }, [data, isEn]);

  if (loading) return <PageSkeleton cards={2} />;
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
  const ecoRaw   = isPartialDay && yesterdayRow
    ? (yesterdayRow.economic_7d ?? 0)
    : (data.current.economic_raw ?? 0);
  const eco7d    = isPartialDay && yesterdayRow
    ? (yesterdayRow.economic_7d ?? 0)
    : (data.current.economic_7d  ?? 0);
  const ecoLevel = (isPartialDay && yesterdayRow
    ? getRiskLevel(eco7d)
    : (data.current.economic_level ?? 'MODERADO')) as RiskLevel;
  const ecoMult  = data.current.economic_multiplier ?? (eco7d / 100);
  const mult     = toMult(ecoRaw);
  const mult7d   = toMult(eco7d);
  const primaryDateStr = isPartialDay && yesterdayRow ? yesterdayRow.date : data.current.date;

  const currentDateStr = (() => {
    try {
      const [y, m, d] = primaryDateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString(
        isEn ? 'en-US' : 'es-PE',
        { day: 'numeric', month: 'long', year: 'numeric' }
      );
    } catch {
      return primaryDateStr;
    }
  })();

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = (data.daily_series ?? []).map((d) => ({
    date: d.date,
    economic_7d:  d.economic_7d,
    economic_raw: d.economic_raw,
  }));

  // Range-filtered chart data for time range buttons
  const chartRangeData = (() => {
    const days = chartRange === '1m' ? 30 : chartRange === '3m' ? 90 : chartRange === '1y' ? 365 : chartData.length;
    return chartData.slice(-days);
  })();

  const maxIre = Math.max(
    ...chartData.map((d) => Math.max(d.economic_7d ?? 0, d.economic_raw ?? 0)),
    200
  );
  const yTicks = [0, 100, 200, 300, 500].filter((t) => t <= maxIre + 150);

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
      recency: i / arr.length,
    }));

  const regression = computeRegression(scatterRaw.map((p) => ({ x: p.ire, y: p.fx })));

  // ── B1: Distribución mensual del IRE ────────────────────────────────────────
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const monthlyBarData = (data.monthly_series ?? [])
    .filter((m) => m.economic_avg != null && m.month < currentYearMonth)  // exclude current month
    .map((m) => {
      const peakVal = monthlyPeaks[m.month]?.ire;
      const value = peakVal ?? (m.economic_avg as number);
      return {
        month: m.month,
        label: fmtMonth(m.month, isEn),
        value,
        avg: m.economic_avg as number,
        color: ireBarColor(value),
      };
    });

  // sectorData computed before early returns above

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
            {isEn ? 'Economic Risk Index' : 'Índice de Riesgo Económico'}
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
            <CiteButton indicator={isEn ? 'Economic Risk Index (IRE)' : 'Índice de Riesgo Económico (IRE)'} isEn={isEn} />
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
                {isEn ? 'Showing last completed day as primary.' : 'Se muestran los valores del último día completo como referencia.'}
              </span>
            </div>
          </div>
        )}

        {/* ══ SECTION 2: ECONOMIC READING CARDS (2 cards) ═════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Card 1: Today (or last complete day if partial) */}
          <ReadingCard
            title={isPartialDay
              ? (isEn ? 'ECONOMIC RISK · LAST COMPLETE DAY' : 'RIESGO ECONÓMICO · ÚLTIMO DÍA COMPLETO')
              : (isEn ? 'ECONOMIC RISK · TODAY' : 'RIESGO ECONÓMICO · HOY')}
            subtitle={formatDate(primaryDateStr, isEn)}
            ire={ecoRaw}
            level={ecoLevel}
            accentColor="#2A9D8F"
            isEn={isEn}
            indexLabel="IRE"
          />
          {/* Card 2: 7-day trend */}
          <ReadingCard
            title={isEn ? '7-DAY TREND' : 'TENDENCIA 7 DÍAS'}
            subtitle={isEn ? `${ecoMult.toFixed(1)}× the historical average` : `${ecoMult.toFixed(1)}× el promedio histórico`}
            ire={eco7d}
            level={ecoLevel}
            accentColor="#2A9D8F"
            isEn={isEn}
            indexLabel="IRE"
          />
        </div>

        {/* Partial day — today's raw secondary display */}
        {isPartialDay && (
          <div className="flex gap-4 mb-5">
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
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {isEn ? 'IRE history (Jan 2025 – present)' : 'Historial IRE (ene. 2025 – presente)'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 max-w-lg">
                  {isEn
                    ? 'Each point is one day. Bold line shows weekly trend. Teal = economic risk.'
                    : 'Cada punto es un día. La línea gruesa muestra tendencia semanal. Verde = riesgo económico.'
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
                        background: chartDisplay === mode ? '#2A9D8F' : 'transparent',
                        color: chartDisplay === mode ? '#fff' : '#8D99AE',
                        border: '1px solid',
                        borderColor: chartDisplay === mode ? '#2A9D8F' : '#E8E4DC',
                      }}
                      title={mode === 'chart' ? (isEn ? 'Chart view' : 'Ver gráfico') : (isEn ? 'Table view' : 'Ver tabla')}
                    >
                      {mode === 'chart' ? '📈' : '📋'}
                    </button>
                  ))}
                </div>
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

            {chartDisplay === 'chart' && (
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
            )}

            {chartDisplay === 'table' && (
              <div className="overflow-auto max-h-72 rounded-lg border border-gray-100">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0" style={{ background: '#FAF8F4' }}>
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-500 border-b border-gray-100">{isEn ? 'Date' : 'Fecha'}</th>
                      <th className="text-right py-2 px-3 font-semibold border-b border-gray-100" style={{ color: '#2A9D8F' }}>IRE {isEn ? '(daily)' : '(diario)'}</th>
                      <th className="text-right py-2 px-3 font-semibold border-b border-gray-100" style={{ color: '#2A9D8F' }}>IRE 7d</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...chartRangeData].reverse().map((row, i) => (
                      <tr key={row.date} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                        <td className="py-1.5 px-3 text-gray-600">{row.date}</td>
                        <td className="py-1.5 px-3 text-right tabular-nums" style={{ color: ireBarColor(row.economic_raw ?? 0) }}>
                          {row.economic_raw != null ? Math.round(row.economic_raw) : '—'}
                        </td>
                        <td className="py-1.5 px-3 text-right tabular-nums font-medium" style={{ color: ireBarColor(row.economic_7d ?? 0) }}>
                          {row.economic_7d != null ? Math.round(row.economic_7d) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {chartDisplay === 'chart' && (
            <div ref={chartContainerRef} style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={chartRangeData}
                margin={{ top: 40, right: 16, left: 8, bottom: 8 }}
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

                <Area
                  type="monotone"
                  dataKey="economic_raw"
                  stroke="#2A9D8F"
                  fill="none"
                  dot={false}
                  strokeWidth={1}
                  strokeOpacity={0.5}
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
                {/* Fixed peak dots on the smoothed line */}
                {ecoPeaks.map((peak) => {
                  const val = chartRangeData.find((d: any) => d.date === peak.date)?.economic_7d ?? peak.value;
                  return (
                    <ReferenceDot key={peak.date} x={peak.date} y={val}
                      r={4} fill="#2A9D8F" stroke="white" strokeWidth={1.5} />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>

            {/* SVG overlay — dashed lines from label to dot (pointer-events: none) */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
              {ecoPeaks.map((peak, idx) => {
                const lp = labelPositions[peak.date];
                const dp = dotPositions[peak.date];
                if (!lp || !dp) return null;
                let staggerY = idx % 2 === 0 ? 20 : -30;
                if (idx > 0) {
                  const prevDate = new Date(ecoPeaks[idx-1].date).getTime();
                  const thisDate = new Date(peak.date).getTime();
                  if (Math.abs(thisDate - prevDate) < 45 * 24 * 60 * 60 * 1000) {
                    staggerY += idx % 2 === 0 ? 15 : -15;
                  }
                }
                return (
                  <line key={peak.date}
                    x1={lp.x} y1={lp.y + staggerY + 11} x2={dp.x} y2={dp.y}
                    stroke="#2A9D8F" strokeWidth={0.8} strokeDasharray="3,2" strokeOpacity={0.6} />
                );
              })}
            </svg>

            {/* HTML draggable labels — all positions in px relative to container */}
            {ecoPeaks.map((peak, idx) => {
              const pos = labelPositions[peak.date];
              if (!pos) return null;
              let staggerY = idx % 2 === 0 ? 20 : -30;
              if (idx > 0) {
                const prevDate = new Date(ecoPeaks[idx-1].date).getTime();
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
                    border: `1px solid ${active ? '#2A9D8F' : '#2A9D8Faa'}`,
                    borderRadius: 3,
                    padding: '2px 6px',
                    fontSize: isLong ? 8 : 9,
                    fontWeight: 600,
                    color: '#2A9D8F',
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
            )}
          </div>
        )}

        {/* ══ SECTION 5: INTERPRETATION TABLE ════════════════════════════ */}
        <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {isEn ? 'How to interpret this index' : '¿Cómo se interpreta?'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {isEn
              ? <>
                  Example: a value of <strong>150</strong> indicates activity <strong>1.5× the average</strong> (50% above normal).
                  A value of <strong>45</strong> indicates activity <strong>0.5× the average</strong> (half of normal). Mean&nbsp;=&nbsp;100.
                </>
              : <>
                  Ejemplo: un valor de <strong>150</strong> indica actividad <strong>1.5× el promedio</strong> (50% por encima de lo normal).
                  Un valor de <strong>45</strong> indica actividad <strong>0.5× el promedio</strong> (la mitad de lo normal). Media&nbsp;=&nbsp;100.
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

        {/* ══ SECTION 5b: DUAL DRIVERS ═════════════════════════════════════ */}
        {(data.current.political_justification || data.current.economic_justification || data.current.justification) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: CHART_COLORS.ink }}>
                {isEn ? 'What\'s driving today\'s index?' : '¿Qué impulsa el índice hoy?'}
              </h3>
              <span className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
                {formatDate(primaryDateStr, isEn)}
              </span>
            </div>
            {(() => {
              const polDrivers = (data.current.top_political_drivers ?? []);
              const ecoDrivers = (data.current.top_economic_drivers ?? []);
              if (polDrivers.length === 0 && ecoDrivers.length === 0) return null;

              const EVENT_CLUSTERS: { keywords: string[]; label_es: string; label_en: string }[] = [
                { keywords: ['petroperú', 'petroperu'], label_es: 'Crisis Petroperú', label_en: 'Petroperú crisis' },
                { keywords: ['camisea', 'gas natural', 'gnv', 'gasoducto'], label_es: 'Crisis gas / Camisea', label_en: 'Natural gas / Camisea crisis' },
                { keywords: ['arancel', 'trump', 'comercio exterior', 'exporta', 'importa'], label_es: 'Aranceles / comercio exterior', label_en: 'Tariffs / trade policy' },
                { keywords: ['tipo de cambio', 'dólar', 'bcrp', 'reservas', 'banco central'], label_es: 'Tipo de cambio / BCRP', label_en: 'Exchange rate / BCRP' },
                { keywords: ['inflación', 'inflacion', 'ipc', 'precios'], label_es: 'Inflación / precios', label_en: 'Inflation / prices' },
                { keywords: ['presupuest', 'deuda', 'fiscal', 'déficit', 'deficit', 'bono'], label_es: 'Política fiscal / deuda', label_en: 'Fiscal policy / debt' },
                { keywords: ['pbi', 'crecimiento económico', 'recesión', 'recession'], label_es: 'Crecimiento / PBI', label_en: 'Growth / GDP' },
                { keywords: ['miner', 'pataz', 'cobre', 'oro', 'zinc'], label_es: 'Sector minero', label_en: 'Mining sector' },
                { keywords: ['empleo', 'desempleo', 'huelga', 'paro laboral'], label_es: 'Empleo / paros', label_en: 'Employment / strikes' },
                { keywords: ['voto de confianza', 'gabinete', 'premier'], label_es: 'Inestabilidad política', label_en: 'Political instability' },
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

        {/* ══ SECTION: HISTORICAL CONTEXT + YoY ══════════════════════════ */}
        {(() => {
          const allValues = (data.daily_series ?? []).map((d) => d.economic_7d ?? 0).filter((v) => v > 0);
          if (allValues.length < 30) return null;
          const todayVal = eco7d;
          const sorted = [...allValues].sort((a, b) => a - b);
          const percentile = Math.round((sorted.filter((v) => v <= todayVal).length / sorted.length) * 100);
          const seriesArr = data.daily_series ?? [];
          const todayIdx = seriesArr.length - 1;

          // Consecutive days at/above average
          const reversed = [...seriesArr].reverse();
          let consecutive = 0;
          for (const d of reversed) { if ((d.economic_7d ?? 0) >= 100) consecutive++; else break; }

          // YoY: find entry ~365 days ago
          const todayDate = new Date(primaryDateStr);
          const yoyDate = new Date(todayDate);
          yoyDate.setFullYear(yoyDate.getFullYear() - 1);
          const yoyStr = yoyDate.toISOString().slice(0, 10);
          const yoyRow = seriesArr.find((d) => d.date === yoyStr)
            ?? seriesArr.filter((d) => d.date <= yoyStr).slice(-1)[0];
          const yoyVal = yoyRow?.economic_7d ?? null;
          const yoyDelta = yoyVal != null ? todayVal - yoyVal : null;
          const yoyPct = yoyVal != null && yoyVal > 0 ? ((todayVal - yoyVal) / yoyVal * 100) : null;

          return (
            <div className="mb-6 rounded-xl border border-gray-200 p-5" style={{ background: '#FAF8F4' }}>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: '#2D3142' }}>
                {isEn ? 'Historical context' : 'Contexto histórico'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold" style={{ color: '#2A9D8F' }}>{percentile}°</p>
                  <p className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                    {isEn ? 'percentile since Jan 2025' : 'percentil desde ene. 2025'}
                  </p>
                </div>
                {consecutive > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: consecutive >= 7 ? '#9B2226' : '#C65D3E' }}>{consecutive}</p>
                    <p className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                      {isEn ? 'days above average' : 'días sobre el promedio'}
                    </p>
                  </div>
                )}
                {yoyPct != null && (
                  <div className="text-center">
                    <p className="text-3xl font-bold" style={{ color: yoyPct > 0 ? '#C65D3E' : '#2A9D8F' }}>
                      {yoyPct > 0 ? '+' : ''}{yoyPct.toFixed(0)}%
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                      {isEn ? 'vs same day last year' : 'vs mismo día año pasado'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                      {isEn ? `Last year: IRE ${Math.round(yoyVal!)}` : `Año pasado: IRE ${Math.round(yoyVal!)}`}
                    </p>
                  </div>
                )}
                {(() => {
                  const similar = seriesArr
                    .slice(0, todayIdx - 14)
                    .filter((d) => { const v = d.economic_7d ?? 0; return v > 0 && Math.abs(v - todayVal) / Math.max(todayVal, 1) < 0.15; })
                    .sort((a, b) => Math.abs((a.economic_7d ?? 0) - todayVal) - Math.abs((b.economic_7d ?? 0) - todayVal))
                    .slice(0, 2);
                  if (similar.length === 0) return null;
                  return (
                    <div className="text-center">
                      <p className="text-xs font-semibold mb-1" style={{ color: '#8D99AE' }}>
                        {isEn ? 'Similar days (±15%)' : 'Días similares (±15%)'}
                      </p>
                      {similar.map((d) => (
                        <p key={d.date} className="text-xs" style={{ color: '#2D3142' }}>
                          {d.date} — IRE {Math.round(d.economic_7d ?? 0)}
                        </p>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

        {/* ══ SECTION 6: IRE vs TIPO DE CAMBIO SCATTER ════════════════════ */}
        {scatterRaw.length >= 10 && (
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-6 mb-6">
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
            <p className="text-xs text-gray-400 mt-2">
              {isEn
                ? `R² = ${((() => { const n = scatterRaw.length; const mx = scatterRaw.reduce((s,d)=>s+d.ire,0)/n; const my = scatterRaw.reduce((s,d)=>s+d.fx,0)/n; const sxy = scatterRaw.reduce((s,d)=>s+(d.ire-mx)*(d.fx-my),0); const sxx = scatterRaw.reduce((s,d)=>s+(d.ire-mx)**2,0); const syy = scatterRaw.reduce((s,d)=>s+(d.fx-my)**2,0); return sxx>0&&syy>0?(sxy/Math.sqrt(sxx*syy))**2:0; })()).toFixed(2)} — In daily view, correlation between economic risk and exchange rate is near zero. See monthly view for a clearer relationship.`
                : `R² = ${((() => { const n = scatterRaw.length; const mx = scatterRaw.reduce((s,d)=>s+d.ire,0)/n; const my = scatterRaw.reduce((s,d)=>s+d.fx,0)/n; const sxy = scatterRaw.reduce((s,d)=>s+(d.ire-mx)*(d.fx-my),0); const sxx = scatterRaw.reduce((s,d)=>s+(d.ire-mx)**2,0); const syy = scatterRaw.reduce((s,d)=>s+(d.fx-my)**2,0); return sxx>0&&syy>0?(sxy/Math.sqrt(sxx*syy))**2:0; })()).toFixed(2)} — En la vista diaria, la correlación entre riesgo económico y tipo de cambio es prácticamente nula. Ver vista mensual para una relación más clara.`
              }
            </p>
          </div>
        )}

        </>)}

        {/* ══ SECTION B1: DISTRIBUCIÓN MENSUAL DEL IRE ════════════════════ */}
        {viewMode === 'monthly' && (<>

        {/* Monthly hero cards */}
        {(() => {
          const currentYM = new Date().toISOString().slice(0, 7);
          const completedMonths = (data.monthly_series ?? []).filter(m => m.month < currentYM);
          const currentMonthData = (data.monthly_series ?? []).find(m => m.month === currentYM);
          const lastCompleted = completedMonths[completedMonths.length - 1];
          const prevCompleted = completedMonths[completedMonths.length - 2];

          const lastVal = lastCompleted?.economic_avg ?? 0;
          const prevVal = prevCompleted?.economic_avg ?? 0;
          const currentVal = currentMonthData?.economic_avg ?? 0;
          const changePct = prevVal > 0 ? ((lastVal - prevVal) / prevVal * 100).toFixed(1) : null;
          const currentMonthLabel = currentYM ? fmtMonth(currentYM, isEn) : '';
          const lastMonthLabel = lastCompleted ? fmtMonth(lastCompleted.month, isEn) : '';

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Primary: last completed month */}
              <div className="rounded-xl border-2 p-5 flex flex-col" style={{ borderColor: '#2A9D8F66', background: '#2A9D8F0D' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {lastMonthLabel}
                </p>
                <p className="text-4xl font-bold leading-none mt-3" style={{ color: '#2A9D8F' }}>
                  {Math.round(lastVal)}
                </p>
                {changePct !== null && (
                  <p className="text-xs mt-2" style={{ color: Number(changePct) > 0 ? '#C65D3E' : '#2A9D8F' }}>
                    {Number(changePct) > 0 ? '▲' : '▼'} {Math.abs(Number(changePct))}% {isEn ? 'vs prior month' : 'vs mes anterior'}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">IRE · {isEn ? 'monthly average' : 'promedio mensual'}</p>
              </div>
              {/* Secondary: current partial month */}
              <div className="rounded-xl border p-5 flex flex-col" style={{ borderColor: '#d1d5db', background: '#f9fafb' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {currentMonthLabel} {isEn ? '(partial)' : '(parcial)'}
                </p>
                <p className="text-4xl font-bold leading-none mt-3 text-gray-500">
                  {Math.round(currentVal)}
                </p>
                <p className="text-xs text-gray-400 mt-2">IRE · {isEn ? 'month-to-date average' : 'promedio hasta hoy'}</p>
              </div>
            </div>
          );
        })()}

        {monthlyBarData.length >= 2 && (
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {isEn ? 'Monthly IRE — peak value (7d)' : 'IRE mensual — valor pico (7 días)'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isEn ? 'Peak 7-day smoothed IRE per month. Color = risk level.' : 'Pico mensual del IRE suavizado 7 días. Color = nivel de riesgo.'}
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
                    value: 'IRE',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                    offset: 8,
                  }}
                />
                <ReferenceLine y={100} stroke={CHART_COLORS.amber} strokeDasharray="4 2" />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [Math.round(v), isEn ? 'IRE monthly avg' : 'IRE promedio mensual']}
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
                if (e.dimension === 'economic' && e.label) {
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

        {/* ══ SECTION B2: PRINCIPALES SECTORES DE RIESGO ECONÓMICO ════════ */}
        <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-5">
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {isEn ? 'Main economic risk sectors' : 'Principales sectores de riesgo económico'}
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {isEn
              ? "Drivers classified by sector keyword from today's top economic news."
              : 'Titulares clasificados por sector según palabras clave de los principales drivers económicos de hoy.'
            }
          </p>
          {sectorData.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              {isEn
                ? 'Sector breakdown will be available on next pipeline run with sufficient top_economic_drivers data.'
                : 'El desglose por sector estará disponible en la próxima ejecución del pipeline con datos de top_economic_drivers suficientes.'
              }
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, sectorData.length * 40)}>
              <BarChart
                data={sectorData}
                layout="vertical"
                margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_DEFAULTS.gridStroke}
                  strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  allowDecimals={false}
                  label={{
                    value: isEn ? 'Drivers count' : 'N.° de drivers',
                    position: 'insideBottom',
                    offset: -4,
                    style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke },
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="sector"
                  tick={{ ...axisTickStyle, textAnchor: 'end' }}
                  stroke={CHART_DEFAULTS.axisStroke}
                  width={90}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [v, isEn ? 'Drivers' : 'Drivers']}
                />
                <Bar dataKey="count" radius={[0, 3, 3, 0]}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        </>)}

        {/* ══ SECTION 7: DATA BOXES ═══════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {[
            { label: isEn ? 'Articles analyzed today' : 'Artículos analizados hoy', value: data.current.articles_total },
            { label: isEn ? 'Economically relevant' : 'Económicamente relevantes', value: (() => { const n = data.current.articles_economic_relevant; if (n == null) return '—'; if (n <= 2) return isEn ? `${n} (low-activity day)` : `${n} (baja actividad)`; return n; })() },
            { label: isEn ? 'Coverage days' : 'Días cobertura', value: data.metadata.coverage_days },
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
            ? 'Coverage: ~110 articles/day from 16 Peruvian media outlets (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).'
            : 'Cobertura: ~110 artículos/día de 16 medios peruanos (La República, El Comercio, Gestión, RPP, Andina, Correo, Peru21, Trome, Caretas, ATV, Canal N, El Búho, Inforegión, Diario UNO, La Razón, Panamericana).'}
        </p>

        {/* ══ SECTION: ALERT CTA ════════════════════════════════════════════ */}
        <div className="mb-6 rounded-xl border border-dashed p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: '#2A9D8F55', background: '#f0fafa' }}>
          <div className="text-2xl flex-shrink-0">🔔</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#2D3142' }}>
              {isEn ? 'Get alerts when economic risk spikes' : 'Recibe alertas cuando el riesgo económico se dispare'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
              {isEn
                ? 'Email us to be notified when IRE exceeds 150 (elevated risk).'
                : 'Escríbenos para recibir alertas cuando el IRE supere 150 (riesgo elevado).'}
            </p>
          </div>
          <a
            href={`mailto:hola@qhawarina.pe?subject=${encodeURIComponent(isEn ? 'IRE Alert Request' : 'Solicitud de alerta IRE')}&body=${encodeURIComponent(isEn ? 'Please notify me when IRE exceeds 150.\n\nName: \nOrganization: ' : 'Por favor, notifícame cuando el IRE supere 150.\n\nNombre: \nOrganización: ')}`}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#2A9D8F', color: '#fff' }}
          >
            {isEn ? 'Request alerts' : 'Solicitar alertas'}
          </a>
        </div>

        {/* ══ SECTION 8: LINKS ════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row gap-3">
          {viewMode === 'daily' && (
          <Link href="/estadisticas/riesgo-politico" className="flex-1">
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
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
          )}
          <Link href="/estadisticas/riesgo-politico/metodologia" className="flex-1">
            <div className="bg-[#FAF8F4] rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all flex items-center gap-4">
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
        </div>

      </div>

    </div>
  );
}
