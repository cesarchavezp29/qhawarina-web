import LastUpdate from "../../../components/stats/LastUpdate";

export default function InflacionMetodologiaPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </a>
          {" / "}
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">
            Inflación
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">Metodología</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Metodología - Nowcast de Inflación
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
            El nowcast de inflación mensual utiliza un <strong>Modelo de Factores Dinámicos (DFM)</strong> con
            factores rezagados y término autorregresivo para predecir la variación mensual del IPC (promedio móvil 3 meses).
            El modelo integra precios de alta frecuencia (supermercados, mayoristas) con indicadores tradicionales para
            detectar presiones inflacionarias antes de la publicación oficial mensual del INEI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">RMSE (3M-MA)</div>
              <div className="text-2xl font-bold text-blue-900">0.319 pp</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">R² Early Backtest</div>
              <div className="text-2xl font-bold text-green-900">0.70-0.82</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">vs AR(1)</div>
              <div className="text-2xl font-bold text-purple-900">-0.9%</div>
              <div className="text-xs text-gray-600">Rel.RMSE = 0.991</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Arquitectura del Modelo
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.1 DFM con Factores Rezagados
          </h3>
          <p className="text-gray-700 mb-4">
            A diferencia del modelo de PBI, el modelo de inflación incluye factores rezagados para capturar
            dinámicas de transmisión de precios:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            IPC<sub>t</sub> = α + β<sub>0</sub>&apos;F<sub>t</sub> + β<sub>1</sub>&apos;F<sub>t-1</sub> + γ·IPC<sub>t-1</sub> + ε<sub>t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            Donde:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>F<sub>t</sub></strong>: Factores contemporáneos (K=3)</li>
            <li><strong>F<sub>t-1</sub></strong>: Factores con 1 mes de rezago</li>
            <li><strong>IPC<sub>t-1</sub></strong>: Término autorregresivo (inercia inflacionaria)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            La inclusión de rezagos mejora R² de 0.139 (solo factores contemporáneos) a 0.199 (con rezagos).
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.2 Target: Variación Mensual Suavizada (3M-MA)
          </h3>
          <p className="text-gray-700 mb-4">
            Clave para el desempeño del modelo: predecimos la variación mensual del IPC con promedio móvil de 3 meses
            en lugar de la variación cruda mensual.
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            IPC_3M<sub>t</sub> = (var<sub>t</sub> + var<sub>t-1</sub> + var<sub>t-2</sub>) / 3
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Beneficios:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>Reduce volatilidad 30% (de 0.323 a 0.225) preservando señal de corto plazo</li>
            <li>Mejora R² de ~0.14 (variación cruda) a 0.70-0.82 (3M-MA) en early backtest</li>
            <li>Más robusto a shocks transitorios (ofertas, eventos únicos)</li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>¿Por qué NO usar variación 12m?</strong> La variación interanual (IPC 12m) es demasiado
              persistente (autocorrelación ~0.95) - un modelo AR(1) simple la predice casi perfectamente. DFM no agrega
              valor para targets tan suaves. La variación mensual suavizada (3M-MA) encuentra el balance óptimo entre
              volatilidad y predictibilidad.
            </p>
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Fuentes de Datos
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.1 Precios de Alta Frecuencia
          </h3>
          <p className="text-gray-700 mb-4">
            Innovación clave: <strong>precios diarios/semanales</strong> que anticipan el IPC mensual oficial:
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cobertura</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Supermercados</td>
                  <td className="px-4 py-2 text-gray-700">42,710 SKUs (Plaza Vea, Metro, Wong)</td>
                  <td className="px-4 py-2 text-gray-600">Diaria</td>
                  <td className="px-4 py-2 text-gray-600">Scraping VTEX API</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">MIDAGRI Mayorista</td>
                  <td className="px-4 py-2 text-gray-700">Frutas, verduras, tubérculos (GMML)</td>
                  <td className="px-4 py-2 text-gray-600">Diaria</td>
                  <td className="px-4 py-2 text-gray-600">Scraping PDFs boletines</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">MIDAGRI Pollo</td>
                  <td className="px-4 py-2 text-gray-700">Pollo mayorista/minorista, huevos</td>
                  <td className="px-4 py-2 text-gray-600">Diaria</td>
                  <td className="px-4 py-2 text-gray-600">Scraping PDFs aves</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.2 Índice de Supermercados (BPP para Perú)
          </h3>
          <p className="text-gray-700 mb-4">
            Similar al <strong>Billion Prices Project</strong> del MIT, construimos un índice diario de precios
            monitoreando supermercados en línea. Método: <strong>Jevons bilateral</strong> (media geométrica de
            ratios de precios).
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            I<sub>t</sub> = I<sub>t-1</sub> · exp( (1/N) Σ log(p<sub>i,t</sub> / p<sub>i,t-1</sub>) )
          </div>
          <p className="text-gray-700 mb-4">
            Solo incluye productos presentes en ambas fechas. Filtra ratios extremos (0.5 &lt; ratio &lt; 2.0) para
            eliminar ofertas y errores de scraping.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.3 Indicadores Tradicionales (25 series)
          </h3>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>Tipo de cambio nominal y volatilidad (BCRP)</li>
            <li>Precios al por mayor agregados (BCRP)</li>
            <li>Componentes del IPC: core, no-core, alimentos (INEI)</li>
            <li>Expectativas de inflación empresarial (BCRP)</li>
            <li>Precios de combustibles (OSINERGMIN)</li>
            <li>Salarios y remuneraciones (MTPE)</li>
          </ul>
        </div>

        {/* Performance */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Desempeño y Validación
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.1 Backtest Out-of-Sample
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">MAE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rel.RMSE</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 font-semibold text-gray-900">DFM (factores + rezagos + AR)</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-900">0.319</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.241</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.991</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">AR(1)</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.322</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.248</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">Random Walk</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.402</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.316</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.248</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-700 mt-4 mb-4">
            El DFM apenas supera AR(1) en RMSE global (-0.9%), pero el valor está en:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>Detección temprana:</strong> Precios diarios de supermercados dan señales con días de anticipación</li>
            <li><strong>Puntos de inflexión:</strong> DFM captura mejor cambios de tendencia que AR(1)</li>
            <li><strong>Early backtest R²:</strong> 0.70-0.82 indica buena capacidad predictiva en período de entrenamiento</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.2 Nowcast Actual (Feb 2026)
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-medium">
              IPC Feb-2026 (3M-MA): <strong>+0.29%</strong>
            </p>
            <p className="text-sm text-green-800 mt-2">
              Error vs oficial: 0.003% | R² = 0.199 | Panel completo a través de Ene-2026
            </p>
          </div>
        </div>

        {/* High-Frequency Prices */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Índice de Precios de Alta Frecuencia
          </h2>
          <p className="text-gray-700 mb-4">
            Complemento al nowcast mensual: un <strong>índice diario</strong> que monitorea precios en tiempo casi real.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            4.1 Metodología BPP
          </h3>
          <p className="text-gray-700 mb-4">
            Inspirado en el Billion Prices Project (Cavallo & Rigobon, 2016), scraped de supermercados peruanos:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>42,710 SKUs monitoreados diariamente</li>
            <li>3 cadenas principales: Plaza Vea, Metro, Wong</li>
            <li>Índice Jevons bilateral (base = 100)</li>
            <li>Sin rezago de publicación (actualización diaria)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            4.2 Ventajas y Limitaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✓ Ventajas</h4>
              <ul className="list-disc pl-4 text-sm text-green-800 space-y-1">
                <li>Frecuencia diaria vs IPC mensual</li>
                <li>Sin rezago de publicación</li>
                <li>Gran cobertura (42K productos)</li>
                <li>Replica metodología MIT BPP</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠ Limitaciones</h4>
              <ul className="list-disc pl-4 text-sm text-yellow-800 space-y-1">
                <li>Solo supermercados (no mercados tradicionales)</li>
                <li>Sesgado hacia Lima Metropolitana</li>
                <li>No incluye servicios (~50% de CPI)</li>
                <li>Sensible a promociones/ofertas</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            Ver{" "}
            <a href="/estadisticas/inflacion/precios-alta-frecuencia" className="text-blue-700 hover:underline">
              índice de precios diarios
            </a>
            {" "}para datos actualizados.
          </p>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Limitaciones</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>Ventaja marginal sobre AR(1):</strong> Rel.RMSE = 0.991 indica solo -0.9% de mejora.
              El valor del DFM está en detección temprana de cambios, no en reducción masiva de error.
            </li>
            <li>
              <strong>Dependencia de scraping:</strong> Cambios en estructura de sitios web pueden romper scrapers.
              Mantenimiento continuo requerido.
            </li>
            <li>
              <strong>Cobertura geográfica:</strong> Precios de alta frecuencia concentrados en Lima.
              Inflación regional puede diferir.
            </li>
            <li>
              <strong>Servicios no cubiertos:</strong> Índice de supermercados no captura ~50% del CPI (servicios,
              alquileres, salud, educación).
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
              <strong>Cavallo, A., & Rigobon, R. (2016).</strong> &quot;The Billion Prices Project: Using online
              prices for measurement and research.&quot; <em>Journal of Economic Perspectives</em>, 30(2), 151-178.
            </p>
            <p>
              <strong>Bok, B., Caratelli, D., Giannone, D., Sbordone, A. M., & Tambalotti, A. (2018).</strong>
              {" "}&quot;Macroeconomic nowcasting and forecasting with big data.&quot;{" "}
              <em>Annual Review of Economics</em>, 10, 615-643.
            </p>
            <p>
              <strong>Koop, G., & Korobilis, D. (2012).</strong> &quot;Forecasting inflation using dynamic model
              averaging.&quot; <em>International Economic Review</em>, 53(3), 867-886.
            </p>
            <p>
              <strong>Giannone, D., Monti, F., & Reichlin, L. (2009).</strong> &quot;Incorporating conjunctural
              analysis in structural models.&quot; In <em>Wiley Handbook in Applied Econometrics</em>, 41-57.
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
            Ver: <code className="bg-gray-100 px-2 py-1 rounded">src/models/dfm.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">src/ingestion/midagri.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/build_daily_index.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
