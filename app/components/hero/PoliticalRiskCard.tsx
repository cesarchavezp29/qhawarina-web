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

const LEVEL_CONFIG: Record<string, { color: string; label_es: string; label_en: string; zone: number }> = {
  MINIMO:   { color: "#8D99AE", label_es: "Mínimo",   label_en: "Minimal",  zone: 0.1 },
  BAJO:     { color: "#2A9D8F", label_es: "Bajo",      label_en: "Low",      zone: 0.3 },
  MEDIO:    { color: "#E0A458", label_es: "Medio",     label_en: "Moderate", zone: 0.5 },
  ALTO:     { color: "#C65D3E", label_es: "Alto",      label_en: "High",     zone: 0.7 },
  CRITICAL: { color: "#9B2226", label_es: "Crítico",   label_en: "Critical", zone: 0.9 },
};

// Progress bar: 5 colored zones
const ZONES = [
  { from: 0,   to: 0.2, color: "#8D99AE" },
  { from: 0.2, to: 0.4, color: "#2A9D8F" },
  { from: 0.4, to: 0.6, color: "#E0A458" },
  { from: 0.6, to: 0.8, color: "#C65D3E" },
  { from: 0.8, to: 1.0, color: "#9B2226" },
];

function RiskBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(1, score)) * 100;
  return (
    <div className="relative h-2 rounded-full overflow-visible" style={{ background: "#E8E4DC" }}>
      {/* Colored zones */}
      <div className="absolute inset-0 flex rounded-full overflow-hidden">
        {ZONES.map((z) => (
          <div
            key={z.from}
            className="h-full"
            style={{ width: "20%", background: z.color, opacity: 0.35 }}
          />
        ))}
      </div>
      {/* Filled portion */}
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: ZONES.find((z) => score >= z.from && score < z.to)?.color ??
            (score >= 1 ? "#9B2226" : "#8D99AE"),
          opacity: 0.9,
        }}
      />
      {/* Indicator dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
        style={{
          left: `calc(${pct}% - 6px)`,
          background: ZONES.find((z) => score >= z.from && score < z.to)?.color ?? "#9B2226",
        }}
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
  // Draw colored background zones (subtle)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Threshold line at 0.5 */}
      <line x1="0" y1={h * 0.15 + (1 - 0.5) * h * 0.85} x2={w} y2={h * 0.15 + (1 - 0.5) * h * 0.85}
        stroke="#E8E4DC" strokeWidth="1" strokeDasharray="3,3" />
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
  const level = current.level ?? "BAJO";
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG["BAJO"];
  const articles = current.articles_total ?? 0;

  return (
    <Link href="/estadisticas/riesgo-politico" className="block group">
      <div
        className="rounded-lg p-6 flex flex-col gap-4 transition-shadow group-hover:shadow-md"
        style={{
          background: "#FAF8F4",
          border: "1px solid #E8E4DC",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
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

        {/* Score + level badge */}
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
                {score.toFixed(2)}
              </span>
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  background: cfg.color + "20",
                  color: cfg.color,
                }}
              >
                {isEn ? cfg.label_en : cfg.label_es}
              </span>
            </div>
            {/* Progress bar */}
            <RiskBar score={score} />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{ color: "#8D99AE" }}>0</span>
              <span className="text-xs" style={{ color: "#8D99AE" }}>1</span>
            </div>
          </div>
          <div className="flex-1 h-12">
            <Sparkline data={scoreValues} color={cfg.color} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-3" style={{ borderColor: "#E8E4DC" }}>
          <span className="text-xs" style={{ color: "#8D99AE" }}>
            {isEn
              ? `6 sources · ${articles} articles today`
              : `6 fuentes · ${articles} artículos hoy`}
          </span>
          <span className="text-xs" style={{ color: "#8D99AE" }}>
            {formatDate(current.date, isEn)}
          </span>
        </div>
      </div>
    </Link>
  );
}
