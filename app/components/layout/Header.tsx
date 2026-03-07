"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";
import SearchModal from "../SearchModal";

export default function Header() {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);
  const t = useTranslations("nav");
  const ts = useTranslations("stats");

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsMobileStatsOpen(false);
  };

  const navLinkClass =
    "text-sm font-medium transition-colors px-3 py-2 rounded-sm hover:bg-[#fdf3f0]";
  const navLinkStyle = { color: "#2D3142" };
  const navLinkHoverStyle = { color: "#C65D3E" };

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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={navLinkClass}
              style={navLinkStyle}
            >
              {t("home")}
            </Link>

            {/* Estadísticas Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsStatsOpen(true)}
              onMouseLeave={() => setIsStatsOpen(false)}
            >
              <button
                onClick={() => setIsStatsOpen(!isStatsOpen)}
                className={`${navLinkClass} flex items-center gap-1`}
                style={navLinkStyle}
              >
                {t("statistics")}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isStatsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStatsOpen && (
                <div
                  className="absolute left-0 mt-0 w-56 rounded-md shadow-lg z-50 py-1"
                  style={{ background: "#fff", border: "1px solid #E8E4DC" }}
                >
                  {[
                    ["/estadisticas/pbi", ts("gdp")],
                    ["/estadisticas/inflacion", ts("inflation")],
                    ["/estadisticas/pobreza", ts("poverty")],
                    ["/estadisticas/riesgo-politico", ts("politicalRisk")],
                    ["/estadisticas/precios-diarios", t("dailyPrices")],
                    ["/estadisticas/intervenciones", t("fxMarket")],
                    ["/estadisticas/calendario", t("calendar")],
                  ].map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-sm transition-colors hover:bg-[#fdf3f0]"
                      style={{ color: "#2D3142" }}
                      onClick={closeMobile}
                    >
                      {label}
                    </Link>
                  ))}
                  <div style={{ borderTop: "1px solid #E8E4DC", margin: "4px 0" }} />
                  <Link
                    href="/estadisticas"
                    className="block px-4 py-2 text-sm font-medium transition-colors hover:bg-[#fdf3f0]"
                    style={{ color: "#C65D3E" }}
                    onClick={closeMobile}
                  >
                    {t("seeAll")} →
                  </Link>
                </div>
              )}
            </div>

            <Link href="/simuladores" className={navLinkClass} style={navLinkStyle}>
              {t("simulators")}
            </Link>
            <Link href="/datos" className={navLinkClass} style={navLinkStyle}>
              {t("data")}
            </Link>
            <Link href="/escenarios" className={navLinkClass} style={navLinkStyle}>
              {t("scenarios")}
            </Link>
            <Link href="/metodologia" className={navLinkClass} style={navLinkStyle}>
              {t("methodology")}
            </Link>
            <Link href="/sobre-nosotros" className={navLinkClass} style={navLinkStyle}>
              {t("about")}
            </Link>

            <SearchModal />
            <LanguageSwitcher />
          </nav>

          {/* Mobile: Language switcher + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-md transition-colors hover:bg-[#fdf3f0]"
              style={{ color: "#2D3142" }}
              aria-label={t("openMenu")}
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
            <Link
              href="/"
              onClick={closeMobile}
              className="block px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
              style={{ color: "#2D3142" }}
            >
              {t("home")}
            </Link>

            {/* Mobile Estadísticas accordion */}
            <div>
              <button
                onClick={() => setIsMobileStatsOpen(!isMobileStatsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={{ color: "#2D3142" }}
              >
                {t("statistics")}
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${isMobileStatsOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileStatsOpen && (
                <div className="pl-4 mt-1 space-y-0.5">
                  {[
                    ["/estadisticas/pbi", ts("gdp")],
                    ["/estadisticas/inflacion", ts("inflation")],
                    ["/estadisticas/pobreza", ts("poverty")],
                    ["/estadisticas/riesgo-politico", ts("politicalRisk")],
                    ["/estadisticas/precios-diarios", t("dailyPrices")],
                    ["/estadisticas/intervenciones", t("fxMarket")],
                    ["/estadisticas/calendario", t("calendar")],
                  ].map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm rounded-sm hover:bg-[#fdf3f0] transition-colors"
                      style={{ color: "#2D3142" }}
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    href="/estadisticas"
                    onClick={closeMobile}
                    className="block px-3 py-1.5 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                    style={{ color: "#C65D3E" }}
                  >
                    {t("seeAll")} →
                  </Link>
                </div>
              )}
            </div>

            {[
              ["/simuladores", t("simulators")],
              ["/datos", t("data")],
              ["/escenarios", t("scenarios")],
              ["/metodologia", t("methodology")],
              ["/sobre-nosotros", t("about")],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                className="block px-3 py-2 text-sm font-medium rounded-sm hover:bg-[#fdf3f0] transition-colors"
                style={{ color: "#2D3142" }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
