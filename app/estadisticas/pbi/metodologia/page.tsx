import LastUpdate from "../../../components/stats/LastUpdate";

export default function PBIMetodologiaPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </a>
          {" / "}
          <a href="/estadisticas/pbi" className="hover:text-blue-700">
            PBI
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">Metodología</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Metodología - Nowcast de PBI
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
            El nowcast de PBI trimestral utiliza un <strong>Modelo de Factores Dinámicos (DFM)</strong> con
            ecuación puente Ridge para predecir el crecimiento del PBI peruano con 1-3 meses de anticipación
            respecto a la publicación oficial de INEI. El modelo resume 35+ indicadores mensuales de alta
            frecuencia en 3 factores latentes que capturan las dimensiones principales de la actividad económica.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">RMSE Pre-COVID</div>
              <div className="text-2xl font-bold text-blue-900">1.47 pp</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">R² In-Sample</div>
              <div className="text-2xl font-bold text-green-900">0.93</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">vs AR(1)</div>
              <div className="text-2xl font-bold text-purple-900">-31%</div>
              <div className="text-xs text-gray-600">RMSE reduction</div>
            </div>
          </div>
        </div>

        {/* Model Architecture */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            1. Arquitectura del Modelo
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.1 Modelo de Factores Dinámicos (DFM)
          </h3>
          <p className="text-gray-700 mb-4">
            El DFM asume que un panel de N indicadores mensuales puede ser resumido por K factores latentes comunes:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            X<sub>it</sub> = λ<sub>i</sub>&apos;F<sub>t</sub> + ε<sub>it</sub>
            <br />
            F<sub>t</sub> = A<sub>1</sub>F<sub>t-1</sub> + ... + A<sub>p</sub>F<sub>t-p</sub> + u<sub>t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            Donde:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>X<sub>it</sub></strong>: Indicador i en el mes t (estandarizado)</li>
            <li><strong>F<sub>t</sub></strong>: Vector de K=3 factores latentes</li>
            <li><strong>λ<sub>i</sub></strong>: Factor loadings (pesos de cada indicador)</li>
            <li><strong>A<sub>p</sub></strong>: Matrices autorregresivas de orden p=1</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.2 Ecuación Puente (Bridge Equation)
          </h3>
          <p className="text-gray-700 mb-4">
            Los factores mensuales se agregan a frecuencia trimestral y se relacionan con el PBI mediante
            regresión Ridge con término autorregresivo:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            GDP<sub>t</sub> = α + β<sub>1</sub>·F̄<sub>1,t</sub> + β<sub>2</sub>·F̄<sub>2,t</sub> + β<sub>3</sub>·F̄<sub>3,t</sub> + γ·GDP<sub>t-1</sub> + ε<sub>t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            Donde F̄<sub>k,t</sub> es el promedio trimestral del factor k. Usamos Ridge (α=1.0) en lugar de OLS
            para evitar overfitting - OLS producía coeficientes de -81 en factor_1, Ridge da coeficientes estables y
            reduce RMSE 28% (1.41 vs 1.97).
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.3 Manejo de COVID-19
          </h3>
          <p className="text-gray-700 mb-4">
            Para evitar distorsiones por el shock estructural de 2020-2021:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            <li>
              <strong>Rolling window de 7 años:</strong> En lugar de ventana expansiva, usamos solo los últimos
              84 meses para extracción de factores. Esto evita que el modelo &quot;aprenda&quot; patrones de COVID
              que no se repetirán.
            </li>
            <li>
              <strong>Exclusión de training:</strong> Post-2022, el modelo excluye 2020-2021 del entrenamiento
              de la ecuación puente. Pre-COVID usa todos los datos disponibles.
            </li>
            <li>
              <strong>Resultado:</strong> RMSE post-COVID mejora de 8.1 pp (ventana expansiva) a 7.1 pp (rolling + exclusión).
            </li>
          </ul>
        </div>

        {/* Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Fuentes de Datos
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.1 Indicadores Mensuales (35 series)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Categoría
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Indicadores
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fuente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Producción</td>
                  <td className="px-4 py-2 text-gray-700">Manufactura, minería, construcción, pesca</td>
                  <td className="px-4 py-2 text-gray-600">INEI, BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Comercio Exterior</td>
                  <td className="px-4 py-2 text-gray-700">Exportaciones, importaciones (volumen y valor)</td>
                  <td className="px-4 py-2 text-gray-600">BCRP, SUNAT</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Crédito</td>
                  <td className="px-4 py-2 text-gray-700">Crédito total, consumo, hipotecario, empresas</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Empleo</td>
                  <td className="px-4 py-2 text-gray-700">Empleo formal Lima, planilla privada</td>
                  <td className="px-4 py-2 text-gray-600">MTPE</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Fiscal</td>
                  <td className="px-4 py-2 text-gray-700">Recaudación tributaria, gasto público</td>
                  <td className="px-4 py-2 text-gray-600">SUNAT, MEF</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Expectativas</td>
                  <td className="px-4 py-2 text-gray-700">Confianza empresarial, expectativas PBI</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Satelital</td>
                  <td className="px-4 py-2 text-gray-700">Luces nocturnas (NTL) suma nacional</td>
                  <td className="px-4 py-2 text-gray-600">NOAA-VIIRS</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.2 Target: PBI Trimestral (INEI)
          </h3>
          <p className="text-gray-700 mb-4">
            PBI desestacionalizado, variación YoY (%). Publicado con ~45 días de rezago. Target period: último
            trimestre completo para el cual hay panel suficiente (&gt;50% de series con datos).
          </p>
        </div>

        {/* Performance */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Desempeño y Validación
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.1 Backtest Histórico (2010-2025)
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">MAE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">R²</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-gray-900">Pre-COVID (2010-2019)</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">1.47</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.12</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.89</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">Post-COVID (2022-2025)</td>
                  <td className="px-4 py-2 text-right font-semibold text-gray-900">7.09</td>
                  <td className="px-4 py-2 text-right text-gray-700">5.21</td>
                  <td className="px-4 py-2 text-right text-gray-700">0.76</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 text-gray-900 font-medium">Período Completo</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-900">5.45</td>
                  <td className="px-4 py-2 text-right text-blue-900">3.89</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.93</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.2 Comparación vs Benchmarks
          </h3>
          <p className="text-gray-700 mb-4">
            El DFM supera consistentemente a modelos naive:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>AR(1):</strong> RMSE = 7.85 pp → DFM Rel.RMSE = 0.69 (-31% error)</li>
            <li><strong>Random Walk:</strong> RMSE = 8.01 pp → DFM Rel.RMSE = 0.68 (-32% error)</li>
          </ul>
          <p className="text-gray-700 mb-4">
            El valor del DFM es mayor en puntos de inflexión (recesiones, aceleraciones) donde AR(1) simplemente
            proyecta tendencia reciente.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.3 Nowcast Actual (2025-Q4)
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-medium">
              PBI 2025-Q4: <strong>+2.13%</strong> YoY
            </p>
            <p className="text-sm text-green-800 mt-2">
              Bridge R² = 0.934 | Panel a través de Nov-2025 | 33/35 series activas
            </p>
          </div>
        </div>

        {/* Regional Disaggregation */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Desagregación Regional
          </h2>
          <p className="text-gray-700 mb-4">
            El nowcast nacional se desagrega a 25 departamentos usando luces nocturnas (NTL) como proxy de
            actividad económica regional. Método: <strong>ntl_share</strong> (asignación proporcional).
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            GDP<sub>dept,t</sub> = GDP<sub>nacional,t</sub> × share<sub>dept</sub>
            <br />
            share<sub>dept</sub> = NTL<sub>dept</sub> / Σ NTL<sub>nacional</sub>
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Supuesto:</strong> Modelo homogéneo - todos los departamentos crecen al ritmo nacional.
            Solo varía la participación económica, no las tasas de crecimiento. Ver{" "}
            <a href="/estadisticas/pbi/mapas" className="text-blue-700 hover:underline">
              mapas regionales
            </a>
            {" "}para detalles.
          </p>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Limitaciones</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>Datos faltantes:</strong> El &quot;ragged edge&quot; (meses recientes con series incompletas)
              puede introducir ruido. Truncamos meses con &lt;50% de datos.
            </li>
            <li>
              <strong>Cambios estructurales:</strong> El modelo asume estabilidad de relaciones. Shocks como COVID
              requieren tratamiento especial (exclusión, rolling windows).
            </li>
            <li>
              <strong>Revisiones de PBI:</strong> INEI revisa el PBI oficial hasta 3 trimestres hacia atrás.
              El backtest usa datos vintage para realismo.
            </li>
            <li>
              <strong>Desagregación regional:</strong> El modelo homogéneo no captura heterogeneidad en crecimiento
              departamental. Futuros modelos usarán indicadores regionales específicos.
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
              <strong>Giannone, D., Reichlin, L., & Small, D. (2008).</strong> &quot;Nowcasting: The real-time
              informational content of macroeconomic data.&quot; <em>Journal of Monetary Economics</em>, 55(4), 665-676.
            </p>
            <p>
              <strong>Bańbura, M., & Rünstler, G. (2011).</strong> &quot;A look into the factor model black box:
              Publication lags and the role of hard and soft data in forecasting GDP.&quot;{" "}
              <em>International Journal of Forecasting</em>, 27(2), 333-346.
            </p>
            <p>
              <strong>Stock, J. H., & Watson, M. W. (2002).</strong> &quot;Forecasting using principal components
              from a large number of predictors.&quot; <em>Journal of the American Statistical Association</em>,
              97(460), 1167-1179.
            </p>
            <p>
              <strong>Mariano, R. S., & Murasawa, Y. (2003).</strong> &quot;A new coincident index of business
              cycles based on monthly and quarterly series.&quot; <em>Journal of Applied Econometrics</em>, 18(4), 427-443.
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
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/generate_nowcast.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
