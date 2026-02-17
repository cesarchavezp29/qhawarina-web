import LastUpdate from "../../../components/stats/LastUpdate";

export default function RiesgoPoliticoMetodologiaPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </a>
          {" / "}
          <a href="/estadisticas/riesgo-politico" className="hover:text-blue-700">
            Riesgo Político
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">Metodología</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Metodología - Índice de Inestabilidad Política
        </h1>
        <div className="mt-4">
          <LastUpdate date="16-Feb-2026" />
        </div>

        {/* Overview */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Resumen Ejecutivo
          </h2>
          <p className="text-gray-700 mb-4">
            El <strong>Índice de Inestabilidad Política</strong> cuantifica el riesgo político y la volatilidad
            institucional en Perú mediante un índice compuesto que combina eventos de noticias clasificados por NLP
            con indicadores financieros de estrés. El índice se actualiza diariamente y está normalizado para facilitar
            interpretación (media=0, desviación estándar=1).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Composición</div>
              <div className="text-lg font-semibold text-blue-900">50% Eventos + 50% Financiero</div>
              <div className="text-xs text-gray-600 mt-1">Ponderación igual</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Frecuencia</div>
              <div className="text-lg font-semibold text-green-900">Diaria</div>
              <div className="text-xs text-gray-600 mt-1">~2,500 noticias/mes procesadas</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Arquitectura del Índice Compuesto
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.1 Fórmula General
          </h3>
          <p className="text-gray-700 mb-4">
            El índice combina dos componentes principales con ponderación igual (50-50):
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            I<sub>t</sub> = 0.5 × C<sub>eventos,t</sub> + 0.5 × C<sub>financiero,t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            Donde cada componente está normalizado (z-score) usando ventana móvil de 60 meses:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            Z<sub>t</sub> = (X<sub>t</sub> - μ<sub>t-60:t</sub>) / σ<sub>t-60:t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Interpretación:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>I &gt; +1.0:</strong> Inestabilidad muy alta (top 16%)</li>
            <li><strong>0 &lt; I &lt; +1.0:</strong> Inestabilidad moderada</li>
            <li><strong>-1.0 &lt; I &lt; 0:</strong> Estabilidad relativa</li>
            <li><strong>I &lt; -1.0:</strong> Estabilidad excepcional (bottom 16%)</li>
          </ul>
        </div>

        {/* Events Component */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Componente de Eventos (50%)
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.1 Clasificación NLP de Noticias
          </h3>
          <p className="text-gray-700 mb-4">
            Sistema de clasificación automática que analiza ~2,500 artículos/mes de fuentes peruanas (La República,
            El Comercio, Gestión, RPP) para detectar eventos de inestabilidad política.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Categorías de eventos y pesos:</strong>
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Peso</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ejemplos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Corrupción</td>
                  <td className="px-4 py-2 text-center text-red-600 font-semibold">1.0</td>
                  <td className="px-4 py-2 text-gray-700">Casos Lava Jato, investigaciones fiscales, arrestos</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Protestas</td>
                  <td className="px-4 py-2 text-center text-orange-600 font-semibold">0.8</td>
                  <td className="px-4 py-2 text-gray-700">Manifestaciones masivas, bloqueos de carreteras, paros</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Crisis Gabinete</td>
                  <td className="px-4 py-2 text-center text-yellow-600 font-semibold">0.7</td>
                  <td className="px-4 py-2 text-gray-700">Renuncias ministros, censuras, moción de confianza</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Elecciones</td>
                  <td className="px-4 py-2 text-center text-blue-600 font-semibold">0.3</td>
                  <td className="px-4 py-2 text-gray-700">Campañas electorales, debates, segunda vuelta</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.2 Agregación Diaria
          </h3>
          <p className="text-gray-700 mb-4">
            Los eventos clasificados se agregan diariamente usando la suma ponderada:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            Score<sub>eventos,t</sub> = Σ (weight<sub>category</sub> × count<sub>category,t</sub>)
          </div>
          <p className="text-gray-700 mb-4">
            Luego se normaliza (z-score) sobre ventana móvil de 60 días para dar el componente final de eventos.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.3 Modelo NLP: Clasificador Zero-Shot
          </h3>
          <p className="text-gray-700 mb-4">
            Usa modelo transformer (BERT multilingual) fine-tuned para clasificación multi-label:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>Input: título + resumen del artículo (max 512 tokens)</li>
            <li>Output: probabilidades para cada categoría (threshold = 0.5)</li>
            <li>Validación: F1-score ~0.75 en set de prueba manual</li>
            <li>Actualización: reentrenamiento trimestral con nuevos ejemplos</li>
          </ul>
        </div>

        {/* Financial Component */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Componente Financiero (50%)
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.1 Índice de Estrés Financiero
          </h3>
          <p className="text-gray-700 mb-4">
            Combina 3 sub-componentes que capturan presión en mercados financieros:
          </p>

          <div className="space-y-4 mb-6">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3.1.1 Volatilidad FX (Tipo de Cambio)</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                FX_vol<sub>t</sub> = std(PEN/USD<sub>t-30:t</sub>)
              </div>
              <p className="text-sm text-gray-700">
                Desviación estándar móvil de 30 días del tipo de cambio. Picos en períodos de incertidumbre
                política (ej: vacancias presidenciales, protestas masivas).
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3.1.2 Credit Spread (Spread Bancario)</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                Spread<sub>t</sub> = Tasa_activa<sub>t</sub> - Tasa_pasiva<sub>t</sub>
              </div>
              <p className="text-sm text-gray-700">
                Diferencia entre tasas activas (préstamos) y pasivas (depósitos). Se amplía cuando bancos
                perciben mayor riesgo crediticio debido a inestabilidad económica/política.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">3.1.3 Reserves Drawdown (Caída de Reservas)</h4>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-2">
                Drawdown<sub>t</sub> = max(0, -(RIN<sub>t</sub> - RIN<sub>t-1</sub>) / RIN<sub>t-1</sub>)
              </div>
              <p className="text-sm text-gray-700">
                Caída mensual en Reservas Internacionales Netas (BCRP). Solo cuenta caídas (drawdowns positivos).
                Indica intervenciones del banco central para defender el tipo de cambio.
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.2 Agregación del Componente Financiero
          </h3>
          <p className="text-gray-700 mb-4">
            Cada sub-componente se normaliza (z-score) independientemente, luego se promedian con pesos iguales:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            C<sub>financiero,t</sub> = (1/3) × [Z(FX_vol) + Z(Spread) + Z(Drawdown)]
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Fuentes de datos:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>FX:</strong> PN01246PM - Tipo de cambio interbancario (BCRP)</li>
            <li><strong>Tasas:</strong> PN07807NM (activa) - PN07816NM (pasiva) - Sistema bancario (BCRP)</li>
            <li><strong>Reservas:</strong> PN00027MM - Reservas Internacionales Netas (BCRP)</li>
          </ul>
        </div>

        {/* Data & Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Fuentes de Datos
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            4.1 Noticias (RSS Feeds)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">URL RSS</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Artículos/Día</th>
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
            Total: ~90 artículos/día, ~2,700 artículos/mes procesados por el clasificador NLP.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            4.2 Datos Financieros (BCRP)
          </h3>
          <p className="text-gray-700 mb-4">
            Todas las series financieras provienen del API del Banco Central de Reserva del Perú (BCRP),
            actualizado diariamente con ~1-2 días de rezago.
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>Frecuencia:</strong> Diaria (FX), Mensual (tasas, reservas)</li>
            <li><strong>Historia:</strong> 2000-presente (~25 años de datos)</li>
            <li><strong>Actualización:</strong> Automática vía `scripts/update_bcrp.py`</li>
          </ul>
        </div>

        {/* Historical Validation */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            5. Validación Histórica
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            5.1 Eventos Históricos Clave
          </h3>
          <p className="text-gray-700 mb-4">
            El índice captura correctamente los períodos de mayor inestabilidad en Perú:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pico Índice</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-red-50">
                  <td className="px-4 py-2 font-medium text-gray-900">Oct 2008</td>
                  <td className="px-4 py-2 text-gray-700">Crisis financiera global (Lehman Brothers)</td>
                  <td className="px-4 py-2 text-right font-bold text-red-600">+1.55</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Mar 2020</td>
                  <td className="px-4 py-2 text-gray-700">Inicio pandemia COVID-19</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.40</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Nov 2020</td>
                  <td className="px-4 py-2 text-gray-700">Crisis política (vacancia Vizcarra)</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.65</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Dic 2022 - Ene 2023</td>
                  <td className="px-4 py-2 text-gray-700">Protestas post-vacancia Castillo</td>
                  <td className="px-4 py-2 text-right font-semibold text-orange-600">+0.82</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mt-4">
            <strong>Interpretación:</strong> Oct 2008 es el pico histórico (+1.55) debido al componente financiero
            extremo. Las crisis políticas internas (2020, 2022) muestran picos moderados (+0.4 a +0.8) dominados por
            el componente de eventos.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            5.2 Correlación con Variables Macro
          </h3>
          <p className="text-gray-700 mb-4">
            El índice correlaciona negativamente con indicadores de confianza y crecimiento:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>Confianza empresarial (BCRP):</strong> r = -0.42 (p &lt; 0.01)</li>
            <li><strong>PBI YoY:</strong> r = -0.28 (p &lt; 0.05) — inestabilidad frena crecimiento</li>
            <li><strong>Inversión privada:</strong> r = -0.35 (p &lt; 0.01) — mayor inestabilidad, menos inversión</li>
          </ul>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Limitaciones</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>Sesgo de medios:</strong> RSS feeds se concentran en medios limeños. Protestas regionales
              pueden estar subrepresentadas si no reciben cobertura nacional.
            </li>
            <li>
              <strong>Ponderaciones ad-hoc:</strong> Pesos de categorías (corrupción=1.0, protestas=0.8, etc.)
              son subjetivos. Idealmente deberían estimarse de datos históricos.
            </li>
            <li>
              <strong>EMBI no disponible:</strong> EMBI Perú (JP Morgan) sería mejor proxy de riesgo país que
              spreads bancarios locales, pero no está en BCRP. Requiere fuente externa.
            </li>
            <li>
              <strong>Normalización móvil:</strong> Ventana de 60 meses implica que &quot;normalidad&quot; cambia
              en el tiempo. Períodos largos de inestabilidad pueden re-calibrar la baseline.
            </li>
            <li>
              <strong>Clasificación NLP imperfecta:</strong> F1 ~0.75 implica ~25% de error en clasificación.
              Falsos positivos/negativos introducen ruido en el componente de eventos.
            </li>
          </ul>
        </div>

        {/* Future Improvements */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🔮 Mejoras Futuras</h3>
          <ul className="list-disc pl-6 space-y-2 text-blue-800 text-sm">
            <li>
              <strong>Sentiment analysis:</strong> Además de clasificar categorías, extraer sentiment (positivo/negativo)
              de artículos para capturar tono de la cobertura.
            </li>
            <li>
              <strong>EMBI integration:</strong> Agregar spread EMBI Perú como proxy directo de riesgo país percibido
              por inversionistas internacionales.
            </li>
            <li>
              <strong>Social media monitoring:</strong> Expandir fuentes a Twitter/X, Facebook para capturar
              protestas/movilizaciones en tiempo más real.
            </li>
            <li>
              <strong>Ponderaciones dinámicas:</strong> Estimar pesos de categorías mediante regresión inversa
              (qué categorías predicen mejor crisis económicas/financieras).
            </li>
            <li>
              <strong>Forecasting:</strong> Usar serie histórica del índice para predecir futuras crisis
              (ej: nowcast de próxima vacancia presidencial).
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Referencias
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Baker, S. R., Bloom, N., & Davis, S. J. (2016).</strong> &quot;Measuring economic policy
              uncertainty.&quot; <em>The Quarterly Journal of Economics</em>, 131(4), 1593-1636.
            </p>
            <p>
              <strong>Caldara, D., & Iacoviello, M. (2022).</strong> &quot;Measuring geopolitical risk.&quot;{" "}
              <em>American Economic Review</em>, 112(4), 1194-1225.
            </p>
            <p>
              <strong>Manela, A., & Moreira, A. (2017).</strong> &quot;News implied volatility and disaster
              concerns.&quot; <em>Journal of Financial Economics</em>, 123(1), 137-162.
            </p>
            <p>
              <strong>Gentzkow, M., Kelly, B., & Taddy, M. (2019).</strong> &quot;Text as data.&quot;{" "}
              <em>Journal of Economic Literature</em>, 57(3), 535-574.
            </p>
          </div>
        </div>

        {/* Code Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Código fuente disponible en el{" "}
            <a
              href="https://github.com/btorressz/nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-medium"
            >
              repositorio NEXUS
            </a>
          </p>
          <p className="text-xs text-gray-500">
            Ver: <code className="bg-gray-100 px-2 py-1 rounded">src/nlp/classifier.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">src/processing/political_index.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/build_political_index.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
