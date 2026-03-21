"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import BreadcrumbJsonLd from "../components/BreadcrumbJsonLd";

interface HubData {
  gdp: { value: number | null; period: string | null; generatedAt: string | null } | null;
  inflation: { value: number | null; period: string | null } | null;
  poverty: { rate: number | null; year: number | null } | null;
  political: { score: number | null; level: string | null; date: string | null } | null;
  prices: { var: number | null; cum: number | null; date: string | null } | null;
  fx: { rate: number | null; date: string | null; spot: number | null } | null;
}

function fmt(v: number | null | undefined, decimals = 2, prefix = "", suffix = ""): string {
  if (v === null || v === undefined) return "—";
  const sign = v > 0 && prefix === "+" ? "+" : "";
  return `${sign}${prefix !== "+" ? prefix : ""}${v.toFixed(decimals)}${suffix}`;
}

function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "en" ? "en-US" : "es-PE", { day: "numeric", month: "short", year: "numeric" });
}

export default function EstadisticasPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  const T = isEn ? {
    title: "Statistics",
    subtitle: "High-frequency economic indicators for Peru",
    updated: "Updated:",
    gdpTitle: "Gross Domestic Product",
    gdpDesc: "Quarterly nowcast with regional and sectoral projections",
    inflacionTitle: "Inflation",
    inflacionDesc: "Monthly variation with high-frequency price index",
    pobrezaTitle: "Poverty",
    pobrezaDesc: "Monthly/quarterly series with regional maps",
    preciosTitle: "Daily Prices",
    preciosDesc: "Jevons index of 42,000+ products at Plaza Vea, Metro and Wong. Cavallo (MIT) methodology.",
    politicaTitle: "Political Instability",
    politicaDesc: "Composite index of political events and financial stress",
    fxTitle: "Exchange Rate Market",
    fxBadge: "MANAGED FLOAT",
    fxDesc: "BCRP spot and swap interventions, exchange rate, sovereign bonds and BVL",
    charts: "Charts",
    maps: "Maps",
    methodology: "Methodology",
    seeIndex: "See index →",
    downloadData: "Download data",
    seeDashboard: "See dashboard →",
    accum: "accum.",
    note: "Note:",
    noteText: "All indicators use Dynamic Factor Models (DFM) to incorporate high-frequency information. Official data sourced from BCRP, INEI and MIDAGRI.",
    nowcast: "Nowcast",
  } : {
    title: "Estadísticas",
    subtitle: "Indicadores económicos de alta frecuencia para Perú",
    updated: "Actualizado:",
    gdpTitle: "Producto Bruto Interno",
    gdpDesc: "Nowcast trimestral con proyecciones regionales y sectoriales",
    inflacionTitle: "Inflación",
    inflacionDesc: "Variación mensual con índice de precios de alta frecuencia",
    pobrezaTitle: "Pobreza",
    pobrezaDesc: "Serie mensual/trimestral con mapas regionales",
    preciosTitle: "Precios Diarios",
    preciosDesc: "Índice Jevons de 42,000+ productos en Plaza Vea, Metro y Wong. Metodología Cavallo (MIT).",
    politicaTitle: "Inestabilidad Política",
    politicaDesc: "Índice compuesto de eventos y estrés financiero",
    fxTitle: "Mercado Cambiario",
    fxBadge: "FLOTACIÓN SUCIA",
    fxDesc: "Intervenciones spot y swaps del BCRP, tipo de cambio, bonos soberanos y BVL",
    charts: "Gráficos",
    maps: "Mapas",
    methodology: "Metodología",
    seeIndex: "Ver índice →",
    downloadData: "Descargar datos",
    seeDashboard: "Ver dashboard →",
    accum: "acum.",
    note: "Nota:",
    noteText: "Todos los indicadores utilizan modelos de factores dinámicos (DFM) para incorporar información de alta frecuencia. Los datos oficiales provienen de BCRP, INEI y MIDAGRI.",
    nowcast: "Nowcast",
  };

  const [d, setD] = useState<HubData>({
    gdp: null, inflation: null, poverty: null, political: null, prices: null, fx: null,
  });

  useEffect(() => {
    const load = async () => {
      const [gdpR, infR, povR, polR, pricesR, fxR] = await Promise.allSettled([
        fetch(`/assets/data/gdp_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
        fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
        fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
        fetch(`/assets/data/political_index_daily.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
        fetch(`/assets/data/daily_price_index.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
        fetch(`/assets/data/fx_interventions.json?v=${new Date().toISOString().slice(0, 13)}`).then((r) => r.json()),
      ]);

      setD({
        gdp: gdpR.status === "fulfilled" ? { value: gdpR.value?.nowcast?.value ?? null, period: gdpR.value?.nowcast?.target_period ?? null, generatedAt: gdpR.value?.metadata?.generated_at ?? null } : null,
        inflation: infR.status === "fulfilled" ? { value: infR.value?.nowcast?.value ?? null, period: infR.value?.nowcast?.target_period ?? null } : null,
        poverty: povR.status === "fulfilled" ? { rate: povR.value?.national?.poverty_rate ?? null, year: povR.value?.metadata?.target_year ?? null } : null,
        political: polR.status === "fulfilled" ? { score: polR.value?.current?.score ?? null, level: polR.value?.current?.level ?? null, date: polR.value?.current?.date ?? null } : null,
        prices: pricesR.status === "fulfilled" ? { var: pricesR.value?.latest?.var_all ?? null, cum: pricesR.value?.latest?.cum_pct ?? null, date: pricesR.value?.latest?.date ?? null } : null,
        fx: fxR.status === "fulfilled" ? { rate: fxR.value?.latest?.fx ?? null, date: fxR.value?.latest?.date ?? null, spot: fxR.value?.latest?.spot_net_purchases ?? null } : null,
      });
    };
    load();
  }, []);

  const politicalColor = d.political?.level === "ALTO" || d.political?.level === "MUY ALTO" ? "text-red-600" : d.political?.level === "MEDIO" ? "text-orange-500" : "text-green-600";
  const gdpColor = d.gdp?.value !== null && d.gdp?.value !== undefined && d.gdp.value >= 0 ? "text-green-600" : "text-red-600";
  const lastExport = d.gdp?.generatedAt ? fmtDate(d.gdp.generatedAt, locale) : null;

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#FAF8F4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.018'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <BreadcrumbJsonLd crumbs={[{ name: "Qhawarina", href: "/" }, { name: T.title, href: "/estadisticas" }]} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{T.title}</h1>
          <p className="text-lg text-gray-600">{T.subtitle}</p>
          {lastExport && <p className="text-sm text-gray-400 mt-1">{T.updated} {lastExport}</p>}
        </div>

        <div className="space-y-6">
          {/* PBI */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{T.gdpTitle}</h2>
                <p className="text-sm text-gray-600">{T.gdpDesc}</p>
              </div>
              <div className="ml-6 text-right">
                <p className={`text-3xl font-bold ${gdpColor}`}>
                  {d.gdp?.value !== null && d.gdp?.value !== undefined ? `${d.gdp.value >= 0 ? "+" : ""}${d.gdp.value.toFixed(1)}%` : "—"}
                </p>
                <p className="text-sm text-gray-500">{d.gdp?.period ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link href="/estadisticas/pbi/graficos" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">📊 {T.charts}</Link>
              <Link href="/estadisticas/pbi/mapas" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">🗺️ {T.maps}</Link>
              <Link href="/estadisticas/pbi/metodologia" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">📖 {T.methodology}</Link>
            </div>
          </div>

          {/* Inflación */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{T.inflacionTitle}</h2>
                <p className="text-sm text-gray-600">{T.inflacionDesc}</p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-orange-600">
                  {d.inflation?.value !== null && d.inflation?.value !== undefined ? `${d.inflation.value >= 0 ? "+" : ""}${d.inflation.value.toFixed(2)}%` : "—"}
                </p>
                <p className="text-sm text-gray-500">{d.inflation?.period ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link href="/estadisticas/inflacion/graficos" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">📊 {T.charts}</Link>
              <Link href="/estadisticas/inflacion/mapas" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">🗺️ {T.maps}</Link>
              <Link href="/estadisticas/inflacion/metodologia" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">📖 {T.methodology}</Link>
            </div>
          </div>

          {/* Pobreza */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{T.pobrezaTitle}</h2>
                <p className="text-sm text-gray-600">{T.pobrezaDesc}</p>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-red-600">
                  {d.poverty?.rate !== null && d.poverty?.rate !== undefined ? `${d.poverty.rate.toFixed(1)}%` : "—"}
                </p>
                <p className="text-sm text-gray-500">{d.poverty?.year ? `${T.nowcast} ${d.poverty.year}` : "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link href="/estadisticas/pobreza/graficos" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">📊 {T.charts}</Link>
              <Link href="/estadisticas/pobreza/mapas" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">🗺️ {T.maps}</Link>
              <Link href="/estadisticas/pobreza/metodologia" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">📖 {T.methodology}</Link>
            </div>
          </div>

          {/* Precios Diarios */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{T.preciosTitle}</h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">BPP</span>
                </div>
                <p className="text-sm text-gray-600">{T.preciosDesc}</p>
              </div>
              <div className="ml-6 text-right">
                <p className={`text-3xl font-bold ${d.prices?.var !== null && d.prices?.var !== undefined && d.prices.var >= 0 ? "text-red-600" : "text-green-600"}`}>
                  {d.prices?.var !== null && d.prices?.var !== undefined ? `${d.prices.var >= 0 ? "+" : ""}${d.prices.var.toFixed(3)}%` : "—"}
                </p>
                <p className="text-sm text-gray-500">
                  {d.prices?.cum !== null && d.prices?.cum !== undefined ? `${d.prices.cum >= 0 ? "+" : ""}${d.prices.cum.toFixed(2)}% ${T.accum}` : d.prices?.date ?? "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <Link href="/estadisticas/precios-diarios" className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium">{T.seeIndex}</Link>
              <Link href="/datos" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium">{T.downloadData}</Link>
            </div>
          </div>

          {/* Inestabilidad Política */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{T.politicaTitle}</h2>
                <p className="text-sm text-gray-600 mb-4">{T.politicaDesc}</p>
                <div className="flex items-center gap-4">
                  <Link href="/estadisticas/riesgo-politico/graficos" className="text-sm text-blue-700 hover:text-blue-900 font-medium">{T.charts} →</Link>
                  <Link href="/estadisticas/riesgo-politico/metodologia" className="text-sm text-blue-700 hover:text-blue-900 font-medium">{T.methodology} →</Link>
                </div>
              </div>
              <div className="ml-6 text-right">
                <p className={`text-3xl font-bold ${politicalColor}`}>{d.political?.level ?? "—"}</p>
                <p className="text-sm text-gray-500">
                  {d.political?.score !== null && d.political?.score !== undefined ? `${d.political.score.toFixed(3)} · ${d.political.date ?? ""}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Mercado Cambiario */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-gray-900">{T.fxTitle}</h2>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{T.fxBadge}</span>
                </div>
                <p className="text-sm text-gray-600">{T.fxDesc}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Link href="/estadisticas/intervenciones" className="text-sm text-blue-700 hover:text-blue-900 font-medium">📊 {T.seeDashboard}</Link>
                </div>
              </div>
              <div className="ml-6 text-right">
                <p className="text-3xl font-bold text-emerald-700">
                  {d.fx?.rate !== null && d.fx?.rate !== undefined ? d.fx.rate.toFixed(4) : "—"}
                </p>
                <p className="text-sm text-gray-500">PEN/USD{d.fx?.date ? ` · ${d.fx.date}` : ""}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>{T.note}</strong> {T.noteText}
          </p>
        </div>
      </div>
    </div>
  );
}
