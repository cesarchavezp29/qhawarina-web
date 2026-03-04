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
        const iso = d?.metadata?.updated ?? d?.current?.date ?? new Date().toISOString();
        const dt = new Date(iso);
        setDateStr(dt.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' }));
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
          {" / "}
          <a href="/estadisticas/riesgo-politico" className="hover:text-blue-700">
            {isEn ? 'Political Risk' : 'Riesgo Político'}
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">{isEn ? 'Methodology' : 'Metodología'}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEn ? 'Methodology — Political Instability Index' : 'Metodología - Índice de Inestabilidad Política'}
        </h1>
        <div className="mt-4">
          <DynamicLastUpdate isEn={isEn} />
        </div>

        {/* Overview */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'Executive Summary' : 'Resumen Ejecutivo'}
          </h2>
          <p className="text-gray-700 mb-4">
            {isEn
              ? <>The <strong>Political Instability Index</strong> quantifies political risk and institutional volatility in Peru through a composite index that combines NLP-classified news events with financial stress indicators. The index is updated daily and normalized for easy interpretation (mean=0, standard deviation=1).</>
              : <>El <strong>Índice de Inestabilidad Política</strong> cuantifica el riesgo político y la volatilidad institucional en Perú mediante un índice compuesto que combina eventos de noticias clasificados por NLP con indicadores financieros de estrés. El índice se actualiza diariamente y está normalizado para facilitar interpretación (media=0, desviación estándar=1).</>}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">{isEn ? 'Composition' : 'Composición'}</div>
              <div className="text-lg font-semibold text-blue-900">{isEn ? '50% Events + 50% Financial' : '50% Eventos + 50% Financiero'}</div>
              <div className="text-xs text-gray-600 mt-1">{isEn ? 'Equal weighting' : 'Ponderación igual'}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">{isEn ? 'Frequency' : 'Frecuencia'}</div>
              <div className="text-lg font-semibold text-green-900">{isEn ? 'Daily' : 'Diaria'}</div>
              <div className="text-xs text-gray-600 mt-1">{isEn ? '~2,500 news/month processed' : '~2,500 noticias/mes procesadas'}</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '1. Composite Index Architecture' : '1. Arquitectura del Índice Compuesto'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '1.1 General Formula' : '1.1 Fórmula General'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The index combines two main components with equal weighting (50-50):'
              : 'El índice combina dos componentes principales con ponderación igual (50-50):'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            I<sub>t</sub> = 0.5 × C<sub>{isEn ? 'events' : 'eventos'},t</sub> + 0.5 × C<sub>{isEn ? 'financial' : 'financiero'},t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Where each component is normalized (z-score) using a 60-month rolling window:'
              : 'Donde cada componente está normalizado (z-score) usando ventana móvil de 60 meses:'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            Z<sub>t</sub> = (X<sub>t</sub> - μ<sub>t-60:t</sub>) / σ<sub>t-60:t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>{isEn ? 'Interpretation:' : 'Interpretación:'}</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>I &gt; +1.0:</strong> {isEn ? 'Very high instability (top 16%)' : 'Inestabilidad muy alta (top 16%)'}</li>
            <li><strong>0 &lt; I &lt; +1.0:</strong> {isEn ? 'Moderate instability' : 'Inestabilidad moderada'}</li>
            <li><strong>-1.0 &lt; I &lt; 0:</strong> {isEn ? 'Relative stability' : 'Estabilidad relativa'}</li>
            <li><strong>I &lt; -1.0:</strong> {isEn ? 'Exceptional stability (bottom 16%)' : 'Estabilidad excepcional (bottom 16%)'}</li>
          </ul>
        </div>

        {/* Events Component */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '2. Events Component (50%)' : '2. Componente de Eventos (50%)'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.1 NLP News Classification' : '2.1 Clasificación NLP de Noticias'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Automatic classification system that analyzes ~2,500 articles/month from Peruvian sources (La República, El Comercio, Gestión, RPP) to detect political instability events.'
              : 'Sistema de clasificación automática que analiza ~2,500 artículos/mes de fuentes peruanas (La República, El Comercio, Gestión, RPP) para detectar eventos de inestabilidad política.'}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>{isEn ? 'Event categories and weights:' : 'Categorías de eventos y pesos:'}</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Category' : 'Categoría'}</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">{isEn ? 'Weight' : 'Peso'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Examples' : 'Ejemplos'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Corruption' : 'Corrupción'}</td>
                  <td className="px-4 py-2 text-center text-red-600 font-semibold">1.0</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Lava Jato cases, fiscal investigations, arrests' : 'Casos Lava Jato, investigaciones fiscales, arrestos'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Protests' : 'Protestas'}</td>
                  <td className="px-4 py-2 text-center text-orange-600 font-semibold">0.8</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Mass demonstrations, road blockades, strikes' : 'Manifestaciones masivas, bloqueos de carreteras, paros'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Cabinet Crisis' : 'Crisis Gabinete'}</td>
                  <td className="px-4 py-2 text-center text-yellow-600 font-semibold">0.7</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Ministerial resignations, censures, confidence motions' : 'Renuncias ministros, censuras, moción de confianza'}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Elections' : 'Elecciones'}</td>
                  <td className="px-4 py-2 text-center text-blue-600 font-semibold">0.3</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Electoral campaigns, debates, second rounds' : 'Campañas electorales, debates, segunda vuelta'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.2 Daily Aggregation' : '2.2 Agregación Diaria'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Classified events are aggregated daily using the weighted sum:'
              : 'Los eventos clasificados se agregan diariamente usando la suma ponderada:'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            Score<sub>{isEn ? 'events' : 'eventos'},t</sub> = Σ (weight<sub>category</sub> × count<sub>category,t</sub>)
          </div>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Then normalized (z-score) over a 60-day rolling window to produce the final events component.'
              : 'Luego se normaliza (z-score) sobre ventana móvil de 60 días para dar el componente final de eventos.'}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '2.3 NLP Model: Zero-Shot Classifier' : '2.3 Modelo NLP: Clasificador Zero-Shot'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Uses a transformer model (multilingual BERT) fine-tuned for multi-label classification:'
              : 'Usa modelo transformer (BERT multilingual) fine-tuned para clasificación multi-label:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>{isEn ? 'Input: article title + summary (max 512 tokens)' : 'Input: título + resumen del artículo (max 512 tokens)'}</li>
            <li>{isEn ? 'Output: probabilities for each category (threshold = 0.5)' : 'Output: probabilidades para cada categoría (threshold = 0.5)'}</li>
            <li>{isEn ? 'Validation: F1-score ~0.75 on manual test set' : 'Validación: F1-score ~0.75 en set de prueba manual'}</li>
            <li>{isEn ? 'Update: quarterly retraining with new examples' : 'Actualización: reentrenamiento trimestral con nuevos ejemplos'}</li>
          </ul>
        </div>

        {/* Financial Component */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '3. Financial Component (50%)' : '3. Componente Financiero (50%)'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '3.1 Financial Stress Index' : '3.1 Índice de Estrés Financiero'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Combines 3 sub-components that capture pressure in financial markets:'
              : 'Combina 3 sub-componentes que capturan presión en mercados financieros:'}
          </p>

          <div className="space-y-4 mb-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">{isEn ? '3.1.1 FX Volatility (Exchange Rate)' : '3.1.1 Volatilidad FX (Tipo de Cambio)'}</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                FX_vol<sub>t</sub> = std(PEN/USD<sub>t-30:t</sub>)
              </div>
              <p className="text-sm text-gray-700">
                {isEn
                  ? '30-day rolling standard deviation of the exchange rate. Spikes in periods of political uncertainty (e.g., presidential impeachments, mass protests).'
                  : 'Desviación estándar móvil de 30 días del tipo de cambio. Picos en períodos de incertidumbre política (ej: vacancias presidenciales, protestas masivas).'}
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">{isEn ? '3.1.2 Credit Spread (Banking Spread)' : '3.1.2 Credit Spread (Spread Bancario)'}</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                Spread<sub>t</sub> = {isEn ? 'Active_rate' : 'Tasa_activa'}<sub>t</sub> - {isEn ? 'Passive_rate' : 'Tasa_pasiva'}<sub>t</sub>
              </div>
              <p className="text-sm text-gray-700">
                {isEn
                  ? 'Difference between active (lending) and passive (deposit) rates. Widens when banks perceive higher credit risk due to economic/political instability.'
                  : 'Diferencia entre tasas activas (préstamos) y pasivas (depósitos). Se amplía cuando bancos perciben mayor riesgo crediticio debido a inestabilidad económica/política.'}
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">{isEn ? '3.1.3 Reserves Drawdown (Drop in Reserves)' : '3.1.3 Reserves Drawdown (Caída de Reservas)'}</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                Drawdown<sub>t</sub> = max(0, -(RIN<sub>t</sub> - RIN<sub>t-1</sub>) / RIN<sub>t-1</sub>)
              </div>
              <p className="text-sm text-gray-700">
                {isEn
                  ? 'Monthly drop in Net International Reserves (BCRP). Only counts drops (positive drawdowns). Indicates central bank interventions to defend the exchange rate.'
                  : 'Caída mensual en Reservas Internacionales Netas (BCRP). Solo cuenta caídas (drawdowns positivos). Indica intervenciones del banco central para defender el tipo de cambio.'}
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '3.2 Financial Component Aggregation' : '3.2 Agregación del Componente Financiero'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'Each sub-component is normalized (z-score) independently, then averaged with equal weights:'
              : 'Cada sub-componente se normaliza (z-score) independientemente, luego se promedian con pesos iguales:'}
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            C<sub>{isEn ? 'financial' : 'financiero'},t</sub> = (1/3) × [Z(FX_vol) + Z(Spread) + Z(Drawdown)]
          </div>
          <p className="text-gray-700 mb-4">
            <strong>{isEn ? 'Data sources:' : 'Fuentes de datos:'}</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>FX:</strong> PN01246PM - {isEn ? 'Interbank exchange rate (BCRP)' : 'Tipo de cambio interbancario (BCRP)'}</li>
            <li><strong>{isEn ? 'Rates:' : 'Tasas:'}</strong> PN07807NM ({isEn ? 'active' : 'activa'}) - PN07816NM ({isEn ? 'passive' : 'pasiva'}) - {isEn ? 'Banking system (BCRP)' : 'Sistema bancario (BCRP)'}</li>
            <li><strong>{isEn ? 'Reserves:' : 'Reservas:'}</strong> PN00027MM - {isEn ? 'Net International Reserves (BCRP)' : 'Reservas Internacionales Netas (BCRP)'}</li>
          </ul>
        </div>

        {/* Data & Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '4. Data Sources' : '4. Fuentes de Datos'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '4.1 News (RSS Feeds)' : '4.1 Noticias (RSS Feeds)'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Source' : 'Fuente'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'RSS URL' : 'URL RSS'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{isEn ? 'Articles/Day' : 'Artículos/Día'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">La República</td>
                  <td className="px-4 py-2 text-gray-700 text-xs">larepublica.pe/feed/politica</td>
                  <td className="px-4 py-2 text-right text-gray-600">~30</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">El Comercio</td>
                  <td className="px-4 py-2 text-gray-700 text-xs">elcomercio.pe/feed/politica</td>
                  <td className="px-4 py-2 text-right text-gray-600">~25</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Gestión</td>
                  <td className="px-4 py-2 text-gray-700 text-xs">gestion.pe/feed/politica</td>
                  <td className="px-4 py-2 text-right text-gray-600">~20</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">RPP Noticias</td>
                  <td className="px-4 py-2 text-gray-700 text-xs">rpp.pe/feed/politica</td>
                  <td className="px-4 py-2 text-right text-gray-600">~15</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {isEn
              ? 'Total: ~90 articles/day, ~2,700 articles/month processed by the NLP classifier.'
              : 'Total: ~90 artículos/día, ~2,700 artículos/mes procesados por el clasificador NLP.'}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '4.2 Financial Data (BCRP)' : '4.2 Datos Financieros (BCRP)'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'All financial series come from the API of the Central Reserve Bank of Peru (BCRP), updated daily with ~1–2 days lag.'
              : 'Todas las series financieras provienen del API del Banco Central de Reserva del Perú (BCRP), actualizado diariamente con ~1-2 días de rezago.'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>{isEn ? 'Frequency:' : 'Frecuencia:'}</strong> {isEn ? 'Daily (FX), Monthly (rates, reserves)' : 'Diaria (FX), Mensual (tasas, reservas)'}</li>
            <li><strong>{isEn ? 'History:' : 'Historia:'}</strong> {isEn ? '2000–present (~25 years of data)' : '2000-presente (~25 años de datos)'}</li>
            <li><strong>{isEn ? 'Update:' : 'Actualización:'}</strong> {isEn ? 'Automatic via' : 'Automática vía'} <code className="bg-gray-100 px-1 rounded">scripts/update_bcrp.py</code></li>
          </ul>
        </div>

        {/* Historical Validation */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? '5. Historical Validation' : '5. Validación Histórica'}
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '5.1 Key Historical Events' : '5.1 Eventos Históricos Clave'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The index correctly captures the periods of greatest instability in Peru:'
              : 'El índice captura correctamente los períodos de mayor inestabilidad en Perú:'}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Period' : 'Período'}</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{isEn ? 'Event' : 'Evento'}</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{isEn ? 'Index Peak' : 'Pico Índice'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-red-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Oct 2008' : 'Oct 2008'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Global financial crisis (Lehman Brothers)' : 'Crisis financiera global (Lehman Brothers)'}</td>
                  <td className="px-4 py-2 text-right font-bold text-red-600">+1.55</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Mar 2020' : 'Mar 2020'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'COVID-19 pandemic onset' : 'Inicio pandemia COVID-19'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.40</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Nov 2020' : 'Nov 2020'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Political crisis (Vizcarra impeachment)' : 'Crisis política (vacancia Vizcarra)'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.65</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">{isEn ? 'Dec 2022 – Jan 2023' : 'Dic 2022 - Ene 2023'}</td>
                  <td className="px-4 py-2 text-gray-700">{isEn ? 'Post-Castillo impeachment protests' : 'Protestas post-vacancia Castillo'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.82</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mt-4">
            <strong>{isEn ? 'Interpretation:' : 'Interpretación:'}</strong>{' '}
            {isEn
              ? 'Oct 2008 is the historical peak (+1.55) due to the extreme financial component. Internal political crises (2020, 2022) show moderate peaks (+0.4 to +0.8) dominated by the events component.'
              : 'Oct 2008 es el pico histórico (+1.55) debido al componente financiero extremo. Las crisis políticas internas (2020, 2022) muestran picos moderados (+0.4 a +0.8) dominados por el componente de eventos.'}
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {isEn ? '5.2 Correlation with Macro Variables' : '5.2 Correlación con Variables Macro'}
          </h3>
          <p className="text-gray-700 mb-4">
            {isEn
              ? 'The index correlates negatively with confidence and growth indicators:'
              : 'El índice correlaciona negativamente con indicadores de confianza y crecimiento:'}
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>{isEn ? 'Business confidence (BCRP):' : 'Confianza empresarial (BCRP):'}</strong> r = -0.42 (p &lt; 0.01)</li>
            <li><strong>{isEn ? 'GDP YoY:' : 'PBI YoY:'}</strong> r = -0.28 (p &lt; 0.05) — {isEn ? 'instability curbs growth' : 'inestabilidad frena crecimiento'}</li>
            <li><strong>{isEn ? 'Private investment:' : 'Inversión privada:'}</strong> r = -0.35 (p &lt; 0.01) — {isEn ? 'higher instability, less investment' : 'mayor inestabilidad, menos inversión'}</li>
          </ul>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ {isEn ? 'Limitations' : 'Limitaciones'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>{isEn ? 'Media bias:' : 'Sesgo de medios:'}</strong>{' '}
              {isEn
                ? 'RSS feeds concentrate on Lima-based media. Regional protests may be under-represented if they do not receive national coverage.'
                : 'RSS feeds se concentran en medios limeños. Protestas regionales pueden estar subrepresentadas si no reciben cobertura nacional.'}
            </li>
            <li>
              <strong>{isEn ? 'Ad-hoc weights:' : 'Ponderaciones ad-hoc:'}</strong>{' '}
              {isEn
                ? 'Category weights (corruption=1.0, protests=0.8, etc.) are subjective. Ideally they should be estimated from historical data.'
                : 'Pesos de categorías (corrupción=1.0, protestas=0.8, etc.) son subjetivos. Idealmente deberían estimarse de datos históricos.'}
            </li>
            <li>
              <strong>{isEn ? 'EMBI not available:' : 'EMBI no disponible:'}</strong>{' '}
              {isEn
                ? 'Peru EMBI (JP Morgan) would be a better country risk proxy than local banking spreads, but is not in BCRP. Requires an external source.'
                : 'EMBI Perú (JP Morgan) sería mejor proxy de riesgo país que spreads bancarios locales, pero no está en BCRP. Requiere fuente externa.'}
            </li>
            <li>
              <strong>{isEn ? 'Rolling normalization:' : 'Normalización móvil:'}</strong>{' '}
              {isEn
                ? '60-month window implies "normality" changes over time. Long periods of instability can re-calibrate the baseline.'
                : 'Ventana de 60 meses implica que "normalidad" cambia en el tiempo. Períodos largos de inestabilidad pueden re-calibrar la baseline.'}
            </li>
            <li>
              <strong>{isEn ? 'Imperfect NLP classification:' : 'Clasificación NLP imperfecta:'}</strong>{' '}
              {isEn
                ? 'F1 ~0.75 implies ~25% classification error. False positives/negatives introduce noise in the events component.'
                : 'F1 ~0.75 implica ~25% de error en clasificación. Falsos positivos/negativos introducen ruido en el componente de eventos.'}
            </li>
          </ul>
        </div>

        {/* Future Improvements */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🔮 {isEn ? 'Future Improvements' : 'Mejoras Futuras'}</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800 text-sm">
            <li>
              <strong>{isEn ? 'Sentiment analysis:' : 'Sentiment analysis:'}</strong>{' '}
              {isEn
                ? 'Beyond classifying categories, extract sentiment (positive/negative) from articles to capture the tone of coverage.'
                : 'Además de clasificar categorías, extraer sentiment (positivo/negativo) de artículos para capturar tono de la cobertura.'}
            </li>
            <li>
              <strong>{isEn ? 'EMBI integration:' : 'EMBI integration:'}</strong>{' '}
              {isEn
                ? 'Add Peru EMBI spread as a direct proxy for country risk as perceived by international investors.'
                : 'Agregar spread EMBI Perú como proxy directo de riesgo país percibido por inversionistas internacionales.'}
            </li>
            <li>
              <strong>{isEn ? 'Social media monitoring:' : 'Social media monitoring:'}</strong>{' '}
              {isEn
                ? 'Expand sources to Twitter/X, Facebook to capture protests/mobilizations in more real time.'
                : 'Expandir fuentes a Twitter/X, Facebook para capturar protestas/movilizaciones en tiempo más real.'}
            </li>
            <li>
              <strong>{isEn ? 'Dynamic weights:' : 'Ponderaciones dinámicas:'}</strong>{' '}
              {isEn
                ? 'Estimate category weights through inverse regression (which categories best predict economic/financial crises).'
                : 'Estimar pesos de categorías mediante regresión inversa (qué categorías predicen mejor crisis económicas/financieras).'}
            </li>
            <li>
              <strong>{isEn ? 'Forecasting:' : 'Forecasting:'}</strong>{' '}
              {isEn
                ? 'Use the historical index series to predict future crises (e.g., nowcast of next presidential impeachment).'
                : 'Usar serie histórica del índice para predecir futuras crisis (ej: nowcast de próxima vacancia presidencial).'}
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {isEn ? 'References' : 'Referencias'}
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Baker, S. R., Bloom, N., &amp; Davis, S. J. (2016).</strong> &quot;Measuring economic policy
              uncertainty.&quot; <em>The Quarterly Journal of Economics</em>, 131(4), 1593-1636.
            </p>
            <p>
              <strong>Caldara, D., &amp; Iacoviello, M. (2022).</strong> &quot;Measuring geopolitical risk.&quot;{" "}
              <em>American Economic Review</em>, 112(4), 1194-1225.
            </p>
            <p>
              <strong>Manela, A., &amp; Moreira, A. (2017).</strong> &quot;News implied volatility and disaster
              concerns.&quot; <em>Journal of Financial Economics</em>, 123(1), 137-162.
            </p>
            <p>
              <strong>Gentzkow, M., Kelly, B., &amp; Taddy, M. (2019).</strong> &quot;Text as data.&quot;{" "}
              <em>Journal of Economic Literature</em>, 57(3), 535-574.
            </p>
          </div>
        </div>

        {/* Code Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            {isEn ? 'Source code available in the ' : 'Código fuente disponible en el '}
            <a
              href="https://github.com/btorressz/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              {isEn ? 'NEXUS repository' : 'repositorio NEXUS'}
            </a>
          </p>
          <p className="text-xs text-gray-500">
            {isEn ? 'See:' : 'Ver:'}{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">src/nlp/classifier.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">src/processing/political_index.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/build_political_index.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
