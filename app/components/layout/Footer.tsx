import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Qhawarina
            </h3>
            <p className="text-sm text-gray-600">
              Nowcasting económico para Perú. Predicciones diarias de indicadores macroeconómicos usando modelos de factores dinámicos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Enlaces
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/estadisticas" className="text-sm text-gray-600 hover:text-blue-800">
                  Estadísticas
                </Link>
              </li>
              <li>
                <Link href="/datos" className="text-sm text-gray-600 hover:text-blue-800">
                  Datos
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-sm text-gray-600 hover:text-blue-800">
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Fuentes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Banco Central de Reserva del Perú (BCRP)</li>
              <li>Instituto Nacional de Estadística (INEI)</li>
              <li>Ministerio de Agricultura (MIDAGRI)</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-sm text-gray-500">
            {currentYear} Qhawarina. Datos abiertos. Metodología transparente.
          </p>
        </div>
      </div>
    </footer>
  );
}
