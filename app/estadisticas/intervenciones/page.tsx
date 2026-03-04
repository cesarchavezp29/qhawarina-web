"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import ShareButton from "../../components/ShareButton";
import EmbedWidget from "../../components/EmbedWidget";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// ─── Variable catalog ────────────────────────────────────────────────────────

const VARIABLES = [
  {
    key: "spot_net_purchases" as const,
    keyM: "spot_net_purchases",
    label: "Spot neto",
    labelFull: "Compras netas spot BCRP",
    unit: "Mill. USD",
    color: "#1d4ed8",
    type: "bar" as const,
    dash: undefined,
    group: "int" as const,
    description: "Compras (positivo) o ventas (negativo) netas de dólares en el mercado spot.",
  },
  {
    key: "swaps_net" as const,
    keyM: "swaps_net",
    label: "Swaps neto",
    labelFull: "Swaps cambiarios netos BCRP",
    unit: "Mill. USD",
    color: "#7c3aed",
    type: "bar" as const,
    dash: undefined,
    group: "int" as const,
    description: "Swaps de compra menos swaps de venta netos.",
  },
  {
    key: "fx" as const,
    keyM: "fx_avg",
    label: "TC PEN/USD",
    labelFull: "Tipo de cambio interbancario",
    unit: "PEN/USD",
    color: "#059669",
    type: "line" as const,
    dash: "solid",
    group: "fin" as const,
    description: "Tipo de cambio interbancario venta (soles por dólar).",
  },
  {
    key: "bond_sol_10y" as const,
    keyM: "bond_sol_avg",
    label: "Bono Sol 10a",
    labelFull: "Bono soberano 10 años (S/)",
    unit: "%",
    color: "#dc2626",
    type: "line" as const,
    dash: "solid",
    group: "fin" as const,
    description: "Rendimiento anual del bono soberano peruano a 10 años en soles.",
  },
  {
    key: "bond_usd_10y" as const,
    keyM: "bond_usd_avg",
    label: "Bono USD 10a",
    labelFull: "Bono soberano 10 años (USD)",
    unit: "%",
    color: "#9333ea",
    type: "line" as const,
    dash: "dot",
    group: "fin" as const,
    description: "Rendimiento anual del bono soberano peruano a 10 años en dólares.",
  },
  {
    key: "reference_rate" as const,
    keyM: "reference_rate",
    label: "Tasa Ref.",
    labelFull: "Tasa de referencia BCRP",
    unit: "%",
    color: "#0891b2",
    type: "line" as const,
    dash: "dash",
    group: "fin" as const,
    description: "Tasa de política monetaria del BCRP.",
  },
  {
    key: "bvl" as const,
    keyM: "bvl_end",
    label: "BVL",
    labelFull: "BVL Índice General",
    unit: "pts",
    color: "#f59e0b",
    type: "line" as const,
    dash: "solid",
    group: "mkt" as const,
    description: "Índice General de la Bolsa de Valores de Lima.",
  },
] as const;

type VarKey = typeof VARIABLES[number]["key"];
type ViewMode = "diario" | "mensual";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyRecord {
  date: string;
  spot_net_purchases: number | null;
  swaps_net: number | null;
  total_intervention: number;
  fx: number | null;
  reference_rate: number | null;
  bond_sol_10y: number | null;
  bond_usd_10y: number | null;
  bvl: number | null;
}

interface MonthlyRecord {
  month: string;
  spot_net_purchases: number;
  swaps_net: number;
  total_intervention: number;
  fx_avg: number | null;
  bond_sol_avg: number | null;
  bond_usd_avg: number | null;
  bvl_end: number | null;
  reference_rate: number | null;
  n_days: number;
}

