'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import PriceIndexCard from './components/hero/PriceIndexCard';
import IrpCard from './components/hero/IrpCard';
import IreCard from './components/hero/IreCard';

const WATERMARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

function zoneColor(prr: number): string {
  if (prr < 50)  return '#8D99AE';
  if (prr < 90)  return '#2A9D8F';
  if (prr < 110) return '#E9C46A';
  if (prr < 150) return '#C65D3E';
  if (prr < 200) return '#9B2226';
  return '#6B0000';
}

export default function HomePage() {
  const isEn = useLocale() === 'en';
  const [data, setData]                     = useState<any>(null);
  const [loading, setLoading]               = useState(true);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [notaDiaria, setNotaDiaria]         = useState<any>(null);
  const [columnas, setColumnas]             = useState<any[]>([]);
  const [copied, setCopied]                 = useState(false);

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


  if (loading) return <LoadingSkeleton />;

  // ── Derived values ────────────────────────────────────────────────────────
  const isStale = pipelineStatus?.run_time
    ? (Date.now() - new Date(pipelineStatus.run_time).getTime()) / 3_600_000 > 36
    : false;
  const hasErrors = pipelineStatus &&
    (['supermarket', 'rss'] as const).some(k => pipelineStatus[k] && !pipelineStatus[k].passed);
  const todayStr = new Date().toISOString().slice(0, 13);

  const gdpValue = data?.gdp?.nowcast?.value;
  const gdpColor = gdpValue != null ? (gdpValue >= 0 ? '#2A9D8F' : '#9B2226') : '#2D3142';
  const irp7d    = data?.political?.current?.political_7d ?? 0;
  const irpLevel = data?.political?.current?.political_level ?? 'BAJO';
  const irpColor = zoneColor(irp7d);
  const ipdCum   = data?.prices?.latest?.cum_pct ?? 0;
  const ipdColor = ipdCum > 0 ? '#C65D3E' : '#2A9D8F';

  const latestArticles = [...columnas].sort((a, b) => b.date > a.date ? 1 : -1).slice(0, 3);
  const citationText = `Qhawarina (${new Date().getFullYear()}). Índice de Precios Diarios e Índice de Riesgo Político para Perú. qhawarina.pe. Licencia CC BY 4.0.`;

  return (
    <div style={{ background: '#FAF8F4', backgroundImage: WATERMARK, minHeight: '100vh' }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFFCF7', borderBottom: '1px solid #E8E4DC' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">

          {/* Live badge */}
          <div className="flex items-center gap-2 mb-5">
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

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl leading-tight mb-4 max-w-3xl"
            style={{ color: '#2D3142', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            {isEn ? <>Peru&apos;s economy,<br /><span style={{ color: '#C65D3E' }}>in real time.</span></>
                  : <>La economía peruana,<br /><span style={{ color: '#C65D3E' }}>en tiempo real.</span></>}
          </h1>
          <p className="text-lg max-w-xl leading-relaxed mb-8" style={{ color: '#6b7280' }}>
            {isEn
              ? 'Daily prices, political risk, GDP nowcast and poverty indicators — built on 42,000+ supermarket products and machine-learning models.'
              : 'Precios diarios, riesgo político, nowcast de PBI e indicadores de pobreza — basados en 42,000+ productos y modelos de machine learning.'}
          </p>

          {/* 3 live stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl">
            <Link href="/estadisticas/pbi" className="block group">
              <div className="p-4 rounded-xl transition-all group-hover:shadow-md"
                style={{ background: '#FAF8F4', border: '1px solid #E8E4DC', borderTop: `3px solid ${gdpColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'GDP Nowcast' : 'PBI Nowcast'}
                </div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: gdpColor, fontFamily: 'ui-monospace, monospace' }}>
                  {gdpValue != null ? `${gdpValue >= 0 ? '+' : ''}${gdpValue.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>{data?.gdp?.nowcast?.target_period ?? 'YoY'}</div>
              </div>
            </Link>
            <Link href="/estadisticas/riesgo-politico" className="block group">
              <div className="p-4 rounded-xl transition-all group-hover:shadow-md"
                style={{ background: '#FAF8F4', border: '1px solid #E8E4DC', borderTop: `3px solid ${irpColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Political Risk' : 'Riesgo Político'}
                </div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: irpColor, fontFamily: 'ui-monospace, monospace' }}>
                  {Math.round(irp7d)}
                </div>
                <div className="text-xs mt-0.5 font-semibold" style={{ color: irpColor }}>{irpLevel}</div>
              </div>
            </Link>
            <Link href="/estadisticas/precios-diarios" className="block group">
              <div className="p-4 rounded-xl transition-all group-hover:shadow-md"
                style={{ background: '#FAF8F4', border: '1px solid #E8E4DC', borderTop: `3px solid ${ipdColor}` }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>
                  {isEn ? 'Price Index' : 'Índice de Precios'}
                </div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: ipdColor, fontFamily: 'ui-monospace, monospace' }}>
                  {ipdCum >= 0 ? '+' : ''}{ipdCum.toFixed(2)}%
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>{isEn ? 'month-to-date' : 'mes en curso'}</div>
              </div>
            </Link>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link href="/estadisticas/pbi"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#C65D3E', color: '#fff' }}>
              {isEn ? 'Explore data' : 'Explorar datos'}
            </Link>
          </div>
        </div>
      </section>

      {/* ── NOTA DIARIA + INDEX CARDS ─────────────────────────────────────── */}
      <section style={{ background: '#FAF8F4', borderBottom: '1px solid #E8E4DC' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-10">

          {/* Stale / error banner */}
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

          {/* Nota Diaria */}
          {notaDiaria && (
            <div className="mb-8">
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
            </div>
          )}

          {/* Index cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data?.prices    && <PriceIndexCard data={data.prices}    isEn={isEn} />}
            {data?.political && <IrpCard        data={data.political} isEn={isEn} />}
            {data?.political && <IreCard        data={data.political} isEn={isEn} />}
          </div>

        </div>
      </section>

      {/* ── CREDIBILITY BAR ────────────────────────────────────────────────── */}
      <section style={{ background: '#2D3142', borderBottom: '1px solid #3d4160' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[
              { value: '42k+', label: isEn ? 'products tracked' : 'productos rastreados' },
              { value: '84',   label: isEn ? 'economic series' : 'series económicas' },
              { value: '1,891', label: isEn ? 'districts covered' : 'distritos cubiertos' },
              { value: 'CC BY 4.0', label: isEn ? 'open data license' : 'licencia datos abiertos' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-bold" style={{ color: '#C65D3E', fontFamily: 'ui-monospace, monospace' }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section style={{ background: '#FAF8F4', borderBottom: '1px solid #E8E4DC' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <h2 className="text-center text-2xl mb-2" style={{ color: '#2D3142', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            {isEn ? 'What Qhawarina offers' : 'Qué ofrece Qhawarina'}
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: '#8D99AE' }}>
            {isEn ? 'Four complementary lenses on the Peruvian economy' : 'Cuatro lentes complementarios sobre la economía peruana'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                href: '/estadisticas/precios-diarios',
                color: '#C65D3E',
                icon: '📊',
                title: isEn ? 'Daily Prices' : 'Precios Diarios',
                desc: isEn
                  ? 'Jevons price index from 42k+ supermarket SKUs. Updated every night from Plaza Vea, Metro, and Wong.'
                  : 'Índice de precios Jevons con 42k+ SKUs de supermercado. Actualizado cada noche de Plaza Vea, Metro y Wong.',
              },
              {
                href: '/estadisticas/riesgo-politico',
                color: '#9B2226',
                icon: '🔴',
                title: isEn ? 'Political Risk' : 'Riesgo Político',
                desc: isEn
                  ? 'IRP and IRE indices built from 10 news sources. Tracks political and economic stability in real time.'
                  : 'Índices IRP e IRE construidos con 10 fuentes de noticias. Monitorea estabilidad política y económica en tiempo real.',
              },
              {
                href: '/estadisticas/pbi',
                color: '#2A9D8F',
                icon: '📈',
                title: isEn ? 'GDP & Inflation' : 'PBI e Inflación',
                desc: isEn
                  ? 'Machine-learning nowcasts for quarterly GDP and monthly inflation, updated as new data arrives.'
                  : 'Nowcasts de machine learning para PBI trimestral e inflación mensual, actualizados con cada dato nuevo.',
              },
              {
                href: '/datos',
                color: '#E0A458',
                icon: '🗂️',
                title: isEn ? 'Open Data & API' : 'Datos Abiertos y API',
                desc: isEn
                  ? 'All series downloadable as CSV/JSON. REST API with 100 free calls/day. CC BY 4.0 license.'
                  : 'Todas las series descargables en CSV/JSON. API REST con 100 llamadas gratuitas/día. Licencia CC BY 4.0.',
              },
            ].map(({ href, color, icon, title, desc }) => (
              <Link key={href} href={href} className="block group">
                <div className="h-full p-6 rounded-xl transition-all group-hover:shadow-md"
                  style={{ background: '#FFFCF7', border: '1px solid #E8E4DC', borderTop: `3px solid ${color}` }}>
                  <div className="text-2xl mb-3">{icon}</div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: '#2D3142' }}>{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8D99AE' }}>{desc}</p>
                  <div className="mt-4 text-xs font-semibold" style={{ color }}>
                    {isEn ? 'View →' : 'Ver →'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUBLICATIONS + JOURNALISTS ────────────────────────────────────── */}
      <main className="max-w-[1200px] mx-auto px-6 py-10">

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

      {/* ── ENTERPRISE CTA ────────────────────────────────────────────────── */}
      <section style={{ background: '#2D3142', borderTop: '1px solid #3d4160' }}>
        <div className="max-w-[1200px] mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl mb-3"
            style={{ color: '#FAF8F4', fontFamily: 'var(--font-serif, Georgia, serif)', fontWeight: 400 }}>
            {isEn ? 'Do you need economic data for your organization?' : '¿Necesitas datos económicos para tu empresa?'}
          </h2>
          <p className="text-sm mb-8 max-w-xl mx-auto" style={{ color: '#8D99AE' }}>
            {isEn
              ? 'Pro and Enterprise plans include full API access, custom reports, and dedicated support for businesses, media, and research institutions.'
              : 'Los planes Pro y Empresarial incluyen acceso completo a la API, reportes personalizados y soporte dedicado para empresas, medios e instituciones.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/pricing"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#C65D3E', color: '#fff' }}>
              {isEn ? 'See plans & pricing' : 'Ver planes y precios'}
            </Link>
            <Link href="/institucional"
              className="px-6 py-3 rounded-lg text-sm font-semibold transition-all"
              style={{ background: 'transparent', color: '#FAF8F4', border: '1.5px solid #FAF8F430' }}>
              {isEn ? 'For institutions' : 'Para instituciones'}
            </Link>
          </div>
        </div>
      </section>

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
