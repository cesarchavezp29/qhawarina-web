"use client";

import Link from "next/link";

interface TopMover {
  category: string;
  label_es: string;
  label_en: string;
  var: number;
}

interface PriceData {
  latest: {
    date: string;
    index_all: number;
    index_food: number;
    cum_pct: number;
    var_all: number;
    n_products_today: number;
    top_movers: TopMover[];
  };
  series: Array<{ date: string; index_all: number; index_food: number }>;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.01;
  const w = 200, h = 48;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - ((v - min) / range) * h * 0.85 - h * 0.075,
  ]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={area} fill={color} fillOpacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function formatDate(dateStr: string, isEn: boolean): string {
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(
      isEn ? "en-US" : "es-PE",
      { day: "numeric", month: "short", year: "numeric" }
    );
  } catch {
    return dateStr;
  }
}

export default function PriceIndexCard({
  data,
  isEn,
}: {
  data: PriceData;
  isEn: boolean;
}) {
  const latest = data.latest;
  const series30 = data.series.slice(-30);
  const foodValues = series30.map((r) => r.index_food ?? 100);

  const cumPct = latest.cum_pct ?? 0;
  const varAll = latest.var_all ?? 0;
  const isUp = cumPct >= 0;

  const accentColor = isUp ? "#C65D3E" : "#9B2226";
  const deltaColor = varAll > 0 ? "#9B2226" : varAll < 0 ? "#2A9D8F" : "#8D99AE";
  const deltaArrow = varAll > 0 ? "▲" : varAll < 0 ? "▼" : "→";

  const topMovers = (latest.top_movers ?? []).slice(0, 2);
  const nProducts = latest.n_products_today ?? 0;

  return (
    <Link href="/estadisticas/precios-diarios" className="block group">
      <div
        className="flex flex-col gap-4 transition-shadow group-hover:shadow-md"
        style={{
          background: "#FAF8F4",
          border: "1px solid #E8E4DC",
          borderRadius: 8,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient top bar */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, #C65D3E, #E0A458)",
          }}
        />

        {/* QHAWARINA watermark */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 12,
            right: 16,
            fontSize: "3.8rem",
            fontWeight: 900,
            color: "#2D3142",
            opacity: 0.04,
            userSelect: "none",
            pointerEvents: "none",
            fontFamily: "var(--font-outfit, sans-serif)",
            letterSpacing: "0.04em",
            lineHeight: 1,
          }}
        >
          QHAWARINA
        </div>

        <div className="p-6 pt-7 flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#C65D3E" }}
                >
                  Qhawarina
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest">
                  {isEn ? "· Daily Prices" : "· Precios Diarios"}
                </span>
              </div>
              <h2
                className="text-lg font-serif leading-tight"
                style={{ color: "#2D3142", fontFamily: "var(--font-serif, Georgia, serif)" }}
              >
                {isEn ? "Daily Price Index" : "Índice de Precios Diarios"}
              </h2>
            </div>
            <span
              className="text-sm font-medium mt-1 group-hover:underline"
              style={{ color: "#C65D3E" }}
            >
              {isEn ? "View →" : "Ver →"}
            </span>
          </div>

          {/* KPI + sparkline */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div
                className="tabular-nums leading-none mb-1"
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-mono, ui-monospace, monospace)",
                  fontFeatureSettings: '"tnum"',
                  color: accentColor,
                }}
              >
                {cumPct >= 0 ? "+" : ""}
                {cumPct.toFixed(2)}%
              </div>
              <div className="text-xs" style={{ color: "#8D99AE" }}>
                {isEn ? "accumulated this month" : "acumulado mes en curso"}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: deltaColor, fontFeatureSettings: '"tnum"' }}
                >
                  {deltaArrow} {varAll >= 0 ? "+" : ""}
                  {varAll.toFixed(3)}%
                </span>
                <span className="text-xs" style={{ color: "#8D99AE" }}>
                  {isEn ? "vs yesterday" : "vs ayer"}
                </span>
              </div>
            </div>
            <div className="flex-1 h-12">
              <Sparkline data={foodValues} color={accentColor} />
            </div>
          </div>

          {/* Top movers */}
          {topMovers.length > 0 && (
            <div className="text-xs leading-relaxed" style={{ color: "#2D3142" }}>
              <span style={{ color: "#8D99AE" }}>{isEn ? "Today: " : "Hoy: "}</span>
              {topMovers.map((m, i) => (
                <span key={m.category}>
                  <span style={{ color: m.var > 0 ? "#9B2226" : "#2A9D8F" }}>
                    {m.label_es} {m.var >= 0 ? "+" : ""}
                    {m.var.toFixed(1)}%
                  </span>
                  {i < topMovers.length - 1 && (
                    <span style={{ color: "#8D99AE" }}> · </span>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: "#E8E4DC" }}
          >
            <span className="text-xs" style={{ color: "#8D99AE" }}>
              {isEn
                ? `${nProducts.toLocaleString()} prices tracked`
                : `${nProducts.toLocaleString()} precios rastreados`}
              {" · "}Plaza Vea · Metro · Wong
            </span>
            <span className="text-xs" style={{ color: "#8D99AE" }}>
              {formatDate(latest.date, isEn)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
