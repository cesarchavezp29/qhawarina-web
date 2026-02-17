"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface DayRecord {
  date: string;
  index_all: number;
  index_food: number;
  index_nonfood: number;
  var_all: number;
  var_food: number;
  cum_pct: number;
  [key: string]: number | string;
}

interface CategoryMeta {
  label_es: string;
  label_en: string;
  color: string;
  cpi_weight: number;
}

interface PriceIndexData {
  metadata: {
    methodology: string;
    base_date: string;
    last_date: string;
    n_days: number;
    stores: string[];
    n_products_approx: number;
    reference: string;
    updated: string;
  };
  categories: Record<string, CategoryMeta>;
  series: DayRecord[];
  latest: {
    date: string;
    index_all: number;
    index_food: number;
    cum_pct: number;
    var_all: number;
  };
}

type ViewMode = "index" | "daily_change" | "cumulative";

export default function PreciosDiariosPage() {
  const [data, setData] = useState<PriceIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("index");
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    fetch("/assets/data/daily_price_index.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando índice de precios...</p>
      </div>
    );
  }

  if (!data || !data.series?.length) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/estadisticas" className="hover:text-blue-700">Estadísticas</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Precios Diarios</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">Índice de Precios Diario</h1>

          {/* Methodology banner even without data */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-4xl">📡</div>
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Qhawarina BPP — Billion Prices Project para Perú
                </h2>
                <p className="text-blue-800 mb-4">
                  Primer índice de precios diario para Perú, basado en la metodología de{" "}
                  <strong>Alberto Cavallo (MIT)</strong>. Recopilamos precios de 42,000+ productos
                  en Plaza Vea, Metro y Wong cada día y construimos un índice Jevons bilateral
                  chain-linked.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {[
                    { label: "Productos", value: "42,000+" },
                    { label: "Tiendas", value: "3 cadenas" },
                    { label: "Método", value: "Jevons BPP" },
                    { label: "Frecuencia", value: "Diaria" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-blue-800">{item.value}</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-amber-900 mb-2">⏳ Acumulando datos</h3>
            <p className="text-amber-800 text-sm">
              El índice comenzó el <strong>10 de febrero 2026</strong>. Necesitamos al menos
              30 días de scraping diario para que la serie sea estadísticamente significativa.
              El scraper corre automáticamente cada día a las 07:00 AM y actualiza este índice.
            </p>
            <p className="text-amber-700 text-xs mt-2">
              Comparación con el IPC oficial del INEI disponible desde que tengamos 1+ mes de datos.
            </p>
          </div>

          <MethodologySection />
        </div>
      </div>
    );
  }

  const dates = data.series.map((r) => r.date);

  // Main traces
  const getYValues = (key: string) => {
    if (viewMode === "index") return data.series.map((r) => r[key] as number);
    if (viewMode === "daily_change") {
      return data.series.map((r, i) => {
        if (i === 0) return 0;
        const prev = data.series[i - 1][key] as number;
        const curr = r[key] as number;
        return ((curr / prev - 1) * 100);
      });
    }
    // cumulative
    const base = data.series[0][key] as number;
    return data.series.map((r) => ((r[key] as number) / base - 1) * 100);
  };

  const yAxisLabel =
    viewMode === "index"
      ? `Índice (${data.metadata.base_date} = 100)`
      : viewMode === "daily_change"
      ? "Variación diaria (%)"
      : "Variación acumulada (%)";

  const mainTraces = [
    {
      x: dates,
      y: getYValues("index_all"),
      name: "Todos los productos",
      type: "scatter" as const,
      mode: "lines+markers" as const,
      line: { color: "#1d4ed8", width: 3 },
      marker: { size: 7 },
    },
    {
      x: dates,
      y: getYValues("index_food"),
      name: "Alimentos y bebidas",
      type: "scatter" as const,
      mode: "lines+markers" as const,
      line: { color: "#ef4444", width: 2 },
      marker: { size: 5 },
    },
    {
      x: dates,
      y: getYValues("index_nonfood"),
      name: "No alimentario",
      type: "scatter" as const,
      mode: "lines+markers" as const,
      line: { color: "#8b5cf6", width: 2 },
      marker: { size: 5 },
    },
  ];

  // Category traces
  const catTraces = showCategories
    ? Object.entries(data.categories).map(([catId, meta]) => ({
        x: dates,
        y: getYValues(`index_${catId}`),
        name: meta.label_es,
        type: "scatter" as const,
        mode: "lines" as const,
        line: { color: meta.color, width: 1.5, dash: "dot" as const },
        opacity: 0.7,
      }))
    : [];

  const layout = {
    xaxis: { title: "", gridcolor: "#e5e7eb", tickformat: "%d %b" },
    yaxis: {
      title: yAxisLabel,
      gridcolor: "#e5e7eb",
      zeroline: viewMode !== "index",
      zerolinecolor: "#6b7280",
    },
    hovermode: "x unified" as const,
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    margin: { t: 20, r: 20, b: 50, l: 60 },
    legend: { orientation: "h" as const, y: -0.15 },
    height: 420,
  };

  const n = data.series.length;
  const cumPct = ((data.series[n - 1].index_all / 100) - 1) * 100;
  const dailyAvgPct = (Math.pow(data.series[n - 1].index_all / 100, 1 / Math.max(n - 1, 1)) - 1) * 100;
  const annualizedPct = dailyAvgPct * 365;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/estadisticas" className="hover:text-blue-700">Estadísticas</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Precios Diarios</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-gray-900">Índice de Precios Diario</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                QHAWARINA BPP
              </span>
            </div>
            <p className="text-lg text-gray-600">
              Metodología Cavallo (MIT) · {data.metadata.stores.join(", ")} ·{" "}
              {data.metadata.n_products_approx.toLocaleString()}+ productos
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Actualizado</p>
            <p className="font-semibold text-gray-900">{data.latest.date}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Índice actual</p>
            <p className="text-3xl font-bold text-blue-800">
              {data.latest.index_all?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">base {data.metadata.base_date} = 100</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Variación última sesión</p>
            <p className={`text-3xl font-bold ${(data.latest.var_all ?? 0) >= 0 ? "text-red-600" : "text-green-600"}`}>
              {(data.latest.var_all ?? 0) >= 0 ? "+" : ""}
              {((data.latest.var_all ?? 0)).toFixed(3)}%
            </p>
            <p className="text-xs text-gray-400">variación diaria</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Acumulado</p>
            <p className={`text-3xl font-bold ${cumPct >= 0 ? "text-red-600" : "text-green-600"}`}>
              {cumPct >= 0 ? "+" : ""}{cumPct.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-400">desde {data.metadata.base_date}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Ritmo anualizado</p>
            <p className={`text-3xl font-bold ${annualizedPct >= 0 ? "text-orange-600" : "text-green-600"}`}>
              {annualizedPct >= 0 ? "+" : ""}{annualizedPct.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-400">proyección si ritmo actual continúa</p>
          </div>
        </div>

        {/* Data coverage notice */}
        {n < 30 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-amber-600">⚠️</span>
            <p className="text-sm text-amber-800">
              <strong>{n} días de datos</strong> disponibles. La serie se vuelve estadísticamente
              robusta a partir de 30 días. El scraper acumula datos cada día automáticamente.
            </p>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex gap-2">
              {(["index", "daily_change", "cumulative"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? "bg-blue-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mode === "index" ? "Índice" : mode === "daily_change" ? "Var. diaria" : "Acumulado"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showCategories
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {showCategories ? "Ocultar categorías" : "Ver por categoría"}
            </button>
          </div>

          <Plot
            data={[...mainTraces, ...catTraces]}
            layout={layout}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ["select2d", "lasso2d"],
              toImageButtonOptions: {
                format: "png",
                filename: "qhawarina_precios_diarios",
                height: 700,
                width: 1400,
                scale: 2,
              },
            }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />

          <p className="text-xs text-gray-500 mt-3">
            Fuente: Qhawarina / Plaza Vea / Metro / Wong — Índice Jevons bilateral chain-linked,
            base {data.metadata.base_date} = 100. Filtro: 0.5 &lt; ratio &lt; 2.0.
          </p>
        </div>

        {/* Category breakdown */}
        {data.categories && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Índice por Categoría (último día)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(data.categories).map(([catId, meta]) => {
                const latestRecord = data.series[data.series.length - 1];
                const idx = latestRecord[`index_${catId}`] as number;
                const change = idx - 100;
                return (
                  <div
                    key={catId}
                    className="flex items-center gap-2 p-3 rounded-lg bg-gray-50"
                    style={{ borderLeft: `3px solid ${meta.color}` }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{meta.label_es}</p>
                      <p className="text-sm font-bold" style={{ color: meta.color }}>
                        {idx?.toFixed(2)}
                        <span className={`ml-1 text-xs ${change >= 0 ? "text-red-500" : "text-green-500"}`}>
                          ({change >= 0 ? "+" : ""}{change?.toFixed(2)}%)
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <MethodologySection />
      </div>
    </div>
  );
}


function MethodologySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">📐 Metodología</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium">1. Recopilación de precios</p>
            <p className="text-gray-500">42,000+ productos de Plaza Vea, Metro y Wong scrapeados via API VTEX cada día hábil.</p>
          </div>
          <div>
            <p className="font-medium">2. Índice Jevons bilateral</p>
            <p className="text-gray-500">Para cada par de días consecutivos, se empareja cada producto por (tienda, SKU) y se calcula la media geométrica de los ratios de precio: <code className="bg-gray-100 px-1 rounded">exp(mean(log(p_t/p_{"{t-1}"}))</code></p>
          </div>
          <div>
            <p className="font-medium">3. Filtro de outliers</p>
            <p className="text-gray-500">Se excluyen ratios fuera del rango [0.5, 2.0] para eliminar errores de datos y promociones temporales extremas.</p>
          </div>
          <div>
            <p className="font-medium">4. Chain-linking</p>
            <p className="text-gray-500">Los índices diarios se encadenan multiplicativamente: Index_t = Index_{"{t-1}"} × Jevons_t</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">🔬 Referencia académica</h3>
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900">Billion Prices Project (BPP)</p>
          <p className="text-sm text-blue-700">Alberto Cavallo & Roberto Rigobon (MIT)</p>
          <p className="text-xs text-blue-600 mt-1">
            "The Billion Prices Project: Using Online Prices for Measurement and Research"
            <br />Journal of Economic Perspectives, 2016.
          </p>
        </div>
        <p className="text-sm text-gray-600">
          El BPP original cubre 22 países y ha demostrado que los precios online adelantan
          al IPC oficial por <strong>2-4 semanas</strong>. Qhawarina aplica esta metodología
          al mercado peruano por primera vez.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/estadisticas/inflacion/categorias"
            className="text-sm text-blue-700 hover:underline"
          >
            Ver IPC oficial →
          </Link>
          <Link
            href="/datos"
            className="text-sm text-blue-700 hover:underline"
          >
            Descargar datos →
          </Link>
        </div>
      </div>
    </div>
  );
}
