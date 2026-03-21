'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts';
import { CHART_DEFAULTS, tooltipContentStyle, axisTickStyle, CHART_COLORS } from './lib/chartTheme';
import PriceIndexCard from './components/hero/PriceIndexCard';
import IrpCard from './components/hero/IrpCard';
import IreCard from './components/hero/IreCard';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

type Indicator = 'prices' | 'irp' | 'pbi' | 'inflation';
type Range = '30d' | '90d' | '1y' | 'all';

const INDICATOR_META: Record<Indicator, { labelEs: string; labelEn: string; color: string; href: string }> = {
  prices:    { labelEs: 'Precios',        labelEn: 'Prices',     color: '#C65D3E', href: '/estadisticas/precios-diarios' },
  irp:       { labelEs: 'Riesgo Pol.',    labelEn: 'Pol. Risk',  color: '#C65D3E', href: '/estadisticas/riesgo-politico' },
  pbi:       { labelEs: 'PBI',            labelEn: 'GDP',        color: '#2A9D8F', href: '/estadisticas/pbi' },
  inflation: { labelEs: 'Inflación',      labelEn: 'Inflation',  color: '#C65D3E', href: '/estadisticas/inflacion' },
};

const RANGE_LABELS: Record<Indicator, Array<[Range, string, string]>> = {
  prices:    [['30d','30D','30D'], ['90d','90D','90D'], ['1y','1A','1Y'], ['all','Todo','All']],
  irp:       [['30d','30D','30D'], ['90d','90D','90D'], ['1y','1A','1Y'], ['all','Todo','All']],
  pbi:       [['30d','2A','2Y'],  ['90d','3A','3Y'],   ['1y','5A','5Y'],  ['all','Todo','All']],
  inflation: [['30d','1A','1Y'],  ['90d','2A','2Y'],   ['1y','3A','3Y'],  ['all','Todo','All']],
};

function fmtXLabel(s: string): string {
  if (!s) return '';
  if (s.includes('Q')) return s;
  const mo = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const p = s.split('-');
  if (p.length === 3) return `${parseInt(p[2])} ${mo[parseInt(p[1]) - 1]}`;
  if (p.length === 2) return `${mo[parseInt(p[1]) - 1]} '${p[0].slice(2)}`;
  return s;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string, isEn: boolean): string {
  try {
    return parseLocalDate(dateStr).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short' });
  } catch { return dateStr; }
}

function zoneColor(prr: number): string {
  if (prr < 50)  return '#8D99AE';
  if (prr < 90)  return '#2A9D8F';
  if (prr < 110) return '#E9C46A';
  if (prr < 150) return '#C65D3E';
  if (prr < 200) return '#9B2226';
  return '#6B0000';
}

function dotColor(score: number) {
  if (score >= 70) return '#9B2226';
  if (score >= 55) return '#C65D3E';
  if (score >= 35) return '#E9C46A';
  return '#8D99AE';
}

function srcLabel(src: string) {
  const map: Record<string, string> = {
    elcomercio: 'El Comercio', gestion: 'Gestión', larepublica: 'La República',
    rpp: 'RPP', andina: 'Andina', correo: 'Correo', peru21: 'Perú 21',
    elbuho: 'El Búho', canaln: 'Canal N', panamericana: 'Panamericana',
  };
  return map[src] ?? src;
}

