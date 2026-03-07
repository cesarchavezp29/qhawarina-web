"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

// Design system — matches app/lib/chartTheme.ts
const TERRA = "#C65D3E";
const INK   = "#2D3142";
const INK3  = "#8D99AE";
const BG    = "#FAF8F4";
const SURFACE = "#EDEAE5";
const BORDER  = "#E8E4DF";

interface DataFile {
  name: string;
  description: string;
  file: string;
  format: "JSON" | "CSV";
  csvFile?: string;  // companion CSV at /assets/data/csv/
  rows?: string;
}

interface DataSection {
  id: string;
  title: string;
  icon: string;
  badgeClass: string;
  description: string;
  files: DataFile[];
}

interface FileMeta {
  size: string;
  updated: string;
}

const DATA_SECTIONS: DataSection[] = [
  {
    id: "nowcasts",
    title: "Nowcasts",
    icon: "📡",
    badgeClass: "bg-teal-100 text-teal-800",
    description: "Predicciones en tiempo real de los modelos Qhawarina. Actualizados diariamente.",
    files: [
      {
        name: "Nowcast PBI",
        description: "Predicción trimestral del crecimiento del PBI. Incluye valores oficiales históricos, predicciones y métricas del modelo DFM.",
        file: "gdp_nowcast.json",
        format: "JSON",
        csvFile: "pbi_nowcast.csv",
        rows: "88 trimestres",
      },
      {
        name: "Nowcast Inflación",
        description: "Predicción mensual de inflación (var% mensual y 12 meses). Serie histórica desde 2010.",
        file: "inflation_nowcast.json",
        format: "JSON",
      },
      {
        name: "Nowcast Pobreza Nacional",
        description: "Predicción anual de pobreza monetaria a nivel nacional. Incluye intervalos de confianza.",
        file: "poverty_nowcast.json",
        format: "JSON",
        csvFile: "pobreza_nacional.csv",
        rows: "21 años",
      },
      {
        name: "Pobreza Departamental",
        description: "Proyección de pobreza por departamento para 2025. 25 departamentos con cambio en pp vs 2024.",
        file: "poverty_nowcast.json",
        format: "JSON",
        csvFile: "pobreza_departamental.csv",
        rows: "25 departamentos",
      },
      {
        name: "Índice Político Diario",
        description: "Índice de riesgo político para Perú. Basado en clasificación GPT-4o de 11 feeds RSS.",
        file: "political_index_daily.json",
        format: "JSON",
        csvFile: "riesgo_politico.csv",
        rows: "365 días",
      },
      {
        name: "Mercado Cambiario / Intervenciones BCRP",
        description: "Tipo de cambio PEN/USD, intervenciones spot y swaps del BCRP, tasa de referencia, bonos soberanos y BVL. Desde 2020, frecuencia diaria y mensual.",
        file: "fx_interventions.json",
        format: "JSON",
        csvFile: "tipo_cambio.csv",
        rows: "~500 días",
      },
    ],
  },
  {
    id: "sectoral",
    title: "Desagregaciones",
    icon: "🏭",
    badgeClass: "bg-amber-100 text-amber-800",
    description: "PBI por sector económico e inflación por categoría analítica.",
    files: [
      {
        name: "PBI por Sector",
        description: "Crecimiento trimestral del PBI desagregado en 8 sectores: Agropecuario, Pesca, Minería, Manufactura, Electricidad, Construcción, Comercio y Servicios.",
        file: "gdp_sectoral.json",
        format: "JSON",
        rows: "87 trimestres",
      },
      {
        name: "Inflación por Categoría",
        description: "IPC de Lima Metropolitana desagregado en 7 categorías: Alimentos, Sin Alimentos, Core, Subyacente, Transables, No Transables. Desde 2010.",
        file: "inflation_categories.json",
        format: "JSON",
        rows: "192 meses",
      },
      {
        name: "PBI Regional",
        description: "Proxy de actividad económica por departamento usando Nighttime Lights (NTL) satelital.",
        file: "gdp_regional_nowcast.json",
        format: "JSON",
        rows: "25 departamentos",
      },
      {
        name: "Pobreza Trimestral",
        description: "Serie trimestral de tasa de pobreza departamental. Interpolación del modelo GBR.",
        file: "poverty_quarterly.json",
        format: "JSON",
      },
      {
        name: "Pobreza Mensual",
        description: "Serie mensual de pobreza por departamento. Incluye predicciones Qhawarina.",
        file: "poverty_monthly.json",
        format: "JSON",
      },
    ],
  },
  {
    id: "panels",
    title: "Paneles de Datos",
    icon: "📊",
    badgeClass: "bg-slate-100 text-slate-700",
    description: "Paneles completos de indicadores económicos en formato largo. Para análisis propios.",
    files: [
      {
        name: "Panel Nacional Mensual",
        description: "58 series económicas nacionales en formato largo. Incluye valor bruto, desestacionalizado, log, dlog y variaciones interanuales. Fuente: BCRP, INEI, MIDAGRI, Supermercados.",
        file: "panel_national_monthly.csv",
        format: "CSV",
        rows: "~25,000 obs",
      },
      {
        name: "Panel Departamental Mensual",
        description: "233 series a nivel departamental (25 depts × ~10 categorías). Incluye NTL, BCRP series regionales, crédito, empleo y más.",
        file: "panel_departmental_monthly.csv",
        format: "CSV",
        rows: "~250,000 obs",
      },
      {
        name: "Pobreza Distrital",
        description: "Proxy de pobreza a nivel distrital usando Nighttime Lights. Desagregación sub-departamental.",
        file: "poverty_districts_full.csv",
        format: "CSV",
        rows: "~1,800 distritos",
      },
    ],
  },
  {
    id: "backtests",
    title: "Backtests",
    icon: "🔬",
    badgeClass: "bg-orange-100 text-orange-800",
    description: "Resultados de evaluación fuera de muestra de los modelos. Transparencia metodológica.",
    files: [
      {
        name: "Backtest PBI",
        description: "Predicciones históricas del DFM de PBI vs valores oficiales. Incluye RMSE, errores por trimestre y comparación con benchmarks AR1 y Random Walk.",
        file: "backtest_gdp.csv",
        format: "CSV",
        rows: "~80 trimestres",
      },
      {
        name: "Backtest Inflación",
        description: "Predicciones históricas del DFM de inflación. Evaluación mensual fuera de muestra desde 2015.",
        file: "backtest_inflation.csv",
        format: "CSV",
        rows: "~120 meses",
      },
      {
        name: "Backtest Pobreza",
        description: "Predicciones históricas del modelo GBR de pobreza departamental. Comparación con AR1.",
        file: "backtest_poverty.csv",
        format: "CSV",
        rows: "~480 dept-año",
      },
    ],
  },
  {
    id: "prices",
    title: "Precios",
    icon: "🛒",
    badgeClass: "bg-red-100 text-red-800",
    description: "Datos de precios de supermercados (BPP — Billion Prices Project para Perú).",
    files: [
      {
        name: "Índice Diario de Precios (BPP)",
        description: "Índice Jevons chain-linked diario de Plaza Vea, Metro y Wong. 42,000+ productos. Metodología Cavallo & Rigobon (MIT). Base = 100 desde 10-Feb-2026.",
        file: "daily_price_index.json",
        format: "JSON",
        csvFile: "precios_diarios.csv",
        rows: "Diario",
      },
      {
        name: "Precios Supermercados Mensual",
        description: "Agregado mensual del índice de precios de supermercados. Crece cada mes con nuevos datos scrapeados.",
        file: "supermarket_monthly_prices.csv",
        format: "CSV",
      },
    ],
  },
];

