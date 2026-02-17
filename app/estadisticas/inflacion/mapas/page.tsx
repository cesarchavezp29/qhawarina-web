import LastUpdate from "../../../components/stats/LastUpdate";

export default function InflacionMapasPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </a>
          {" / "}
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">
            Inflación
          </a>
          {" / "}
          <span className="text-gray-900 font-medium">Mapas</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Mapas Regionales - Inflación
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Variación de precios por departamento
        </p>
        <div className="mt-4">
          <LastUpdate date="15-Feb-2026" />
        </div>

        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribución Regional</h2>
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Mapas departamentales de inflación
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Esta funcionalidad estará disponible próximamente. INEI publica IPC a
              nivel nacional y 24 ciudades principales.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-600">
                <strong>Método planificado:</strong> Índice de precios por ciudad
                principal con interpolación espacial para cobertura departamental.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
