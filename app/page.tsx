'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  CHART_COLORS, tooltipContentStyle,
} from './lib/chartTheme';
import PriceIndexCard from "./components/hero/PriceIndexCard";
import PoliticalRiskCard from "./components/hero/PoliticalRiskCard";

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string, isEn: boolean): string {
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

function MiniCard({ label, value, sub, href, valueColor }: {
  label: string; value: string; sub: string; href: string; valueColor?: string;
}) {
  return (
    <Link href={href} className="block group p-4 transition-shadow hover:shadow-sm"
      style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 6 }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8D99AE' }}>
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums leading-none"
        style={{ color: valueColor ?? '#2D3142', fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontFeatureSettings: '"tnum"' }}>
        {value}
      </div>
      <div className="text-xs mt-1.5 group-hover:underline" style={{ color: '#8D99AE' }}>
        {sub}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [notaDiaria, setNotaDiaria] = useState<any>(null);
  const [columnas, setColumnas] = useState<any[]>([]);

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
        gdp:       gdpR.status === 'fulfilled'    ? gdpR.value    : null,
        inflation: inflR.status === 'fulfilled'   ? inflR.value   : null,
        poverty:   povR.status === 'fulfilled'    ? povR.value    : null,
        political: polR.status === 'fulfilled'    ? polR.value    : null,
        fx:        fxR.status === 'fulfilled'     ? fxR.value     : null,
        prices:    pricesR.status === 'fulfilled' ? pricesR.value : null,
      });
      if (statusR.status === 'fulfilled') setPipelineStatus(statusR.value);
      if (notaR.status === 'fulfilled') setNotaDiaria(notaR.value);
      setLoading(false);
    });
    fetch('/assets/columnas/index.json')
      .then(r => r.json()).then(d => setColumnas(d)).catch(() => {});
  }, []);

  if (loading) return <LoadingSkeleton />;

  const isStale = (() => {
    if (!pipelineStatus?.run_time) return false;
    const ageH = (Date.now() - new Date(pipelineStatus.run_time).getTime()) / 3_600_000;
    return ageH > 36;
  })();

  const hasErrors = pipelineStatus &&
    (['supermarket', 'rss'] as const).some(k => pipelineStatus[k] && !pipelineStatus[k].passed);

  const todayStr = new Date().toISOString().slice(0, 13);

  const gdpValue = data?.gdp?.nowcast?.value;
  const gdpColor = gdpValue != null ? (gdpValue >= 0 ? '#2A9D8F' : '#9B2226') : '#2D3142';

  const inflValue = data?.inflation?.nowcast?.value;
  const inflColor = inflValue != null ? (inflValue > 0.3 ? '#9B2226' : inflValue < 0 ? '#2A9D8F' : '#E0A458') : '#2D3142';

  // Mini chart data — using correct field names from JSON schema
  const inflSeries = (data?.inflation?.monthly_series ?? [])
    .filter((r: any) => r.official != null)
    .slice(-9)
    .map((r: any) => ({ date: r.month, value: r.official }));

  const polSeries = (data?.political?.monthly_series ?? [])
    .filter((r: any) => r.political_avg > 0)
    .slice(-6)
    .map((r: any) => ({ month: r.month, value: +(r.political_avg).toFixed(1) }));

  const gdpTrack = (data?.gdp?.quarterly_series ?? [])
    .filter((r: any) => r.official != null || r.nowcast != null)
    .slice(-6)
    .map((r: any) => ({
      q: r.quarter ?? '',
      INEI: r.official ?? null,
      Nowcast: r.official == null ? r.nowcast : null,
    }));

  const latestArticles = [...columnas]
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 2);

  return (
    <div style={{ background: '#FAF8F4', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── Stale / error banner ─────────────────────────────────── */}
        {(isStale || hasErrors) && (
          <div className="mb-6 px-4 py-2.5 text-sm flex items-center gap-2"
            style={{ background: '#FEF3C7', border: '1px solid #F59E0B', color: '#92400E', borderRadius: 4 }}>
            <span>⚠️</span>
            <span>
              {isStale
                ? (isEn ? 'Data may be outdated — pipeline last ran more than 36h ago.' : 'Los datos pueden estar desactualizados — el pipeline corrió hace más de 36h.')
                : (isEn ? 'Pipeline reported errors in the last run. Some data may be missing.' : 'El pipeline reportó errores en la última ejecución. Algunos datos pueden faltar.')}
            </span>
          </div>
        )}

        {/* ── Headline ────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: '#C65D3E18', color: '#C65D3E', border: '1px solid #C65D3E30' }}>
              {(() => {
                const timeStr = pipelineStatus?.run_time
                  ? new Date(pipelineStatus.run_time).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima', hour12: false,
                    }) + ' PET'
                  : '—';
                return isEn ? `Live · Updated ${timeStr}` : `En vivo · Actualizado ${timeStr}`;
              })()}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl leading-tight mb-4"
            style={{ color: '#2D3142', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            {isEn ? (
              <>High-frequency economic data<br />for Peru</>
            ) : (
              <>Datos económicos de alta frecuencia<br />para el Perú</>
            )}
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: '#8D99AE' }}>
            {isEn
              ? 'Prices, political risk, GDP and poverty — updated daily with open data.'
              : 'Precios, riesgo político, PBI y pobreza — actualizados diariamente con datos abiertos.'}
          </p>
        </section>

        {/* ── Nota Diaria ─────────────────────────────────────────── */}
        {notaDiaria && (
          <section className="mb-8">
            <div className="relative overflow-hidden"
              style={{ background: '#2D3142', borderRadius: 8, color: '#FAF8F4' }}>
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
                        ({isEn ? `Last updated: ${notaDiaria.date}` : `Última actualización: ${notaDiaria.date}`})
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

        {/* ── Hero Cards ──────────────────────────────────────────── */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data?.prices    && <PriceIndexCard   data={data.prices}   isEn={isEn} />}
            {data?.political && <PoliticalRiskCard data={data.political} isEn={isEn} />}
          </div>
        </section>

        {/* ── Secondary Strip ─────────────────────────────────────── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniCard
              label={isEn ? 'GDP Growth (YoY)' : 'PBI (interanual)'}
              value={gdpValue != null ? `${gdpValue >= 0 ? '+' : ''}${gdpValue.toFixed(1)}%` : '—'}
              sub={data?.gdp?.nowcast?.target_period ?? 'Nowcast'}
              href="/estadisticas/pbi"
              valueColor={gdpColor}
            />
            <MiniCard
              label={isEn ? 'Inflation (monthly)' : 'Inflación (mensual)'}
              value={inflValue != null ? `${inflValue >= 0 ? '+' : ''}${inflValue.toFixed(3)}%` : '—'}
              sub={data?.inflation?.nowcast?.target_period ?? 'Nowcast'}
              href="/estadisticas/inflacion"
              valueColor={inflColor}
            />
            <MiniCard
              label="TC PEN/USD"
              value={data?.fx?.latest?.fx != null ? `S/ ${data.fx.latest.fx.toFixed(4)}` : '—'}
              sub={data?.fx?.latest?.date ? formatDateShort(data.fx.latest.date, isEn) : 'BCRP'}
              href="/estadisticas/intervenciones"
            />
            <MiniCard
              label={isEn ? 'Poverty Rate' : 'Pobreza'}
              value={data?.poverty?.national?.poverty_rate != null
                ? `${data.poverty.national.poverty_rate.toFixed(1)}%` : '—'}
              sub={`ENAHO ${data?.poverty?.metadata?.target_year ?? '—'}`}
              href="/estadisticas/pobreza"
            />
          </div>
        </section>

        {/* ── Últimas publicaciones ────────────────────────────────── */}
        {latestArticles.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: '#8D99AE' }}>
                {isEn ? 'Latest Columns' : 'Últimas publicaciones'}
              </h2>
              <Link href="/columnas" className="text-xs hover:underline" style={{ color: '#C65D3E' }}>
                {isEn ? 'View all →' : 'Ver todas →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {latestArticles.map((art: any) => (
                <Link key={art.slug} href={`/columnas/${art.slug}`} className="block group">
                  <div className="p-5 h-full" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
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
                      {art.excerpt?.slice(0, 140)}{(art.excerpt?.length ?? 0) > 140 ? '…' : ''}
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

        {/* ── Para Periodistas ────────────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8D99AE' }}>
            {isEn ? 'For Journalists & Researchers' : 'Para Periodistas e Investigadores'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Open data card */}
            <div className="p-6" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
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
                  ↓ {isEn ? 'Download price data (JSON)' : 'Descargar datos de precios (JSON)'}
                </a>
                <a href="/assets/data/csv/precios_diarios.csv" download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}>
                  ↓ {isEn ? 'Download price data (CSV)' : 'Descargar datos de precios (CSV)'}
                </a>
                <a href="/assets/data/political_index_daily.json" download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}>
                  ↓ {isEn ? 'Download political risk data (JSON)' : 'Descargar datos de riesgo político (JSON)'}
                </a>
                <a href="/feed.xml"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#8D99AE' }}>
                  ⟳ {isEn ? 'RSS feed' : 'Feed RSS'}
                </a>
              </div>
            </div>

            {/* Citation card */}
            <div className="p-6" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#C65D3E' }}>
                {isEn ? 'Cite Qhawarina' : 'Citar Qhawarina'}
              </div>
              <div className="text-xs font-mono p-3 mb-4 leading-relaxed"
                style={{ background: '#FAF8F4', border: '1px solid #E8E4DC', borderRadius: 4, color: '#2D3142' }}>
                Qhawarina ({new Date().getFullYear()}). <em>Índice de Precios Diarios e Índice de Riesgo Político para Perú</em>. qhawarina.pe. Licencia CC BY 4.0.
              </div>
              <div className="text-sm space-y-1.5" style={{ color: '#8D99AE' }}>
                <div>
                  {isEn ? 'Data sources: ' : 'Fuentes: '}
                  <span style={{ color: '#2D3142' }}>BCRP, INEI, ENAHO, MIDAGRI, Plaza Vea, Metro, Wong</span>
                </div>
                <div>
                  {isEn ? 'Update frequency: ' : 'Frecuencia: '}
                  <span style={{ color: '#2D3142' }}>{isEn ? 'Daily at 08:00 PET' : 'Diaria a las 08:00 PET'}</span>
                </div>
                <div>
                  {isEn ? 'License: ' : 'Licencia: '}
                  <span style={{ color: '#2D3142' }}>CC BY 4.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Indicadores en detalle ───────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: '#8D99AE' }}>
            {isEn ? 'Indicators in Detail' : 'Indicadores en detalle'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Inflation mini chart */}
            <Link href="/estadisticas/inflacion" className="block group">
              <div className="p-5" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Monthly Inflation' : 'Inflación Mensual'}
                </div>
                <div className="text-2xl font-bold font-mono mb-3" style={{ color: inflColor }}>
                  {inflValue != null ? `${inflValue >= 0 ? '+' : ''}${inflValue.toFixed(3)}%` : '—'}
                </div>
                {inflSeries.length > 1 && (
                  <ResponsiveContainer width="100%" height={72}>
                    <AreaChart data={inflSeries} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipContentStyle}
                        formatter={(v: number | undefined) => [`${v?.toFixed(3) ?? '—'}%`, isEn ? 'Monthly' : 'Mensual']} />
                      <Area type="monotone" dataKey="value"
                        stroke={CHART_COLORS.teal} fill={CHART_COLORS.teal}
                        fillOpacity={0.12} dot={false} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                <div className="text-xs mt-2 group-hover:underline" style={{ color: '#C65D3E' }}>
                  {isEn ? 'View full analysis →' : 'Ver análisis completo →'}
                </div>
              </div>
            </Link>

            {/* Political risk mini chart */}
            <Link href="/estadisticas/riesgo-politico" className="block group">
              <div className="p-5" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Political Risk' : 'Riesgo Político'}
                </div>
                <div className="text-2xl font-bold font-mono mb-3" style={{ color: '#2D3142' }}>
                  {data?.political?.current?.score != null
                    ? Math.round(data.political.current.score)
                    : '—'}
                  <span className="text-sm font-normal ml-1" style={{ color: '#8D99AE' }}>PRR</span>
                </div>
                {polSeries.length > 1 && (
                  <ResponsiveContainer width="100%" height={72}>
                    <AreaChart data={polSeries} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipContentStyle}
                        formatter={(v: number | undefined) => [`${v?.toFixed(1) ?? '—'}/100`, isEn ? 'Risk' : 'Riesgo']} />
                      <Area type="monotone" dataKey="value"
                        stroke={CHART_COLORS.amber} fill={CHART_COLORS.amber}
                        fillOpacity={0.12} dot={false} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                <div className="text-xs mt-2 group-hover:underline" style={{ color: '#C65D3E' }}>
                  {isEn ? 'View full analysis →' : 'Ver análisis completo →'}
                </div>
              </div>
            </Link>

            {/* GDP mini chart */}
            <Link href="/estadisticas/pbi" className="block group">
              <div className="p-5" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'GDP Growth (YoY)' : 'Crecimiento PBI (interanual)'}
                </div>
                <div className="text-2xl font-bold font-mono mb-3" style={{ color: gdpColor }}>
                  {gdpValue != null ? `${gdpValue >= 0 ? '+' : ''}${gdpValue.toFixed(1)}%` : '—'}
                </div>
                {gdpTrack.length > 1 && (
                  <ResponsiveContainer width="100%" height={72}>
                    <BarChart data={gdpTrack} margin={{ top: 2, right: 2, left: -20, bottom: 0 }} barCategoryGap="20%">
                      <XAxis dataKey="q" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={tooltipContentStyle}
                        formatter={(v: number | undefined) => [`${v?.toFixed(1) ?? '—'}%`, '']} />
                      <Bar dataKey="INEI" fill={CHART_COLORS.ink3} radius={[2, 2, 0, 0]} />
                      <Bar dataKey="Nowcast" fill={CHART_COLORS.teal} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                <div className="text-xs mt-2 group-hover:underline" style={{ color: '#C65D3E' }}>
                  {isEn ? 'View full analysis →' : 'Ver análisis completo →'}
                </div>
              </div>
            </Link>

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
        <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-10"></div>
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="h-52 bg-gray-200 rounded-lg"></div>
          <div className="h-52 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    </div>
  );
}
