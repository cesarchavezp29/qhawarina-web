"use client";

import Link from "next/link";

interface PoliticalData {
  current: {
    date: string;
    score: number;
    level: string;
    articles_total: number;
  };
  daily_series: Array<{ date: string; score: number }>;
}

const LEVEL_CONFIG: Record<string, { color: string; label_es: string; label_en: string }> = {
  MINIMO:   { color: "#8D99AE", label_es: "Mínimo",   label_en: "Minimal"  },
  BAJO:     { color: "#2A9D8F", label_es: "Bajo",     label_en: "Low"      },
  MODERADO: { color: "#E0A458", label_es: "Moderado", label_en: "Moderate" },
  ELEVADO:  { color: "#C65D3E", label_es: "Elevado",  label_en: "Elevated" },
  ALTO:     { color: "#9B2226", label_es: "Alto",     label_en: "High"     },
  CRITICO:  { color: "#6B0000", label_es: "Crítico",  label_en: "Critical" },
};

// Continuous gradient bar, PRR scale 0-300 (capped at 300 for display)
const PRR_MAX = 300;
const GAUGE_GRADIENT = [
  "#F0ECE6 0%",
  "#E0C9B0 20%",
  "#D4A574 35%",
  "#C65D3E 55%",
  "#A63C2A 75%",
  "#9B2226 90%",
  "#6B1518 100%",
].join(", ");

function zoneColor(prr: number): string {
  if (prr < 50)  return "#8D99AE";
  if (prr < 80)  return "#2A9D8F";
  if (prr < 120) return "#E0A458";
  if (prr < 160) return "#C65D3E";
  if (prr < 200) return "#9B2226";
  return "#6B1518";
}

function RiskBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(PRR_MAX, score)) / PRR_MAX * 100;
  const dotColor = zoneColor(score);
  return (
    <div
      className="relative h-2 rounded-full overflow-visible"
      style={{ background: `linear-gradient(90deg, ${GAUGE_GRADIENT})` }}
    >
      {/* Indicator dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
        style={{ left: `calc(${pct}% - 6px)`, background: dotColor }}
      />
    </div>
  );
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
      {/* Reference line at PRR=100 (average) */}
      {min < 100 && max > 100 && (
        <line
          x1="0" y1={h - ((100 - min) / range) * h * 0.85 - h * 0.075}
          x2={w} y2={h - ((100 - min) / range) * h * 0.85 - h * 0.075}
          stroke="#E8E4DC" strokeWidth="1" strokeDasharray="3,3"
        />
      )}
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

export default function PoliticalRiskCard({
  data,
  isEn,
}: {
  data: PoliticalData;
  isEn: boolean;
}) {
  const current = data.current;
  const series30 = (data.daily_series ?? []).slice(-30);
  const scoreValues = series30.map((r) => r.score);

  const score = current.score ?? 0;
  const scoreDisplay = Math.round(score);  // PRR value (mean=100, unbounded)
  const level = current.level ?? "BAJO";
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG["MODERADO"];
  const articles = current.articles_total ?? 0;

  return (
    <Link href="/estadisticas/riesgo-politico" className="block group">
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
                  {isEn ? "· Political Risk" : "· Riesgo Político"}
                </span>
              </div>
              <h2
                className="text-lg leading-tight"
                style={{ color: "#2D3142", fontFamily: "var(--font-serif, Georgia, serif)" }}
              >
                {isEn ? "Political Risk Index" : "Índice de Riesgo Político"}
              </h2>
            </div>
            <span
              className="text-sm font-medium mt-1 group-hover:underline"
              style={{ color: "#C65D3E" }}
            >
              {isEn ? "View →" : "Ver →"}
            </span>
          </div>

          {/* Score (0-100) + level badge + sparkline */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-3 mb-2">
                <span
                  className="tabular-nums leading-none"
                  style={{
                    fontSize: "3rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-mono, ui-monospace, monospace)",
                    fontFeatureSettings: '"tnum"',
                    color: cfg.color,
                  }}
                >
                  {scoreDisplay}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8D99AE" }}>
                  PRR
                </span>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{ background: cfg.color + "20", color: cfg.color }}
                >
                  {isEn ? cfg.label_en : cfg.label_es}
                </span>
              </div>
              {/* PRR gauge bar (mean=100, cap at 300 for display) */}
              <RiskBar score={score} />
              <div className="flex justify-between mt-1" style={{ position: 'relative' }}>
                <span className="text-xs" style={{ color: "#8D99AE" }}>0</span>
                <span className="text-xs absolute" style={{ color: "#8D99AE", left: '33%', transform: 'translateX(-50%)' }}>100 (avg)</span>
                <span className="text-xs" style={{ color: "#8D99AE" }}>300</span>
              </div>
            </div>
            <div className="flex-1 h-12">
              <Sparkline data={scoreValues} color={cfg.color} />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: "#E8E4DC" }}
          >
            <span className="text-xs" style={{ color: "#8D99AE" }}>
              {isEn
                ? `11 feeds · 6 sources · ${articles.toLocaleString()} articles today`
                : `11 feeds · 6 fuentes · ${articles.toLocaleString()} artículos hoy`}
            </span>
            <span className="text-xs" style={{ color: "#8D99AE" }}>
              {formatDate(current.date, isEn)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
