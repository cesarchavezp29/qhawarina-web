"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Category {
  id: string;
  name_es: string;
  name_en: string;
  color: string;
  description_es: string;
  weight_pct: number | null;
  dates: string[];
  values_monthly: number[];
  values_12m: number[];
  latest_monthly: number;
  latest_12m: number;
  latest_date: string;
  n_obs: number;
}

interface InflationData {
  metadata: {
    last_update: string;
    source: string;
    coverage: string;
    n_categories: number;
  };
  categories: Category[];
}

type ChartMode = "monthly" | "12m";

export default function InflacionCategoriasPage() {
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartMode, setChartMode] = useState<ChartMode>("12m");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetch("/assets/data/inflation_categories.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setSelectedIds(d.categories.map((c: Category) => c.id));
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  const toggle = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const total = data.categories.find((c) => c.id === "total");
  const visible = data.categories.filter((c) => selectedIds.includes(c.id));

  const valueKey = chartMode === "monthly" ? "values_monthly" : "values_12m";
  const latestKey =
    chartMode === "monthly" ? "latest_monthly" : "latest_12m";

  const traces = visible.map((cat) => ({
    x: cat.dates,
    y: cat[valueKey],
    type: "scatter" as const,
    mode: "lines" as const,
    name: cat.name_es,
    line: {
      color: cat.color,
      width: cat.id === "total" ? 3 : 1.5,
      dash: cat.id === "total" ? ("solid" as const) : ("solid" as const),
    },
  }));

  const unit = chartMode === "monthly" ? "var% mensual" : "var% interanual";

  const layout = {
    xaxis: { title: "", gridcolor: "#e5e7eb" },
    yaxis: {
      title: unit,
      gridcolor: "#e5e7eb",
      zeroline: true,
      zerolinecolor: "#6b7280",
      zerolinewidth: 1,
    },
    hovermode: "x unified" as const,
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    margin: { t: 20, r: 20, b: 50, l: 55 },
    legend: {
      orientation: "v" as const,
      y: 1,
      yanchor: "top" as const,
      x: 1.02,
      xanchor: "left" as const,
      font: { size: 12 },
    },
    height: 460,
    shapes: [
      // BCRP target band: 1%-3%
      {
        type: "rect" as const,
        xref: "paper" as const,
        yref: "y" as const,
        x0: 0, x1: 1, y0: 1, y1: 3,
        fillcolor: "#dcfce7",
        opacity: 0.3,
        line: { width: 0 },
      },
    ],
    annotations:
      chartMode === "12m"
        ? [
            {
              xref: "paper" as const,
              yref: "y" as const,
              x: 0.01,
              y: 2,
              text: "Meta BCRP: 1%–3%",
              showarrow: false,
              font: { color: "#16a34a", size: 11 },
            },
          ]
        : [],
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/estadisticas" className="hover:text-blue-700">
            Estadísticas
          </Link>
          <span className="mx-2">/</span>
          <Link href="/estadisticas/inflacion" className="hover:text-blue-700">
            Inflación
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Categorías</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inflación por Categoría
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Desagregación del IPC de Lima Metropolitana por categorías analíticas.
            Cobertura: diciembre 2010 – {data.metadata.last_update}.
          </p>
        </div>

        {/* Latest Values Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {data.categories.map((cat) => {
            const val = cat[latestKey];
            const isPositive = val > 0;
            const isInTarget = chartMode === "12m" && val >= 1 && val <= 3;
            return (
              <div
                key={cat.id}
                onClick={() => toggle(cat.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{
                  borderLeft: selectedIds.includes(cat.id)
                    ? `4px solid ${cat.color}`
                    : "4px solid #e5e7eb",
                  opacity: selectedIds.includes(cat.id) ? 1 : 0.45,
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-medium text-gray-500 leading-tight">
                    {cat.name_es}
                    {cat.weight_pct && (
                      <span className="ml-1 text-gray-400">
                        ({cat.weight_pct}%)
                      </span>
                    )}
                  </p>
                  {isInTarget && (
                    <span className="text-xs text-green-600 font-semibold ml-1 shrink-0">
                      Meta ✓
                    </span>
                  )}
                </div>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: cat.color }}
                >
                  {isPositive ? "+" : ""}
                  {val.toFixed(chartMode === "monthly" ? 3 : 2)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {chartMode === "monthly" ? "mes a mes" : "12 meses"} •{" "}
                  {cat.latest_date}
                </p>
              </div>
            );
          })}
        </div>

        {/* Chart + Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setChartMode("12m")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartMode === "12m"
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                12 meses (YoY)
              </button>
              <button
                onClick={() => setChartMode("monthly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartMode === "monthly"
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Mensual (m/m)
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedIds(data.categories.map((c) => c.id))}
                className="text-xs text-blue-700 hover:underline"
              >
                Todas
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-xs text-blue-700 hover:underline"
              >
                Ninguna
              </button>
            </div>
          </div>

          <Plot
            data={traces}
            layout={layout}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ["select2d", "lasso2d"],
              toImageButtonOptions: {
                format: "png",
                filename: "qhawarina_inflacion_categorias",
                height: 800,
                width: 1400,
                scale: 2,
              },
            }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />

          <p className="text-sm text-gray-500 mt-3">
            <strong>Fuente:</strong> {data.metadata.source} •{" "}
            <strong>Cobertura:</strong> {data.metadata.coverage} •{" "}
            {chartMode === "12m" && (
              <span className="text-green-700">
                La banda verde indica el rango meta del BCRP (1%–3%)
              </span>
            )}
          </p>
        </div>

        {/* Interpretation Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Interpretación de Categorías
            </h3>
            <div className="space-y-3">
              {data.categories
                .filter((c) => c.id !== "total")
                .map((cat) => (
                  <div key={cat.id} className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cat.name_es}
                        {cat.weight_pct && (
                          <span className="text-gray-500 font-normal">
                            {" "}
                            (~{cat.weight_pct}% del IPC)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-600">
                        {cat.description_es}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Señales de Política Monetaria
            </h3>
            <div className="space-y-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">Inflación Subyacente vs No Subyacente</p>
                <p className="text-blue-700 mt-1">
                  La inflación subyacente refleja presiones domésticas persistentes.
                  Si la subyacente sube mientras la no subyacente baja, el BCRP
                  tiene más razón para subir tasas.
                </p>
              </div>
              <div>
                <p className="font-medium">Transables vs No Transables</p>
                <p className="text-blue-700 mt-1">
                  Inflación de transables refleja tipo de cambio e importaciones.
                  No transables refleja demanda interna y costos laborales locales.
                </p>
              </div>
              <div>
                <p className="font-medium">Alimentos</p>
                <p className="text-blue-700 mt-1">
                  Alta volatilidad por factores climáticos (El Niño, heladas).
                  El BCRP mira el core para calibrar su política, no los alimentos.
                </p>
              </div>
              <div className="bg-white rounded p-3 mt-2">
                <p className="font-semibold text-gray-900">
                  Meta actual BCRP: 1% – 3% (12m)
                </p>
                <p className="text-gray-700">
                  IPC Total actual:{" "}
                  <strong style={{ color: total?.color }}>
                    {total
                      ? `${total.latest_12m > 0 ? "+" : ""}${total.latest_12m.toFixed(2)}%`
                      : "N/D"}
                  </strong>{" "}
                  {total && total.latest_12m >= 1 && total.latest_12m <= 3
                    ? "✅ Dentro de meta"
                    : "⚠️ Fuera de meta"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-4">
            <Link
              href="/estadisticas/inflacion"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              ← Volver a Inflación
            </Link>
            <Link
              href="/estadisticas/inflacion/graficos"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Ver gráficos históricos →
            </Link>
            <Link
              href="/estadisticas/inflacion/metodologia"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Ver metodología →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