interface FXData {
  metadata: {
    generated_at: string;
    coverage: string;
    methodology: string;
    n_days_daily: number;
    n_months_monthly: number;
    units: Record<string, string>;
  };
  latest: {
    date: string;
    fx: number | null;
    spot_net_purchases: number | null;
    swaps_net: number | null;
    reference_rate: number | null;
    bond_sol_10y: number | null;
    bond_usd_10y: number | null;
    bvl: number | null;
  };
  daily_series: DailyRecord[];
  monthly_series: MonthlyRecord[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fmtDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Get value from a record using the appropriate key for the current view mode */
function getVal(
  rec: DailyRecord | MonthlyRecord,
  varDef: (typeof VARIABLES)[number],
  viewMode: ViewMode
): number | null {
  if (viewMode === "diario") {
    return (rec as DailyRecord)[varDef.key as keyof DailyRecord] as number | null;
  } else {
    return (rec as MonthlyRecord)[varDef.keyM as keyof MonthlyRecord] as number | null;
  }
}

/** Normalize a series to % change from its first non-null value */
function normalizeToBase(vals: (number | null)[]): (number | null)[] {
  const firstNonNull = vals.find((v) => v !== null && v !== 0);
  if (firstNonNull === undefined || firstNonNull === null) return vals;
  return vals.map((v) =>
    v !== null ? ((v / firstNonNull) - 1) * 100 : null
  );
}

// ─── Variable Selector Pill ───────────────────────────────────────────────────

function VarPill({
  variable,
  active,
  onClick,
}: {
  variable: (typeof VARIABLES)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={variable.description}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? "border-transparent text-white shadow-sm"
          : "border-gray-300 text-gray-500 bg-white hover:border-gray-400"
      }`}
      style={active ? { backgroundColor: variable.color, borderColor: variable.color } : {}}
    >
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: active ? "white" : variable.color }}
      />
      <span>{variable.label}</span>
      <span className={`text-xs ${active ? "opacity-70" : "text-gray-400"}`}>
        {variable.unit}
      </span>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IntervencionesBCRPPage() {
  const [data, setData] = useState<FXData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<VarKey>>(
    new Set(["spot_net_purchases", "fx"])
  );
  const [viewMode, setViewMode] = useState<ViewMode>("mensual");
  const [normalized, setNormalized] = useState(false);

  useEffect(() => {
    fetch(`/assets/data/fx_interventions.json?v=${new Date().toISOString().split('T')[0]}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleVar(key: VarKey) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key); // keep at least 1 selected
      } else {
        next.add(key);
      }
      return next;
    });
  }

  // ── Derived chart data ────────────────────────────────────────────────────
  const { traces, layout, hasScale } = useMemo(() => {
    if (!data) return { traces: [], layout: {}, hasScale: false };

    const series = viewMode === "diario" ? data.daily_series : data.monthly_series;
    const xLabels = viewMode === "diario"
      ? (series as DailyRecord[]).map((r) => r.date)
      : (series as MonthlyRecord[]).map((r) => r.month);

    const selectedVars = VARIABLES.filter((v) => selected.has(v.key));
    const hasBars = selectedVars.some((v) => v.type === "bar");
    const hasLines = selectedVars.some((v) => v.type === "line");
    const hasBVL = selected.has("bvl");
    const hasOtherLines = selectedVars.some(
      (v) => v.type === "line" && v.key !== "bvl"
    );

    // Mixed scale warning: BVL (50k) + rates/TC (3-7) without normalization
    const mixedScaleWarning = hasBVL && hasOtherLines && !normalized && !hasBars;
    const hasScale = mixedScaleWarning;

    const buildTraces = () => {
      return selectedVars.map((varDef) => {
        const rawVals = series.map((rec) =>
          getVal(rec as DailyRecord | MonthlyRecord, varDef, viewMode)
        );
        const yVals = normalized ? normalizeToBase(rawVals) : rawVals;

        const isBar = varDef.type === "bar" && !normalized;
        // Axis assignment when NOT normalized:
        // - bars → y1 (left, Mill.USD)
        // - lines when bars also present → y2 (right)
        // - lines when only lines → y1
        const yaxis =
          normalized || (!hasBars && hasLines)
            ? "y"
            : isBar
            ? "y"
            : "y2";

        if (isBar) {
          return {
            x: xLabels,
            y: yVals,
            name: varDef.label,
            type: "bar" as const,
            marker: {
              color: (yVals as (number | null)[]).map((v) =>
                v !== null && v >= 0 ? varDef.color : adjustColorDark(varDef.color)
              ),
              opacity: 0.85,
            },
            yaxis,
          };
        } else {
          return {
            x: xLabels,
            y: yVals,
            name: varDef.label,
            type: "scatter" as const,
            mode: "lines" as const,
            line: {
              color: varDef.color,
              width: varDef.key === "reference_rate" ? 1.5 : 2,
              dash: varDef.dash ?? "solid",
            },
            connectgaps: true,
            yaxis,
          };
        }
      });
    };

    const traces = buildTraces();

    // Build layout
    const leftTitle = normalized
      ? "Variación desde inicio (%)"
      : hasBars
      ? "Mill. USD"
      : selectedVars.length === 1
      ? `${selectedVars[0].unit}`
      : "Valor";

    const rightTitle = normalized
      ? ""
      : hasBars && hasLines
      ? selectedVars
          .filter((v) => v.type === "line")
          .map((v) => v.unit)
          .filter((u, i, arr) => arr.indexOf(u) === i)
          .join(" / ")
      : "";

    const showDualAxis = hasBars && hasLines && !normalized;
    const layout: any = {
      barmode: "relative",
      xaxis: { gridcolor: "#e5e7eb", tickformat: viewMode === "diario" ? "%d %b %y" : "%b %y" },
      yaxis: {
        title: leftTitle,
        gridcolor: "#e5e7eb",
        zeroline: hasBars,
        zerolinecolor: "#374151",
        zerolinewidth: 1,
      },
      ...(showDualAxis
        ? {
            yaxis2: {
              title: rightTitle,
              overlaying: "y",
              side: "right",
              anchor: "x",
              showgrid: false,
            },
          }
        : {}),
      hovermode: "x unified",
      plot_bgcolor: "#ffffff",
      paper_bgcolor: "#ffffff",
      margin: { t: 20, r: showDualAxis ? 70 : 20, b: 50, l: 70 },
      legend: { orientation: "h" as const, y: -0.18 },
      height: 440,
    };

    return { traces, layout, hasScale };
  }, [data, selected, viewMode, normalized]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos del mercado cambiario...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href="/estadisticas" className="hover:text-blue-700">Estadísticas</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">Mercado Cambiario</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mercado Cambiario & Intervenciones BCRP</h1>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <p className="text-amber-800">
              Ejecuta el pipeline de exportación para generar los datos más recientes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { latest, monthly_series } = data;
  const prevMonth = monthly_series[monthly_series.length - 2] ?? null;

  const GROUP_LABELS: Record<string, string> = {
    int: "Intervenciones",
    fin: "Financiero",
    mkt: "Mercado",
  };

  // Group variables
  const grouped = ["int", "fin", "mkt"].map((g) => ({
    group: g,
    label: GROUP_LABELS[g],
    vars: VARIABLES.filter((v) => v.group === g),
  }));

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/estadisticas" className="hover:text-blue-700">Estadísticas</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Mercado Cambiario</span>
        </nav>

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Mercado Cambiario & Intervenciones BCRP
              </h1>
              <span className="px-3 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                FLOTACIÓN SUCIA
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Fuente: Estadísticas BCRP · Cobertura: {data.metadata.coverage} · Actualizado: {fmtDate(latest.date)}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <ShareButton title="Mercado Cambiario — Qhawarina" text={`TC PEN/USD: ${latest.fx?.toFixed(4)} | Tasa BCRP: ${latest.reference_rate?.toFixed(2)}% — Qhawarina`} />
            <EmbedWidget path="/estadisticas/intervenciones" title="Mercado Cambiario — Qhawarina" height={700} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "TC PEN/USD", val: latest.fx?.toFixed(4), unit: "venta interbancaria", color: "text-emerald-700" },
            { label: "Tasa referencia BCRP", val: latest.reference_rate ? `${latest.reference_rate.toFixed(2)}%` : "—", unit: "política monetaria", color: "text-blue-800" },
            { label: "Intervención spot", val: latest.spot_net_purchases !== null ? `${latest.spot_net_purchases > 0 ? "+" : ""}${latest.spot_net_purchases.toFixed(0)} M` : "—", unit: "último día (USD)", color: latest.spot_net_purchases !== null && latest.spot_net_purchases >= 0 ? "text-blue-700" : "text-red-600" },
            { label: "Bono soberano 10a S/", val: latest.bond_sol_10y ? `${latest.bond_sol_10y.toFixed(2)}%` : "—", unit: "rendimiento anual", color: "text-red-700" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.val ?? "—"}</p>
              <p className="text-xs text-gray-400">{kpi.unit}</p>
            </div>
          ))}
        </div>

        {/* ── Main interactive chart ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">

          {/* Controls row */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            {/* Variable selector */}
            <div className="flex flex-col gap-3">
              {grouped.map(({ group, label, vars }) => (
                <div key={group} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 w-24 uppercase tracking-wide">
                    {label}
                  </span>
                  {vars.map((v) => (
                    <VarPill
                      key={v.key}
                      variable={v}
                      active={selected.has(v.key)}
                      onClick={() => toggleVar(v.key)}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Right-side controls */}
            <div className="flex flex-col gap-2 items-end">
              {/* View mode */}
              <div className="flex rounded-lg overflow-hidden border border-gray-200">
                {(["diario", "mensual"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {mode === "diario" ? "Diario (2a)" : "Mensual (2020–)"}
                  </button>
                ))}
              </div>

              {/* Normalize toggle */}
              <button
                onClick={() => setNormalized((n) => !n)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  normalized
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}
              >
                <span>{normalized ? "✓" : "○"}</span>
                Normalizar (base=100)
              </button>
            </div>
          </div>

          {/* Mixed scale warning */}
          {hasScale && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 flex items-center gap-2">
              <span className="text-amber-600 text-sm">⚠️</span>
              <p className="text-sm text-amber-800">
                <strong>BVL</strong> tiene escala muy diferente al TC y bonos.
                Activa <strong>Normalizar</strong> para comparar tendencias.
              </p>
            </div>
          )}

          {/* Chart — key forces full remount when selections change (react-plotly.js quirk) */}
          <Plot
            key={`${viewMode}-${normalized ? 1 : 0}-${[...selected].sort().join(",")}`}
            data={traces as any}
            layout={layout}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: ["select2d", "lasso2d"],
              toImageButtonOptions: {
                format: "png",
                filename: "qhawarina_bcrp_mercado_cambiario",
                height: 700,
                width: 1400,
                scale: 2,
              },
            }}
            style={{ width: "100%", height: "100%" }}
            useResizeHandler
          />

          <p className="text-xs text-gray-400 mt-3">
            {normalized
              ? "Variación porcentual acumulada desde el inicio del período seleccionado (base=0%)."
              : "Datos diarios (2 años) o mensuales acumulados (desde ene 2020). Barras: Mill. USD · Líneas: escala derecha."}
            {" "}Fuente: BCRP.
          </p>
        </div>

        {/* Monthly summary */}
        {prevMonth && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">Spot acumulado mes anterior</p>
              <p className="text-xs text-gray-400 mb-1">{prevMonth.month}</p>
              <p className={`text-xl font-bold ${prevMonth.spot_net_purchases >= 0 ? "text-blue-700" : "text-red-600"}`}>
                {prevMonth.spot_net_purchases >= 0 ? "+" : ""}
                {prevMonth.spot_net_purchases.toFixed(0)} Mill. USD
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">Swaps acumulados</p>
              <p className="text-xs text-gray-400 mb-1">{prevMonth.month}</p>
              <p className={`text-xl font-bold ${prevMonth.swaps_net >= 0 ? "text-violet-700" : "text-orange-600"}`}>
                {prevMonth.swaps_net >= 0 ? "+" : ""}
                {prevMonth.swaps_net.toFixed(0)} Mill. USD
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">TC promedio</p>
              <p className="text-xs text-gray-400 mb-1">{prevMonth.month}</p>
              <p className="text-xl font-bold text-emerald-700">
                {prevMonth.fx_avg?.toFixed(4) ?? "—"} PEN/USD
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <p className="text-xs text-gray-500">BVL cierre</p>
              <p className="text-xs text-gray-400 mb-1">{prevMonth.month}</p>
              <p className="text-xl font-bold text-amber-700">
                {prevMonth.bvl_end?.toLocaleString("es-PE", { maximumFractionDigits: 0 }) ?? "—"}
              </p>
            </div>
          </div>
        )}

        <MethodologySection />
      </div>
    </div>
  );
}

