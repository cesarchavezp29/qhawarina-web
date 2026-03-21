"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import ShareButton from "../../components/ShareButton";
import CiteButton from "../../components/CiteButton";
import ChartShareButton from "../../components/ChartShareButton";
import EmbedWidget from "../../components/EmbedWidget";
import PageSkeleton from "../../components/PageSkeleton";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// Qhawarina category colors for the ~8 sub-categories
const CAT_COLORS = ['#C65D3E','#2A9D8F','#8B7355','#C4A35A','#7FBFB5','#5B8C5A','#4A7C8C','#D4956A','#9B2226'];

interface DayRecord {
  date: string;
  index_all: number;
  index_food: number;
  index_nonfood: number;
  var_all: number;
  var_food: number;
  cum_pct: number;
  [key: string]: number | string;
}

interface CategoryMeta {
  label_es: string;
  label_en: string;
  color: string;
  cpi_weight: number;
}

interface PriceIndexData {
  metadata: {
    methodology: string;
    base_date: string;
    last_date: string;
    n_days: number;
    stores: string[];
    n_products_approx: number;
    reference: string;
    updated: string;
  };
  categories: Record<string, CategoryMeta>;
  series: DayRecord[];
  latest: {
    date: string;
    index_all: number;
    index_food: number;
    cum_pct: number;
    var_all: number;
    top_movers?: Array<{ category: string; label_es: string; label_en: string; var: number }>;
  };
}

type ViewMode = "index" | "daily_change" | "cumulative";

