"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';
import CiteButton from "../../../components/CiteButton";
import ShareButton from "../../../components/ShareButton";
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
import {
  CHART_COLORS,
  CHART_DEFAULTS,
  tooltipContentStyle,
  axisTickStyle,
} from "../../../lib/chartTheme";
import PageSkeleton from "../../../components/PageSkeleton";

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
  const isEn = useLocale() === 'en';
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState<"quarterly" | "monthly">("monthly");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_quarterly.json?v=${new Date().toISOString().slice(0, 13)}`).then((res) => res.json()),
      fetch(`/assets/data/poverty_monthly.json?v=${new Date().toISOString().slice(0, 13)}`).then((res) => res.json()),
    ])
      .then(([quarterly, monthly]) => {
        setQuarterlyData(quarterly.national_quarterly || []);
        setMonthlyData(monthly.national_monthly || []);
        if (quarterly.metadata?.generated_at) {
          const locale = isEn ? 'en-US' : 'es-PE';
          setLastUpdate(new Date(quarterly.metadata.generated_at).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading poverty data:", err);
        setError(true);
        setLoading(false);
      });
  }, [isEn]);

  if (loading) return <PageSkeleton cards={2} />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF8F4' }}>
      <div className="max-w-md text-center">
        <p className="text-red-500 font-medium mb-2">{isEn ? 'Error loading data.' : 'Error cargando datos.'}</p>
        <p className="text-sm text-gray-500 mb-4">{isEn ? 'Data is updated monthly. Try again later.' : 'Los datos se actualizan mensualmente. Intenta de nuevo más tarde.'}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: '#C65D3E', color: '#C65D3E' }}>
          {isEn ? 'Retry' : 'Reintentar'}
        </button>
      </div>
    </div>
  );

  const latestQuarter = quarterlyData[quarterlyData.length - 1];
  const latestMonth = monthlyData[monthlyData.length - 1];
  const currentData = viewMode === "monthly" ? monthlyData : quarterlyData;

  const activeBtn = { backgroundColor: CHART_COLORS.terra, color: '#fff' };
  const inactiveBtn = { backgroundColor: CHART_COLORS.surface, color: CHART_COLORS.ink };

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: "#FAF8F4", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.045'%3EQHAWARINA%3C/text%3E%3C/svg%3E")` }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="text-sm mb-4" style={{ color: CHART_COLORS.ink3 }}>
            <Link href="/estadisticas" className="hover:underline">
              {isEn ? 'Statistics' : 'Estadísticas'}
            </Link>
            {" / "}
            <Link href="/estadisticas/pobreza" className="hover:underline">
              {isEn ? 'Poverty' : 'Pobreza'}
            </Link>
            {" / "}
            <span style={{ color: CHART_COLORS.ink }} className="font-medium">
              {isEn ? 'Quarterly' : 'Trimestral'}
            </span>
          </nav>

          <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
            <h1 className="text-4xl font-bold" style={{ color: CHART_COLORS.ink }}>
              {isEn ? 'High-Frequency Poverty' : 'Pobreza de Alta Frecuencia'}
            </h1>
            <div className="flex gap-2 flex-shrink-0">
              <CiteButton indicator={isEn ? 'Poverty — Quarterly Data' : 'Pobreza — Datos Trimestrales'} isEn={isEn} />
              <ShareButton
                title={isEn ? 'Poverty Quarterly — Qhawarina' : 'Pobreza Trimestral — Qhawarina'}
                text={isEn ? '📊 Peru poverty quarterly data | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/trimestral' : '📊 Datos trimestrales de pobreza en Perú | Qhawarina\nhttps://qhawarina.pe/estadisticas/pobreza/trimestral'}
              />
            </div>
          </div>
          <p className="text-lg mb-3" style={{ color: CHART_COLORS.ink3 }}>
            {isEn ? 'Monthly and quarterly temporal disaggregation' : 'Desagregación temporal mensual y trimestral'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("monthly")}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={viewMode === "monthly" ? activeBtn : inactiveBtn}
            >
              {isEn ? 'Monthly' : 'Mensual'}
            </button>
            <button
              onClick={() => setViewMode("quarterly")}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={viewMode === "quarterly" ? activeBtn : inactiveBtn}
            >
              {isEn ? 'Quarterly' : 'Trimestral'}
            </button>
          </div>
          <div className="mt-4">
            <LastUpdate date={lastUpdate} />
          </div>
        </div>

        {/* Current Value Card */}
        <div className="rounded-lg border p-8 mb-8" style={{ background: '#FFFCF7', borderColor: CHART_DEFAULTS.gridStroke }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider mb-2" style={{ color: CHART_COLORS.ink3 }}>
                {isEn ? 'National Rate' : 'Tasa Nacional'}
              </h2>
              <p className="text-5xl font-bold" style={{ color: CHART_COLORS.ink }}>
                {viewMode === "monthly"
                  ? latestMonth?.poverty_rate.toFixed(1)
                  : latestQuarter?.poverty_rate.toFixed(1)}%
              </p>
              <p className="text-sm mt-2" style={{ color: CHART_COLORS.ink3 }}>
                {viewMode === "monthly" ? latestMonth?.month : latestQuarter?.quarter}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm mb-1" style={{ color: CHART_COLORS.ink3 }}>
                {isEn ? 'Series available:' : 'Serie disponible:'}
              </p>
              <p className="text-lg font-medium" style={{ color: CHART_COLORS.ink }}>
                {viewMode === "monthly"
                  ? `2012-01 ${isEn ? 'to' : 'a'} ${latestMonth?.month}`
                  : `2004-Q1 ${isEn ? 'to' : 'a'} ${latestQuarter?.quarter}`}
              </p>
              <p className="text-sm mt-2" style={{ color: CHART_COLORS.ink3 }}>
                {viewMode === "monthly"
                  ? `${monthlyData.length} ${isEn ? 'months' : 'meses'}`
                  : `${quarterlyData.length} ${isEn ? 'quarters' : 'trimestres'}`}
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-lg border p-6 mb-8" style={{ background: CHART_COLORS.bg, borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: CHART_COLORS.ink }}>
            {viewMode === "monthly"
              ? (isEn ? "Monthly Series (2012–2025) — 3M-MA" : "Serie Mensual (2012-2025) - 3M-MA")
              : (isEn ? "Quarterly Series (2004–2025)" : "Serie Trimestral (2004-2025)")}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={currentData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_DEFAULTS.gridStroke}
                strokeWidth={CHART_DEFAULTS.gridStrokeWidth}
              />
              <XAxis
                dataKey={viewMode === "monthly" ? "month" : "quarter"}
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={axisTickStyle}
                stroke={CHART_DEFAULTS.axisStroke}
                label={{
                  value: isEn ? "Poverty Rate (%)" : "Tasa de Pobreza (%)",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_DEFAULTS.axisStroke },
                }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: number | undefined) => [
                  `${(value ?? 0).toFixed(1)}%`,
                  isEn ? "Poverty" : "Pobreza",
                ]}
              />
              <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
              <Line
                type="monotone"
                dataKey="poverty_rate"
                stroke={CHART_COLORS.amber}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.amber, r: 3 }}
                name={isEn ? "Quarterly Rate" : "Tasa Trimestral"}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-end">
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
                a.download = viewMode === "monthly" ? "pobreza_mensual.csv" : "pobreza_trimestral.csv";
                a.click();
              }}
              className="px-4 py-2 text-white rounded text-sm font-medium"
              style={{ backgroundColor: CHART_COLORS.terra }}
            >
              {isEn ? 'Download CSV' : 'Descargar CSV'}
            </button>
          </div>
        </div>

        {/* Methodology */}
        <div className="rounded-lg border p-6" style={{ background: '#FFFCF7', borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: CHART_COLORS.ink }}>
            {isEn ? 'Methodology' : 'Metodología'}
          </h3>
          <div className="prose prose-sm max-w-none" style={{ color: CHART_COLORS.ink }}>
            <p className="mb-4">
              {isEn
                ? 'This indicator uses temporal disaggregation (Chow-Lin method) to distribute INEI annual poverty rates to quarterly frequency.'
                : 'Este indicador utiliza desagregación temporal (método Chow-Lin) para distribuir las tasas anuales de pobreza publicadas por INEI a frecuencia trimestral.'}
            </p>

            <h4 className="text-base font-semibold mt-6 mb-2" style={{ color: CHART_COLORS.ink }}>
              {isEn ? 'High-frequency indicators' : 'Indicadores de alta frecuencia'}
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>
                <strong>{isEn ? 'Quarterly GDP:' : 'PBI trimestral:'}</strong>{' '}
                {isEn ? 'Proxy for household income' : 'Proxy del ingreso de los hogares'}
              </li>
              <li>
                <strong>{isEn ? 'Monthly CPI:' : 'IPC mensual:'}</strong>{' '}
                {isEn ? 'Adjustment for changes in the poverty line' : 'Ajuste por cambios en la línea de pobreza'}
              </li>
            </ul>

            <h4 className="text-base font-semibold mt-6 mb-2" style={{ color: CHART_COLORS.ink }}>
              {isEn ? 'Advantages of quarterly approach' : 'Ventajas del enfoque trimestral'}
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>{isEn ? 'Enables intra-annual tracking of changes in social conditions' : 'Permite seguimiento intra-anual de cambios en condiciones sociales'}</li>
              <li>{isEn ? 'Identifies seasonal trends and short-term fluctuations' : 'Identifica tendencias estacionales y fluctuaciones de corto plazo'}</li>
              <li>{isEn ? 'Compatible with frequency of other macroeconomic indicators' : 'Compatible con frecuencia de otros indicadores macroeconómicos'}</li>
            </ul>

            <h4 className="text-base font-semibold mt-6 mb-2" style={{ color: CHART_COLORS.ink }}>
              {isEn ? 'Reference' : 'Referencia'}
            </h4>
            <p className="text-sm">
              {isEn
                ? 'INDEC Argentina (2016), "Quarterly estimation methodology for poverty and indigence". The Chow-Lin method is standard for temporal disaggregation in economic series.'
                : 'INDEC Argentina (2016), "Metodología de estimación trimestral de pobreza e indigencia". El método Chow-Lin es estándar para desagregación temporal en series económicas.'}
            </p>

            <div className="mt-6 p-4 rounded-lg" style={{ background: CHART_COLORS.surface, border: `1px solid ${CHART_DEFAULTS.gridStroke}` }}>
              <p className="text-sm" style={{ color: CHART_COLORS.ink }}>
                <strong>{isEn ? 'Note:' : 'Nota:'}</strong>{' '}
                {isEn
                  ? 'Quarterly values are estimates based on the intra-annual distribution of indicators. Official annual INEI values are maintained as reference.'
                  : 'Los valores trimestrales son estimaciones basadas en la distribución intra-anual de los indicadores. Los valores anuales oficiales de INEI se mantienen como referencia.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
