import LastUpdate from "../components/stats/LastUpdate";

export default function MetodologiaPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Metodología
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Documentación técnica completa de nuestros modelos de nowcasting y fuentes de datos.
        </p>
        <div className="mt-4 mb-8">
          <LastUpdate date="16-Feb-2026" />
        </div>

        {/* Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Acerca de Nuestra Metodología
          </h2>
          <p className="text-gray-700 mb-4">
            QHAWARINA utiliza técnicas avanzadas de nowcasting económico para predecir indicadores clave de la
            economía peruana antes de su publicación oficial. Nuestros modelos combinan:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
            <li>
              <strong>Modelos de Factores Dinámicos (DFM)</strong> que resumen decenas de indicadores de alta
              frecuencia en factores latentes
            </li>
            <li>
              <strong>Machine Learning</strong> (Gradient Boosting, Ridge regression) para capturar relaciones
              no-lineales
            </li>
            <li>
              <strong>Datos satelitales</strong> (luces nocturnas) para monitoreo en tiempo real de actividad económica
            </li>
            <li>
              <strong>Web scraping y NLP</strong> para precios de alta frecuencia y análisis de eventos políticos
            </li>
            <li>
              <strong>Validación rigurosa</strong> mediante backtests out-of-sample con datos vintage
            </li>
          </ul>
          <p className="text-gray-700">
            Toda nuestra metodología está documentada con transparencia académica, incluyendo fórmulas matemáticas,
            desempeño histórico, limitaciones conocidas y referencias bibliográficas.
          </p>
        </div>

        {/* Methodology Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* GDP */}
          <a
            href="/estadisticas/pbi/metodologia"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-800">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nowcast de PBI
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Modelo de Factores Dinámicos con 35+ indicadores mensuales, ecuación puente Ridge,
                  manejo de COVID-19 y desagregación regional NTL.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>✓ RMSE: 1.47pp (pre-COVID)</span>
                  <span>✓ R²: 0.93</span>
                </div>
                <div className="mt-3 text-blue-700 font-medium text-sm flex items-center">
                  Ver metodología completa
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Inflation */}
          <a
            href="/estadisticas/inflacion/metodologia"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-800">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nowcast de Inflación
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  DFM con factores rezagados, target 3M-MA, precios de alta frecuencia (BPP),
                  scraping de supermercados y MIDAGRI.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>✓ RMSE: 0.319pp</span>
                  <span>✓ R²: 0.70-0.82</span>
                </div>
                <div className="mt-3 text-blue-700 font-medium text-sm flex items-center">
                  Ver metodología completa
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Poverty */}
          <a
            href="/estadisticas/pobreza/metodologia"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-800">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nowcast de Pobreza
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Panel departamental con Gradient Boosting, change-prediction approach,
                  NTL satelital y desagregación Chow-Lin trimestral.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>✓ RMSE: 2.54pp</span>
                  <span>✓ Rel.RMSE: 0.953 vs AR1</span>
                </div>
                <div className="mt-3 text-blue-700 font-medium text-sm flex items-center">
                  Ver metodología completa
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>

          {/* Political Risk */}
          <a
            href="/estadisticas/riesgo-politico/metodologia"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-100 text-red-800">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Índice de Inestabilidad Política
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Índice compuesto 50% eventos NLP + 50% estrés financiero, clasificación
                  BERT de ~2,500 noticias/mes, validación histórica.
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>✓ F1-score: 0.75</span>
                  <span>✓ Actualización diaria</span>
                </div>
                <div className="mt-3 text-blue-700 font-medium text-sm flex items-center">
                  Ver metodología completa
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Technical Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            📊 Principios Metodológicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-semibold mb-2">Transparencia</h3>
              <p>
                Documentamos completamente nuestros modelos con fórmulas matemáticas, código fuente abierto
                y validación histórica rigurosa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Reproducibilidad</h3>
              <p>
                Todos los backtests usan datos vintage (punto-en-el-tiempo) para simular predicciones en
                tiempo real sin look-ahead bias.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Validación Out-of-Sample</h3>
              <p>
                Comparamos contra benchmarks naive (AR1, Random Walk) en ventanas expansivas para evaluar
                valor agregado real.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Limitaciones Honestas</h3>
              <p>
                Cada metodología documenta limitaciones conocidas, sesgos potenciales y áreas de mejora futura.
              </p>
            </div>
          </div>
        </div>

        {/* Code Repository */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            💻 Código Fuente Abierto
          </h2>
          <p className="text-gray-700 mb-4">
            Todo el código está disponible públicamente en nuestro repositorio GitHub:
          </p>
          <a
            href="https://github.com/btorressz/nexus"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Ver repositorio NEXUS
          </a>
          <p className="text-sm text-gray-500 mt-3">
            Incluye: modelos de nowcasting, scripts de ingesta de datos, backtesting, visualizaciones y tests.
          </p>
        </div>
      </div>
    </div>
  );
}
