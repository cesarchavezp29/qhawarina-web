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
            ? 'Methodology — AI-GPR Dual Risk Indices (IRP + IRE)'
            : 'Metodología — Índices de Riesgo Dual AI-GPR (IRP + IRE)'}
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
                  using Artificial Intelligence&quot;, Federal Reserve Board Working Paper. Applied to Peru as{' '}
                  <strong>two independent indices</strong> — IRP (political) and IRE (economic) — using Claude Haiku
                  as the LLM classifier, 16 news sources with RSS feeds and historical archive backfill, and per-feed normalization
                  (mean = 100 over 2025 baseline).
                </>
              : <>
                  <strong>Base metodológica:</strong> Construido siguiendo a{' '}
                  <strong>Iacoviello &amp; Tong (2026)</strong>, &quot;The AI-GPR Index: Measuring Geopolitical Risk
                  using Artificial Intelligence&quot;, Federal Reserve Board Working Paper. Aplicado a Perú como{' '}
                  <strong>dos índices independientes</strong> — IRP (político) e IRE (económico) — usando Claude Haiku
                  como clasificador LLM, 16 fuentes de noticias con feeds RSS y backfill de archivo histórico, y normalización por feed
                  (media = 100 sobre línea base 2025).
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
                  Qhawarina produces <strong>two independent daily risk indices</strong>:{' '}
                  the <strong>IRP</strong> (Índice de Riesgo Político) and the{' '}
                  <strong>IRE</strong> (Índice de Riesgo Económico). Each index aggregates severity scores
                  assigned by Claude Haiku to individual news articles, using a per-feed normalization
                  approach that eliminates composition bias when new feeds are added. Both indices are
                  calibrated to a mean of 100 over the 2025 calendar year baseline. This is the first
                  application of the AI-GPR methodology to a Latin American country at daily frequency.
                </>
              : <>
                  Qhawarina produce <strong>dos índices de riesgo diarios independientes</strong>:{' '}
                  el <strong>IRP</strong> (Índice de Riesgo Político) y el{' '}
                  <strong>IRE</strong> (Índice de Riesgo Económico). Cada índice agrega puntajes de
                  severidad asignados por Claude Haiku a artículos individuales, usando una normalización
                  por feed que elimina el sesgo de composición al agregar nuevos feeds. Ambos índices
                  están calibrados a una media de 100 sobre la línea base del año 2025. Es la primera
                  aplicación de la metodología AI-GPR a un país latinoamericano con frecuencia diaria.
                </>}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Structure' : 'Estructura'}</div>
              <div className="text-base font-semibold text-blue-900">
                {isEn ? '2 independent indices' : '2 índices independientes'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {isEn ? 'IRP (political) + IRE (economic)' : 'IRP (político) + IRE (económico)'}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Scale' : 'Escala'}</div>
              <div className="text-base font-semibold text-green-900">{isEn ? 'Mean = 100, unbounded' : 'Media = 100, sin límite'}</div>
              <div className="text-xs text-gray-500 mt-1">{isEn ? 'Crisis periods: 200–400+' : 'Períodos de crisis: 200–400+'}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">{isEn ? 'Frequency' : 'Frecuencia'}</div>
              <div className="text-base font-semibold text-orange-900">{isEn ? 'Daily' : 'Diaria'}</div>
              <div className="text-xs text-gray-500 mt-1">
                {isEn ? '16 sources + archive' : '16 fuentes + archivo'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Formula */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '1. The AI-GPR Dual-Index Formula' : '1. La Fórmula AI-GPR de Índice Dual'}
          </h2>

          <p className="text-gray-700 mb-4">
            {isEn
              ? <>
                  IRP and IRE are computed by the same four-step procedure, applied independently to
                  political scores and economic scores respectively. The key innovation vs. a simple
                  daily-sum approach is <strong>per-feed normalization</strong> (Step 2), which prevents
                  index distortion when new feeds are added or when one newspaper publishes more than usual.
                </>
              : <>
                  El IRP y el IRE se calculan con el mismo procedimiento de cuatro pasos, aplicado
                  independientemente a los puntajes políticos y económicos. La innovación clave respecto
                  a un enfoque de suma diaria simple es la <strong>normalización por feed</strong> (Paso 2),
                  que previene la distorsión del índice cuando se agregan nuevos feeds o cuando un diario
                  publica más de lo usual.
                </>}
          </p>

          <div className="bg-gray-900 text-green-400 p-5 rounded-lg font-mono text-sm mb-6 space-y-3">
            <div><span className="text-gray-400">{'# Step 1: Average score per feed-day (N_it = article count)'}</span></div>
            <div>SWP<sub>it</sub> = (1/N<sub>it</sub>) × Σ score<sub>j</sub>
              <span className="text-gray-400">{'  [articles j in feed i on day t]'}</span>
            </div>
            <div className="mt-2"><span className="text-gray-400">{'# Step 2: Per-feed normalization (composition-bias correction)'}</span></div>
            <div>Y<sub>it</sub> = SWP<sub>it</sub> / mean<sub>i,2025</sub>
              <span className="text-gray-400">{'  [each feed\'s 2025 mean → 1.0]'}</span>
            </div>
            <div className="mt-2"><span className="text-gray-400">{'# Step 3: Volume-weighted mean across active feeds'}</span></div>
            <div>Z<sub>t</sub> = Σ(N<sub>it</sub> × Y<sub>it</sub>) / Σ(N<sub>it</sub>)</div>
            <div className="mt-2"><span className="text-gray-400">{'# Step 4: Scale to 2025 baseline (S̄ = mean(Z_t) over 2025)'}</span></div>
            <div className="text-yellow-300 font-bold">IRP<sub>t</sub> = (Z<sub>t</sub> / S̄<sub>2025</sub>) × 100</div>
            <div className="text-gray-400 text-xs mt-2">{'# IRE_t uses economic_score instead of political_score — same formula'}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-sm text-blue-800">
            <strong>{isEn ? 'Why per-feed normalization?' : '¿Por qué normalización por feed?'}</strong>{' '}
            {isEn
              ? <>
                  If Gestión Economía publishes 50 articles in one day and Gestión Peru only 5, a simple sum
                  would double-count Gestión&apos;s contribution. Per-feed normalization gives each feed equal
                  weight regardless of publication volume, and prevents the index from rising mechanically
                  when new feeds are incorporated.
                </>
              : <>
                  Si Gestión Economía publica 50 artículos un día y Gestión Peru solo 5, una suma simple
                  contaría doble la contribución de Gestión. La normalización por feed da peso igual a cada
                  feed sin importar el volumen de publicación, y evita que el índice suba mecánicamente al
                  incorporar nuevos feeds.
                </>}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.1 Level Thresholds (IRP and IRE)' : '1.1 Umbrales de Nivel (IRP e IRE)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Level' : 'Nivel'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Index value' : 'Valor del índice'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Interpretation' : 'Interpretación'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { level: 'MÍNIMO',  color: '#8D99AE', range: '< 50',    es: 'Calma excepcional, noticias de rutina',                          en: 'Exceptional calm, routine news only' },
                  { level: 'BAJO',    color: '#2A9D8F', range: '50–90',   es: 'Por debajo del promedio, pocas notas relevantes',                 en: 'Below average, few relevant articles' },
                  { level: 'NORMAL',  color: '#E9C46A', range: '90–110',  es: 'Entorno normal, cerca de la media histórica',                     en: 'Normal environment, near historical mean' },
                  { level: 'ELEVADO', color: '#C65D3E', range: '110–150', es: 'Inestabilidad por encima del promedio, vigilancia activa',         en: 'Above-average instability, active monitoring' },
                  { level: 'ALTO',    color: '#9B2226', range: '150–200', es: 'Crisis significativa, múltiples eventos graves',                   en: 'Significant crisis, multiple serious events' },
                  { level: 'CRÍTICO', color: '#6B0000', range: '> 200',   es: 'Crisis aguda: vacancia, colapso institucional, emergencia',        en: 'Acute crisis: impeachment, institutional collapse, emergency' },
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
            IRP<sub>t</sub><sup>smooth</sup> = (1/7) × Σ IRP<sub>t+k</sub>, k ∈ [-3, +3]
          </div>
        </div>

        {/* Section 2: Article Classification */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '2. Dual LLM Classification' : '2. Clasificación Dual por LLM'}
          </h2>

          <p className="text-gray-700 mb-4">
            {isEn
              ? <>
                  Each article is classified by <strong>Claude Haiku</strong> (Anthropic) via{' '}
                  <strong>two independent API calls</strong>: one for the political dimension and one for
                  the economic dimension. Each call assigns an integer score from 0 to 100.
                  Classification is performed in batches of 20 articles per API call.
                </>
              : <>
                  Cada artículo es clasificado por <strong>Claude Haiku</strong> (Anthropic) mediante{' '}
                  <strong>dos llamadas independientes a la API</strong>: una para la dimensión política y
                  una para la dimensión económica. Cada llamada asigna un puntaje entero de 0 a 100.
                  La clasificación se realiza en lotes de 20 artículos por llamada a la API.
                </>}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.1 Dual Score System' : '2.1 Sistema de Puntaje Dual'}
          </h3>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Score' : 'Puntaje'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Range' : 'Rango'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'What it measures' : 'Qué mide'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Used by' : 'Usado por'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-semibold text-red-700">political_score</td>
                  <td className="px-4 py-2 font-mono text-gray-700">0 – 100</td>
                  <td className="px-4 py-2 text-gray-700">
                    {isEn
                      ? 'Institutional instability: impeachments, censures, corruption, governance crises, social conflicts'
                      : 'Inestabilidad institucional: vacancias, censuras, corrupción, crisis de gobernabilidad, conflictos sociales'}
                  </td>
                  <td className="px-4 py-2 font-semibold text-red-600">IRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold text-orange-700">economic_score</td>
                  <td className="px-4 py-2 font-mono text-gray-700">0 – 100</td>
                  <td className="px-4 py-2 text-gray-700">
                    {isEn
                      ? 'Economic disruption: financial crises, sectoral collapse, price shocks, large fiscal risks'
                      : 'Disrupción económica: crisis financieras, colapso sectorial, shocks de precios, grandes riesgos fiscales'}
                  </td>
                  <td className="px-4 py-2 font-semibold text-orange-600">IRE</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6 text-sm text-amber-900">
            <strong>{isEn ? 'Dominant dimension rule:' : 'Regla de dimensión dominante:'}</strong>{' '}
            {isEn
              ? <>
                  When a political action <em>uses</em> an economic crisis as context or leverage (e.g.,
                  &quot;Opposition party conditions government using the energy crisis&quot;), the political
                  score should dominate. The article describes a political maneuver, not an economic event.
                  Conversely, a Moody&apos;s report on gas supply disruptions affecting inflation is primarily
                  economic, not political. Each article is classified on <em>what actually happens</em>, not
                  what topic is mentioned.
                </>
              : <>
                  Cuando una acción política <em>usa</em> una crisis económica como contexto o palanca (e.g.,
                  &quot;Partido opositor condiciona al gobierno usando la crisis energética&quot;), el puntaje
                  político debe dominar. El artículo describe una maniobra política, no un evento económico.
                  Por el contrario, un reporte de Moody&apos;s sobre interrupciones en el suministro de gas
                  que afectan la inflación es primordialmente económico, no político. Cada artículo se
                  clasifica por <em>lo que realmente ocurre</em>, no por qué tema menciona.
                </>}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.2 Severity Scale (0 – 100 integers)' : '2.2 Escala de Severidad (enteros 0 – 100)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The LLM assigns an integer from 0 to 100 on each dimension independently. The scale is calibrated so that 0 = no relevance and values above 60 represent major, high-impact events.'
              : 'El LLM asigna un entero de 0 a 100 en cada dimensión de forma independiente. La escala está calibrada de modo que 0 = sin relevancia y valores sobre 60 representan eventos importantes de alto impacto.'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{isEn ? 'Score' : 'Puntaje'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Level' : 'Nivel'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Example (political)' : 'Ejemplo (político)'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { s: '0',    lv: isEn ? 'No relevance' : 'Sin relevancia',       en: 'Sports, lifestyle, foreign news without Peru impact',           es: 'Deportes, farándula, noticias extranjeras sin impacto Perú' },
                  { s: '1–20', lv: isEn ? 'Minor' : 'Menor',                       en: 'Routine legislative sessions, minor party statements',          es: 'Sesiones legislativas rutinarias, declaraciones menores de partidos' },
                  { s: '21–40',lv: isEn ? 'Moderate' : 'Moderado',                 en: 'Congressional investigations, escalating political disputes',    es: 'Investigaciones parlamentarias, disputas políticas escalando' },
                  { s: '41–60',lv: isEn ? 'Significant' : 'Significativo',         en: 'Censure motions, cabinet reshuffles under political fire',       es: 'Mociones de interpelación, cambios de gabinete bajo presión' },
                  { s: '61–80',lv: isEn ? 'Major' : 'Mayor',                       en: 'Impeachment attempts, constitutional crises, mass protests',     es: 'Intentos de vacancia, crisis constitucionales, protestas masivas' },
                  { s: '81–100',lv: isEn ? 'Critical' : 'Crítico',                 en: 'State of emergency, imminent regime change, widespread violence', es: 'Estado de emergencia, cambio de régimen inminente, violencia masiva' },
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

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.3 Top-Driver Filtering' : '2.3 Filtro de Principales Impulsores'}
          </h3>
          <p className="text-gray-700 text-sm">
            {isEn
              ? <>
                  To avoid cross-contamination between the two driver lists, articles shown as{' '}
                  <strong>top political drivers</strong> are restricted to those where{' '}
                  <code className="bg-gray-100 px-1 rounded">political_score ≥ economic_score</code>, and{' '}
                  <strong>top economic drivers</strong> are restricted to those where{' '}
                  <code className="bg-gray-100 px-1 rounded">economic_score &gt; political_score</code>.
                  This ensures each article appears in only the list that reflects its dominant dimension.
                </>
              : <>
                  Para evitar contaminación cruzada entre las dos listas de impulsores, los artículos
                  mostrados como <strong>principales impulsores políticos</strong> se restringen a aquellos
                  donde <code className="bg-gray-100 px-1 rounded">political_score ≥ economic_score</code>,
                  y los <strong>principales impulsores económicos</strong> a aquellos donde{' '}
                  <code className="bg-gray-100 px-1 rounded">economic_score &gt; political_score</code>.
                  Esto garantiza que cada artículo aparece solo en la lista que refleja su dimensión dominante.
                </>}
          </p>
        </div>

        {/* Section 3: Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '3. Data Sources (RSS Feeds + Archive)' : '3. Fuentes de Datos (RSS Feeds + Archivo)'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Articles are collected daily from 16 Peruvian news sources via RSS feeds, covering national politics, economics, regional events, and broadcast media. Historical coverage is extended via the Arc Publishing archive API for select sources.'
              : 'Los artículos se recolectan diariamente de 16 fuentes de noticias peruanas vía feeds RSS, cubriendo política nacional, economía, eventos regionales y medios audiovisuales. La cobertura histórica se extiende vía la API de archivo Arc Publishing para fuentes seleccionadas.'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Source' : 'Fuente'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'RSS Feeds' : 'Feeds RSS'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Archive' : 'Archivo'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Coverage' : 'Cobertura'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { src: 'El Comercio',  feeds: isEn ? 'Politics, Economy' : 'Política, Economía',  arc: '✓', cov: isEn ? 'Politics, economy, Lima' : 'Política, economía, Lima' },
                  { src: 'Gestión',      feeds: isEn ? 'Peru, Economy' : 'Peru, Economía',           arc: '✓', cov: isEn ? 'Economy, business, markets' : 'Economía, empresa, mercados' },
                  { src: 'La República', feeds: isEn ? 'Politics, Economy' : 'Política, Economía',  arc: '–', cov: isEn ? 'National politics, social conflicts' : 'Política nacional, conflictos sociales' },
                  { src: 'Andina',       feeds: isEn ? 'Politics, Economy' : 'Política, Economía',  arc: '–', cov: isEn ? 'Official agency, government news' : 'Agencia oficial, noticias del gobierno' },
                  { src: 'RPP Noticias', feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Breaking news, regional events' : 'Noticias de última hora, regiones' },
                  { src: 'Correo',       feeds: isEn ? 'Politics, Economy' : 'Política, Economía',  arc: '✓', cov: isEn ? 'National politics, opinion' : 'Política nacional, opinión' },
                  { src: 'Peru21',       feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'National news, opinion' : 'Noticias nacionales, opinión' },
                  { src: 'Trome',        feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Popular press, social issues' : 'Prensa popular, temas sociales' },
                  { src: 'Caretas',      feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Investigative, politics, culture' : 'Investigativo, política, cultura' },
                  { src: 'ATV',          feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Broadcast TV news' : 'Noticias televisivas' },
                  { src: 'Canal N',      feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'News channel, politics' : 'Canal de noticias, política' },
                  { src: 'El Búho',      feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Digital news, analysis' : 'Noticias digitales, análisis' },
                  { src: 'Inforegión',   feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Regional news, environment' : 'Noticias regionales, medioambiente' },
                  { src: 'Diario UNO',   feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'National news, social issues' : 'Noticias nacionales, temas sociales' },
                  { src: 'La Razón',     feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'National news, politics' : 'Noticias nacionales, política' },
                  { src: 'Panamericana', feeds: isEn ? 'General' : 'General',                        arc: '–', cov: isEn ? 'Broadcast TV, breaking news' : 'Televisión, noticias de última hora' },
                ].map(r => (
                  <tr key={r.src}>
                    <td className="px-4 py-2 font-medium text-gray-900">{r.src}</td>
                    <td className="px-4 py-2 text-gray-600">{r.feeds}</td>
                    <td className="px-4 py-2 text-center font-medium" style={{ color: r.arc === '✓' ? '#2A9D8F' : '#9CA3AF' }}>{r.arc}</td>
                    <td className="px-4 py-2 text-gray-600">{r.cov}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {isEn
              ? 'Total: 16 sources. Articles collected daily. RSS coverage begins January 2025; archive backfill extends coverage for El Comercio, Gestión, and Correo.'
              : 'Total: 16 fuentes. Artículos recolectados diariamente. La cobertura RSS comienza en enero 2025; el backfill de archivo extiende la cobertura para El Comercio, Gestión y Correo.'}
          </p>
        </div>

        {/* Section 4: Sample Statistics */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '4. Sample Statistics (Jan 2025 – present)' : '4. Estadísticas de Muestra (Ene 2025 – presente)'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: isEn ? 'Total articles' : 'Artículos totales',                val: '25,000+' },
              { label: isEn ? 'Corrected misclassifications' : 'Correcciones aplicadas', val: '415+' },
              { label: isEn ? 'IRP 2025 mean (baseline)' : 'Media IRP 2025 (línea base)', val: '100' },
              { label: isEn ? 'Max IRP observed' : 'IRP máximo observado',            val: '300+' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-sm">
            {isEn
              ? <>
                  The IRP and IRE distributions are right-skewed: most days show moderate activity (index 50–120),
                  but political or economic crises create outlier readings. The 2025 calendar year serves as the
                  normalization baseline (mean = 100). Over 415 articles have been retroactively corrected for
                  clear misclassifications (routine FX reports, foreign politics, sports, celebrity news) to
                  maintain index integrity.
                </>
              : <>
                  Las distribuciones del IRP e IRE son sesgadas a la derecha: la mayoría de días muestran
                  actividad moderada (índice 50–120), pero las crisis políticas o económicas crean lecturas
                  extremas. El año calendario 2025 sirve como línea base de normalización (media = 100).
                  Más de 415 artículos han sido corregidos retroactivamente por clasificaciones claramente
                  erróneas (reportes cambiarios rutinarios, política extranjera, deportes, farándula) para
                  mantener la integridad del índice.
                </>}
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
                    it: isEn ? 'Article (severity 0–100)' : 'Artículo (severidad 0–100)',
                    qw: isEn ? 'Article (dual score 0–100)' : 'Artículo (puntaje dual 0–100)',
                  },
                  {
                    f:  isEn ? 'Index structure' : 'Estructura del índice',
                    bb: isEn ? 'Single composite' : 'Compuesto único',
                    it: isEn ? 'Single index' : 'Índice único',
                    qw: isEn ? 'Dual: IRP + IRE (independent)' : 'Dual: IRP + IRE (independientes)',
                  },
                  {
                    f:  isEn ? 'Normalization' : 'Normalización',
                    bb: 'Mean = 100',
                    it: 'Mean = 100',
                    qw: isEn ? 'Per-feed mean (2025 baseline)' : 'Media por feed (línea base 2025)',
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
              <strong>{isEn ? 'Short baseline period:' : 'Período de línea base corto:'}</strong>{' '}
              {isEn
                ? 'The normalization baseline (S̄) is computed from 2025 calendar year data only. It does not cover prior crisis episodes (Castillo impeachment 2022, COVID 2020). As the archive grows, thresholds will become better calibrated.'
                : 'La línea base de normalización (S̄) se calcula solo con datos del año calendario 2025. No cubre episodios de crisis anteriores (vacancia Castillo 2022, COVID 2020). A medida que crezca el archivo, los umbrales serán mejor calibrados.'}
            </li>
            <li>
              <strong>{isEn ? 'Lima-centric media:' : 'Medios centrados en Lima:'}</strong>{' '}
              {isEn
                ? 'Most sources are Lima-based national outlets. Regional protests or economic shocks may be under-represented if they do not receive national coverage. Inforegión partially mitigates this.'
                : 'La mayoría de fuentes son medios nacionales con sede en Lima. Protestas regionales o shocks económicos locales pueden estar subrepresentados si no reciben cobertura nacional. Inforegión mitiga parcialmente esto.'}
            </li>
            <li>
              <strong>{isEn ? 'LLM classification errors:' : 'Errores de clasificación LLM:'}</strong>{' '}
              {isEn
                ? 'Claude Haiku may occasionally misclassify articles or assign incorrect severity scores. Over 415 retroactive corrections have been applied for systematic patterns (routine FX reports, foreign politics, sports), but residual errors remain.'
                : 'Claude Haiku puede ocasionalmente clasificar incorrectamente artículos o asignar severidades erróneas. Se han aplicado más de 415 correcciones retroactivas para patrones sistemáticos (reportes cambiarios rutinarios, política extranjera, deportes), pero pueden quedar errores residuales.'}
            </li>
            <li>
              <strong>{isEn ? 'Archive depth varies by source:' : 'Profundidad de archivo varía por fuente:'}</strong>{' '}
              {isEn
                ? 'RSS coverage begins January 2025 uniformly. Archive backfill via Arc Publishing covers El Comercio and Correo from January 2025, but Gestión only from September 2025 onward (API limitation).'
                : 'La cobertura RSS comienza uniformemente en enero 2025. El backfill de archivo vía Arc Publishing cubre El Comercio y Correo desde enero 2025, pero Gestión solo desde septiembre 2025 (limitación de la API).'}
            </li>
          </ul>
        </div>

        {/* Future Work */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🔮 {isEn ? 'Future Improvements' : 'Mejoras Futuras'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800 text-sm">
            <li>
              <strong>{isEn ? 'Longer archive backfill:' : 'Backfill de archivo más largo:'}</strong>{' '}
              {isEn
                ? 'Extend historical coverage to 2022 (Castillo impeachment) via news archive APIs to improve baseline calibration and enable historical benchmarking against known crisis episodes.'
                : 'Extender la cobertura histórica a 2022 (vacancia Castillo) vía APIs de archivo de noticias para mejorar la calibración de la línea base y permitir benchmarking histórico contra episodios de crisis conocidos.'}
            </li>
            <li>
              <strong>{isEn ? 'Regional sources:' : 'Fuentes regionales:'}</strong>{' '}
              {isEn
                ? 'Add RSS feeds from regional newspapers (La República Arequipa, El Correo Cusco, etc.) to better capture regional conflicts and economic shocks outside Lima.'
                : 'Agregar feeds RSS de diarios regionales (La República Arequipa, El Correo Cusco, etc.) para capturar mejor conflictos regionales y shocks económicos fuera de Lima.'}
            </li>
            <li>
              <strong>{isEn ? 'Forecasting integration:' : 'Integración en forecasting:'}</strong>{' '}
              {isEn
                ? 'Include IRP and IRE lags as predictors in the GDP nowcasting and investment models, to capture the real economic costs of political uncertainty.'
                : 'Incluir rezagos del IRP e IRE como predictores en los modelos de nowcasting de PBI e inversión, para capturar los costos reales de la incertidumbre política en la economía.'}
            </li>
            <li>
              <strong>{isEn ? 'Validation against external indices:' : 'Validación contra índices externos:'}</strong>{' '}
              {isEn
                ? 'Cross-validate IRP against V-DEM political instability scores and country risk ratings (EMBI Peru) to assess construct validity.'
                : 'Validar cruzadamente el IRP contra puntajes de inestabilidad política de V-DEM y calificaciones de riesgo país (EMBI Peru) para evaluar la validez de constructo.'}
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
                ? '— Primary methodological reference: per-feed normalization, LLM severity scoring, and volume-weighted aggregation.'
                : '— Referencia metodológica principal: normalización por feed, severidad por LLM, y agregación ponderada por volumen.'}
            </p>
            <p>
              <strong>Baker, S. R., Bloom, N., &amp; Davis, S. J. (2016).</strong>{' '}
              &quot;Measuring economic policy uncertainty.&quot;{' '}
              <em>The Quarterly Journal of Economics</em>, 131(4), 1593–1636.{' '}
              {isEn
                ? '— Foundational EPU framework: news-based uncertainty index with mean = 100 normalization.'
                : '— Marco EPU fundacional: índice de incertidumbre basado en noticias con normalización media = 100.'}
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
                ? '— Survey of NLP methods in economics; conceptual framework for article-level severity classification.'
                : '— Survey de métodos NLP en economía; marco conceptual para clasificación de severidad a nivel de artículo.'}
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
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/build_daily_index.py</code>,{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/export_web_data.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
