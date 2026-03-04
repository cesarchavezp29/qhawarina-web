import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-blue-800 mb-3 block">QHAWARINA</Link>
            <p className="text-sm text-gray-600 leading-relaxed">
              Nowcasting económico para Perú. Predicciones diarias de PBI, inflación y pobreza.
            </p>
            <p className="text-xs text-gray-400 mt-3">Datos bajo licencia CC BY 4.0</p>
          </div>

          {/* Estadísticas */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Estadísticas</h3>
            <ul className="space-y-2">
              {[
                ["/estadisticas/pbi", "PBI"],
                ["/estadisticas/inflacion", "Inflación"],
                ["/estadisticas/pobreza", "Pobreza"],
                ["/estadisticas/riesgo-politico", "Riesgo Político"],
                ["/estadisticas/precios-diarios", "Precios Diarios"],
                ["/estadisticas/intervenciones", "Mercado Cambiario"],
                ["/estadisticas/calendario", "Calendario"],
                ["/estadisticas/pobreza/distritos", "Pobreza Distrital"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-600 hover:text-blue-800 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Herramientas + Proyecto */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Herramientas</h3>
            <ul className="space-y-2">
              {[
                ["/simuladores", "Simuladores"],
                ["/escenarios", "Escenarios"],
                ["/reportes", "Reportes"],
                ["/datos", "Datos Abiertos"],
                ["/api/docs", "API"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-600 hover:text-blue-800 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3 mt-5">Proyecto</h3>
            <ul className="space-y-2">
              {[
                ["/metodologia", "Metodología"],
                ["/sobre-nosotros", "Sobre Nosotros"],
                ["/feed.xml", "RSS Feed"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-gray-600 hover:text-blue-800 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fuentes */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Fuentes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>BCRP — Series monetarias</li>
              <li>INEI — PBI, IPC, Pobreza</li>
              <li>MIDAGRI — Precios agrícolas</li>
              <li>Plaza Vea · Metro · Wong</li>
              <li>81 medios (RSS)</li>
            </ul>
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-800 mt-4"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">© {currentYear} Qhawarina — Datos abiertos, metodología transparente</p>
          <p className="text-sm text-gray-400">🇵🇪 Hecho para Perú</p>
        </div>
      </div>
    </footer>
  );
}