export default function HomePage() {
  const isEn = useLocale() === 'en';
  const [data, setData]                       = useState<any>(null);
  const [loading, setLoading]                 = useState(true);
  const [pipelineStatus, setPipelineStatus]   = useState<any>(null);
  const [notaDiaria, setNotaDiaria]           = useState<any>(null);
  const [columnas, setColumnas]               = useState<any[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator>('prices');
  const [timeRange, setTimeRange]             = useState<Range>('90d');
  const [copied, setCopied]                   = useState(false);

  useEffect(() => {
    const v = new Date().toISOString().slice(0, 13);
    Promise.allSettled([
      fetch(`/assets/data/gdp_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/inflation_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/poverty_nowcast.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/political_index_daily.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/fx_interventions.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/daily_price_index.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/pipeline_status.json?v=${v}`).then(r => r.json()),
      fetch(`/assets/data/nota_diaria.json?v=${v}`).then(r => r.json()),
    ]).then(([gdpR, inflR, povR, polR, fxR, pricesR, statusR, notaR]) => {
      setData({
        gdp:       gdpR.status       === 'fulfilled' ? gdpR.value       : null,
        inflation: inflR.status      === 'fulfilled' ? inflR.value      : null,
        poverty:   povR.status       === 'fulfilled' ? povR.value       : null,
        political: polR.status       === 'fulfilled' ? polR.value       : null,
        fx:        fxR.status        === 'fulfilled' ? fxR.value        : null,
        prices:    pricesR.status    === 'fulfilled' ? pricesR.value    : null,
      });
      if (statusR.status === 'fulfilled') setPipelineStatus(statusR.value);
      if (notaR.status   === 'fulfilled') setNotaDiaria(notaR.value);
      setLoading(false);
    });
    fetch('/assets/columnas/index.json').then(r => r.json()).then(setColumnas).catch(() => {});
  }, []);

  const featuredChartData = useMemo(() => {
    if (!data) return [];
    if (selectedIndicator === 'prices') {
      const n = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : Infinity;
      return (data.prices?.series ?? []).slice(-n).map((r: any) => ({
        x: r.date, value: r.index_all, food: r.index_food,
      }));
    }
    if (selectedIndicator === 'irp') {
      const n = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '1y' ? 365 : Infinity;
      return (data.political?.daily_series ?? []).slice(-n).map((r: any) => ({
        x: r.date, value: r.political_7d ?? 0,
      }));
    }
    if (selectedIndicator === 'pbi') {
      const n = timeRange === '30d' ? 8 : timeRange === '90d' ? 12 : timeRange === '1y' ? 20 : Infinity;
      return (data.gdp?.quarterly_series ?? []).slice(-n).map((r: any) => ({
        x: r.quarter ?? '',
        official: r.official ?? null,
        nowcast:  r.official == null ? (r.nowcast ?? null) : null,
      }));
    }
    if (selectedIndicator === 'inflation') {
      const n = timeRange === '30d' ? 12 : timeRange === '90d' ? 24 : timeRange === '1y' ? 36 : Infinity;
      return (data.inflation?.monthly_series ?? []).slice(-n).map((r: any) => ({
        x: r.month ?? '',
        official: r.official ?? null,
        nowcast:  r.official == null ? (r.nowcast ?? null) : null,
      }));
    }
    return [];
  }, [data, selectedIndicator, timeRange]);

  if (loading) return <LoadingSkeleton />;

  // ── Derived values ────────────────────────────────────────────────────────
  const isStale = pipelineStatus?.run_time
    ? (Date.now() - new Date(pipelineStatus.run_time).getTime()) / 3_600_000 > 36
    : false;
  const hasErrors = pipelineStatus &&
    (['supermarket', 'rss'] as const).some(k => pipelineStatus[k] && !pipelineStatus[k].passed);
  const todayStr = new Date().toISOString().slice(0, 13);

  const gdpValue   = data?.gdp?.nowcast?.value;
  const gdpColor   = gdpValue != null ? (gdpValue >= 0 ? '#2A9D8F' : '#9B2226') : '#2D3142';
  const inflValue  = data?.inflation?.nowcast?.value;
  const inflColor  = inflValue != null ? (inflValue > 0.3 ? '#9B2226' : inflValue < 0 ? '#2A9D8F' : '#E0A458') : '#2D3142';
  const irp7d      = data?.political?.current?.political_7d  ?? 0;
  const irpLevel   = data?.political?.current?.political_level  ?? 'BAJO';
  const irpColor   = zoneColor(irp7d);
  const ire7d      = data?.political?.current?.economic_7d   ?? 0;
  const ireLevel   = data?.political?.current?.economic_level   ?? 'BAJO';
  const ireColor   = zoneColor(ire7d);
  const ipdCum     = data?.prices?.latest?.cum_pct ?? 0;
  const ipdColor   = ipdCum > 0 ? '#C65D3E' : '#2A9D8F';
  const povertyVal = data?.poverty?.national?.poverty_nowcast ?? data?.poverty?.national?.poverty_rate;

  const polDrivers = (data?.political?.current?.top_political_drivers ?? []).slice(0, 4);
  const ecoDrivers = (data?.political?.current?.top_economic_drivers  ?? []).slice(0, 4);
  const topMovers  = (data?.prices?.latest?.top_movers ?? []) as any[];
  const latestArticles = [...columnas].sort((a, b) => b.date > a.date ? 1 : -1).slice(0, 3);

  const citationText = `Qhawarina (${new Date().getFullYear()}). Índice de Precios Diarios e Índice de Riesgo Político para Perú. qhawarina.pe. Licencia CC BY 4.0.`;

  const chartInterval = Math.max(1, Math.floor(featuredChartData.length / 8));

  return (
    <div style={{ background: '#FAF8F4', backgroundImage: WATERMARK, minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── Stale / error banner ────────────────────────────────────── */}
        {(isStale || hasErrors) && (
          <div className="mb-6 px-4 py-2.5 text-sm flex items-center gap-2 rounded"
            style={{ background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E' }}>
            <span>⚠</span>
            <span>
              {isStale
                ? (isEn ? 'Data may be outdated — pipeline last ran more than 36h ago.' : 'Los datos pueden estar desactualizados — el pipeline corrió hace más de 36h.')
                : (isEn ? 'Pipeline reported errors in the last run. Some data may be missing.' : 'El pipeline reportó errores en la última ejecución. Algunos datos pueden faltar.')}
            </span>
          </div>
        )}

        {/* ── Masthead ─────────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: '#C65D3E18', color: '#C65D3E', border: '1px solid #C65D3E30' }}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" style={{ animation: 'pulse 2s infinite' }} />
              {(() => {
                const t = pipelineStatus?.run_time
                  ? new Date(pipelineStatus.run_time).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima', hour12: false,
                    }) + ' PET'
                  : '—';
                return isEn ? `Live · Updated ${t}` : `En vivo · Actualizado ${t}`;
              })()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl leading-tight mb-3"
            style={{ color: '#2D3142', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            {isEn ? "Peru's Economic Pulse" : 'Pulso de la Economía Peruana'}
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: '#8D99AE' }}>
            {isEn
              ? <>Prices, political risk, GDP and poverty — updated daily. Built for{' '}
                  <strong style={{ color: '#2D3142' }}>journalists and policymakers</strong>.</>
              : <>Precios, riesgo político, PBI y pobreza — actualizados a diario. Para{' '}
                  <strong style={{ color: '#2D3142' }}>periodistas y tomadores de decisiones</strong>.</>}
          </p>
        </section>

        {/* ── 5-tile KPI strip ──────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

            <Link href="/estadisticas/precios-diarios" className="block group">
              <div className="p-4 rounded-lg transition-shadow group-hover:shadow-sm"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderTop: `3px solid ${ipdColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Daily Prices' : 'Precios Diarios'}
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: ipdColor, fontFamily: 'ui-monospace, monospace' }}>
                  {ipdCum >= 0 ? '+' : ''}{ipdCum.toFixed(2)}%
                </div>
                <div className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'month-to-date' : 'mes en curso'}
                </div>
              </div>
            </Link>

            <Link href="/estadisticas/riesgo-politico" className="block group">
              <div className="p-4 rounded-lg transition-shadow group-hover:shadow-sm"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderTop: `3px solid ${irpColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Pol. Risk (IRP)' : 'Riesgo Pol. (IRP)'}
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: irpColor, fontFamily: 'ui-monospace, monospace' }}>
                  {Math.round(irp7d)}
                </div>
                <div className="text-xs mt-1 font-semibold" style={{ color: irpColor }}>{irpLevel}</div>
              </div>
            </Link>

            <Link href="/estadisticas/riesgo-economico" className="block group">
              <div className="p-4 rounded-lg transition-shadow group-hover:shadow-sm"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderTop: `3px solid ${ireColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Eco. Risk (IRE)' : 'Riesgo Eco. (IRE)'}
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: ireColor, fontFamily: 'ui-monospace, monospace' }}>
                  {Math.round(ire7d)}
                </div>
                <div className="text-xs mt-1 font-semibold" style={{ color: ireColor }}>{ireLevel}</div>
              </div>
            </Link>

            <Link href="/estadisticas/pbi" className="block group">
              <div className="p-4 rounded-lg transition-shadow group-hover:shadow-sm"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderTop: `3px solid ${gdpColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                  {isEn ? 'GDP (YoY)' : 'PBI (interanual)'}
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: gdpColor, fontFamily: 'ui-monospace, monospace' }}>
                  {gdpValue != null ? `${gdpValue >= 0 ? '+' : ''}${gdpValue.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                  {data?.gdp?.nowcast?.target_period ?? 'Nowcast'}
                </div>
              </div>
            </Link>

            <Link href="/estadisticas/inflacion" className="block group">
              <div className="p-4 rounded-lg transition-shadow group-hover:shadow-sm"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderTop: `3px solid ${inflColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Inflation (MoM)' : 'Inflación (mensual)'}
                </div>
                <div className="text-2xl font-bold tabular-nums leading-none"
                  style={{ color: inflColor, fontFamily: 'ui-monospace, monospace' }}>
                  {inflValue != null ? `${inflValue >= 0 ? '+' : ''}${inflValue.toFixed(3)}%` : '—'}
                </div>
                <div className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                  {data?.inflation?.nowcast?.target_period ?? 'Nowcast'}
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* ── Nota Diaria ──────────────────────────────────────────────── */}
        {notaDiaria && (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-xl"
              style={{ background: '#2D3142', color: '#FAF8F4' }}>
              <div aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #C65D3E, #E0A458)',
              }} />
              <div className="p-6 pt-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: '#C65D3E' }}>
                    {isEn ? 'Daily Brief' : 'Nota Diaria'}
                    {notaDiaria.date !== todayStr && (
                      <span className="ml-2 normal-case font-normal" style={{ color: '#8D99AE', opacity: 0.8 }}>
                        ({isEn ? `Last: ${notaDiaria.date}` : `Última: ${notaDiaria.date}`})
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl mb-2" style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                    {isEn ? notaDiaria.headline_en : notaDiaria.headline_es}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ opacity: 0.75 }}>
                    {isEn ? notaDiaria.body_en : notaDiaria.body_es}
                  </p>
                </div>
                {notaDiaria.highlights?.length > 0 && (
                  <div className="md:min-w-[220px] flex flex-col gap-2.5">
                    {notaDiaria.highlights.map((h: any, i: number) => (
                      <div key={i} className="text-sm flex items-start gap-2" style={{ opacity: 0.8 }}>
                        <span className="mt-0.5 shrink-0">{h.icon}</span>
                        <span>{isEn ? h.text_en : h.text_es}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Hero Cards ───────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data?.prices    && <PriceIndexCard data={data.prices}    isEn={isEn} />}
            {data?.political && <IrpCard        data={data.political} isEn={isEn} />}
            {data?.political && <IreCard        data={data.political} isEn={isEn} />}
          </div>
        </section>

        {/* ── Indicator Explorer (featured chart) ──────────────────────── */}
        <section className="mb-8">
          <div className="rounded-xl p-6" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#2D3142' }}>
                  {isEn ? 'Indicator Explorer' : 'Explorador de Indicadores'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                  {isEn
                    ? 'Select an indicator and time range · Right-click chart to save image'
                    : 'Elige un indicador y período · Clic derecho en el gráfico para guardar'}
                </p>
              </div>

              {/* Indicator toggle */}
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {(['prices', 'irp', 'pbi', 'inflation'] as Indicator[]).map(ind => {
                  const meta = INDICATOR_META[ind];
                  const active = selectedIndicator === ind;
                  return (
                    <button
                      key={ind}
                      onClick={() => { setSelectedIndicator(ind); setTimeRange('90d'); }}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                      style={{
                        background: active ? meta.color : 'transparent',
                        color:      active ? 'white' : '#6b7280',
                        border:     `1.5px solid ${active ? meta.color : '#d6d3d1'}`,
                      }}>
                      {isEn ? meta.labelEn : meta.labelEs}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Range selector */}
            <div className="flex gap-1 mb-5">
              {RANGE_LABELS[selectedIndicator].map(([val, labelEs, labelEn]) => (
                <button
                  key={val}
                  onClick={() => setTimeRange(val as Range)}
                  className="px-2.5 py-1 rounded text-xs font-semibold transition-all"
                  style={{
                    background: timeRange === val ? '#2D314215' : 'transparent',
                    color:      timeRange === val ? '#2D3142'   : '#9ca3af',
                    border:     `1px solid ${timeRange === val ? '#2D314230' : 'transparent'}`,
                  }}>
                  {isEn ? labelEn : labelEs}
                </button>
              ))}
            </div>

            {/* Chart */}
            {featuredChartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={300}>
                {selectedIndicator === 'prices' ? (
                  <AreaChart data={featuredChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
                    <XAxis dataKey="x" tick={{ ...axisTickStyle, fontSize: 9 }} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={fmtXLabel} interval={chartInterval} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} domain={['auto', 'auto']}
                      tickFormatter={(v: number) => v.toFixed(1)} width={42} />
                    <Tooltip contentStyle={tooltipContentStyle}
                      formatter={(v: any) => [v != null ? Number(v).toFixed(2) : '—']} />
                    <ReferenceLine y={100} stroke="#E8E4DF" strokeDasharray="4 2" />
                    <Area type="monotone" dataKey="food"  name={isEn ? 'Food' : 'Alimentos'}
                      stroke="#E0A458" fill="#E0A458" fillOpacity={0.08} dot={false} strokeWidth={1} />
                    <Area type="monotone" dataKey="value" name={isEn ? 'All items' : 'General'}
                      stroke="#C65D3E" fill="#C65D3E" fillOpacity={0.12} dot={false} strokeWidth={2} />
                  </AreaChart>
                ) : selectedIndicator === 'irp' ? (
                  <AreaChart data={featuredChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
                    <XAxis dataKey="x" tick={{ ...axisTickStyle, fontSize: 9 }} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={fmtXLabel} interval={chartInterval} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} domain={[0, 'auto']} width={42} />
                    <Tooltip contentStyle={tooltipContentStyle}
                      formatter={(v: any) => [v != null ? `${Math.round(Number(v))} IRP` : '—']} />
                    <ReferenceLine y={100} stroke="#E9C46A" strokeDasharray="4 2"
                      label={{ value: isEn ? 'avg' : 'prom', position: 'right', fontSize: 9, fill: '#8D99AE' }} />
                    <ReferenceLine y={150} stroke="#C65D3E" strokeDasharray="4 2"
                      label={{ value: 'ELEVADO', position: 'right', fontSize: 9, fill: '#C65D3E' }} />
                    <Area type="monotone" dataKey="value" name="IRP 7d"
                      stroke="#C65D3E" fill="#C65D3E" fillOpacity={0.12} dot={false} strokeWidth={2} />
                  </AreaChart>
                ) : selectedIndicator === 'pbi' ? (
                  <ComposedChart data={featuredChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
                    <XAxis dataKey="x" tick={{ ...axisTickStyle, fontSize: 9 }} stroke={CHART_DEFAULTS.axisStroke} interval={1} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={(v: number) => `${v}%`} width={42} />
                    <Tooltip contentStyle={tooltipContentStyle}
                      formatter={(v: any) => [v != null ? `${Number(v).toFixed(1)}%` : '—']} />
                    <ReferenceLine y={0} stroke="#E8E4DF" />
                    <Bar dataKey="official" name={isEn ? 'INEI Official' : 'Oficial INEI'}
                      fill={CHART_COLORS.ink} fillOpacity={0.65} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="nowcast"  name="Nowcast"
                      fill={CHART_COLORS.teal} radius={[2, 2, 0, 0]} />
                  </ComposedChart>
                ) : (
                  <ComposedChart data={featuredChartData} margin={{ top: 8, right: 20, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} vertical={false} />
                    <XAxis dataKey="x" tick={{ ...axisTickStyle, fontSize: 9 }} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={fmtXLabel} interval={chartInterval} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={(v: number) => `${v}%`} width={42} />
                    <Tooltip contentStyle={tooltipContentStyle}
                      formatter={(v: any) => [v != null ? `${Number(v).toFixed(3)}%` : '—']} />
                    <ReferenceLine y={0} stroke="#E8E4DF" />
                    <ReferenceLine y={1} stroke="#2A9D8F" strokeDasharray="3 2" strokeOpacity={0.5}
                      label={{ value: '1%', position: 'right', fontSize: 9, fill: '#2A9D8F' }} />
                    <ReferenceLine y={3} stroke="#2A9D8F" strokeDasharray="3 2" strokeOpacity={0.5}
                      label={{ value: '3%', position: 'right', fontSize: 9, fill: '#2A9D8F' }} />
                    <Bar dataKey="official" name={isEn ? 'INEI Official' : 'Oficial INEI'}
                      fill={CHART_COLORS.ink} fillOpacity={0.6} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="nowcast" name="Nowcast"
                      fill={CHART_COLORS.terra} radius={[2, 2, 0, 0]} />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center" style={{ color: '#8D99AE' }}>
                <span className="text-sm">{isEn ? 'No data available' : 'Sin datos disponibles'}</span>
              </div>
            )}

            {/* Caption + link */}
            <div className="mt-3 flex items-start justify-between gap-4">
              <p className="text-xs leading-relaxed" style={{ color: '#8D99AE' }}>
                {selectedIndicator === 'prices' && (isEn
                  ? 'Index base 100 = start of month. Amber = food sub-index. Terracotta = all items.'
                  : 'Base 100 = inicio de mes. Ámbar = sub-índice alimentos. Terracota = general.')}
                {selectedIndicator === 'irp' && (isEn
                  ? '7-day moving average of political risk. Yellow dashed = historical average (100). Red dashed = ELEVADO threshold (150).'
                  : 'Promedio móvil 7 días del riesgo político. Punteado amarillo = promedio histórico (100). Punteado rojo = umbral ELEVADO (150).')}
                {selectedIndicator === 'pbi' && (isEn
                  ? 'YoY % change. Dark bars = INEI official data. Teal bar = Qhawarina nowcast for latest quarter.'
                  : '% variación interanual. Barras oscuras = datos oficiales INEI. Barra teal = nowcast Qhawarina.')}
                {selectedIndicator === 'inflation' && (isEn
                  ? 'Monthly % change. Teal lines = BCRP 1–3% target band. Terracotta bar = latest nowcast.'
                  : '% variación mensual. Líneas teal = meta BCRP 1–3%. Barra terracota = último nowcast.')}
              </p>
              <Link href={INDICATOR_META[selectedIndicator].href}
                className="text-xs font-medium hover:underline shrink-0"
                style={{ color: '#C65D3E' }}>
                {isEn ? 'Full analysis →' : 'Análisis completo →'}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Risk Drivers ─────────────────────────────────────────────── */}
        {(polDrivers.length > 0 || ecoDrivers.length > 0) && (
          <section className="mb-8">
            <h2 className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#8D99AE' }}>
              {isEn ? "Today's Risk Drivers" : 'Drivers de Riesgo Hoy'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {polDrivers.length > 0 && (
                <div className="p-5 rounded-xl"
                  style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderLeft: '4px solid #C65D3E' }}>
                  <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#C65D3E' }}>
                    {isEn ? 'Political Risk — IRP drivers' : 'Riesgo Político — drivers del IRP'}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {polDrivers.map((d: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: dotColor(d.score) }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug" style={{ color: '#2D3142' }}>
                            {d.title.length > 90 ? d.title.slice(0, 90) + '…' : d.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                            {srcLabel(d.source)} · pol={d.score}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid #E8E4DF' }}>
                    <Link href="/estadisticas/riesgo-politico" className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                      {isEn ? 'Full political risk analysis →' : 'Análisis completo →'}
                    </Link>
                  </div>
                </div>
              )}

              {ecoDrivers.length > 0 && (
                <div className="p-5 rounded-xl"
                  style={{ background: '#FFFCF7', border: '1px solid #E8E4DF', borderLeft: '4px solid #2A9D8F' }}>
                  <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#2A9D8F' }}>
                    {isEn ? 'Economic Risk — IRE drivers' : 'Riesgo Económico — drivers del IRE'}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {ecoDrivers.map((d: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full" style={{ background: dotColor(d.score) }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug" style={{ color: '#2D3142' }}>
                            {d.title.length > 90 ? d.title.slice(0, 90) + '…' : d.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>
                            {srcLabel(d.source)} · eco={d.score}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2.5" style={{ borderTop: '1px solid #E8E4DF' }}>
                    <Link href="/estadisticas/riesgo-economico" className="text-xs hover:underline" style={{ color: '#2A9D8F' }}>
                      {isEn ? 'Full economic risk analysis →' : 'Análisis completo →'}
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </section>
        )}

        {/* ── Price Movers + Secondary KPIs ────────────────────────────── */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Price movers — 2/3 width */}
            {topMovers.length > 0 && (
              <div className="md:col-span-2 p-5 rounded-xl"
                style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8D99AE' }}>
                    {isEn ? "Today's Price Movers" : 'Mayor Movimiento de Precios Hoy'}
                  </div>
                  <Link href="/estadisticas/precios-diarios" className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                    {isEn ? 'All prices →' : 'Todos los precios →'}
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {topMovers.slice(0, 6).map((m: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1.5"
                      style={{ borderBottom: i < topMovers.slice(0, 6).length - 2 ? '1px solid #E8E4DF' : 'none' }}>
                      <span className="text-sm" style={{ color: '#2D3142' }}>
                        {isEn ? m.label_en : m.label_es}
                      </span>
                      <span className="text-sm font-semibold tabular-nums ml-3"
                        style={{ color: m.var > 0 ? '#9B2226' : '#2A9D8F', fontFamily: 'ui-monospace, monospace' }}>
                        {m.var >= 0 ? '+' : ''}{m.var.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: '#8D99AE' }}>
                  {isEn
                    ? `${data?.prices?.latest?.n_products_today?.toLocaleString() ?? '—'} prices tracked · Plaza Vea · Metro · Wong`
                    : `${data?.prices?.latest?.n_products_today?.toLocaleString() ?? '—'} precios rastreados · Plaza Vea · Metro · Wong`}
                </p>
              </div>
            )}

            {/* FX + Poverty stacked — 1/3 width */}
            <div className="flex flex-col gap-3">
              <Link href="/estadisticas/intervenciones" className="block group">
                <div className="p-4 rounded-xl transition-shadow group-hover:shadow-sm"
                  style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                    TC PEN/USD
                  </div>
                  <div className="text-2xl font-bold tabular-nums leading-none"
                    style={{ color: '#2D3142', fontFamily: 'ui-monospace, monospace' }}>
                    {data?.fx?.latest?.fx != null ? `S/ ${data.fx.latest.fx.toFixed(4)}` : '—'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                    {data?.fx?.latest?.date ? formatDateShort(data.fx.latest.date, isEn) : 'BCRP'}
                  </div>
                </div>
              </Link>
              <Link href="/estadisticas/pobreza" className="block group">
                <div className="p-4 rounded-xl transition-shadow group-hover:shadow-sm"
                  style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                  <div className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#8D99AE' }}>
                    {isEn ? 'Poverty Rate' : 'Tasa de Pobreza'}
                  </div>
                  <div className="text-2xl font-bold tabular-nums leading-none"
                    style={{ color: '#E0A458', fontFamily: 'ui-monospace, monospace' }}>
                    {povertyVal != null ? `${povertyVal.toFixed(1)}%` : '—'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#8D99AE' }}>
                    Nowcast {data?.poverty?.metadata?.target_year ?? '—'}
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </section>

        {/* ── Update note ──────────────────────────────────────────────── */}
        <section className="mb-8">
          <p className="text-xs text-center" style={{ color: '#8D99AE' }}>
            {isEn
              ? 'Indices updated daily at 9:00 PM Peru time (PET)'
              : 'Índices actualizados todos los días a las 9:00 PM hora peruana (PET)'}
          </p>
        </section>

        {/* ── Latest columns ───────────────────────────────────────────── */}
        {latestArticles.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8D99AE' }}>
                {isEn ? 'Latest Columns' : 'Últimas publicaciones'}
              </h2>
              <Link href="/columnas" className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                {isEn ? 'View all →' : 'Ver todas →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestArticles.map((art: any) => (
                <Link key={art.slug} href={`/columnas/${art.slug}`} className="block group">
                  <div className="p-5 h-full rounded-xl"
                    style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
                    <div className="text-xs mb-2" style={{ color: '#8D99AE' }}>
                      {new Date(art.date + 'T12:00:00').toLocaleDateString(
                        isEn ? 'en-US' : 'es-PE',
                        { day: 'numeric', month: 'long', year: 'numeric' }
                      )}
                      {' · '}{art.author?.split(' ')[0]}
                    </div>
                    <h3 className="text-base font-semibold leading-snug mb-2 group-hover:underline"
                      style={{ color: '#2D3142', fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                      {art.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#8D99AE' }}>
                      {art.excerpt?.slice(0, 120)}{(art.excerpt?.length ?? 0) > 120 ? '…' : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(art.tags ?? []).slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded"
                          style={{ background: '#C65D3E15', color: '#C65D3E', border: '1px solid #C65D3E20' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Journalist tools ─────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8D99AE' }}>
            {isEn ? 'For Journalists & Researchers' : 'Para Periodistas e Investigadores'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Downloads */}
            <div className="p-6 rounded-xl" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#C65D3E' }}>
                {isEn ? 'Open Data · CC BY 4.0' : 'Datos Abiertos · CC BY 4.0'}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#2D3142', opacity: 0.8 }}>
                {isEn
                  ? 'All data and methodology are open. Download daily series, cite freely, and build on our work. We respond to media inquiries within 24h.'
                  : 'Todos los datos y la metodología son abiertos. Descarga series diarias, cita libremente y construye sobre nuestro trabajo. Respondemos consultas de medios en 24h.'}
              </p>
              <div className="flex flex-col gap-2.5">
                <Link href="/metodologia"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#C65D3E' }}>
                  → {isEn ? 'Read the methodology' : 'Leer la metodología'}
                </Link>
                <a href="/assets/data/daily_price_index.json" download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}>
                  ↓ {isEn ? 'Price data (JSON)' : 'Datos de precios (JSON)'}
                </a>
                <a href="/assets/data/csv/precios_diarios.csv" download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}>
                  ↓ {isEn ? 'Price data (CSV)' : 'Datos de precios (CSV)'}
                </a>
                <a href="/assets/data/political_index_daily.json" download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}>
                  ↓ {isEn ? 'Political risk data (JSON)' : 'Riesgo político (JSON)'}
                </a>
                <a href="/feed.xml"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#8D99AE' }}>
                  ⟳ RSS Feed
                </a>
              </div>
            </div>

            {/* Citation */}
            <div className="p-6 rounded-xl" style={{ background: '#FFFCF7', border: '1px solid #E8E4DF' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#C65D3E' }}>
                {isEn ? 'Cite Qhawarina' : 'Citar Qhawarina'}
              </div>
              <div className="text-xs font-mono p-3 mb-3 leading-relaxed"
                style={{ background: '#FAF8F4', border: '1px solid #E8E4DF', borderRadius: 4, color: '#2D3142' }}>
                Qhawarina ({new Date().getFullYear()}).{' '}
                <em>Índice de Precios Diarios e Índice de Riesgo Político para Perú</em>.
                {' '}qhawarina.pe. Licencia CC BY 4.0.
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(citationText).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded transition-all mb-4"
                style={{
                  background: copied ? '#2A9D8F20' : '#2D314210',
                  color:      copied ? '#2A9D8F'   : '#2D3142',
                  border:     `1px solid ${copied ? '#2A9D8F40' : '#2D314220'}`,
                }}>
                {copied ? (isEn ? 'Copied!' : '¡Copiado!') : (isEn ? 'Copy citation' : 'Copiar cita')}
              </button>
              <div className="text-sm space-y-1.5" style={{ color: '#8D99AE' }}>
                <div>
                  {isEn ? 'Sources: ' : 'Fuentes: '}
                  <span style={{ color: '#2D3142' }}>BCRP, INEI, ENAHO, MIDAGRI, Plaza Vea, Metro, Wong</span>
                </div>
                <div>
                  {isEn ? 'Update freq.: ' : 'Frecuencia: '}
                  <span style={{ color: '#2D3142' }}>{isEn ? 'Daily at 21:00 PET' : 'Diaria a las 21:00 PET'}</span>
                </div>
                <div>
                  {isEn ? 'License: ' : 'Licencia: '}
                  <span style={{ color: '#2D3142' }}>CC BY 4.0</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ background: '#FAF8F4', minHeight: '100vh' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-10 animate-pulse">
        <div className="h-10 rounded w-1/2 mb-4" style={{ background: '#E8E4DF' }} />
        <div className="h-4 rounded w-2/3 mb-10" style={{ background: '#E8E4DF' }} />
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-lg" style={{ background: '#E8E4DF' }} />)}
        </div>
        <div className="h-40 rounded-xl mb-8" style={{ background: '#E8E4DF' }} />
        <div className="grid grid-cols-3 gap-5 mb-8">
          {[1,2,3].map(i => <div key={i} className="h-52 rounded-lg" style={{ background: '#E8E4DF' }} />)}
        </div>
        <div className="h-80 rounded-xl" style={{ background: '#E8E4DF' }} />
      </div>
    </div>
  );
}
