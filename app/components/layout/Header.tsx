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

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsMobileStatsOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center" onClick={closeMobile}>
              <span className="text-2xl font-bold text-blue-800">QHAWARINA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
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
                className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors flex items-center"
              >
                {t("statistics")}
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isStatsOpen && (
                <div className="absolute left-0 mt-0 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="py-1">
                    <Link
                      href="/estadisticas/pbi"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      PBI
                    </Link>
                    <Link
                      href="/estadisticas/inflacion"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Inflación
                    </Link>
                    <Link
                      href="/estadisticas/pobreza"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Pobreza
                    </Link>
                    <Link
                      href="/estadisticas/riesgo-politico"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Riesgo Político
                    </Link>
                    <Link
                      href="/estadisticas/precios-diarios"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Precios Diarios
                    </Link>
                    <Link
                      href="/estadisticas/intervenciones"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Mercado Cambiario
                    </Link>
                    <Link
                      href="/estadisticas/calendario"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Calendario de Publicaciones
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <Link
                      href="/estadisticas"
                      className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 font-medium"
                    >
                      {t("seeAll")} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/simuladores"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              Simuladores
            </Link>

            <Link
              href="/datos"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("data")}
            </Link>

            <Link
              href="/escenarios"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("scenarios")}
            </Link>

            <Link
              href="/metodologia"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("methodology")}
            </Link>

            <Link
              href="/sobre-nosotros"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("about")}
            </Link>

            {/* Search */}
            <SearchModal />

            {/* Language Switcher */}
            <LanguageSwitcher />
          </nav>

          {/* Mobile: Language switcher + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-blue-800 hover:bg-gray-100 transition-colors"
              aria-label="Abrir menú"
            >
              {isMobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/"
              onClick={closeMobile}
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md"
            >
              {t("home")}
            </Link>

            {/* Mobile Estadísticas accordion */}
            <div>
              <button
                onClick={() => setIsMobileStatsOpen(!isMobileStatsOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md"
              >
                {t("statistics")}
                <svg
                  className={`h-4 w-4 transition-transform ${isMobileStatsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isMobileStatsOpen && (
                <div className="pl-4 mt-1 space-y-1">
                  {[
                    ["/estadisticas/pbi", "PBI"],
                    ["/estadisticas/inflacion", "Inflación"],
                    ["/estadisticas/pobreza", "Pobreza"],
                    ["/estadisticas/riesgo-politico", "Riesgo Político"],
                    ["/estadisticas/precios-diarios", "Precios Diarios"],
                    ["/estadisticas/intervenciones", "Mercado Cambiario"],
                    ["/estadisticas/calendario", "Calendario"],
                    ["/estadisticas", "Ver todo →"],
                  ].map(([href, label]) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobile}
                      className="block px-3 py-1.5 text-sm text-gray-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/simuladores" onClick={closeMobile} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md">
              Simuladores
            </Link>
            <Link href="/datos" onClick={closeMobile} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md">
              {t("data")}
            </Link>
            <Link href="/escenarios" onClick={closeMobile} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md">
              {t("scenarios")}
            </Link>
            <Link href="/metodologia" onClick={closeMobile} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md">
              {t("methodology")}
            </Link>
            <Link href="/sobre-nosotros" onClick={closeMobile} className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-800 hover:bg-gray-50 rounded-md">
              {t("about")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