function fmtBytes(bytes: number): string {
  if (bytes <= 0) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

function fmtLastMod(header: string | null, locale: string): string {
  if (!header) return "—";
  return new Date(header).toLocaleDateString(locale === "en" ? "en-US" : "es-PE", {
    month: "short",
    year: "numeric",
  });
}

const DownloadIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export default function DatosPage() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [meta, setMeta] = useState<Record<string, FileMeta>>({});
  const [search, setSearch] = useState("");

  const totalFiles = DATA_SECTIONS.reduce((sum, s) => sum + s.files.length, 0);

  const filteredSections = search.trim()
    ? DATA_SECTIONS.map((s) => ({
        ...s,
        files: s.files.filter(
          (f) =>
            f.name.toLowerCase().includes(search.toLowerCase()) ||
            f.description.toLowerCase().includes(search.toLowerCase()) ||
            f.file.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter((s) => s.files.length > 0)
    : DATA_SECTIONS.filter((s) => !activeSection || s.id === activeSection);

  useEffect(() => {
    const allFiles = Array.from(
      new Set(DATA_SECTIONS.flatMap((s) => s.files.map((f) => f.file)))
    );
    Promise.allSettled(
      allFiles.map(async (filename) => {
        const res = await fetch(`/assets/data/${filename}`, { method: "HEAD" });
        const bytes = parseInt(res.headers.get("content-length") ?? "0", 10);
        const lastMod = res.headers.get("last-modified");
        return { filename, size: fmtBytes(bytes), updated: fmtLastMod(lastMod, locale) };
      })
    ).then((results) => {
      const map: Record<string, FileMeta> = {};
      for (const r of results) {
        if (r.status === "fulfilled") {
          map[r.value.filename] = { size: r.value.size, updated: r.value.updated };
        }
      }
      setMeta(map);
    });
  }, [locale]);

  return (
    <div style={{ background: BG }} className="min-h-screen py-12">
      <BreadcrumbJsonLd
        crumbs={[
          { name: "Qhawarina", href: "/" },
          { name: isEn ? "Open Data" : "Datos Abiertos", href: "/datos" },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4" style={{ color: INK }}>
            {isEn ? "Open Data" : "Datos Abiertos"}
          </h1>
          <p className="text-lg max-w-3xl" style={{ color: INK3 }}>
            {isEn
              ? "All Qhawarina data is freely accessible under the "
              : "Todos los datos de Qhawarina son de acceso libre bajo licencia "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              style={{ color: TERRA }}
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 4.0
            </a>
            {isEn
              ? " license. Direct download — no registration, no API key."
              : ". Descarga directo — sin registro, sin API key."}
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: INK3 }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveSection(null); }}
              placeholder={isEn ? "Search dataset..." : "Buscar dataset..."}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ border: `1px solid ${BORDER}`, background: "#fff", color: INK }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: INK3 }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Stats bar */}
          <div className="mt-6 flex flex-wrap gap-6">
            {[
              [String(totalFiles), isEn ? "files available" : "archivos disponibles"],
              ["490+", isEn ? "economic series" : "series económicas"],
              ["Diario", isEn ? "update frequency" : "actualización"],
              ["CC BY 4.0", isEn ? "open license" : "licencia abierta"],
            ].map(([val, label]) => (
              <div key={val} className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: TERRA }}>{val}</span>
                <span style={{ color: INK3 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          {DATA_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
              style={
                activeSection === section.id
                  ? { background: SURFACE, borderColor: BORDER, color: INK }
                  : { background: "#fff", borderColor: BORDER, color: INK3 }
              }
            >
              {section.icon} {section.title} ({section.files.length})
            </button>
          ))}
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="px-4 py-2 rounded-full text-sm underline"
              style={{ color: INK3 }}
            >
              {isEn ? "Show all" : "Ver todo"}
            </button>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {filteredSections.length === 0 && (
            <p className="text-sm py-4" style={{ color: INK3 }}>
              {isEn ? `No datasets found for "${search}".` : `No se encontraron datasets para "${search}".`}
            </p>
          )}
          {filteredSections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{section.icon}</span>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: INK }}>{section.title}</h2>
                  <p className="text-sm" style={{ color: INK3 }}>{section.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.files.map((file) => {
                  const fileMeta = meta[file.file];
                  const hasCsv = Boolean(file.csvFile);
                  return (
                    <div
                      key={`${file.file}-${file.name}`}
                      className="rounded-lg border p-5 hover:shadow-md transition-shadow"
                      style={{ background: "#fff", borderColor: BORDER }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold pr-2" style={{ color: INK }}>{file.name}</h3>
                        <span className={`shrink-0 text-xs font-mono px-2 py-0.5 rounded font-medium ${section.badgeClass}`}>
                          {hasCsv ? "JSON+CSV" : file.format}
                        </span>
                      </div>

                      <p className="text-sm mb-4 leading-relaxed" style={{ color: INK3 }}>
                        {file.description}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs" style={{ color: INK3 }}>
                          <span>{fileMeta?.size ?? "…"}</span>
                          {file.rows && <><span>·</span><span>{file.rows}</span></>}
                          <span>·</span>
                          <span>
                            {fileMeta
                              ? `${isEn ? "Upd.:" : "Act.:"} ${fileMeta.updated}`
                              : isEn ? "loading…" : "cargando…"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* CSV primary button */}
                          {hasCsv && (
                            <a
                              href={`/assets/data/csv/${file.csvFile}`}
                              download={file.csvFile}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: TERRA }}
                            >
                              <DownloadIcon />
                              CSV
                            </a>
                          )}
                          {/* JSON / main format secondary button */}
                          <a
                            href={`/assets/data/${file.file}`}
                            download={file.file}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-gray-50 border"
                            style={
                              hasCsv
                                ? { borderColor: BORDER, color: INK3 }
                                : { borderColor: TERRA, color: TERRA, background: "#FDF0EC" }
                            }
                          >
                            <DownloadIcon />
                            {hasCsv ? file.format : (isEn ? "Download" : "Descargar")}
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* License + Citation */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-6" style={{ background: "#fff", borderColor: BORDER }}>
            <h3 className="font-semibold mb-3" style={{ color: INK }}>
              📄 {isEn ? "License" : "Licencia"}
            </h3>
            <p className="text-sm mb-3" style={{ color: INK3 }}>
              {isEn
                ? <><strong style={{ color: INK }}>Creative Commons BY 4.0</strong>. You can freely use, modify and redistribute with attribution.</>
                : <>Todos los datos de Qhawarina están disponibles bajo licencia <strong style={{ color: INK }}>Creative Commons BY 4.0</strong>. Puedes usar, modificar y redistribuir libremente con atribución.</>}
            </p>
            <p className="text-xs" style={{ color: INK3 }}>
              {isEn
                ? "Original data: BCRP, INEI, MIDAGRI (Peruvian public domain). Models and processing: Qhawarina CC BY 4.0."
                : "Datos originales: BCRP, INEI, MIDAGRI (dominio público peruano). Modelos y procesamiento: Qhawarina CC BY 4.0."}
            </p>
          </div>

          <div className="rounded-lg border p-6" style={{ background: "#fff", borderColor: BORDER }}>
            <h3 className="font-semibold mb-3" style={{ color: INK }}>
              📖 {isEn ? "How to cite" : "Cómo citar"}
            </h3>
            <div className="rounded p-3 text-xs font-mono leading-relaxed" style={{ background: BG, color: INK3 }}>
              Qhawarina ({new Date().getFullYear()}).{" "}
              {isEn
                ? "Economic Nowcasting for Peru. Data available at qhawarina.pe/datos. License CC BY 4.0."
                : "Nowcasting Económico para Perú. Datos disponibles en qhawarina.pe/datos. Licencia CC BY 4.0."}
            </div>
            <p className="text-xs mt-2" style={{ color: INK3 }}>
              {isEn ? "For academic use, include the download date." : "Para uso académico, incluye la fecha de descarga."}
            </p>
          </div>
        </div>

        {/* API Link */}
        <div
          className="mt-6 rounded-lg border p-6 flex items-center justify-between"
          style={{ background: SURFACE, borderColor: BORDER }}
        >
          <div>
            <h3 className="font-semibold" style={{ color: INK }}>
              {isEn ? "Need programmatic access?" : "¿Necesitas acceso programático?"}
            </h3>
            <p className="text-sm mt-1" style={{ color: INK3 }}>
              {isEn
                ? "The Qhawarina API allows you to retrieve real-time data with rate limiting and automatic updates."
                : "La API de Qhawarina permite obtener datos en tiempo real con rate limiting y actualización automática."}
            </p>
          </div>
          <Link
            href="/api/docs"
            className="shrink-0 ml-4 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ backgroundColor: TERRA }}
          >
            {isEn ? "View API →" : "Ver API →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
