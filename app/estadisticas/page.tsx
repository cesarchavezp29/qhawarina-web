import Link from "next/link";
import LastUpdate from "../components/stats/LastUpdate";

export default function EstadisticasPage() {
  const lastUpdate = "16-Feb-2026";

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Estadísticas</h1>
          <p className="text-lg text-gray-600">
            Indicadores económicos de alta frecuencia para Perú
          </p>
          <div className="mt-4">
            <LastUpdate date={lastUpdate} />
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="space-y-6">
          {/* Actividad Económica */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Producto Bruto Interno
                </h2>
                <p className="text-sm text-gray-600">
                  Nowcast trimestral con proyecciones regionales y sectoriales
                </p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-green-600">+2.1%</p>
                <p className="text-sm text-gray-500">2025-Q3</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/estadisticas/pbi/graficos"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                📊 Gráficos
              </Link>
              <Link
                href="/estadisticas/pbi/mapas"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                🗺️ Mapas
              </Link>
              <Link
                href="/estadisticas/pbi/metodologia"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                📖 Metodología
              </Link>
            </div>
          </div>

          {/* Precios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Inflación</h2>
                <p className="text-sm text-gray-600">
                  Variación mensual con índice de precios de alta frecuencia
                </p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-orange-600">+0.11%</p>
                <p className="text-sm text-gray-500">Feb 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/estadisticas/inflacion/graficos"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                📊 Gráficos
              </Link>
              <Link
                href="/estadisticas/inflacion/mapas"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                🗺️ Mapas
              </Link>
              <Link
                href="/estadisticas/inflacion/metodologia"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                📖 Metodología
              </Link>
            </div>
          </div>

          {/* Condiciones Sociales */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Pobreza</h2>
                <p className="text-sm text-gray-600">
                  Serie mensual/trimestral con mapas regionales
                </p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-red-600">25.4%</p>
                <p className="text-sm text-gray-500">Ene 2025</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/estadisticas/pobreza/graficos"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                📊 Gráficos
              </Link>
              <Link
                href="/estadisticas/pobreza/mapas"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                🗺️ Mapas
              </Link>
              <Link
                href="/estadisticas/pobreza/metodologia"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                📖 Metodología
              </Link>
            </div>
          </div>

          {/* Precios Diarios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Precios Diarios</h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">BPP</span>
                </div>
                <p className="text-sm text-gray-600">
                  Índice Jevons de 42,000+ productos en Plaza Vea, Metro y Wong. Metodología Cavallo (MIT).
                </p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-green-600">+0.40%</p>
                <p className="text-sm text-gray-500">hoy · −0.12% acum.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link
                href="/estadisticas/precios-diarios"
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
              >
                Ver índice →
              </Link>
              <Link
                href="/datos"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
              >
                Descargar datos
              </Link>
            </div>
          </div>

          {/* Riesgo País */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Inestabilidad Política
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Índice compuesto de eventos y estrés financiero
                </p>
                <div className="flex items-center space-x-4">
                  <Link
                    href="/estadisticas/riesgo-politico/graficos"
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Gráficos →
                  </Link>
                  <Link
                    href="/estadisticas/riesgo-politico/metodologia"
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Metodología →
                  </Link>
                </div>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-yellow-600">MEDIO</p>
                <p className="text-sm text-gray-500">0.53</p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> Todos los indicadores utilizan modelos de factores
            dinámicos (DFM) para incorporar información de alta frecuencia. Los datos
            oficiales provienen de BCRP, INEI y MIDAGRI.
          </p>
        </div>
      </div>
    </div>
  );
}
