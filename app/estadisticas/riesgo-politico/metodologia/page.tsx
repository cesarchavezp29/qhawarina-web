'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

function DynamicLastUpdate({ isEn }: { isEn: boolean }) {
  const [dateStr, setDateStr] = useState('');
  useEffect(() => {
    const locale = isEn ? 'en-US' : 'es-PE';
    fetch('/assets/data/political_index_daily.json?v=' + new Date().toISOString().slice(0, 10))
      .then(r => r.json())
      .then(d => {
        const iso = d?.metadata?.generated_at ?? d?.current?.date ?? new Date().toISOString();
        setDateStr(new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }));
      })
      .catch(() => setDateStr(new Date().toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' })));
  }, [isEn]);
  if (!dateStr) return null;
  return (
    <div className="flex items-center justify-end text-sm text-gray-500">
      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{isEn ? 'Last updated:' : 'Última actualización:'} {dateStr}</span>
    </div>
  );
}

export default function RiesgoPoliticoMetodologiaPage() {
  const isEn = useLocale() === 'en';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            {isEn ? 'Statistics' : 'Estadísticas'}
          </a>
          {' / '}
          <a href="/estadisticas/riesgo-politico" className="hover:text-blue-700">
            {isEn ? 'Political Risk' : 'Riesgo Político'}
          </a>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Methodology' : 'Metodología'}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEn
            ? 'Methodology — Political Risk Index (AI-GPR)'
            : 'Metodología — Índice de Riesgo Político (AI-GPR)'}
        </h1>
        <div className="mt-4">
          <DynamicLastUpdate isEn={isEn} />
        </div>

        {/* Citation banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg px-6 py-4">
          <p className="text-sm text-blue-800">
            {isEn
              ? <>
                  <strong>Methodological basis:</strong> Constructed following{' '}
                  <strong>Iacoviello &amp; Tong (2026)</strong>, &quot;The AI-GPR Index: Measuring Geopolitical Risk
                  using Artificial Intelligence&quot;, Federal Reserve Board Working Paper. Applied to Peru using
                  Claude Haiku as the LLM classifier, 11 RSS feeds, and daily normalization (mean = 100).
                </>
              : <>
                  <strong>Base metodológica:</strong> Construido siguiendo a{' '}
                  <strong>Iacoviello &amp; Tong (2026)</strong>, &quot;The AI-GPR Index: Measuring Geopolitical Risk
                  using Artificial Intelligence&quot;, Federal Reserve Board Working Paper. Aplicado a Perú usando
                  Claude Haiku como clasificador LLM, 11 feeds RSS, y normalización diaria (media = 100).
                </>}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'Executive Summary' : 'Resumen Ejecutivo'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? <>
                  The <strong>Qhawarina Political Risk Index</strong> is a daily index that measures political and
                  economic instability in Peru by aggregating severity scores assigned to individual news articles
                  classified by a large language model. It follows the <em>AI-GPR</em> methodology of Iacoviello
                  &amp; Tong (2026) — the first application of this approach to a Latin American country at daily
                  frequency.
                </>
              : <>
                  El <strong>Índice de Riesgo Político Qhawarina</strong> es un índice diario que mide la
                  inestabilidad política y económica en Perú agregando puntajes de severidad asignados a artículos
                  individuales clasificados por un modelo de lenguaje. Sigue la metodología <em>AI-GPR</em> de
                  Iacoviello &amp; Tong (2026) — primera aplicación de este enfoque a un país latinoamericano con
                  frecuencia diaria.
                </>}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Composition' : 'Composición'}</div>
              <div className="text-base font-semibold text-blue-900">60% {isEn ? 'Political' : 'Político'} + 40% {isEn ? 'Economic' : 'Económico'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? 'Article-level severity' : 'Severidad a nivel de artículo'}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Scale' : 'Escala'}</div>
              <div className="text-base font-semibold text-green-900">{isEn ? 'Mean = 100, unbounded' : 'Media = 100, sin límite'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? 'Crisis periods: 200–400+' : 'Períodos de crisis: 200–400+'}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Frequency' : 'Frecuencia'}</div>
              <div className="text-base font-semibold text-orange-900">{isEn ? 'Daily' : 'Diaria'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? '11 RSS feeds · 6 sources' : '11 feeds RSS · 6 fuentes'}</div>
            </div>
          </div>
        </div>

        {/* Section 1: Formula */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '1. The AI-GPR Formula' : '1. La Fórmula AI-GPR'}
          </h2>

          <p className="text-gray-700 mb-4">
            {isEn
              ? 'For each day t, the index aggregates the severity scores of all classified articles:'
              : 'Para cada día t, el índice agrega los puntajes de severidad de todos los artículos clasificados:'}
          </p>

          <div className="bg-gray-900 text-green-400 p-5 rounded-lg font-mono text-sm mb-6 space-y-2">
            <div><span className="text-gray-400"># Daily weighted sum</span></div>
            <div>
              daily_sum<sub>t</sub> = 0.6 × Σ s<sub>i,t</sub><span className="text-gray-400">[political/both]</span>
              {'  '}+ 0.4 × Σ s<sub>i,t</sub><span className="text-gray-400">[economic/both]</span>
            </div>
            <div className="mt-2"><span className="text-gray-400"># Normalization constant</span></div>
            <div>S̄ = mean(daily_sum<sub>t</sub>) over all history</div>
            <div className="mt-2"><span className="text-gray-400"># PRR index (Political Risk Reading)</span></div>
            <div className="text-yellow-300 font-bold">PRR<sub>t</sub> = (daily_sum<sub>t</sub> / S̄) × 100</div>
          </div>

          <p className="text-gray-700 mb-3">
            {isEn
              ? <><strong>Key properties:</strong> By construction, mean(PRR) = 100 over the full estimation sample. A value of 150 means political news volume and severity is 50% above the historical average. The index is unbounded upward — acute crises (mass protests, presidential impeachment attempts) produce readings of 200–500+.</>
              : <><strong>Propiedades clave:</strong> Por construcción, mean(PRR) = 100 sobre toda la muestra. Un valor de 150 significa que el volumen y severidad de noticias políticas es 50% superior al promedio histórico. El índice no tiene límite superior — crisis agudas (protestas masivas, intentos de vacancia) producen lecturas de 200–500+.</>}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.1 Level Thresholds' : '1.1 Umbrales de Nivel'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Level' : 'Nivel'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PRR</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Interpretation' : 'Interpretación'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { level: 'MÍNIMO',   color: '#8D99AE', range: '< 50',    es: 'Calma política excepcional, noticias de rutina',         en: 'Exceptional political calm, routine news only' },
                  { level: 'BAJO',     color: '#2A9D8F', range: '50–80',   es: 'Actividad política normal, pocas notas relevantes',      en: 'Normal political activity, few relevant articles' },
                  { level: 'MODERADO', color: '#E0A458', range: '80–120',  es: 'Entorno promedio, tensiones menores o moderadas',         en: 'Average environment, minor or moderate tensions' },
                  { level: 'ELEVADO',  color: '#C65D3E', range: '120–160', es: 'Inestabilidad por encima del promedio, vigilancia activa', en: 'Above-average instability, active monitoring' },
                  { level: 'ALTO',     color: '#9B2226', range: '160–200', es: 'Crisis política significativa, múltiples eventos graves',  en: 'Significant political crisis, multiple serious events' },
                  { level: 'CRÍTICO',  color: '#6B0000', range: '> 200',   es: 'Crisis aguda: vacancia, golpe, estado de emergencia',     en: 'Acute crisis: impeachment, coup, state of emergency' },
                ].map(r => (
                  <tr key={r.level}>
                    <td className="px-4 py-2 font-bold" style={{ color: r.color }}>{r.level}</td>
                    <td className="px-4 py-2 font-mono text-gray-700">{r.range}</td>
                    <td className="px-4 py-2 text-gray-700">{isEn ? r.en : r.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.2 Smoothing' : '1.2 Suavización'}
          </h3>
          <p className="text-gray-700 mb-2">
            {isEn
              ? 'The displayed score is a 7-day centered moving average to reduce day-to-day noise while preserving the trend signal. Days with fewer than 5 articles are flagged as low-coverage.'
              : 'El puntaje mostrado es una media móvil centrada de 7 días para reducir el ruido día a día manteniendo la señal de tendencia. Los días con menos de 5 artículos se marcan como baja cobertura.'}
          </p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            PRR<sub>t</sub><sup>smooth</sup> = (1/7) × Σ PRR<sub>t+k</sub>, k ∈ [-3, +3]
          </div>
        </div>

        {/* Section 2: Article Classification */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '2. LLM Article Classification' : '2. Clasificación de Artículos por LLM'}
          </h2>

          <p className="text-gray-700 mb-4">
            {isEn
              ? <>
                  Each article is classified by <strong>Claude Haiku</strong> (Anthropic) using a structured prompt
                  that assigns: (1) a <em>category</em> and (2) a continuous <em>severity</em> score on the [0, 1] scale.
                  Classification is performed in batches of 20 articles per API call.
                </>
              : <>
                  Cada artículo es clasificado por <strong>Claude Haiku</strong> (Anthropic) usando un prompt estructurado
                  que asigna: (1) una <em>categoría</em> y (2) un puntaje de <em>severidad</em> continuo en la escala [0, 1].
                  La clasificación se realiza en lotes de 20 artículos por llamada a la API.
                </>}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.1 Categories' : '2.1 Categorías'}
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Category' : 'Categoría'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Weight in PRR' : 'Peso en PRR'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Definition' : 'Definición'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-semibold text-red-700">political</td>
                  <td className="px-4 py-2 font-mono text-gray-700">×0.6</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Impeachments, censures, corruption, social conflicts, governance crises' : 'Vacancias, censuras, corrupción, conflictos sociales, crisis de gobernabilidad'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-orange-700">economic</td>
                  <td className="px-4 py-2 font-mono text-gray-700">×0.4</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Financial crises, sectoral collapse, large state arbitrations, severe market drops' : 'Crisis financieras, colapso sectorial, arbitrajes grandes contra el Estado, caídas severas de mercado'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-purple-700">both</td>
                  <td className="px-4 py-2 font-mono text-gray-700">×0.6 + ×0.4</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Events with simultaneous political AND economic impact' : 'Eventos con impacto político Y económico simultáneo'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-gray-500">irrelevant</td>
                  <td className="px-4 py-2 font-mono text-gray-400">×0</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Routine news, international events without Peru impact, sports, lifestyle' : 'Noticias rutinarias, eventos internacionales sin impacto Perú, deportes, farándula'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.2 Severity Scale (0.0 – 1.0)' : '2.2 Escala de Severidad (0.0 – 1.0)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The LLM assigns a continuous severity to each non-irrelevant article. Legacy data (collected before the float-scale update) uses the mapping: integer 1 → 0.2, 2 → 0.5, 3 → 0.9.'
              : 'El LLM asigna una severidad continua a cada artículo no irrelevante. Los datos históricos (recolectados antes de la actualización a escala flotante) usan el mapeo: entero 1 → 0.2, 2 → 0.5, 3 → 0.9.'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{isEn ? 'Severity' : 'Severidad'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Level' : 'Nivel'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Description' : 'Descripción'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { s: '0.0', lv: isEn ? 'No risk' : 'Sin riesgo',            en: 'Factual report with no instability signal',                         es: 'Reporte factual sin señal de inestabilidad' },
                  { s: '0.2', lv: isEn ? 'Minor' : 'Menor',                   en: 'Minor tensions, routine legislative activity, small protests',       es: 'Tensiones menores, actividad legislativa rutinaria, protestas pequeñas' },
                  { s: '0.5', lv: isEn ? 'Significant' : 'Significativo',     en: 'Escalating disputes, interpelaciones, active fiscal investigations', es: 'Disputas escalando, interpelaciones, investigaciones fiscales activas' },
                  { s: '0.7', lv: isEn ? 'Major' : 'Mayor',                   en: 'Major crisis, impeachment motions, cabinet reshuffles under fire',   es: 'Crisis mayor, mociones de vacancia, cambios de gabinete bajo presión' },
                  { s: '0.9', lv: isEn ? 'Severe' : 'Grave',                  en: 'Severe institutional crisis, constitutional breakdown, mass violence', es: 'Crisis institucional grave, quiebre constitucional, violencia masiva' },
                  { s: '1.0', lv: isEn ? 'Critical' : 'Crítico',              en: 'Imminent regime change, state of emergency, widespread violence',    es: 'Cambio de régimen inminente, estado de emergencia, violencia generalizada' },
                ].map(r => (
                  <tr key={r.s}>
                    <td className="px-4 py-2 text-center font-mono font-bold text-gray-900">{r.s}</td>
                    <td className="px-4 py-2 font-medium text-gray-700">{r.lv}</td>
                    <td className="px-4 py-2 text-gray-600">{isEn ? r.en : r.es}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '3. Data Sources (RSS Feeds)' : '3. Fuentes de Datos (RSS Feeds)'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Articles are collected in real time from 11 RSS feeds across 6 Peruvian news sources, covering national politics, economics, and regional events.'
              : 'Los artículos se recolectan en tiempo real de 11 feeds RSS de 6 fuentes de noticias peruanas, cubriendo política nacional, economía y eventos regionales.'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Source' : 'Fuente'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{isEn ? 'Articles/Day' : 'Artículos/Día'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Coverage' : 'Cobertura'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { src: 'La República',  n: '~35', cov: isEn ? 'National politics, social conflicts' : 'Política nacional, conflictos sociales' },
                  { src: 'El Comercio',   n: '~25', cov: isEn ? 'Politics, economy, Lima' : 'Política, economía, Lima' },
                  { src: 'Gestión',       n: '~20', cov: isEn ? 'Economy, business, markets' : 'Economía, empresa, mercados' },
                  { src: 'RPP Noticias',  n: '~15', cov: isEn ? 'Breaking news, regional events' : 'Noticias de última hora, regiones' },
                  { src: 'Ideeleradio',   n: '~5',  cov: isEn ? 'Human rights, political analysis' : 'Derechos humanos, análisis político' },
                  { src: 'Infobae Perú',  n: '~10', cov: isEn ? 'National and political news' : 'Noticias nacionales y políticas' },
                ].map(r => (
                  <tr key={r.src}>
                    <td className="px-4 py-2 font-medium text-gray-900">{r.src}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{r.n}</td>
                    <td className="px-4 py-2 text-gray-600">{r.cov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {isEn
              ? 'Total: ~110 articles/day on average. Articles are collected 3× daily (6:00, 13:00, 20:00 Lima time). Coverage begins January 2025.'
              : 'Total: ~110 artículos/día en promedio. Los artículos se recolectan 3× al día (6:00, 13:00, 20:00 hora Lima). Cobertura desde enero 2025.'}
          </p>
        </div>

        {/* Section 4: Sample Statistics */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '4. Sample Statistics (Jan 2025 – present)' : '4. Estadísticas de Muestra (Ene 2025 – presente)'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: isEn ? 'Total articles' : 'Artículos totales', val: '25,000+' },
              { label: isEn ? 'Political/economic' : 'Político/económico', val: '~20%' },
              { label: isEn ? 'Median PRR' : 'PRR mediana', val: '~74' },
              { label: isEn ? 'Max PRR observed' : 'PRR máximo observado', val: '726' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-sm">
            {isEn
              ? 'The PRR distribution is right-skewed: the median (~74) is below the mean (100) because most days are calm, but political crises create outlier readings. The 75th percentile is approximately 133, meaning only one quarter of days exceed ELEVADO level.'
              : 'La distribución del PRR es sesgada a la derecha: la mediana (~74) está por debajo de la media (100) porque la mayoría de días son tranquilos, pero las crisis políticas crean lecturas extremas. El percentil 75 es aproximadamente 133, lo que significa que solo un cuarto de los días supera el nivel ELEVADO.'}
          </p>
        </div>

        {/* Section 5: Comparison with Baker, Bloom & Davis */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '5. Comparison with Classical Approaches' : '5. Comparación con Enfoques Clásicos'}
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Feature' : 'Característica'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Baker, Bloom &amp; Davis (2016)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Iacoviello &amp; Tong (2026)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qhawarina</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  {
                    f:  isEn ? 'Classification method' : 'Método de clasificación',
                    bb: isEn ? 'Keyword counting' : 'Conteo de palabras clave',
                    it: isEn ? 'LLM (GPT)' : 'LLM (GPT)',
                    qw: isEn ? 'LLM (Claude Haiku)' : 'LLM (Claude Haiku)',
                  },
                  {
                    f:  isEn ? 'Unit of analysis' : 'Unidad de análisis',
                    bb: isEn ? 'Article (binary)' : 'Artículo (binario)',
                    it: isEn ? 'Article (severity 0–1)' : 'Artículo (severidad 0–1)',
                    qw: isEn ? 'Article (severity 0–1)' : 'Artículo (severidad 0–1)',
                  },
                  {
                    f:  isEn ? 'Normalization' : 'Normalización',
                    bb: 'Mean = 100',
                    it: 'Mean = 100',
                    qw: 'Mean = 100',
                  },
                  {
                    f:  isEn ? 'Frequency' : 'Frecuencia',
                    bb: isEn ? 'Monthly' : 'Mensual',
                    it: isEn ? 'Monthly/Daily' : 'Mensual/Diaria',
                    qw: isEn ? 'Daily' : 'Diaria',
                  },
                  {
                    f:  isEn ? 'Country' : 'País',
                    bb: 'USA',
                    it: isEn ? '43 countries' : '43 países',
                    qw: 'Perú',
                  },
                ].map(r => (
                  <tr key={r.f}>
                    <td className="px-4 py-2 font-medium text-gray-700">{r.f}</td>
                    <td className="px-4 py-2 text-gray-600">{r.bb}</td>
                    <td className="px-4 py-2 text-gray-600">{r.it}</td>
                    <td className="px-4 py-2 font-medium text-blue-700">{r.qw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ {isEn ? 'Limitations' : 'Limitaciones'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>{isEn ? 'Coverage start date:' : 'Fecha de inicio de cobertura:'}</strong>{' '}
              {isEn
                ? 'RSS feeds were collected from January 2025. The normalization constant S̄ reflects only this period. As the archive grows, S̄ will be recalculated and historical PRR values may shift slightly.'
                : 'Los feeds RSS se recolectan desde enero 2025. La constante de normalización S̄ refleja solo este período. A medida que crece el archivo, S̄ se recalculará y los valores históricos de PRR pueden variar levemente.'}
            </li>
            <li>
              <strong>{isEn ? 'Article volume bias:' : 'Sesgo por volumen de artículos:'}</strong>{' '}
              {isEn
                ? 'As more feeds are added over time, the daily article count grows, which can mechanically inflate recent PRR values relative to the normalization period.'
                : 'A medida que se agregan más feeds, el conteo diario de artículos crece, lo que puede inflar mecánicamente los valores recientes de PRR respecto al período de normalización.'}
            </li>
            <li>
              <strong>{isEn ? 'Media bias:' : 'Sesgo de medios:'}</strong>{' '}
              {isEn
                ? 'Feeds concentrate on Lima-based media. Regional protests may be under-represented if they do not receive national coverage.'
                : 'Los feeds se concentran en medios limeños. Protestas regionales pueden estar subrepresentadas si no reciben cobertura nacional.'}
            </li>
            <li>
              <strong>{isEn ? 'LLM classification errors:' : 'Errores de clasificación LLM:'}</strong>{' '}
              {isEn
                ? 'Claude Haiku may occasionally misclassify articles or assign incorrect severity scores. Batch processing (20 articles per call) introduces minor context-switching effects.'
                : 'Claude Haiku puede ocasionalmente clasificar incorrectamente artículos o asignar severidades erróneas. El procesamiento en lote (20 artículos por llamada) introduce efectos menores de cambio de contexto.'}
            </li>
          </ul>
        </div>

        {/* Future Work */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🔮 {isEn ? 'Future Improvements' : 'Mejoras Futuras'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800 text-sm">
            <li>
              <strong>{isEn ? 'Float severity scale:' : 'Escala de severidad flotante:'}</strong>{' '}
              {isEn
                ? 'Migrate to continuous [0,1] severity classification for new articles to eliminate the legacy integer-to-float mapping.'
                : 'Migrar a clasificación de severidad continua [0,1] para nuevos artículos y eliminar el mapeo entero-flotante heredado.'}
            </li>
            <li>
              <strong>{isEn ? 'Volume-adjusted normalization:' : 'Normalización ajustada por volumen:'}</strong>{' '}
              {isEn
                ? 'Normalize daily_sum by the number of articles collected that day to remove the mechanical effect of feed expansion.'
                : 'Normalizar daily_sum por el número de artículos recolectados ese día para eliminar el efecto mecánico de la expansión de feeds.'}
            </li>
            <li>
              <strong>{isEn ? 'Longer history via news API:' : 'Historia más larga vía API de noticias:'}</strong>{' '}
              {isEn
                ? 'Backfill the archive to 2022 (Castillo impeachment period) using a news archive API to improve S̄ calibration and historical benchmarking.'
                : 'Rellenar el archivo hasta 2022 (período de vacancia Castillo) usando una API de archivo de noticias para mejorar la calibración de S̄ y el benchmarking histórico.'}
            </li>
            <li>
              <strong>{isEn ? 'Forecasting integration:' : 'Integración en forecasting:'}</strong>{' '}
              {isEn
                ? 'Include PRR lags as predictors in the GDP and investment nowcasting models.'
                : 'Incluir rezagos del PRR como predictores en los modelos de nowcasting de PBI e inversión.'}
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'References' : 'Referencias'}
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <p className="border-l-4 border-blue-500 pl-4 py-1">
              <strong>Iacoviello, M. &amp; Tong, J. (2026).</strong>{' '}
              &quot;The AI-GPR Index: Measuring Geopolitical Risk using Artificial Intelligence.&quot;{' '}
              <em>Federal Reserve Board Working Paper.</em>{' '}
              {isEn
                ? '— Primary methodological reference for the AI-GPR formula applied in this index.'
                : '— Referencia metodológica principal para la fórmula AI-GPR aplicada en este índice.'}
            </p>
            <p>
              <strong>Baker, S. R., Bloom, N., &amp; Davis, S. J. (2016).</strong>{' '}
              &quot;Measuring economic policy uncertainty.&quot;{' '}
              <em>The Quarterly Journal of Economics</em>, 131(4), 1593–1636.{' '}
              {isEn
                ? '— Foundational EPU framework; informs the 60/40 political/economic weighting.'
                : '— Marco EPU fundacional; informa la ponderación 60/40 político/económico.'}
            </p>
            <p>
              <strong>Caldara, D., &amp; Iacoviello, M. (2022).</strong>{' '}
              &quot;Measuring geopolitical risk.&quot;{' '}
              <em>American Economic Review</em>, 112(4), 1194–1225.{' '}
              {isEn
                ? '— GPR index methodology that precedes and motivates the AI-GPR extension.'
                : '— Metodología del índice GPR que precede y motiva la extensión AI-GPR.'}
            </p>
            <p>
              <strong>Gentzkow, M., Kelly, B., &amp; Taddy, M. (2019).</strong>{' '}
              &quot;Text as data.&quot;{' '}
              <em>Journal of Economic Literature</em>, 57(3), 535–574.{' '}
              {isEn
                ? '— Survey of NLP methods in economics; conceptual framework for article-level classification.'
                : '— Survey de métodos NLP en economía; marco conceptual para clasificación a nivel de artículo.'}
            </p>
          </div>
        </div>

        {/* Code Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isEn ? 'Source code available in the ' : 'Código fuente disponible en el '}
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              {isEn ? 'Qhawarina repository' : 'repositorio Qhawarina'}
            </a>
          </p>
          <p className="text-xs text-gray-500">
            {isEn ? 'Key files:' : 'Archivos clave:'}{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">src/nlp/classifier.py</code>,{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/export_web_data.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
