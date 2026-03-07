'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

const ENDPOINTS = [
  {
    path: '/assets/data/political_index_daily.json',
    nameEn: 'Political Risk Index',
    nameEs: 'Índice de Riesgo Político',
    descEn: 'Daily EPU-style instability index for Peru. Classified by Claude Haiku from 11 RSS feeds · 6 sources.',
    descEs: 'Índice diario de inestabilidad tipo EPU para Perú. Clasificado con Claude Haiku desde 11 feeds RSS · 6 fuentes.',
    keysEn: ['metadata.generated_at', 'metadata.rss_feeds', 'current.date', 'current.score (0–1)', 'current.level', 'current.articles_total', 'daily_series[]', 'monthly_series[]', 'aggregates'],
    update: 'Daily',
    updateEs: 'Diario',
    response: `{
  "metadata": { "generated_at": "2026-03-07T03:35:00Z", "rss_feeds": 11 },
  "current": { "date": "2026-03-06", "score": 0.34, "level": "MEDIO",
    "articles_total": 47, "articles_political": 21, "articles_economic": 26 },
  "aggregates": { "7d_avg": 0.31, "30d_avg": 0.29, "year_max": 0.72 },
  "daily_series": [ { "date": "...", "score": 0.34, "n_articles": 47 } ],
  "monthly_series": [ { "month": "2026-02", "political_avg": 0.31, "fx_level": 3.82 } ]
}`,
  },
  {
    path: '/assets/data/daily_price_index.json',
    nameEn: 'Daily Price Index (BPP)',
    nameEs: 'Índice de Precios Diario (BPP)',
    descEn: 'Jevons bilateral chain-linked price index from Plaza Vea, Metro and Wong. 42,000+ products.',
    descEs: 'Índice Jevons bilateral chain-linked desde Plaza Vea, Metro y Wong. 42,000+ productos.',
    keysEn: ['metadata.base_date', 'metadata.last_date', 'metadata.n_days', 'latest.index_all', 'latest.cum_pct', 'series[]', 'categories{}'],
    update: 'Daily',
    updateEs: 'Diario',
    response: `{
  "metadata": { "base_date": "2026-02-10", "last_date": "2026-03-06", "n_days": 25, "stores": ["Plaza Vea","Metro","Wong"] },
  "latest": { "date": "2026-03-06", "index_all": 101.24, "index_food": 101.57, "cum_pct": 1.24, "var_all": 0.042 },
  "series": [ { "date": "2026-02-10", "index_all": 100.0, "index_food": 100.0, "var_all": 0.0, "cum_pct": 0.0 } ],
  "categories": { "arroz_cereales": { "label_es": "Arroz y cereales", "cpi_weight": 0.048 } }
}`,
  },
  {
    path: '/assets/data/fx_interventions.json',
    nameEn: 'FX Market & BCRP Interventions',
    nameEs: 'Mercado Cambiario e Intervenciones BCRP',
    descEn: 'PEN/USD exchange rate, BCRP spot and swap interventions, reference rate, BVL and sovereign bonds. Daily (2 years) and monthly (since Jan 2020).',
    descEs: 'TC PEN/USD, intervenciones spot y swaps BCRP, tasa referencia, BVL y bonos soberanos. Diario (2 años) y mensual (desde ene 2020).',
    keysEn: ['latest{fx, reference_rate, spot_net_purchases, bond_sol_10y, bvl}', 'daily_series[]', 'monthly_series[]'],
    update: 'Daily',
    updateEs: 'Diario',
    response: `{
  "metadata": { "coverage": "2020-01 to present", "n_days_daily": 456, "n_months_monthly": 75 },
  "latest": { "date": "2026-03-06", "fx": 3.8241, "reference_rate": 4.75,
    "spot_net_purchases": 50.0, "bond_sol_10y": 6.84, "bvl": 22150.3 },
  "daily_series": [ { "date": "2026-03-06", "fx": 3.8241, "spot_net_purchases": 50.0 } ],
  "monthly_series": [ { "month": "2026-02", "fx_avg": 3.8190, "spot_net_purchases": 320.0 } ]
}`,
  },
  {
    path: '/assets/data/gdp_nowcast.json',
    nameEn: 'GDP Nowcast',
    nameEs: 'Nowcast PBI',
    descEn: 'Quarterly GDP growth nowcast (YoY %) using DFM + Ridge bridge. Updated weekly on Sundays.',
    descEs: 'Nowcast de crecimiento del PBI trimestral (% interanual) con DFM + puente Ridge. Actualizado semanalmente los domingos.',
    keysEn: ['nowcast.target_period', 'nowcast.value', 'nowcast.bridge_r2', 'backtest_metrics{rmse, r2, relative_rmse_vs_ar1}', 'recent_quarters[]'],
    update: 'Weekly (Sundays)',
    updateEs: 'Semanal (domingos)',
    response: `{
  "metadata": { "generated_at": "2026-03-01T04:00:00Z" },
  "nowcast": { "target_period": "2025-Q4", "value": 2.26, "bridge_r2": 0.934 },
  "backtest_metrics": { "rmse": 1.47, "r2": 0.87, "relative_rmse_vs_ar1": 0.69 },
  "recent_quarters": [ { "quarter": "2025-Q3", "official": 3.1, "nowcast": 2.9, "error": -0.2 } ]
}`,
  },
  {
    path: '/assets/data/inflation_nowcast.json',
    nameEn: 'Inflation Nowcast',
    nameEs: 'Nowcast Inflación',
    descEn: 'Monthly inflation nowcast (3-month MA %) using DFM with AR(1) component. Updated weekly on Sundays.',
    descEs: 'Nowcast de inflación mensual (MA3M %) con DFM y componente AR(1). Actualizado semanalmente los domingos.',
    keysEn: ['nowcast.target_period', 'nowcast.value', 'backtest_metrics{rmse, relative_rmse_vs_ar1}', 'recent_months[]'],
    update: 'Weekly (Sundays)',
    updateEs: 'Semanal (domingos)',
    response: `{
  "metadata": { "generated_at": "2026-03-01T04:00:00Z" },
  "nowcast": { "target_period": "2026-03", "value": 0.213, "bridge_r2": 0.199 },
  "backtest_metrics": { "rmse": 0.319, "relative_rmse_vs_ar1": 0.991 },
  "recent_months": [ { "month": "2026-02", "official": 0.19, "nowcast": 0.21, "error": 0.02 } ]
}`,
  },
  {
    path: '/assets/data/poverty_nowcast.json',
    nameEn: 'Poverty Nowcast',
    nameEs: 'Nowcast Pobreza',
    descEn: 'Annual monetary poverty rate nowcast for Peru and 24 departments using Gradient Boosting + NTL satellite data. Updated annually.',
    descEs: 'Nowcast anual de tasa de pobreza monetaria para Perú y 24 departamentos con GBR + datos NTL satelital. Actualizado anualmente.',
    keysEn: ['national.poverty_rate', 'metadata.target_year', 'backtest_metrics', 'departments[]', 'historical_series[]'],
    update: 'Annual',
    updateEs: 'Anual',
    response: `{
  "metadata": { "target_year": 2025, "generated_at": "2026-01-15T00:00:00Z" },
  "national": { "poverty_rate": 26.0, "extreme_poverty_rate": 4.8 },
  "backtest_metrics": { "rmse": 2.54, "relative_rmse_vs_ar1": 0.953 },
  "departments": [ { "code": "15", "name": "Lima", "poverty_rate_2024": 13.8, "poverty_rate_2025_nowcast": 13.5, "change_pp": -0.3 } ]
}`,
  },
  {
    path: '/assets/data/pipeline_status.json',
    nameEn: 'Pipeline Status',
    nameEs: 'Estado del Pipeline',
    descEn: 'Last pipeline run time and per-step status (supermarket scrape, RSS classification). Use to check data freshness.',
    descEs: 'Última ejecución del pipeline y estado por paso (scraping supermercados, clasificación RSS). Para verificar frescura de datos.',
    keysEn: ['run_time', 'supermarket{passed, n_products}', 'rss{passed, n_articles}'],
    update: 'Daily',
    updateEs: 'Diario',
    response: `{
  "run_time": "2026-03-07T03:35:00Z",
  "supermarket": { "passed": true, "n_products": 42317, "stores_ok": 3 },
  "rss": { "passed": true, "n_articles": 47, "feeds_ok": 11 }
}`,
  },
];

