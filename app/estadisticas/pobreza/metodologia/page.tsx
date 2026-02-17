import LastUpdate from "../../../components/stats/LastUpdate";

export default function PobrezaMetodologiaPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </a>
          {" / "}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">
            Pobreza
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">Metodología</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Metodología - Nowcast de Pobreza
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
            El nowcast de pobreza utiliza un <strong>modelo de panel departamental con Gradient Boosting Regressor (GBR)</strong> que
            predice cambios año-a-año en tasas de pobreza para 24 departamentos. El modelo combina indicadores económicos
            departamentales (crédito, empleo) con datos satelitales de luces nocturnas (NTL) para estimar pobreza monetaria
            con 6-12 meses de anticipación respecto a la publicación oficial anual de INEI.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">RMSE Anual</div>
              <div className="text-2xl font-bold text-blue-900">2.54 pp</div>
              <div className="text-xs text-gray-600">excl. COVID</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">vs AR(1)</div>
              <div className="text-2xl font-bold text-green-900">-4.2%</div>
              <div className="text-xs text-gray-600">Rel.RMSE = 0.953</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">GBR vs Ridge</div>
              <div className="text-2xl font-bold text-purple-900">-25%</div>
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
            1.1 Panel PovertyNowcaster con GBR
          </h3>
          <p className="text-gray-700 mb-4">
            El modelo opera sobre un panel de 24 departamentos × 20 años (2004-2024). Usa un <strong>change-prediction approach</strong>:
            predice el cambio en pobreza, luego lo suma al valor observado en t-1.
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
            Δpobreza<sub>d,t</sub> = GBR(X<sub>d,t</sub>, pobreza<sub>d,t-1</sub>)
            <br />
            pobreza<sub>d,t</sub> = pobreza<sub>d,t-1</sub> + Δpobreza<sub>d,t</sub>
          </div>
          <p className="text-gray-700 mb-4">
            Donde:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>d</strong>: Departamento (24 unidades, Callao fusionado con Lima)</li>
            <li><strong>X<sub>d,t</sub></strong>: Features departamentales agregadas a frecuencia anual</li>
            <li><strong>pobreza<sub>d,t-1</sub></strong>: Rezago de pobreza (muy predictivo)</li>
            <li><strong>GBR</strong>: Gradient Boosting Regressor (scikit-learn) con 100 árboles, max_depth=3</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.2 ¿Por qué Change-Prediction?
          </h3>
          <p className="text-gray-700 mb-4">
            Intentos anteriores de predecir niveles directos fallaron:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            <li>
              <strong>Fixed-effects demeaning:</strong> RMSE = 24.5 pp (inestable con N=24, produce predicciones negativas)
            </li>
            <li>
              <strong>Level prediction con Ridge:</strong> RMSE = 13.7 pp (pierde info del rezago AR tras estandarización)
            </li>
            <li>
              <strong>Change prediction (actual):</strong> RMSE = 2.54 pp ✓ — preserva información del rezago
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.3 Gradient Boosting vs Ridge
          </h3>
          <p className="text-gray-700 mb-4">
            GBR superó dramáticamente a Ridge lineal:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Modelo</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">RMSE (pp)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Casos Extremos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-gray-900">Ridge (α=100)</td>
                  <td className="px-4 py-2 text-right text-gray-700">3.40</td>
                  <td className="px-4 py-2 text-gray-600">Junín: -10pp, Moquegua: -6pp</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-4 py-2 font-semibold text-gray-900">GBR (100 trees)</td>
                  <td className="px-4 py-2 text-right font-bold text-green-900">2.54</td>
                  <td className="px-4 py-2 text-green-800">Junín: +4pp, Moquegua: +0.5pp</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mt-4">
            GBR captura no-linealidades en la relación entre crédito/empleo/NTL y pobreza que Ridge no puede modelar.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            1.4 Manejo de COVID-19
          </h3>
          <p className="text-gray-700 mb-4">
            Similar a GDP/Inflación, excluimos 2020-2021 de training Y evaluación:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            <li>
              <strong>Resultado:</strong> RMSE mejora de 4.6 pp (con COVID) a 3.2 pp (sin COVID) — reducción de 30%
            </li>
            <li>
              <strong>&quot;2018 structural break&quot; = 100% COVID:</strong> pre-2018 RMSE=1.39pp vs post-2018 excl. COVID RMSE=1.57pp (p=0.79, NO significativo)
            </li>
            <li>
              El supuesto &quot;quiebre en 2018&quot; desapareció al excluir COVID — era un artefacto del shock 2020
            </li>
          </ul>
        </div>

        {/* Data Sources */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            2. Fuentes de Datos
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.1 Features Departamentales
          </h3>
          <p className="text-gray-700 mb-4">
            Panel departamental mensual (25 depts × ~260 meses) agregado a frecuencia anual:
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Series</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fuente</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Crédito</td>
                  <td className="px-4 py-2 text-gray-700">Crédito total, consumo, MiPyme (YoY%)</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Depósitos</td>
                  <td className="px-4 py-2 text-gray-700">Depósitos vista, ahorro, plazo (YoY%)</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Electricidad</td>
                  <td className="px-4 py-2 text-gray-700">Producción eléctrica departamental (YoY%)</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Empleo</td>
                  <td className="px-4 py-2 text-gray-700">Afiliados pensiones (ONP/AFP, YoY%)</td>
                  <td className="px-4 py-2 text-gray-600">BCRP</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Fiscal</td>
                  <td className="px-4 py-2 text-gray-700">Recaudación tributaria, gasto regional/local (YoY%)</td>
                  <td className="px-4 py-2 text-gray-600">MEF/SUNAT</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-medium text-gray-900">Satelital</td>
                  <td className="px-4 py-2 text-gray-700">Luces nocturnas (NTL) suma departamental (log)</td>
                  <td className="px-4 py-2 text-gray-600">NOAA-VIIRS</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.2 Luces Nocturnas (NTL) como Proxy
          </h3>
          <p className="text-gray-700 mb-4">
            NTL mensual se agrega a anual y se transforma con log(1+x) para estabilizar varianza:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            NTL_annual<sub>d,t</sub> = log(1 + mean(NTL_monthly<sub>d,t</sub>))
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Ventajas:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>Cobertura universal (25 departamentos sin gaps)</li>
            <li>Frecuencia mensual → permite nowcasting intra-año</li>
            <li>Correlaciona negativamente con pobreza (más luz = menos pobreza)</li>
            <li>Sin rezago de publicación (~15 días desde fin de mes)</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            2.3 Target: Pobreza Monetaria Departamental (INEI)
          </h3>
          <p className="text-gray-700 mb-4">
            Tasa de pobreza monetaria (% población bajo línea de pobreza) por departamento. Publicado anualmente
            con ~6-7 meses de rezago (ej: datos 2024 publicados en Mayo 2025).
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Cobertura:</strong> 24 departamentos (Callao fusionado con Lima en datos oficiales), 2004-2024.
          </p>
        </div>

        {/* Performance */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            3. Desempeño y Validación
          </h2>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.1 Backtest Anual (2012-2024, excl. COVID)
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
                  <td className="px-4 py-2 font-semibold text-gray-900">Panel GBR (change-pred)</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-900">2.54</td>
                  <td className="px-4 py-2 text-right text-blue-900">1.89</td>
                  <td className="px-4 py-2 text-right text-blue-900">0.953</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">AR(1) Departamental</td>
                  <td className="px-4 py-2 text-right text-gray-700">2.65</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.97</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-gray-900">Random Walk</td>
                  <td className="px-4 py-2 text-right text-gray-700">2.78</td>
                  <td className="px-4 py-2 text-right text-gray-700">2.11</td>
                  <td className="px-4 py-2 text-right text-gray-700">1.049</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 mt-4">
            <strong>Primera vez que GBR supera AR(1)</strong> en backtests de pobreza (Rel.RMSE = 0.953, -4.7% error).
            Anteriormente Ridge no lograba vencer benchmarks naive.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.2 Nowcasting Mensual (2012-2024)
          </h3>
          <p className="text-gray-700 mb-4">
            El modelo también produce nowcasts <strong>mensuales</strong> usando rolling windows de 12 meses sobre el panel:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><strong>RMSE mensual:</strong> ~4.3-4.5 pp (estable en meses 3, 6, 9, 12)</li>
            <li><strong>Within-year noise:</strong> 0.5-0.7 pp (bien debajo de 2pp threshold)</li>
            <li><strong>Monthly revisions:</strong> 0.6-0.7 pp (pequeñas y estables)</li>
            <li><strong>Rel.RMSE vs AR1:</strong> 0.989 (-1.1% vs AR1) — ligeramente mejor que anual</li>
          </ul>
          <p className="text-gray-700">
            El ruido intra-año es bajo, por lo que <strong>NO se requiere suavizado</strong> adicional.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            3.3 Nowcast Actual (2024)
          </h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-900 font-medium">
              Pobreza Nacional 2024: <strong>26.8%</strong>
            </p>
            <p className="text-sm text-green-800 mt-2">
              24 departamentos | Panel completo a través de Nov-2024
            </p>
          </div>
        </div>

        {/* Quarterly Nowcasting */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            4. Nowcasting Trimestral
          </h2>
          <p className="text-gray-700 mb-4">
            Complemento a nowcasts anuales/mensuales: predicciones <strong>trimestrales</strong> usando
            desagregación temporal (Chow-Lin) para interpolar entre años.
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            4.1 Método Chow-Lin
          </h3>
          <p className="text-gray-700 mb-4">
            Desagrega observaciones anuales a frecuencia trimestral usando indicadores de alta frecuencia como related series:
          </p>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm mb-4">
            pobreza_quarterly = ChowLin(pobreza_annual, related=[empleo_q, credito_q, ntl_q])
          </div>
          <p className="text-gray-700 mb-4">
            <strong>Ventajas:</strong>
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>Preserva totales anuales (suma de 4 trimestres = valor anual)</li>
            <li>Captura variación intra-año usando indicadores mensuales agregados a trimestral</li>
            <li>Métodos GLS minimizan autocorrelación residual</li>
          </ul>
          <p className="text-gray-700">
            Ver{" "}
            <a href="/estadisticas/pobreza/graficos" className="text-blue-700 hover:underline">
              gráficos trimestrales
            </a>
            {" "}para series desagregadas.
          </p>
        </div>

        {/* Limitations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Limitaciones</h3>
          <ul className="list-disc pl-6 space-y-2 text-yellow-800 text-sm">
            <li>
              <strong>N pequeño:</strong> Solo 24 departamentos → varianza alta en estimaciones departamentales.
              Nacional es más estable.
            </li>
            <li>
              <strong>Rezago de features:</strong> Algunos indicadores departamentales (crédito, empleo) tienen
              1-2 meses de publication lag, limitando la anticipación del nowcast.
            </li>
            <li>
              <strong>Heterogeneidad regional:</strong> Relaciones crédito-pobreza pueden variar por departamento
              (ej: Lima vs Amazonas). GBR captura algo de no-linealidad pero no interacciones espaciales complejas.
            </li>
            <li>
              <strong>COVID como outlier extremo:</strong> Exclusión total de 2020-2021 reduce datos disponibles
              (de 20 años a 18 años efectivos). Trade-off necesario para evitar distorsión.
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
              <strong>Elbers, C., Lanjouw, J. O., & Lanjouw, P. (2003).</strong> &quot;Micro-level estimation
              of poverty and inequality.&quot; <em>Econometrica</em>, 71(1), 355-364.
            </p>
            <p>
              <strong>Zhao, X., Yu, B., Liu, Y., Chen, Z., Li, Q., Wang, C., & Wu, J. (2019).</strong>
              {" "}&quot;Estimation of poverty using random forest regression with multi-source data: A case
              study in Bangladesh.&quot; <em>Remote Sensing</em>, 11(4), 375.
            </p>
            <p>
              <strong>Jean, N., Burke, M., Xie, M., Davis, W. M., Lobell, D. B., & Ermon, S. (2016).</strong>
              {" "}&quot;Combining satellite imagery and machine learning to predict poverty.&quot;{" "}
              <em>Science</em>, 353(6301), 790-794.
            </p>
            <p>
              <strong>Chow, G. C., & Lin, A. L. (1971).</strong> &quot;Best linear unbiased interpolation,
              distribution, and extrapolation of time series by related series.&quot;{" "}
              <em>The Review of Economics and Statistics</em>, 53(4), 372-375.
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
            Ver: <code className="bg-gray-100 px-2 py-1 rounded">src/models/poverty.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">src/processing/spatial_disagg.py</code>,{" "}
            <code className="bg-gray-100 px-2 py-1 rounded">scripts/run_poverty_backtest.py</code>
          </p>
        </div>
      </div>
    </div>
  );
}
