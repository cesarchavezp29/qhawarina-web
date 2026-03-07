'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import PriceIndexCard from "./components/hero/PriceIndexCard";
import PoliticalRiskCard from "./components/hero/PoliticalRiskCard";

// Parse YYYY-MM-DD as local date (avoids UTC-to-local day-shift bug)
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

// ─── Secondary strip mini card ────────────────────────────────────────────────
function MiniCard({
  label, value, sub, href, valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
  valueColor?: string;
}) {
  return (
    <Link href={href} className="block group p-4 transition-shadow hover:shadow-sm"
      style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 6 }}>
      <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8D99AE' }}>
        {label}
      </div>
      <div
        className="text-2xl font-bold tabular-nums leading-none"
        style={{
          color: valueColor ?? '#2D3142',
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontFeatureSettings: '"tnum"',
        }}
      >
        {value}
      </div>
      <div className="text-xs mt-1.5 group-hover:underline" style={{ color: '#8D99AE' }}>
        {sub}
      </div>
    </Link>
  );
}

// ─── Metric box (model performance) ───────────────────────────────────────────
function MetricBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="p-4" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 6 }}>
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: '#8D99AE' }}>{label}</div>
      <div className="text-xl font-bold font-mono" style={{ color: '#2D3142' }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: '#8D99AE' }}>{sub}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [notaDiaria, setNotaDiaria] = useState<any>(null);

  useEffect(() => {
    const v = new Date().toISOString().split('T')[0];
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
  }, []);

  if (loading) return <LoadingSkeleton />;

  // Pipeline staleness check (>36h since last run)
  const isStale = (() => {
    if (!pipelineStatus?.run_time) return false;
    const ageH = (Date.now() - new Date(pipelineStatus.run_time).getTime()) / 3_600_000;
    return ageH > 36;
  })();

  // Pipeline errors
  const hasErrors = pipelineStatus &&
    (['supermarket', 'rss'] as const).some(
      k => pipelineStatus[k] && !pipelineStatus[k].passed
    );

  const todayStr = new Date().toISOString().split('T')[0];

  // Secondary strip values
  const gdpValue = data?.gdp?.nowcast?.value;
  const gdpColor = gdpValue != null ? (gdpValue >= 0 ? '#2A9D8F' : '#9B2226') : '#2D3142';

  const inflValue = data?.inflation?.nowcast?.value;
  const inflColor = inflValue != null ? (inflValue > 0.3 ? '#9B2226' : inflValue < 0 ? '#2A9D8F' : '#E0A458') : '#2D3142';

  return (
    <div style={{ background: '#FAF8F4', minHeight: '100vh' }}>
      <main className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── Stale / error banner ────────────────────────────────── */}
        {(isStale || hasErrors) && (
          <div
            className="mb-6 px-4 py-2.5 text-sm flex items-center gap-2"
            style={{
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              borderRadius: 4,
            }}
          >
            <span>⚠️</span>
            <span>
              {isStale
                ? (isEn
                  ? 'Data may be outdated — pipeline last ran more than 36h ago.'
                  : 'Los datos pueden estar desactualizados — el pipeline corrió hace más de 36h.')
                : (isEn
                  ? 'Pipeline reported errors in the last run. Some data may be missing.'
                  : 'El pipeline reportó errores en la última ejecución. Algunos datos pueden faltar.')
              }
            </span>
          </div>
        )}

        {/* ── Headline ────────────────────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
              style={{ background: '#C65D3E18', color: '#C65D3E', border: '1px solid #C65D3E30' }}
            >
              {(() => {
              const timeStr = pipelineStatus?.run_time
                ? new Date(pipelineStatus.run_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima', hour12: false }) + ' PET'
                : '—';
              return isEn ? `Live · Updated ${timeStr}` : `En vivo · Actualizado ${timeStr}`;
            })()}
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl leading-tight mb-4"
            style={{
              color: '#2D3142',
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontWeight: 400,
            }}
          >
            {isEn ? (
              <>Economic Nowcasting<br />for Peru</>
            ) : (
              <>Nowcasting Económico<br />para Perú</>
            )}
          </h1>
          <p className="text-lg max-w-2xl leading-relaxed" style={{ color: '#8D99AE' }}>
            {isEn
              ? 'Daily GDP, inflation, poverty and political risk — powered by 490+ indicators, open models, and real-time data from BCRP, INEI, and Lima supermarkets.'
              : 'PBI, inflación, pobreza y riesgo político en tiempo real — impulsados por 490+ indicadores, modelos abiertos y datos de BCRP, INEI y supermercados de Lima.'}
          </p>
        </section>

        {/* ── Nota Diaria ─────────────────────────────────────────── */}
        {notaDiaria && (
          <section className="mb-8">
            <div
              className="relative overflow-hidden"
              style={{ background: '#2D3142', borderRadius: 8, color: '#FAF8F4' }}
            >
              {/* Terra→amber accent bar */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #C65D3E, #E0A458)',
                }}
              />
              <div className="p-6 pt-8 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div
                    className="text-xs font-bold tracking-widest uppercase mb-2"
                    style={{ color: '#C65D3E' }}
                  >
                    {isEn ? 'Daily Brief' : 'Nota Diaria'}
                    {notaDiaria.date !== todayStr && (
                      <span className="ml-2 normal-case font-normal" style={{ color: '#8D99AE', opacity: 0.8 }}>
                        ({isEn ? `Last updated: ${notaDiaria.date}` : `Última actualización: ${notaDiaria.date}`})
                      </span>
                    )}
                  </div>
                  <h2
                    className="text-xl mb-2"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
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
            {data?.prices   && <PriceIndexCard   data={data.prices}   isEn={isEn} />}
            {data?.political && <PoliticalRiskCard data={data.political} isEn={isEn} />}
          </div>
        </section>

        {/* ── Secondary Strip ─────────────────────────────────────── */}
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MiniCard
              label={isEn ? 'GDP Growth (YoY)' : 'PBI (interanual)'}
              value={gdpValue != null ? `${gdpValue >= 0 ? '+' : ''}${gdpValue.toFixed(1)}%` : '—'}
              sub={data?.gdp?.nowcast?.target_period ?? (isEn ? 'Nowcast' : 'Nowcast')}
              href="/estadisticas/pbi"
              valueColor={gdpColor}
            />
            <MiniCard
              label={isEn ? 'Inflation (monthly)' : 'Inflación (mensual)'}
              value={inflValue != null ? `${inflValue >= 0 ? '+' : ''}${inflValue.toFixed(3)}%` : '—'}
              sub={data?.inflation?.nowcast?.target_period ?? (isEn ? 'Nowcast' : 'Nowcast')}
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
                ? `${data.poverty.national.poverty_rate.toFixed(1)}%`
                : '—'}
              sub={`ENAHO ${data?.poverty?.metadata?.target_year ?? '—'}`}
              href="/estadisticas/pobreza"
            />
          </div>
        </section>

        {/* ── Para Periodistas ────────────────────────────────────── */}
        <section className="mb-12">
          <h2
            className="text-xs font-bold tracking-widest uppercase mb-4"
            style={{ color: '#8D99AE' }}
          >
            {isEn ? 'For Journalists & Researchers' : 'Para Periodistas e Investigadores'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Open data card */}
            <div
              className="p-6"
              style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: '#C65D3E' }}
              >
                {isEn ? 'Open Data · CC BY 4.0' : 'Datos Abiertos · CC BY 4.0'}
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#2D3142', opacity: 0.8 }}>
                {isEn
                  ? 'All data and methodology are open. Download daily series, cite freely, and build on our work. We respond to media inquiries within 24h.'
                  : 'Todos los datos y la metodología son abiertos. Descarga series diarias, cita libremente y construye sobre nuestro trabajo. Respondemos consultas de medios en 24h.'}
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/metodologia"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#C65D3E' }}
                >
                  → {isEn ? 'Read the methodology' : 'Leer la metodología'}
                </Link>
                <a
                  href="/assets/data/daily_price_index.json"
                  download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}
                >
                  ↓ {isEn ? 'Download price data (JSON)' : 'Descargar datos de precios (JSON)'}
                </a>
                <a
                  href="/assets/data/political_index_daily.json"
                  download
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#2A9D8F' }}
                >
                  ↓ {isEn ? 'Download political risk data (JSON)' : 'Descargar datos de riesgo político (JSON)'}
                </a>
                <a
                  href="/feed.xml"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#8D99AE' }}
                >
                  ⟳ {isEn ? 'RSS feed' : 'Feed RSS'}
                </a>
              </div>
            </div>

            {/* Citation card */}
            <div
              className="p-6"
              style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: '#C65D3E' }}
              >
                {isEn ? 'Cite Qhawarina' : 'Citar Qhawarina'}
              </div>
              <div
                className="text-xs font-mono p-3 mb-4 leading-relaxed"
                style={{
                  background: '#FAF8F4',
                  border: '1px solid #E8E4DC',
                  borderRadius: 4,
                  color: '#2D3142',
                }}
              >
                Qhawarina ({new Date().getFullYear()}). <em>Índice de Precios Diarios e Índice de Riesgo Político para Perú</em>. qhawarina.pe. Licencia CC BY 4.0.
              </div>
              <div className="text-sm space-y-1.5" style={{ color: '#8D99AE' }}>
                <div>
                  {isEn ? 'Data sources: ' : 'Fuentes: '}
                  <span style={{ color: '#2D3142' }}>
                    BCRP, INEI, ENAHO, MIDAGRI, Plaza Vea, Metro, Wong
                  </span>
                </div>
                <div>
                  {isEn ? 'Update frequency: ' : 'Frecuencia: '}
                  <span style={{ color: '#2D3142' }}>
                    {isEn ? 'Daily at 08:00 PET' : 'Diaria a las 08:00 PET'}
                  </span>
                </div>
                <div>
                  {isEn ? 'License: ' : 'Licencia: '}
                  <span style={{ color: '#2D3142' }}>CC BY 4.0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── About + Methodology ─────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <div
            className="p-6"
            style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#8D99AE' }}
            >
              {isEn ? 'About Qhawarina' : 'Sobre Qhawarina'}
            </h3>
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#2D3142' }}>
              {isEn
                ? 'Real-time economic nowcasting platform for Peru using Dynamic Factor Models, Gradient Boosting, and Claude Haiku classification across 490+ indicators.'
                : 'Plataforma de nowcasting económico en tiempo real para Perú utilizando Modelos de Factores Dinámicos, Gradient Boosting y clasificación con Claude Haiku sobre 490+ indicadores.'}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: '#2D3142', opacity: 0.7 }}>
              {isEn
                ? 'Daily update at 08:00 PET. All data and models are open source under CC BY 4.0.'
                : 'Actualización diaria a las 08:00 PET. Todos los datos y modelos son código abierto bajo licencia CC BY 4.0.'}
            </p>
          </div>
          <div
            className="p-6"
            style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 8 }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#8D99AE' }}
            >
              {isEn ? 'Methodology' : 'Metodología'}
            </h3>
            <ul className="text-sm space-y-2" style={{ color: '#2D3142' }}>
              {isEn ? (
                <>
                  <li><strong>GDP:</strong> DFM 2 factors · Ridge bridge (α=1.0) · 7-year rolling window</li>
                  <li><strong>Inflation:</strong> DFM 2 factors with lags + AR(1) component</li>
                  <li><strong>Poverty:</strong> GBR on departmental panel + NTL satellite disaggregation</li>
                  <li><strong>Prices:</strong> Jevons chain-linked index · Plaza Vea, Metro, Wong</li>
                  <li><strong>Political:</strong> 11 RSS feeds · 6 sources · Claude Haiku classification</li>
                </>
              ) : (
                <>
                  <li><strong>PBI:</strong> DFM 2 factores · puente Ridge (α=1.0) · ventana móvil 7 años</li>
                  <li><strong>Inflación:</strong> DFM 2 factores con rezagos + componente AR(1)</li>
                  <li><strong>Pobreza:</strong> GBR en panel departamental + desagregación NTL satelital</li>
                  <li><strong>Precios:</strong> Índice Jevons encadenado · Plaza Vea, Metro, Wong</li>
                  <li><strong>Político:</strong> 11 feeds RSS · 6 fuentes · clasificación Claude Haiku</li>
                </>
              )}
            </ul>
          </div>
        </section>

        {/* ── Model Performance ───────────────────────────────────── */}
        <section>
          <h2
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: '#8D99AE' }}
          >
            {isEn ? 'Model Performance (Out-of-Sample Backtest)' : 'Rendimiento de Modelos (Backtest Fuera de Muestra)'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricBox
              label={isEn ? 'GDP RMSE' : 'RMSE PBI'}
              value={data?.gdp?.backtest_metrics?.rmse != null
                ? `${data.gdp.backtest_metrics.rmse.toFixed(2)}pp`
                : '—'}
              sub={data?.gdp?.backtest_metrics?.r2 != null
                ? `R² = ${data.gdp.backtest_metrics.r2.toFixed(3)}`
                : 'DFM-Ridge'}
            />
            <MetricBox
              label={isEn ? 'Inflation RMSE' : 'RMSE Inflación'}
              value={data?.inflation?.backtest_metrics?.rmse != null
                ? `${data.inflation.backtest_metrics.rmse.toFixed(3)}pp`
                : '—'}
              sub={data?.inflation?.backtest_metrics?.r2 != null
                ? `R² = ${data.inflation.backtest_metrics.r2.toFixed(3)}`
                : 'DFM-AR(1)'}
            />
            <MetricBox
              label={isEn ? 'Poverty RMSE' : 'RMSE Pobreza'}
              value={data?.poverty?.backtest_metrics?.rmse != null
                ? `${data.poverty.backtest_metrics.rmse.toFixed(2)}pp`
                : '—'}
              sub="GBR"
            />
            <MetricBox
              label={isEn ? 'Coverage' : 'Cobertura'}
              value="490+"
              sub={isEn ? 'economic indicators' : 'indicadores económicos'}
            />
          </div>
        </section>

      </main>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
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
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