export default function DataAccessPage() {
  const isEn = useLocale() === 'en';
  const [openEndpoint, setOpenEndpoint] = useState<string | null>(null);

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isEn ? 'Data Access' : 'Acceso a Datos'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {isEn
              ? 'All Qhawarina data is published as open static JSON files. No API key, no rate limits, no account needed — free forever under CC BY 4.0.'
              : 'Todos los datos de Qhawarina se publican como archivos JSON estáticos abiertos. Sin API key, sin límites de tasa, sin cuenta — gratis para siempre bajo CC BY 4.0.'}
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
              <code>{isEn
                ? `// Fetch the political risk index
const res = await fetch('https://qhawarina.pe/assets/data/political_index_daily.json');
const data = await res.json();
console.log(data.current.score);   // e.g. 0.34
console.log(data.current.level);   // e.g. "MEDIO"

// Fetch the daily price index
const prices = await fetch('https://qhawarina.pe/assets/data/daily_price_index.json').then(r => r.json());
console.log(prices.latest.cum_pct); // cumulative % change since base date`
                : `// Obtener el índice de riesgo político
const res = await fetch('https://qhawarina.pe/assets/data/political_index_daily.json');
const data = await res.json();
console.log(data.current.score);   // ej. 0.34
console.log(data.current.level);   // ej. "MEDIO"

// Obtener el índice de precios diario
const prices = await fetch('https://qhawarina.pe/assets/data/daily_price_index.json').then(r => r.json());
console.log(prices.latest.cum_pct); // % acumulado desde fecha base`}</code>
            </pre>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800">
              <strong>✓ {isEn ? 'No authentication required.' : 'Sin autenticación requerida.'}</strong>{' '}
              {isEn
                ? 'All endpoints are publicly accessible. Add a cache-busting query parameter (?v=YYYY-MM-DD) to ensure fresh data.'
                : 'Todos los endpoints son accesibles públicamente. Agrega un parámetro de caché (?v=YYYY-MM-DD) para datos frescos.'}
            </p>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEn ? 'Available Endpoints' : 'Endpoints Disponibles'}
          </h2>
          {ENDPOINTS.map((ep) => (
            <div key={ep.path} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenEndpoint(openEndpoint === ep.path ? null : ep.path)}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">GET</span>
                  <code className="text-blue-700 font-mono text-sm">{ep.path}</code>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {isEn ? ep.update : ep.updateEs}
                  </span>
                </div>
                <span className="text-gray-400 text-sm ml-2">{openEndpoint === ep.path ? '▲' : '▼'}</span>
              </button>
              <div className="px-6 pb-2">
                <p className="text-sm text-gray-600">{isEn ? ep.nameEn : ep.nameEs} — {isEn ? ep.descEn : ep.descEs}</p>
              </div>
              {openEndpoint === ep.path && (
                <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {isEn ? 'Key fields' : 'Campos principales'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ep.keysEn.map(k => (
                        <code key={k} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">{k}</code>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {isEn ? 'Example response' : 'Ejemplo de respuesta'}
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-xs"><code>{ep.response}</code></pre>
                  </div>
                  <div className="mt-4 bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-blue-300 text-xs">
                      <code>{`fetch('https://qhawarina.pe${ep.path}?v=' + new Date().toISOString().slice(0,10))
  .then(r => r.json())
  .then(data => console.log(data));`}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* License */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {isEn ? 'License & Attribution' : 'Licencia y Atribución'}
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            {isEn
              ? 'All Qhawarina data is published under Creative Commons Attribution 4.0 (CC BY 4.0). You are free to use, share and adapt the data for any purpose, as long as you give appropriate credit.'
              : 'Todos los datos de Qhawarina se publican bajo Creative Commons Attribution 4.0 (CC BY 4.0). Puedes usar, compartir y adaptar los datos para cualquier fin, siempre que des el crédito correspondiente.'}
          </p>
          <div className="bg-white rounded-lg p-4 font-mono text-xs text-gray-700 border border-blue-100">
            Qhawarina ({new Date().getFullYear()}). <em>Índice de Precios Diarios e Índice de Riesgo Político para Perú</em>. qhawarina.pe. Licencia CC BY 4.0.
          </div>
        </div>

        {/* Para instituciones */}
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="text-xl font-bold text-[#2D3142]">
                {isEn ? 'For Institutions' : 'Para instituciones'}
              </h2>
              <span className="text-xs font-semibold text-[#C65D3E] uppercase tracking-wide border border-[#C65D3E] rounded px-2 py-0.5">
                {isEn ? 'Granular data' : 'Datos granulares'}
              </span>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl">
              {isEn
                ? 'The aggregate indices above are public and always free. The granular data behind them — product-level prices, article feeds, category indices, departmental poverty — is available to institutional clients on request.'
                : 'Los índices agregados de arriba son públicos y siempre gratuitos. Los datos granulares que los generan — precios por producto, feeds de artículos, índices por categoría, pobreza departamental — están disponibles para clientes institucionales bajo solicitud.'}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {(isEn ? [
              {
                title: 'Product-level price data',
                badge: '~42,000 SKUs · daily',
                desc: 'Full product feed from Plaza Vea, Metro and Wong: product name, SKU, store, category, price, daily change. Delivered as CSV or JSON. Historical archive from launch.',
                who: 'BCRP, consumer goods companies, hedge funds, consulting firms.',
              },
              {
                title: 'Category-level inflation indices',
                badge: '8–10 categories · daily',
                desc: 'Daily price indices disaggregated by basket: meat, dairy, cereals, oils, vegetables, eggs, poultry, personal care, cleaning. With 30-day, 90-day and YoY rates.',
                who: 'Corporate strategy teams, food industry analysts, macro investors.',
              },
              {
                title: 'Political risk article feed',
                badge: 'NLP-classified · daily',
                desc: 'Each article processed by Claude Haiku: headline, source, date, political category, severity, driver phrase. A curated Peruvian political news feed with quantified risk.',
                who: 'Political risk consultancies, embassies, investment banks with Peru exposure.',
              },
              {
                title: 'Departmental poverty tracking',
                badge: '24 departments · quarterly',
                desc: 'Quarterly poverty rate projections with confidence intervals for all 24 departments, between ENAHO publication years. District-level estimates as add-on.',
                who: 'MIDIS, World Bank, IDB, UNDP, mining companies (social impact monitoring).',
              },
            ] : [
              {
                title: 'Precios a nivel de producto',
                badge: '~42,000 SKUs · diario',
                desc: 'Feed completo de Plaza Vea, Metro y Wong: nombre, SKU, tienda, categoría, precio y variación diaria. Entregado como CSV o JSON. Archivo histórico desde el lanzamiento.',
                who: 'BCRP, empresas de consumo masivo, fondos de inversión, consultoras.',
              },
              {
                title: 'Índices de inflación por categoría',
                badge: '8–10 categorías · diario',
                desc: 'Índices de precios diarios desagregados por canasta: carnes, lácteos, cereales, aceites, verduras, huevos, aves, cuidado personal, limpieza. Con tasas a 30, 90 días e interanual.',
                who: 'Equipos de estrategia corporativa, analistas de industria alimentaria, inversores macro.',
              },
              {
                title: 'Feed de artículos de riesgo político',
                badge: 'Clasificado con NLP · diario',
                desc: 'Cada artículo procesado con Claude Haiku: titular, fuente, fecha, categoría política, severidad y frase driver. Un feed periodístico peruano con riesgo cuantificado.',
                who: 'Consultoras de riesgo político, embajadas, bancos de inversión con exposición a Perú.',
              },
              {
                title: 'Seguimiento de pobreza departamental',
                badge: '24 departamentos · trimestral',
                desc: 'Proyecciones trimestrales de tasa de pobreza con intervalos de confianza para los 24 departamentos, entre publicaciones ENAHO. Estimaciones distritales como complemento.',
                who: 'MIDIS, Banco Mundial, BID, PNUD, empresas mineras (monitoreo de impacto social).',
              },
            ]).map(item => (
              <div key={item.title} className="px-8 py-5">
                <div className="flex items-baseline gap-3 mb-1">
                  <h3 className="text-sm font-semibold text-[#2D3142]">{item.title}</h3>
                  <span className="text-xs text-gray-400">{item.badge}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-gray-500">{isEn ? 'Relevant to: ' : 'Para: '}</span>
                  {item.who}
                </p>
              </div>
            ))}
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isEn ? 'Institutional inquiries: ' : 'Consultas institucionales: '}
              <a
                href="mailto:cchavezp@qhawarina.pe?subject=Consulta institucional — datos granulares"
                className="text-[#C65D3E] hover:underline font-medium"
              >
                cchavezp@qhawarina.pe
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