function fmtDate(d: string) {
  // "2026-03-01" → "01 Mar"
  const [, m, day] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${day} ${months[parseInt(m, 10) - 1]}`;
}

export default function PreciosDiariosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData]                   = useState<PriceIndexData | null>(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);
  const [viewMode, setViewMode]           = useState<ViewMode>("index");
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/daily_price_index.json?v=${new Date().toISOString().slice(0, 13)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const catIds = useMemo(() => data ? Object.keys(data.categories) : [], [data]);

  const chartData = useMemo(() => {
    if (!data) return [];
    const series = data.series;
    if (viewMode === 'index') {
      return series.map(r => ({
        date: fmtDate(r.date),
        all: r.index_all,
        food: r.index_food,
        nonfood: r.index_nonfood,
        ...catIds.reduce((acc, id) => ({ ...acc, [id]: r[`index_${id}`] ?? null }), {}),
      }));
    }
    if (viewMode === 'daily_change') {
      return series.map((r, i) => {
        if (i === 0) return { date: fmtDate(r.date), all: 0, food: 0, nonfood: 0 };
        const p = series[i - 1];
        return {
          date: fmtDate(r.date),
          all:     p.index_all    ? ((r.index_all    / p.index_all)    - 1) * 100 : 0,
          food:    p.index_food   ? ((r.index_food   / p.index_food)   - 1) * 100 : 0,
          nonfood: p.index_nonfood? ((r.index_nonfood/ p.index_nonfood)- 1) * 100 : 0,
          ...catIds.reduce((acc, id) => {
            const curr = r[`index_${id}`] as number;
            const prev = p[`index_${id}`] as number;
            return { ...acc, [id]: prev ? ((curr / prev) - 1) * 100 : null };
          }, {}),
        };
      });
    }
    // cumulative
    const b = series[0];
    return series.map(r => ({
      date: fmtDate(r.date),
      all:     b.index_all    ? ((r.index_all    / b.index_all)    - 1) * 100 : 0,
      food:    b.index_food   ? ((r.index_food   / b.index_food)   - 1) * 100 : 0,
      nonfood: b.index_nonfood? ((r.index_nonfood/ b.index_nonfood)- 1) * 100 : 0,
      ...catIds.reduce((acc, id) => {
        const curr = r[`index_${id}`] as number;
        const base = b[`index_${id}`] as number;
        return { ...acc, [id]: base ? ((curr / base) - 1) * 100 : null };
      }, {}),
    }));
  }, [data, viewMode, catIds]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated daily. Try again later.' : 'Los datos se actualizan diariamente. Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  if (!data || !data.series?.length) {
    return (
      <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
            {' / '}
            <span className="text-gray-900 font-medium">{isEn ? 'Daily Prices' : 'Precios Diarios'}</span>
          </nav>
          <h1 className="text-3xl font-bold mb-6" style={{ color: '#1a1a1a' }}>
            {isEn ? 'Daily Price Index' : 'Índice de Precios Diario'}
          </h1>
          <MethodologyBanner isEn={isEn} baseDateFallback={data?.metadata?.base_date ?? '2026-02-10'} />
          <MethodologySection isEn={isEn} />
        </div>
      </div>
    );
  }

  const n = data.series.length;
  const cumPct = ((data.series[n - 1].index_all / 100) - 1) * 100;
  const dailyAvgPct = (Math.pow(data.series[n - 1].index_all / 100, 1 / Math.max(n - 1, 1)) - 1) * 100;
  const annualizedPct = dailyAvgPct * 365;

  const viewModeLabels: Record<ViewMode, string> = isEn
    ? { index: 'Index', daily_change: 'Daily var.', cumulative: 'Cumulative' }
    : { index: 'Índice', daily_change: 'Var. diaria', cumulative: 'Acumulado' };

  const yLabel = isEn
    ? viewMode === 'index' ? `Index (${data.metadata.base_date} = 100)` : viewMode === 'daily_change' ? 'Daily change (%)' : 'Cumulative (%)'
    : viewMode === 'index' ? `Índice (${data.metadata.base_date} = 100)` : viewMode === 'daily_change' ? 'Variación diaria (%)' : 'Variación acumulada (%)';

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#FAF8F4', backgroundImage: WATERMARK }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/estadisticas" className="hover:underline">{isEn ? 'Statistics' : 'Estadísticas'}</Link>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Daily Prices' : 'Precios Diarios'}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
                {isEn ? 'Daily Price Index' : 'Índice de Precios Diario'}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#C65D3E' }}>
                QHAWARINA BPP
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {isEn ? 'Cavallo (MIT) method' : 'Metodología Cavallo (MIT)'} · {data.metadata.stores.join(', ')} · {data.metadata.n_products_approx.toLocaleString()}+ {isEn ? 'products' : 'productos'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-1">
              <p className="text-xs text-gray-500">{isEn ? 'Updated' : 'Actualizado'}</p>
              <p className="text-sm font-semibold text-gray-900">{data.latest.date}</p>
            </div>
            <CiteButton indicator={isEn ? 'Daily Price Index' : 'Índice de Precios Diario'} isEn={isEn} />
            <ShareButton
              title={isEn ? 'Daily Prices BPP — Qhawarina' : 'Precios Diarios BPP — Qhawarina'}
              text={isEn
                ? `Supermarket prices Peru: ${cumPct >= 0 ? '+' : ''}${cumPct.toFixed(2)}% cumulative | Qhawarina\nhttps://qhawarina.pe/estadisticas/precios-diarios`
                : `Precios supermercados Perú: ${cumPct >= 0 ? '+' : ''}${cumPct.toFixed(2)}% acumulado | Qhawarina\nhttps://qhawarina.pe/estadisticas/precios-diarios`}
            />
            <EmbedWidget
              path="/estadisticas/precios-diarios"
              title={isEn ? 'Daily Prices BPP — Qhawarina' : 'Precios Diarios BPP — Qhawarina'}
              height={700}
            />
          </div>
        </div>

        {/* Low data warning */}
        {n < 30 && (
          <div className="rounded-xl p-4 mb-6" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
            <p className="text-sm text-amber-800">
              <strong>{n} {isEn ? 'days of data' : 'días de datos'}</strong>{' '}
              {isEn
                ? 'available. The series becomes statistically robust after 30 days. Data accumulates automatically each day.'
                : 'disponibles. La serie se vuelve estadísticamente robusta a partir de 30 días. Los datos se acumulan automáticamente cada día.'}
            </p>
          </div>
        )}

        {/* Hero chart */}
        <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex gap-1">
              {(['index', 'daily_change', 'cumulative'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: viewMode === mode ? '#C65D3E' : 'transparent',
                    color: viewMode === mode ? 'white' : '#6b7280',
                    border: `2px solid ${viewMode === mode ? '#C65D3E' : '#d6d3d1'}`,
                  }}
                >
                  {viewModeLabels[mode]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: showCategories ? '#2A9D8F' : 'transparent',
                  color: showCategories ? 'white' : '#6b7280',
                  border: `2px solid ${showCategories ? '#2A9D8F' : '#d6d3d1'}`,
                }}
              >
                {showCategories
                  ? (isEn ? 'Hide categories' : 'Ocultar categorías')
                  : (isEn ? 'Show by category' : 'Ver por categoría')}
              </button>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/precios-diarios"
                shareText={isEn
                  ? `Supermarket prices Peru: ${cumPct >= 0 ? '+' : ''}${cumPct.toFixed(2)}% since ${data.metadata.base_date} — Qhawarina`
                  : `Precios supermercados Perú: ${cumPct >= 0 ? '+' : ''}${cumPct.toFixed(2)}% desde ${data.metadata.base_date} — Qhawarina`}
              />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
              <XAxis
                dataKey="date"
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
              />
              <YAxis
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                tickFormatter={v => viewMode === 'index' ? v.toFixed(1) : `${v.toFixed(2)}%`}
                label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke }, offset: 8 }}
                width={55}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(v: any) => [
                  viewMode === 'index' ? Number(v).toFixed(2) : `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(3)}%`,
                ]}
              />
              {viewMode !== 'index' && <ReferenceLine y={0} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 2" />}
              {/* Main 3 lines */}
              <Line type="monotone" dataKey="all"     name={isEn ? 'All products' : 'Todos los productos'} stroke="#C65D3E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="food"    name={isEn ? 'Food & beverages' : 'Alimentos y bebidas'} stroke="#2A9D8F" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="nonfood" name={isEn ? 'Non-food' : 'No alimentario'} stroke="#8B7355" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
              {/* Category lines when toggled */}
              {showCategories && catIds.map((id, i) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  name={isEn ? data.categories[id].label_en : data.categories[id].label_es}
                  stroke={CAT_COLORS[i % CAT_COLORS.length]}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                  dot={false}
                  opacity={0.65}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs mt-2" style={{ color: CHART_DEFAULTS.axisStroke }}>
            {isEn
              ? `Source: Qhawarina / ${data.metadata.stores.join(' / ')} — Bilateral chain-linked Jevons index, base ${data.metadata.base_date} = 100.`
              : `Fuente: Qhawarina / ${data.metadata.stores.join(' / ')} — Índice Jevons bilateral chain-linked, base ${data.metadata.base_date} = 100.`}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: isEn ? 'Current index' : 'Índice actual',
              value: data.latest.index_all?.toFixed(2),
              sub: `base ${data.metadata.base_date} = 100`,
              color: '#C65D3E',
            },
            {
              label: isEn ? 'Last session' : 'Última sesión',
              value: `${(data.latest.var_all ?? 0) >= 0 ? '+' : ''}${(data.latest.var_all ?? 0).toFixed(3)}%`,
              sub: isEn ? 'daily change' : 'variación diaria',
              color: (data.latest.var_all ?? 0) >= 0 ? '#9B2226' : '#2A9D8F',
            },
            {
              label: isEn ? 'Cumulative' : 'Acumulado',
              value: `${cumPct >= 0 ? '+' : ''}${cumPct.toFixed(2)}%`,
              sub: isEn ? `since ${data.metadata.base_date}` : `desde ${data.metadata.base_date}`,
              color: cumPct >= 0 ? '#9B2226' : '#2A9D8F',
            },
            {
              label: isEn ? 'Annualized pace' : 'Ritmo anualizado',
              value: `${annualizedPct >= 0 ? '+' : ''}${annualizedPct.toFixed(1)}%`,
              sub: isEn ? 'if current pace continues' : 'si ritmo actual continúa',
              color: annualizedPct >= 0 ? '#D4956A' : '#2A9D8F',
            },
          ].map((card, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Category movers bar chart */}
        {data.latest.top_movers && data.latest.top_movers.length > 0 && (
          <div className="rounded-xl border p-6 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: '#1a1a1a' }}>
                {isEn ? 'Daily change by category' : 'Variación diaria por categoría'}
              </h3>
              <ChartShareButton
                url="https://qhawarina.pe/estadisticas/precios-diarios"
                shareText={(() => {
                  const top = data.latest.top_movers?.[0];
                  return isEn
                    ? `Supermarket prices Peru (today): ${top ? `${top.label_en} ${top.var >= 0 ? '+' : ''}${top.var.toFixed(2)}%` : cumPct.toFixed(2) + '% cumulative'} — Qhawarina`
                    : `Precios supermercados Perú (hoy): ${top ? `${top.label_es} ${top.var >= 0 ? '+' : ''}${top.var.toFixed(2)}%` : cumPct.toFixed(2) + '% acumulado'} — Qhawarina`;
                })()}
              />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                layout="vertical"
                data={[...data.latest.top_movers]
                  .sort((a, b) => b.var - a.var)
                  .map(m => ({ name: isEn ? m.label_en : m.label_es, var: m.var }))}
                margin={{ top: 4, right: 50, left: 110, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisTickStyle}
                  stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(2)}%`}
                />
                <YAxis type="category" dataKey="name" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} width={105} />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: any) => [`${Number(v) > 0 ? '+' : ''}${Number(v).toFixed(3)}%`, isEn ? 'Daily change' : 'Variación diaria']}
                />
                <ReferenceLine x={0} stroke={CHART_DEFAULTS.axisStroke} />
                <Bar dataKey="var" radius={[0, 3, 3, 0]}>
                  {[...data.latest.top_movers]
                    .sort((a, b) => b.var - a.var)
                    .map((entry, i) => (
                      <Cell key={i} fill={entry.var >= 0 ? '#C65D3E' : '#2A9D8F'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs mt-1" style={{ color: CHART_DEFAULTS.axisStroke }}>
              {isEn ? 'Terracotta = price increase · Teal = price decrease' : 'Terra = alza de precio · Verde azulado = baja de precio'}
            </p>
          </div>
        )}

        {/* Category breakdown cards */}
        {data.categories && Object.keys(data.categories).length > 0 && (
          <div className="rounded-xl border p-5 mb-6" style={{ background: '#FFFCF7', borderColor: '#E8E4DF' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#1a1a1a' }}>
              {isEn ? 'Index by Category (latest day)' : 'Índice por Categoría (último día)'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.categories).map(([catId, meta]) => {
                const latestRecord = data.series[data.series.length - 1];
                const idx = latestRecord[`index_${catId}`] as number;
                const change = idx - 100;
                // Terracotta border for inflation, teal for deflation
                const borderColor = change >= 0 ? '#C65D3E' : '#2A9D8F';
                return (
                  <div
                    key={catId}
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ background: '#FAF8F4', borderLeft: `3px solid ${borderColor}`, border: `1px solid #E8E4DF`, borderLeftWidth: 3, borderLeftColor: borderColor }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {isEn ? meta.label_en : meta.label_es}
                      </p>
                      <p className="text-sm font-bold" style={{ color: change >= 0 ? '#C65D3E' : '#2A9D8F' }}>
                        {idx?.toFixed(2)}
                        <span className="ml-1 text-xs font-normal">
                          ({change >= 0 ? '+' : ''}{change?.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <MethodologySection isEn={isEn} />
      </div>
    </div>
  );
}

function MethodologyBanner({ isEn, baseDateFallback }: { isEn: boolean; baseDateFallback: string }) {
  return (
    <div className="rounded-xl p-6 mb-6" style={{ background: '#FFFCF7', borderLeft: '4px solid #C65D3E', border: '1px solid #E8E4DF' }}>
      <h2 className="text-lg font-bold mb-2" style={{ color: '#C65D3E' }}>
        Qhawarina BPP — Billion Prices Project para Perú
      </h2>
      <p className="text-sm text-gray-700 mb-4">
        {isEn
          ? <>First daily price index for Peru, based on the methodology of <strong>Alberto Cavallo (MIT)</strong>. We collect prices of 42,000+ products at Plaza Vea, Metro and Wong every day and build a bilateral chain-linked Jevons index.</>
          : <>Primer índice de precios diario para Perú, basado en la metodología de <strong>Alberto Cavallo (MIT)</strong>. Recopilamos precios de 42,000+ productos en Plaza Vea, Metro y Wong cada día y construimos un índice Jevons bilateral chain-linked.</>}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: isEn ? 'Products' : 'Productos', value: '42,000+' },
          { label: isEn ? 'Stores' : 'Tiendas', value: isEn ? '3 chains' : '3 cadenas' },
          { label: isEn ? 'Method' : 'Método', value: 'Jevons BPP' },
          { label: isEn ? 'Frequency' : 'Frecuencia', value: isEn ? 'Daily' : 'Diaria' },
        ].map(item => (
          <div key={item.label} className="rounded-lg p-3 text-center" style={{ background: '#FAF8F4', border: '1px solid #E8E4DF' }}>
            <p className="text-xl font-bold" style={{ color: '#C65D3E' }}>{item.value}</p>
            <p className="text-xs text-gray-500">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg px-4 py-3" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
        <p className="text-sm text-amber-800">
          {isEn
            ? <>The index started on <strong>{baseDateFallback}</strong>. Needs at least 30 days of data to be statistically significant. Scraper runs daily at 07:00 AM.</>
            : <>El índice comenzó el <strong>{baseDateFallback}</strong>. Necesitamos al menos 30 días para que la serie sea estadísticamente significativa. El scraper corre diariamente a las 07:00 AM.</>}
        </p>
      </div>
    </div>
  );
}

function MethodologySection({ isEn }: { isEn: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl p-5" style={{ background: '#FFFCF7', borderLeft: '3px solid #C65D3E', border: '1px solid #E8E4DF' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#C65D3E' }}>
          {isEn ? 'Methodology' : 'Metodología'}
        </h3>
        <div className="space-y-3 text-xs text-gray-700">
          <div>
            <p className="font-semibold">{isEn ? '1. Price collection' : '1. Recopilación de precios'}</p>
            <p className="text-gray-500">{isEn ? '42,000+ products from Plaza Vea, Metro and Wong scraped via the VTEX API each business day.' : '42,000+ productos de Plaza Vea, Metro y Wong scrapeados via API VTEX cada día hábil.'}</p>
          </div>
          <div>
            <p className="font-semibold">{isEn ? '2. Bilateral Jevons index' : '2. Índice Jevons bilateral'}</p>
            <p className="text-gray-500">
              {isEn
                ? <>Geometric mean of price ratios per consecutive day pair: <code className="bg-gray-100 px-1 rounded">exp(mean(log(p_t/p_t-1)))</code></>
                : <>Media geométrica de ratios de precio entre pares de días consecutivos: <code className="bg-gray-100 px-1 rounded">exp(mean(log(p_t/p_t-1)))</code></>}
            </p>
          </div>
          <div>
            <p className="font-semibold">{isEn ? '3. Outlier filter' : '3. Filtro de outliers'}</p>
            <p className="text-gray-500">{isEn ? 'Ratios outside [0.5, 2.0] excluded to remove errors and extreme promotions.' : 'Ratios fuera de [0.5, 2.0] excluidos para eliminar errores y promociones extremas.'}</p>
          </div>
          <div>
            <p className="font-semibold">{isEn ? '4. Chain-linking' : '4. Chain-linking'}</p>
            <p className="text-gray-500">{isEn ? <>Daily indices chained multiplicatively: Index_t = Index_t-1 × Jevons_t</> : <>Índices diarios encadenados multiplicativamente: Index_t = Index_t-1 × Jevons_t</>}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderLeft: '3px solid #E8E4DF' }}>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {isEn ? 'Academic reference' : 'Referencia académica'}
        </h3>
        <div className="rounded-lg p-3 mb-3" style={{ background: '#FAF8F4', border: '1px solid #E8E4DF' }}>
          <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Billion Prices Project (BPP)</p>
          <p className="text-xs text-gray-600">Alberto Cavallo &amp; Roberto Rigobon (MIT)</p>
          <p className="text-xs text-gray-500 mt-1">
            &ldquo;The Billion Prices Project: Using Online Prices for Measurement and Research&rdquo;
            <br />Journal of Economic Perspectives, 2016.
          </p>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          {isEn
            ? <>The BPP covers 22 countries and has shown that online prices lead the official CPI by <strong>2–4 weeks</strong>. Qhawarina applies this methodology to the Peruvian market for the first time.</>
            : <>El BPP cubre 22 países y ha demostrado que los precios online adelantan al IPC oficial por <strong>2-4 semanas</strong>. Qhawarina aplica esta metodología al mercado peruano por primera vez.</>}
        </p>
        <div className="flex gap-3 text-xs flex-wrap">
          <Link href="/estadisticas/inflacion" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'Inflation nowcast →' : 'Nowcast inflación →'}
          </Link>
          <Link href="/estadisticas/inflacion/categorias" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'Official CPI →' : 'IPC oficial →'}
          </Link>
          <Link href="/datos" className="font-medium hover:underline" style={{ color: '#C65D3E' }}>
            {isEn ? 'Download data →' : 'Descargar datos →'}
          </Link>
        </div>
      </div>
    </div>
  );
}
