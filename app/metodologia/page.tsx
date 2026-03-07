'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

function DynamicLastUpdate({ isEn }: { isEn: boolean }) {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    fetch('/assets/data/gdp_nowcast.json?v=' + new Date().toISOString().slice(0, 10))
      .then(r => r.json())
      .then(d => {
        const iso = d?.metadata?.generated_at ?? new Date().toISOString();
        setDateStr(new Date(iso).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' }));
      })
      .catch(() => setDateStr(new Date().toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: '2-digit', month: 'long', year: 'numeric' })));
  }, [isEn]);
  if (!dateStr) return null;
  return (
    <div className="flex items-center justify-end text-sm text-gray-500">
      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{isEn ? 'Last update:' : 'Última actualización:'} {dateStr}</span>
    </div>
  );
}

export default function MetodologiaPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    title: 'Methodology',
    subtitle: 'Complete technical documentation of our nowcasting models and data sources.',
    overviewTitle: 'About Our Methodology',
    overviewText: 'QHAWARINA uses advanced economic nowcasting techniques to predict key indicators of the Peruvian economy before their official publication. Our models combine:',
    items: [
      { bold: 'Dynamic Factor Models (DFM)', text: 'that summarize dozens of high-frequency indicators into latent factors' },
      { bold: 'Machine Learning', text: '(Gradient Boosting, Ridge regression) to capture non-linear relationships' },
      { bold: 'Satellite data', text: '(nighttime lights) for real-time monitoring of economic activity' },
      { bold: 'Web scraping and NLP', text: 'for high-frequency prices and analysis of political events' },
      { bold: 'Rigorous validation', text: 'through out-of-sample backtests with vintage data' },
    ],
    overviewClose: 'Our entire methodology is documented with academic transparency, including mathematical formulas, historical performance, known limitations and bibliographic references.',
    gdpTitle: 'GDP Nowcast',
    gdpDesc: 'Dynamic Factor Model with 35+ monthly indicators, Ridge bridge equation, COVID-19 handling and NTL regional disaggregation.',
    gdpStats: ['✓ RMSE: 1.47pp (pre-COVID)', '✓ R²: 0.93'],
    infTitle: 'Inflation Nowcast',
    infDesc: 'DFM with lagged factors, 3M-MA target, high-frequency prices (BPP), supermarket and MIDAGRI scraping.',
    infStats: ['✓ RMSE: ~0.32pp (variación mensual)', '✓ Mejor que AR1 y Random Walk'],
    povTitle: 'Poverty Nowcast',
    povDesc: 'Departmental panel with Gradient Boosting: predicts annual changes in poverty using GDP, food inflation, employment and nighttime lights (NTL). Temporal disaggregation Chow-Lin (annual → quarterly). Spatial distribution to districts via NTL dasymetric.',
    povStats: ['✓ RMSE: 2.54pp', '✓ Rel.RMSE: 0.953 vs AR1'],
    polTitle: 'Political Instability Index (AI-GPR)',
    polDesc: 'AI-GPR methodology (Iacoviello & Tong, 2026). Claude Haiku classifies each article by category (political/economic/both/irrelevant) and severity (0–1). PRR_t = 100 × Σs_it / S̄. Mean = 100, unbounded. Crisis periods: 200–400+.',
    polStats: ['✓ Daily update', '✓ ~3,000 articles/month classified'],
    viewMethodology: 'View full methodology',
    principlesTitle: '📊 Methodological Principles',
    principles: [
      { title: 'Transparency', text: 'We fully document our models with mathematical formulas, open source code and rigorous historical validation.' },
      { title: 'Reproducibility', text: 'All backtests use vintage data (point-in-time) to simulate real-time predictions without look-ahead bias.' },
      { title: 'Out-of-Sample Validation', text: 'We compare against naive benchmarks (AR1, Random Walk) in expanding windows to evaluate real added value.' },
      { title: 'Honest Limitations', text: 'Each methodology documents known limitations, potential biases and areas for future improvement.' },
    ],
    codeTitle: '💻 Open Source Code',
    codeText: 'All code is publicly available in our GitHub repository:',
    codeButton: 'View NEXUS repository',
    codeNote: 'Includes: nowcasting models, data ingestion scripts, backtesting, visualizations and tests.',
    pdfButton: 'Download full methodology (PDF)',
    pdfNote: '13 pages · mathematical formulas · backtesting results',
  } : {
    title: 'Metodología',
    subtitle: 'Documentación técnica completa de nuestros modelos de nowcasting y fuentes de datos.',
    overviewTitle: 'Acerca de Nuestra Metodología',
    overviewText: 'QHAWARINA utiliza técnicas avanzadas de nowcasting económico para predecir indicadores clave de la economía peruana antes de su publicación oficial. Nuestros modelos combinan:',
    items: [
      { bold: 'Modelos de Factores Dinámicos (DFM)', text: 'que resumen decenas de indicadores de alta frecuencia en factores latentes' },
      { bold: 'Machine Learning', text: '(Gradient Boosting, Ridge regression) para capturar relaciones no-lineales' },
      { bold: 'Datos satelitales', text: '(luces nocturnas) para monitoreo en tiempo real de actividad económica' },
      { bold: 'Web scraping y NLP', text: 'para precios de alta frecuencia y análisis de eventos políticos' },
      { bold: 'Validación rigurosa', text: 'mediante backtests out-of-sample con datos vintage' },
    ],
    overviewClose: 'Toda nuestra metodología está documentada con transparencia académica, incluyendo fórmulas matemáticas, desempeño histórico, limitaciones conocidas y referencias bibliográficas.',
    gdpTitle: 'Nowcast de PBI',
    gdpDesc: 'Modelo de Factores Dinámicos con 35+ indicadores mensuales, ecuación puente Ridge, manejo de COVID-19 y desagregación regional NTL.',
    gdpStats: ['✓ RMSE: 1.47pp (pre-COVID)', '✓ R²: 0.93'],
    infTitle: 'Nowcast de Inflación',
    infDesc: 'DFM con factores rezagados, target 3M-MA, precios de alta frecuencia (BPP), scraping de supermercados y MIDAGRI.',
    infStats: ['✓ RMSE: ~0.32pp (variación mensual)', '✓ Mejor que AR1 y Random Walk'],
    povTitle: 'Nowcast de Pobreza',
    povDesc: 'Panel departamental con Gradient Boosting: predice cambios anuales en pobreza usando PBI, inflación alimentaria, empleo y luminosidad nocturna (NTL). Desagregación temporal Chow-Lin (anual → trimestral). Distribución espacial a distritos por NTL dasimétrica.',
    povStats: ['✓ RMSE: 2.54pp', '✓ Rel.RMSE: 0.953 vs AR1'],
    polTitle: 'Índice de Riesgo Político (AI-GPR)',
    polDesc: 'Metodología AI-GPR (Iacoviello & Tong, 2026). Claude Haiku clasifica cada artículo por categoría (político/económico/ambos/irrelevante) y severidad (0–1). PRR_t = 100 × Σs_it / S̄. Media = 100, sin límite superior. Períodos de crisis: 200–400+.',
    polStats: ['✓ Actualización diaria', '✓ ~3,000 artículos/mes clasificados'],
    viewMethodology: 'Ver metodología completa',
    principlesTitle: '📊 Principios Metodológicos',
    principles: [
      { title: 'Transparencia', text: 'Documentamos completamente nuestros modelos con fórmulas matemáticas, código fuente abierto y validación histórica rigurosa.' },
      { title: 'Reproducibilidad', text: 'Todos los backtests usan datos vintage (punto-en-el-tiempo) para simular predicciones en tiempo real sin look-ahead bias.' },
      { title: 'Validación Out-of-Sample', text: 'Comparamos contra benchmarks naive (AR1, Random Walk) en ventanas expansivas para evaluar valor agregado real.' },
      { title: 'Limitaciones Honestas', text: 'Cada metodología documenta limitaciones conocidas, sesgos potenciales y áreas de mejora futura.' },
    ],
    codeTitle: '💻 Código Fuente Abierto',
    codeText: 'Todo el código está disponible públicamente en nuestro repositorio GitHub:',
    codeButton: 'Ver repositorio NEXUS',
    codeNote: 'Incluye: modelos de nowcasting, scripts de ingesta de datos, backtesting, visualizaciones y tests.',
    pdfButton: 'Descargar metodología completa (PDF)',
    pdfNote: '13 páginas · fórmulas matemáticas · resultados de backtesting',
  };

  const cards = [
    { href: '/estadisticas/pbi/metodologia', color: 'blue', title: T.gdpTitle, desc: T.gdpDesc, stats: T.gdpStats },
    { href: '/estadisticas/inflacion/metodologia', color: 'green', title: T.infTitle, desc: T.infDesc, stats: T.infStats },
    { href: '/estadisticas/pobreza/metodologia', color: 'purple', title: T.povTitle, desc: T.povDesc, stats: T.povStats },
    { href: '/estadisticas/riesgo-politico/metodologia', color: 'red', title: T.polTitle, desc: T.polDesc, stats: T.polStats },
  ] as const;

  const iconPaths = [
    'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  ];

  const colorMap: Record<string, string> = { blue: 'bg-blue-100 text-blue-800', green: 'bg-green-100 text-green-800', purple: 'bg-purple-100 text-purple-800', red: 'bg-red-100 text-red-800' };

  return (
    <div className="min-h-screen py-12" style={{ background: '#FAF8F4' }}>
      <BreadcrumbJsonLd crumbs={[
        { name: 'Qhawarina', href: '/' },
        { name: T.title, href: '/metodologia' },
      ]} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{T.title}</h1>
        <p className="text-xl text-gray-600 mb-8">{T.subtitle}</p>
        <div className="mt-4 mb-8"><DynamicLastUpdate isEn={isEn} /></div>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{T.overviewTitle}</h2>
          <p className="text-gray-700 mb-4">{T.overviewText}</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            {T.items.map((item, i) => (
              <li key={i}><strong>{item.bold}</strong> {item.text}</li>
            ))}
          </ul>
          <p className="text-gray-700">{T.overviewClose}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {cards.map((card, i) => (
            <a key={card.href} href={card.href} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-md ${colorMap[card.color]}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[i]} />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{card.desc}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {card.stats.map(s => <span key={s}>{s}</span>)}
                  </div>
                  <div className="mt-3 font-medium text-sm flex items-center" style={{ color: '#C65D3E' }}>
                    {T.viewMethodology}
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="bg-[#fdf3f0] border border-[#E8E4DC] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#2D3142' }}>{T.principlesTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: '#2D3142' }}>
            {T.principles.map(p => (
              <div key={p.title}>
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">{T.codeTitle}</h2>
          <p className="text-gray-700 mb-4">{T.codeText}</p>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/cesarchavezp29/qhawarina" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              {T.codeButton}
            </a>
            <a href="/qhawarina_metodologia.pdf" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white"
              style={{ background: '#C65D3E' }}>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {T.pdfButton}
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-3">{T.codeNote}</p>
          <p className="text-sm text-gray-500 mt-1">{T.pdfNote}</p>
        </div>
      </div>
    </div>
  );
}
