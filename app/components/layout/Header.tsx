"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../LanguageSwitcher";

export default function Header() {
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-800">QHAWARINA</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
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
              href="/datos"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("data")}
            </Link>

            <Link
              href="/escenarios"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors flex items-center"
            >
              {t("scenarios")}
              <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                PRO
              </span>
            </Link>

            <Link
              href="/metodologia"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("methodology")}
            </Link>

            <Link
              href="/api/docs"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("api")}
            </Link>

            <Link
              href="/sobre-nosotros"
              className="text-gray-700 hover:text-blue-800 px-3 py-2 text-sm font-medium transition-colors"
            >
              {t("about")}
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
