"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import SearchModal from "../SearchModal";

const chevron = (open: boolean) => (
  <svg
    className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const dropdownStyle = {
  background: "#fff",
  border: "1px solid #E8E4DC",
};

export default function Header() {
  const isEn = useLocale() === "en";
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const [isPubsOpen, setIsPubsOpen]         = useState(false);
  const [isDataOpen, setIsDataOpen]         = useState(false);
  const [isAboutOpen, setIsAboutOpen]       = useState(false);
  const [isMobileOpen, setIsMobileOpen]     = useState(false);
  const [mobileResearch, setMobileResearch] = useState(false);
  const [mobilePubs, setMobilePubs]         = useState(false);
  const [mobileData, setMobileData]         = useState(false);
  const [mobileAbout, setMobileAbout]       = useState(false);

  const closeMobile = () => {
    setIsMobileOpen(false);
    setMobileResearch(false);
    setMobilePubs(false);
    setMobileData(false);
    setMobileAbout(false);
  };

  const navBtn =
    "text-sm font-medium transition-colors px-3 py-2 rounded-sm hover:bg-[#fdf3f0] flex items-center gap-1";
  const navLink =
    "text-sm font-medium transition-colors px-3 py-2 rounded-sm hover:bg-[#fdf3f0]";
  const ink = { color: "#2D3142" };

  // ── dropdown item lists ──────────────────────────────────────────────────

  const researchItems = isEn ? [
    ["/estadisticas/pbi",            "GDP Nowcast"],
    ["/estadisticas/inflacion",      "Inflation"],
    ["/estadisticas/precios-diarios","Daily Prices (BPP)"],
    ["/estadisticas/pobreza",        "Poverty"],
    ["/estadisticas/riesgo-politico","Political Risk"],
    ["/estadisticas/intervenciones", "FX Market"],
    ["/estadisticas/pobreza/distritos", "District Poverty"],
  ] : [
    ["/estadisticas/pbi",            "PBI Nowcast"],
    ["/estadisticas/inflacion",      "Inflación"],
    ["/estadisticas/precios-diarios","Precios Diarios (BPP)"],
    ["/estadisticas/pobreza",        "Pobreza"],
    ["/estadisticas/riesgo-politico","Riesgo Político"],
    ["/estadisticas/intervenciones", "Mercado Cambiario"],
    ["/estadisticas/pobreza/distritos", "Pobreza Distrital"],
  ];

  const pubsItems = isEn ? [
    ["/reportes",               "Reports"],
    ["/publicaciones",          "Publications"],
    ["/estadisticas/calendario","Economic Calendar"],
    ["/metodologia",            "Methodology"],
  ] : [
    ["/reportes",               "Reportes"],
    ["/publicaciones",          "Publicaciones"],
    ["/estadisticas/calendario","Calendario Económico"],
    ["/metodologia",            "Metodología"],
  ];

  const dataItems = isEn ? [
    ["/datos",      "Open Data"],
    ["/api/docs",   "API"],
    ["/simuladores","Simulators"],
    ["/escenarios", "Scenarios"],
  ] : [
    ["/datos",      "Datos Abiertos"],
    ["/api/docs",   "API"],
    ["/simuladores","Simuladores"],
    ["/escenarios", "Escenarios"],
  ];

  const aboutItems = isEn ? [
    ["/sobre-nosotros", "About Qhawarina"],
    ["/prensa",         "Press"],
    ["/institucional",  "For Institutions"],
  ] : [
    ["/sobre-nosotros", "Sobre Qhawarina"],
    ["/prensa",         "Prensa"],
    ["/institucional",  "Para Instituciones"],
  ];

  const researchLabel = isEn ? "Research"     : "Investigación";
  const pubsLabel     = isEn ? "Publications" : "Publicaciones";
  const dataLabel     = isEn ? "Data"         : "Datos";
  const aboutLabel    = isEn ? "About"        : "Nosotros";

  return (
    <header style={{ background: "#ffffff", borderBottom: "1px solid #E8E4DC" }}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={closeMobile} className="flex items-center">
              <span
                className="text-xl font-bold tracking-wide"
                style={{ color: "#C65D3E", fontFamily: "var(--font-outfit, sans-serif)" }}
              >
                QHAWARINA
              </span>
            </Link>
          </div>

          {/* Desktop Nav — 4 items */}
          <nav className="hidden md:flex items-center space-x-1">

            {/* 1. INVESTIGACIÓN */}
            <div
              className="relative"
              onMouseEnter={() => setIsResearchOpen(true)}
              onMouseLeave={() => setIsResearchOpen(false)}
            >
              <button
                onClick={() => setIsResearchOpen(!isResearchOpen)}
                className={navBtn}
                style={ink}
              >
                {researchLabel}
                {chevron(isResearchOpen)}
              </button>
              {isResearchOpen && (
                <div className="absolute left-0 mt-0 w-56 rounded-md shadow-lg z-50 py-1" style={dropdownStyle}>
                  {researchItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-sm transition-colors hover:bg-[#fdf3f0]"
                      style={ink}
                      onClick={closeMobile}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 2. PUBLICACIONES */}
            <div
              className="relative"
              onMouseEnter={() => setIsPubsOpen(true)}
              onMouseLeave={() => setIsPubsOpen(false)}
            >
              <button
                onClick={() => setIsPubsOpen(!isPubsOpen)}
                className={navBtn}
                style={ink}
              >
                {pubsLabel}
                {chevron(isPubsOpen)}
              </button>
              {isPubsOpen && (
                <div className="absolute left-0 mt-0 w-52 rounded-md shadow-lg z-50 py-1" style={dropdownStyle}>
                  {pubsItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-sm transition-colors hover:bg-[#fdf3f0]"
                      style={ink}
                      onClick={closeMobile}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 3. DATOS */}
            <div
              className="relative"
              onMouseEnter={() => setIsDataOpen(true)}
              onMouseLeave={() => setIsDataOpen(false)}
            >
              <button
                onClick={() => setIsDataOpen(!isDataOpen)}
                className={navBtn}
                style={ink}
              >
                {dataLabel}
                {chevron(isDataOpen)}
              </button>
              {isDataOpen && (
                <div className="absolute left-0 mt-0 w-44 rounded-md shadow-lg z-50 py-1" style={dropdownStyle}>
                  {dataItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-sm transition-colors hover:bg-[#fdf3f0]"
                      style={ink}
                      onClick={closeMobile}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 4. NOSOTROS */}
            <div
              className="relative"
              onMouseEnter={() => setIsAboutOpen(true)}
              onMouseLeave={() => setIsAboutOpen(false)}
            >
              <button
                onClick={() => setIsAboutOpen(!isAboutOpen)}
                className={navBtn}
                style={ink}
              >
                {aboutLabel}
                {chevron(isAboutOpen)}
              </button>
              {isAboutOpen && (
                <div className="absolute right-0 mt-0 w-48 rounded-md shadow-lg z-50 py-1" style={dropdownStyle}>
                  {aboutItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-sm transition-colors hover:bg-[#fdf3f0]"
                      style={ink}
                      onClick={closeMobile}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <SearchModal />
            <LanguageSwitcher />
          </nav>

          {/* Mobile: Language + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-md transition-colors hover:bg-[#fdf3f0]"
              style={ink}
              aria-label={isEn ? "Open menu" : "Abrir menú"}
            >
              {isMobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div style={{ borderTop: "1px solid #E8E4DC", background: "#fff" }}>
          <div className="px-4 py-3 space-y-1">

            {/* Mobile: Investigación accordion */}
            <div>
              <button
                onClick={() => setMobileResearch(!mobileResearch)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={ink}
              >
                {researchLabel}
                {chevron(mobileResearch)}
              </button>
              {mobileResearch && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {researchItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm rounded-sm hover:bg-[#fdf3f0] transition-colors"
                      style={ink}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Publicaciones accordion */}
            <div>
              <button
                onClick={() => setMobilePubs(!mobilePubs)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={ink}
              >
                {pubsLabel}
                {chevron(mobilePubs)}
              </button>
              {mobilePubs && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {pubsItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm rounded-sm hover:bg-[#fdf3f0] transition-colors"
                      style={ink}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Datos accordion */}
            <div>
              <button
                onClick={() => setMobileData(!mobileData)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={ink}
              >
                {dataLabel}
                {chevron(mobileData)}
              </button>
              {mobileData && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {dataItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm rounded-sm hover:bg-[#fdf3f0] transition-colors"
                      style={ink}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Nosotros accordion */}
            <div>
              <button
                onClick={() => setMobileAbout(!mobileAbout)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={ink}
              >
                {aboutLabel}
                {chevron(mobileAbout)}
              </button>
              {mobileAbout && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {aboutItems.map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm rounded-sm hover:bg-[#fdf3f0] transition-colors"
                      style={ink}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
