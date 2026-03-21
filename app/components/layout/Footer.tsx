'use client';

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function Footer() {
  const isEn = useLocale() === "en";
  const currentYear = new Date().getFullYear();

  const investigacionLinks = isEn ? [
    ["/estadisticas/pbi",               "GDP Nowcast"],
    ["/estadisticas/inflacion",         "Inflation"],
    ["/estadisticas/precios-diarios",   "Daily Prices (BPP)"],
    ["/estadisticas/pobreza",           "Poverty"],
    ["/estadisticas/riesgo-politico",   "Political Risk"],
    ["/estadisticas/riesgo-economico",  "Economic Risk"],
    ["/estadisticas/intervenciones",    "FX Market"],
    ["/estadisticas/pobreza/distritos", "District Poverty"],
    ["/estadisticas/calendario",        "Economic Calendar"],
    ["/observatorio/luces-nocturnas",   "Nighttime Lights"],
  ] : [
    ["/estadisticas/pbi",               "PBI Nowcast"],
    ["/estadisticas/inflacion",         "Inflación"],
    ["/estadisticas/precios-diarios",   "Precios Diarios (BPP)"],
    ["/estadisticas/pobreza",           "Pobreza"],
    ["/estadisticas/riesgo-politico",   "Riesgo Político"],
    ["/estadisticas/riesgo-economico",  "Riesgo Económico"],
    ["/estadisticas/intervenciones",    "Mercado Cambiario"],
    ["/estadisticas/pobreza/distritos", "Pobreza Distrital"],
    ["/estadisticas/calendario",        "Calendario Económico"],
    ["/observatorio/luces-nocturnas",   "Luminosidad Nocturna"],
  ];

  const publicacionesLinks = isEn ? [
    ["/columnas",    "Columns"],
    ["/reportes",    "Reports"],
    ["/metodologia", "Methodology"],
  ] : [
    ["/columnas",    "Columnas"],
    ["/reportes",    "Reportes"],
    ["/metodologia", "Metodología"],
  ];

  const datosLinks = isEn ? [
    ["/datos",       "Open Data"],
    ["/api/docs",    "API"],
    ["/simuladores", "Simulators"],
    ["/escenarios",  "Scenarios"],
  ] : [
    ["/datos",       "Datos Abiertos"],
    ["/api/docs",    "API"],
    ["/simuladores", "Simuladores"],
    ["/escenarios",  "Escenarios"],
  ];

  const institucionalLinks = isEn ? [
    ["/sobre-nosotros", "About Qhawarina"],
    ["/prensa",         "Press"],
    ["/institucional",  "For Institutions"],
    ["/feed.xml",       "RSS Feed"],
  ] : [
    ["/sobre-nosotros", "Sobre Qhawarina"],
    ["/prensa",         "Prensa"],
    ["/institucional",  "Para Instituciones"],
    ["/feed.xml",       "Feed RSS"],
  ];

  const linkStyle = { color: "#8D99AE" };

  return (
    <footer style={{ background: "#2D3142", borderTop: "1px solid #3d4258", marginTop: 64 }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">

          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <Image src="/logo-q-64.png" alt="Q" width={32} height={32} className="flex-shrink-0" />
              <span className="text-xl font-bold tracking-wide"
                style={{ color: "#C65D3E", fontFamily: "var(--font-outfit, sans-serif)" }}>
                QHAWARINA
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#8D99AE" }}>
              {isEn
                ? "High-frequency economic data for Peru. Daily indicators of GDP, inflation, poverty and political risk."
                : "Datos económicos de alta frecuencia para el Perú. Indicadores diarios de PBI, inflación, pobreza y riesgo político."}
            </p>
            <p className="text-xs mb-4" style={{ color: "#4a5068" }}>
              {isEn ? "Data under CC BY 4.0 license" : "Datos bajo licencia CC BY 4.0"}
            </p>
            {/* Social */}
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[#C65D3E]"
              style={linkStyle}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>

          {/* Col 2: Investigación */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Research" : "Investigación"}
            </h3>
            <ul className="space-y-2">
              {investigacionLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-[#C65D3E]" style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Publicaciones */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Publications" : "Publicaciones"}
            </h3>
            <ul className="space-y-2">
              {publicacionesLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-[#C65D3E]" style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Datos */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Data" : "Datos"}
            </h3>
            <ul className="space-y-2">
              {datosLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-[#C65D3E]" style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Institucional */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "About" : "Institucional"}
            </h3>
            <ul className="space-y-2">
              {institucionalLinks.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm transition-colors hover:text-[#C65D3E]" style={linkStyle}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #3d4258" }}>
              <a
                href="mailto:cchavezp@qhawarina.pe"
                className="text-sm transition-colors hover:text-[#C65D3E]"
                style={linkStyle}
              >
                cchavezp@qhawarina.pe
              </a>
            </div>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid #3d4258" }}>
          <p className="text-sm" style={{ color: "#4a5068" }}>
            © {currentYear} Qhawarina — {isEn ? "Open data, transparent methodology" : "Datos abiertos, metodología transparente"}
          </p>
          <p className="text-sm" style={{ color: "#4a5068" }}>
            🇵🇪 {isEn ? "Made for Peru" : "Hecho para Perú"}
          </p>
        </div>
      </div>
    </footer>
  );
}
