"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface SectorData {
  id: string;
  name_es: string;
  name_en: string;
  color: string;
  dates: string[];
  values: number[];
  latest_value: number;
  latest_date: string;
}

interface SectoralData {
  metadata: {
    last_update: string;
    frequency: string;
    unit: string;
    source: string;
    n_observations: number;
    n_sectors: number;
  };
  total_gdp: {
    dates: string[];
    values: number[];
  };
  sectors: SectorData[];
  sector_weights: Record<string, number>;
}

export default function PBISectoresPage() {
  const [data, setData] = useState<SectoralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"all" | "selected">("all");

  useEffect(() => {
    fetch("/assets/data/gdp_sectoral.json")
      .then((r) => r.json())
      .then((jsonData) => {
        setData(jsonData);
        // Initialize with all sectors selected
        setSelectedSectors(jsonData.sectors.map((s: SectorData) => s.id));
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

  const toggleSector = (sectorId: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sectorId)
        ? prev.filter((id) => id !== sectorId)
        : [...prev, sectorId]
    );
  };

  const visibleSectors =
    viewMode === "all"
      ? data.sectors
      : data.sectors.filter((s) => selectedSectors.includes(s.id));

  // Create Plotly traces for all sectors
  const traces = [
    // Total GDP as reference line
    {
      x: data.total_gdp.dates,
      y: data.total_gdp.values,
      type: "scatter" as const,
      mode: "lines" as const,
      name: "PBI Total",
      line: { color: "#1f2937", width: 3, dash: "dash" },
    },
    // Individual sectors
    ...visibleSectors.map((sector) => ({
      x: sector.dates,
      y: sector.values,
      type: "scatter" as const,
      mode: "lines+markers" as const,
      name: sector.name_es,
      line: { color: sector.color, width: 2 },
      marker: { size: 4, color: sector.color },
    })),
  ];

  const layout = {
    title: {
      text: "Crecimiento del PBI por Sector Económico",
      font: { size: 18, color: "#1f2937" },
    },
    xaxis: {
      title: "Trimestre",
      gridcolor: "#e5e7eb",
    },
    yaxis: {
      title: "Variación % interanual",
      gridcolor: "#e5e7eb",
      zeroline: true,
      zerolinecolor: "#9ca3af",
      zerolinewidth: 1,
    },
    hovermode: "x unified" as const,
    plot_bgcolor: "#ffffff",
    paper_bgcolor: "#ffffff",
    margin: { t: 60, r: 20, b: 60, l: 60 },
    legend: {
      orientation: "v" as const,
      y: 1,
      yanchor: "top" as const,
      x: 1.02,
      xanchor: "left" as const,
    },
    height: 500,
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
          <Link href="/estadisticas/pbi" className="hover:text-blue-700">
            PBI
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Sectores Económicos</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PBI por Sector Económico
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Desagregación del crecimiento económico por sectores productivos. Datos del INEI procesados por el BCRP.
          </p>
        </div>

        {/* Latest Values Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {data.sectors.map((sector) => (
            <div
              key={sector.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => toggleSector(sector.id)}
              style={{
                borderLeft: selectedSectors.includes(sector.id)
                  ? `4px solid ${sector.color}`
                  : "4px solid #e5e7eb",
                opacity: selectedSectors.includes(sector.id) ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">
                  {sector.name_es}
                </h3>
                <input
                  type="checkbox"
                  checked={selectedSectors.includes(sector.id)}
                  onChange={() => toggleSector(sector.id)}
                  className="h-4 w-4 text-blue-600 rounded"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: sector.color }}
              >
                {sector.latest_value > 0 ? "+" : ""}
                {sector.latest_value.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{sector.latest_date}</p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                filename: "qhawarina_pbi_sectores",
                height: 800,
                width: 1200,
                scale: 2,
              },
            }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />
          <p className="text-sm text-gray-500 mt-4">
            <strong>Fuente:</strong> {data.metadata.source} • Última actualización:{" "}
            {new Date(data.metadata.last_update).toLocaleDateString("es-PE")}
          </p>
        </div>

        {/* Insights */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Interpretación
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>
              <strong>Agropecuario ({data.sectors.find(s => s.id === "agropecuario")?.latest_value.toFixed(1)}%):</strong> Sector primario con alta variabilidad estacional. Incluye agricultura, ganadería y silvicultura.
            </li>
            <li>
              <strong>Minería ({data.sectors.find(s => s.id === "mineria")?.latest_value.toFixed(1)}%):</strong> Sector extractivo clave para las exportaciones. Depende de precios internacionales del cobre, oro, plata.
            </li>
            <li>
              <strong>Manufactura ({data.sectors.find(s => s.id === "manufactura")?.latest_value.toFixed(1)}%):</strong> Sector industrial. Incluye procesamiento primario y no primario.
            </li>
            <li>
              <strong>Construcción ({data.sectors.find(s => s.id === "construccion")?.latest_value.toFixed(1)}%):</strong> Indicador adelantado del empleo. Sensible a inversión pública e inmobiliaria.
            </li>
            <li>
              <strong>Servicios ({data.sectors.find(s => s.id === "servicios")?.latest_value.toFixed(1)}%):</strong> Mayor sector de la economía peruana (~50% del PBI). Incluye transporte, telecomunicaciones, finanzas, turismo.
            </li>
          </ul>
        </div>

        {/* Methodology Note */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📖 Nota Metodológica
          </h3>
          <p className="text-gray-700 mb-4">
            Los datos sectoriales provienen de las Cuentas Nacionales del INEI, publicadas por el BCRP.
            Las cifras muestran la variación porcentual interanual del valor agregado bruto (VAB) de cada sector.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Frecuencia:</strong> Trimestral • <strong>Unidad:</strong> % YoY • <strong>Serie base:</strong> Año 2007 = 100
          </p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/estadisticas/pbi/metodologia"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Ver metodología completa →
            </Link>
            <Link
              href="/estadisticas/pbi"
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              ← Volver a PBI
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