// ─── Dark color helper ────────────────────────────────────────────────────────
function adjustColorDark(hex: string): string {
  // Returns a slightly darker/desaturated version of a hex color for negative bars
  const variants: Record<string, string> = {
    "#1d4ed8": "#1e40af",
    "#7c3aed": "#6d28d9",
  };
  return variants[hex] ?? hex;
}

// ─── Methodology ─────────────────────────────────────────────────────────────
function MethodologySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">🏦 Instrumentos de intervención BCRP</h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium">Spot neto (PD04659MD)</p>
            <p className="text-gray-500">
              Compras o ventas directas de dólares en el mercado interbancario. Efecto inmediato
              sobre el tipo de cambio. Positivo = BCRP compró dólares (absorbió presión apreciadora del sol).
            </p>
          </div>
          <div>
            <p className="font-medium">Swaps cambiarios (PD04660MD)</p>
            <p className="text-gray-500">
              Contratos de compra/venta de dólares con recompra a futuro. Afectan la
              liquidez en dólares sin modificar permanentemente las reservas internacionales.
            </p>
          </div>
          <div>
            <p className="font-medium">¿Por qué interviene el BCRP?</p>
            <p className="text-gray-500">
              Para suavizar la volatilidad excesiva del sol, reducir la inflación importada
              y mantener la confianza en la moneda. El BCRP no defiende un nivel específico
              de TC (flotación sucia, no caja de conversión).
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">📊 Guía del selector de variables</h3>
        <div className="space-y-2 text-sm">
          {VARIABLES.map((v) => (
            <div key={v.key} className="flex items-start gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0"
                style={{ backgroundColor: v.color }}
              />
              <div>
                <span className="font-medium text-gray-800">{v.labelFull}</span>
                <span className="text-gray-400 ml-1 text-xs">({v.unit})</span>
                <p className="text-gray-500 text-xs">{v.description}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t">
            Tip: Activa <strong>Normalizar</strong> para comparar tendencias entre variables
            de escala muy diferente (ej. BVL vs TC).
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <Link href="/estadisticas/riesgo-politico" className="text-sm text-blue-700 hover:underline">
            Ver riesgo político →
          </Link>
          <Link href="/datos" className="text-sm text-blue-700 hover:underline">
            Descargar datos →
          </Link>
        </div>
      </div>
    </div>
  );
}
