"use client";

import { useEffect, useState } from "react";
import LastUpdate from "../../../components/stats/LastUpdate";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface QuarterlyData {
  quarter: string;
  poverty_rate: number;
}

interface MonthlyData {
  month: string;
  poverty_rate: number;
  poverty_rate_raw: number;
}

export default function PobrezaTrimestralPage() {
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"quarterly" | "monthly">("monthly");
  const lastUpdate = "15-Feb-2026";

  useEffect(() => {
    Promise.all([
      fetch("/assets/data/poverty_quarterly.json").then((res) => res.json()),
      fetch("/assets/data/poverty_monthly.json").then((res) => res.json()),
    ])
      .then(([quarterly, monthly]) => {
        setQuarterlyData(quarterly.national_quarterly || []);
        setMonthlyData(monthly.national_monthly || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading poverty data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  const latestQuarter = quarterlyData[quarterlyData.length - 1];
  const latestMonth = monthlyData[monthlyData.length - 1];
  const currentData = viewMode === "monthly" ? monthlyData : quarterlyData;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/estadisticas" className="hover:text-blue-700">
              Estadísticas
            </a>
            {" / "}
            <a href="/estadisticas/pobreza" className="hover:text-blue-700">
              Pobreza
            </a>
            {" / "}
            <span className="text-gray-900 font-medium">Trimestral</span>
          </nav>

          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Pobreza de Alta Frecuencia
              </h1>
              <p className="text-lg text-gray-600">
                Desagregación temporal mensual y trimestral
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-4 py-2 rounded font-medium ${
                  viewMode === "monthly"
                    ? "bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setViewMode("quarterly")}
                className={`px-4 py-2 rounded font-medium ${
                  viewMode === "quarterly"
                    ? "bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Trimestral
              </button>
            </div>
          </div>
          <div className="mt-4">
            <LastUpdate date={lastUpdate} />
          </div>
        </div>

        {/* Current Value Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                Tasa Nacional
              </h2>
              <p className="text-5xl font-bold text-gray-900">
                {viewMode === "monthly"
                  ? latestMonth?.poverty_rate.toFixed(1)
                  : latestQuarter?.poverty_rate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {viewMode === "monthly" ? latestMonth?.month : latestQuarter?.quarter}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Serie disponible:</p>
              <p className="text-lg font-medium text-gray-700">
                {viewMode === "monthly"
                  ? `2012-01 a ${latestMonth?.month}`
                  : `2004-Q1 a ${latestQuarter?.quarter}`}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {viewMode === "monthly" ? `${monthlyData.length} meses` : `${quarterlyData.length} trimestres`}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {viewMode === "monthly"
              ? "Serie Mensual (2012-2025) - 3M-MA"
              : "Serie Trimestral (2004-2025)"}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={viewMode === "monthly" ? "month" : "quarter"}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis
                domain={[15, 70]}
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{
                  value: "Tasa de Pobreza (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12, fill: "#6b7280" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Pobreza"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="poverty_rate"
                stroke="#dc2626"
                strokeWidth={2}
                dot={{ fill: "#dc2626", r: 3 }}
                name="Tasa Trimestral"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={() => {
                const csvContent =
                  viewMode === "monthly"
                    ? "month,poverty_rate\n" +
                      monthlyData.map((d) => `${d.month},${d.poverty_rate}`).join("\n")
                    : "quarter,poverty_rate\n" +
                      quarterlyData.map((d) => `${d.quarter},${d.poverty_rate}`).join("\n");
                const blob = new Blob([csvContent], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download =
                  viewMode === "monthly"
                    ? "pobreza_mensual.csv"
                    : "pobreza_trimestral.csv";
                a.click();
              }}
              className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 text-sm font-medium"
            >
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Methodology */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Metodología
          </h3>
          <div className="prose prose-sm max-w-none text-gray-700">
            <p className="mb-4">
              Este indicador utiliza <strong>desagregación temporal</strong> (método
              Chow-Lin) para distribuir las tasas anuales de pobreza publicadas por
              INEI a frecuencia trimestral.
            </p>

            <h4 className="text-base font-semibold text-gray-900 mt-6 mb-2">
              Indicadores de alta frecuencia
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>PBI trimestral:</strong> Proxy del ingreso de los hogares
              </li>
              <li>
                <strong>IPC mensual:</strong> Ajuste por cambios en la línea de
                pobreza
              </li>
            </ul>

            <h4 className="text-base font-semibold text-gray-900 mt-6 mb-2">
              Ventajas del enfoque trimestral
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                Permite seguimiento intra-anual de cambios en condiciones sociales
              </li>
              <li>
                Identifica tendencias estacionales y fluctuaciones de corto plazo
              </li>
              <li>
                Compatible con frecuencia de otros indicadores macroeconómicos
              </li>
            </ul>

            <h4 className="text-base font-semibold text-gray-900 mt-6 mb-2">
              Referencia
            </h4>
            <p className="text-sm">
              INDEC Argentina (2016), &quot;Metodología de estimación trimestral de
              pobreza e indigencia&quot;. El método Chow-Lin es estándar para
              desagregación temporal en series económicas.
            </p>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Nota:</strong> Los valores trimestrales son estimaciones
                basadas en la distribución intra-anual de los indicadores. Los valores
                anuales oficiales de INEI se mantienen como referencia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
