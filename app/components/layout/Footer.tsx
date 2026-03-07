'use client';

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function Footer() {
  const isEn = useLocale() === "en";
  const currentYear = new Date().getFullYear();

  const statsLinks = isEn ? [
    ["/estadisticas/pbi", "GDP"],
    ["/estadisticas/inflacion", "Inflation"],
    ["/estadisticas/pobreza", "Poverty"],
    ["/estadisticas/riesgo-politico", "Political Risk"],
    ["/estadisticas/precios-diarios", "Daily Prices"],
    ["/estadisticas/intervenciones", "Exchange Rate"],
    ["/estadisticas/calendario", "Calendar"],
    ["/estadisticas/pobreza/distritos", "District Poverty"],
  ] : [
    ["/estadisticas/pbi", "PBI"],
    ["/estadisticas/inflacion", "Inflación"],
    ["/estadisticas/pobreza", "Pobreza"],
    ["/estadisticas/riesgo-politico", "Riesgo Político"],
    ["/estadisticas/precios-diarios", "Precios Diarios"],
    ["/estadisticas/intervenciones", "Mercado Cambiario"],
    ["/estadisticas/calendario", "Calendario"],
    ["/estadisticas/pobreza/distritos", "Pobreza Distrital"],
  ];

  const toolLinks = isEn ? [
    ["/simuladores", "Simulators"],
    ["/escenarios", "Scenarios"],
    ["/reportes", "Reports"],
    ["/datos", "Open Data"],
    ["/api/docs", "API"],
  ] : [
    ["/simuladores", "Simuladores"],
    ["/escenarios", "Escenarios"],
    ["/reportes", "Reportes"],
    ["/datos", "Datos Abiertos"],
    ["/api/docs", "API"],
  ];

  const projectLinks = isEn ? [
    ["/metodologia", "Methodology"],
    ["/sobre-nosotros", "About Us"],
    ["/institucional", "For Institutions"],
    ["/feed.xml", "RSS Feed"],
  ] : [
    ["/metodologia", "Metodología"],
    ["/sobre-nosotros", "Sobre Nosotros"],
    ["/institucional", "Para Instituciones"],
    ["/feed.xml", "Feed RSS"],
  ];

  const sources = isEn ? [
    "BCRP — Monetary series",
    "INEI — GDP, CPI, Poverty",
    "MIDAGRI — Agricultural prices",
    "Plaza Vea · Metro · Wong",
    "11 RSS feeds · 6 sources",
  ] : [
    "BCRP — Series monetarias",
    "INEI — PBI, IPC, Pobreza",
    "MIDAGRI — Precios agrícolas",
    "Plaza Vea · Metro · Wong",
    "11 feeds RSS · 6 fuentes",
  ];

  const linkStyle = { color: "#8D99AE" };

  return (
    <footer style={{ background: "#2D3142", borderTop: "1px solid #3d4258", marginTop: 64 }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <Image
                src="/favicon.png"
                alt="Qhawarina"
                width={32}
                height={32}
                className="flex-shrink-0"
              />
              <span
                className="text-xl font-bold tracking-wide"
                style={{ color: "#C65D3E", fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                QHAWARINA
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "#8D99AE" }}>
              {isEn
                ? "Economic nowcasting for Peru. Daily predictions of GDP, inflation and poverty."
                : "Nowcasting económico para Perú. Predicciones diarias de PBI, inflación y pobreza."}
            </p>
            <p className="text-xs" style={{ color: "#4a5068" }}>
              {isEn ? "Data under CC BY 4.0 license" : "Datos bajo licencia CC BY 4.0"}
            </p>
          </div>

          {/* Statistics */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Statistics" : "Estadísticas"}
            </h3>
            <ul className="space-y-2">
              {statsLinks.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-[#C65D3E]"
                    style={linkStyle}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools + Project */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Tools" : "Herramientas"}
            </h3>
            <ul className="space-y-2">
              {toolLinks.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-[#C65D3E]"
                    style={linkStyle}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 mt-5" style={{ color: "#FAF8F4" }}>
              {isEn ? "Project" : "Proyecto"}
            </h3>
            <ul className="space-y-2">
              {projectLinks.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-[#C65D3E]"
                    style={linkStyle}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#FAF8F4" }}>
              {isEn ? "Sources" : "Fuentes"}
            </h3>
            <ul className="space-y-2">
              {sources.map(s => (
                <li key={s} className="text-sm" style={linkStyle}>{s}</li>
              ))}
            </ul>
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm mt-4 transition-colors hover:text-[#C65D3E]"
              style={linkStyle}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid #3d4258" }}
        >
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
