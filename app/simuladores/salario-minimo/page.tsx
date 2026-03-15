'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, AreaChart, Area, Legend,
} from 'recharts';
import {
  ComposableMap, Geographies, Geography, ZoomableGroup,
} from 'react-simple-maps';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface DiDResult {
  outcome: string; treat_var: string; note: string; N: number; N_depts: number;
  beta: number; se: number; tstat: number; pval: number; ci_lo: number; ci_hi: number; r2: number;
}
interface EventStudyResult {
  outcome: string; treat_var: string; note: string; N: number; N_depts: number;
  beta_2022: number; se_2022: number; pval_2022: number; ci_lo_2022: number; ci_hi_2022: number;
  beta_2023: number; se_2023: number; pval_2023: number; ci_lo_2023: number; ci_hi_2023: number;
}
interface KaitzSummary { p25: number; p50: number; p75: number; iqr: number; min: number; max: number; }
interface RegionalDiDData {
  metadata: Record<string, string>;
  main_kaitz: DiDResult[];
  main_share: DiDResult[];
  robustness: DiDResult[];
  event_study: EventStudyResult[];
  kaitz_summary: KaitzSummary;
  share_summary: KaitzSummary;
}
interface DeptKaitz {
  dept_code: string; dept_name: string; median_formal_2021: number;
  kaitz_pre: number; share_at_risk: number; share_below_new_mw: number; n_formal_2021: number;
}
interface KaitzData { metadata: { mw_pre: number; mw_post: number }; departments: Record<string, DeptKaitz> }
interface KDEPoint { wage: number; density: number }
interface WageDist {
  n_formal: number; n_informal: number; kde_formal: KDEPoint[]; kde_all: KDEPoint[];
  mw_at_survey: number; median_formal: number;
  [key: string]: unknown;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const MW_930  = 930;
const MW_1025 = 1025;
const MW_1130 = 1130;   // current Jan 2025
const MEDIAN_FORMAL_2021 = 1517;  // ENAHO 2021 national approx (from kaitz data)
const NATIONAL_FORMAL_WORKERS = 4_500_000;

const GEO_URL = '/assets/geo/peru_departamental.geojson';

function pStars(p: number): string {
  if (p < 0.01) return '***';
  if (p < 0.05) return '**';
  if (p < 0.10) return '*';
  return '';
}

function fmt(n: number): string { return Math.round(n).toLocaleString('es-PE'); }

function integrateKDE(kde: KDEPoint[], lo: number, hi: number): number {
  const step = 25;
  return kde.filter(p => p.wage >= lo && p.wage < hi).reduce((s, p) => s + p.density * step, 0);
}

// SVG watermark pattern (QHAWARINA rotated 45°, opacity ~0.03)
const WATERMARK_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.04'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// Kaitz category
function kaitzCategory(k: number): 'baja' | 'media' | 'alta' {
  if (k < 0.50) return 'baja';
  if (k <= 0.60) return 'media';
  return 'alta';
}
const CAT_COLORS: Record<string, string> = {
  baja:  '#a8d5ce',
  media: '#2A9D8F',
  alta:  '#1a6b62',
};

// ── Tooltip helper ─────────────────────────────────────────────────────────────
function CITooltip({ children, tip }: { children: React.ReactNode; tip: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 text-xs rounded px-2 py-1 text-center pointer-events-none"
          style={{ background: CHART_COLORS.ink, color: '#fff' }}>
          {tip}
        </span>
      )}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalarioMinimoPageV2() {
  const [regional, setRegional] = useState<RegionalDiDData | null>(null);
  const [kaitzData, setKaitzData] = useState<KaitzData | null>(null);
  const [wageDist, setWageDist] = useState<WageDist | null>(null);
  const [sliderMW, setSliderMW] = useState(MW_1130);
  const [methOpen, setMethOpen] = useState(false);
  const [litOpen, setLitOpen] = useState(false);
  const [deptSort, setDeptSort] = useState<'name' | 'kaitz' | 'risk'>('risk');
  const [deptAsc, setDeptAsc] = useState(false);
  const [tooltipDept, setTooltipDept] = useState<DeptKaitz | null>(null);
  const [mapPos, setMapPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const base = '/assets/data';
    fetch(`${base}/mw_regional_did_results.json`).then(r => r.json()).then(setRegional).catch(() => {});
    fetch(`${base}/mw_pre_policy_kaitz.json`).then(r => r.json()).then(setKaitzData).catch(() => {});
    fetch(`${base}/lima_wage_distribution.json`).then(r => r.json()).then(setWageDist).catch(() => {});
  }, []);

  // ── Pull key results ────────────────────────────────────────────────────────
  const formalResult   = regional?.event_study.find(r => r.outcome === 'formal_v4');
  const wageResult     = regional?.event_study.find(r => r.outcome === 'log_wage');
  const empResult      = regional?.event_study.find(r => r.outcome === 'employed');
  const empMain        = regional?.main_kaitz.find(r => r.outcome === 'employed');

  // ── Dept list from kaitz ────────────────────────────────────────────────────
  const depts: DeptKaitz[] = useMemo(() => {
    if (!kaitzData) return [];
    return Object.values(kaitzData.departments);
  }, [kaitzData]);

  const medianFormal2021 = useMemo(() => {
    if (!depts.length) return MEDIAN_FORMAL_2021;
    const wMed = depts.reduce((s, d) => s + d.median_formal_2021 * d.n_formal_2021, 0);
    const wN   = depts.reduce((s, d) => s + d.n_formal_2021, 0);
    return wN > 0 ? wMed / wN : MEDIAN_FORMAL_2021;
  }, [depts]);

  // ── Slider computations ─────────────────────────────────────────────────────
  const sliderKaitz = useMemo(() => sliderMW / medianFormal2021, [sliderMW, medianFormal2021]);

  const deptsWithSlider = useMemo(() => {
    return depts.map(d => ({
      ...d,
      newKaitz:   sliderMW / d.median_formal_2021,
      riskZone:   (sliderMW / d.median_formal_2021) < 0.65 ? 'verde' :
                  (sliderMW / d.median_formal_2021) < 0.75 ? 'amarillo' : 'rojo',
    }));
  }, [depts, sliderMW]);

  const redDepts = useMemo(() => deptsWithSlider.filter(d => d.riskZone === 'rojo').length, [deptsWithSlider]);

  // Workers in band: KDE integral [MW_1025, sliderMW] scaled by EPE reference count
  // Reference: 324,722 Lima formal workers in [1025→1130] (mw_complete_evidence, simulator_scenario_1130)
  const workersInBand = useMemo(() => {
    if (!wageDist) return 0;
    const REF_WORKERS = 324_722;
    const refBand = integrateKDE(wageDist.kde_formal, MW_1025, MW_1130);
    if (refBand <= 0 || sliderMW <= MW_1025) return 0;
    const curBand = integrateKDE(wageDist.kde_formal, MW_1025, sliderMW);
    return Math.round(REF_WORKERS * curBand / refBand);
  }, [sliderMW, wageDist]);

  const top3Depts = useMemo(() => {
    return [...deptsWithSlider].sort((a, b) => b.newKaitz - a.newKaitz).slice(0, 3).map(d => d.dept_name);
  }, [deptsWithSlider]);

  // ── Sorted dept table ───────────────────────────────────────────────────────
  const sortedDepts = useMemo(() => {
    const arr = [...deptsWithSlider];
    arr.sort((a, b) => {
      if (deptSort === 'name')  return deptAsc ? a.dept_name.localeCompare(b.dept_name) : b.dept_name.localeCompare(a.dept_name);
      if (deptSort === 'kaitz') return deptAsc ? a.kaitz_pre - b.kaitz_pre : b.kaitz_pre - a.kaitz_pre;
      if (deptSort === 'risk')  return deptAsc ? a.newKaitz - b.newKaitz  : b.newKaitz  - a.newKaitz;
      return 0;
    });
    return arr;
  }, [deptsWithSlider, deptSort, deptAsc]);

  const handleDeptSort = (k: 'name' | 'kaitz' | 'risk') => {
    if (deptSort === k) setDeptAsc(a => !a);
    else { setDeptSort(k); setDeptAsc(false); }
  };

  // ── KDE chart data ──────────────────────────────────────────────────────────
  const kdeChartData = useMemo(() => {
    if (!wageDist) return [];
    const fByWage = new Map(wageDist.kde_formal.map(p => [p.wage, p.density]));
    const wages = wageDist.kde_formal.map(p => p.wage).filter(w => w >= 500 && w <= 3000);
    return wages.map(w => ({
      wage: w,
      formal: (fByWage.get(w) ?? 0) * 1000,
    }));
  }, [wageDist]);

  // ── Event study chart data ──────────────────────────────────────────────────
  const eventStudyFormal = useMemo(() => {
    if (!formalResult) return [];
    return [
      { year: '2021 (base)', b: 0, lo: 0, hi: 0 },
      { year: '2022',        b: formalResult.beta_2022,  lo: formalResult.ci_lo_2022,  hi: formalResult.ci_hi_2022  },
      { year: '2023',        b: formalResult.beta_2023,  lo: formalResult.ci_lo_2023,  hi: formalResult.ci_hi_2023  },
    ];
  }, [formalResult]);

  const eventStudyEmp = useMemo(() => {
    if (!empResult) return [];
    return [
      { year: '2021 (base)', b: 0, lo: 0, hi: 0 },
      { year: '2022',        b: empResult.beta_2022,  lo: empResult.ci_lo_2022,  hi: empResult.ci_hi_2022  },
      { year: '2023',        b: empResult.beta_2023,  lo: empResult.ci_lo_2023,  hi: empResult.ci_hi_2023  },
    ];
  }, [empResult]);

  // ── Kaitz gradient bar positions ────────────────────────────────────────────
  function kaitzPos(k: number): string {
    const lo = 0.30, hi = 0.90;
    return `${Math.max(0, Math.min(100, ((k - lo) / (hi - lo)) * 100)).toFixed(1)}%`;
  }

  const loading = !regional || !kaitzData || !wageDist;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: CHART_COLORS.bg, backgroundImage: WATERMARK_BG }}>

      {/* Breadcrumb */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4">
        <p className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
          <Link href="/simuladores" className="hover:underline">Simuladores</Link>
          {' / '}Salario Mínimo
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: HEADLINE
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          style={{ color: CHART_COLORS.ink, fontFamily: "var(--font-outfit, 'Outfit', sans-serif)" }}>
          ¿Subir el salario mínimo destruye empleos?
        </h1>
        <p className="text-lg font-light mb-3" style={{ color: CHART_COLORS.ink3 }}>
          Evidencia de 25 departamentos del Perú (2021–2023)
        </p>
        <p className="text-sm max-w-2xl mx-auto leading-relaxed" style={{ color: CHART_COLORS.ink }}>
          Analizamos el aumento de S/930 a S/1,025 en mayo 2022 usando diferencias en diferencias
          entre departamentos con distinta exposición al salario mínimo.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full border"
          style={{ borderColor: CHART_COLORS.ink3, color: CHART_COLORS.ink3 }}>
          <span>ENAHO Panel 2020–2024 · 25 departamentos · 224,780 observaciones persona-año</span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 2: THREE EVIDENCE CARDS
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">

          {/* Card 1: No employment destruction */}
          <div className="p-5 rounded-sm border-l-4" style={{ background: '#fff', borderLeftColor: CHART_COLORS.terra, borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderRight: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderBottom: `1px solid ${CHART_DEFAULTS.gridStroke}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: CHART_COLORS.terra }}>
              Empleo
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: CHART_COLORS.ink }}>
              No se detectan pérdidas de empleo
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: CHART_COLORS.ink3 }}>
              En departamentos donde el salario mínimo era más restrictivo, el empleo no cayó después del aumento de 2022.
            </p>
            {empMain && (
              <div>
                <p className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
                  El intervalo de confianza incluye el cero — no hay evidencia estadística de destrucción de empleo.
                </p>
                {/* CI bar: shows CI crossing zero */}
                <div className="relative h-2 rounded-full" style={{ background: CHART_DEFAULTS.gridStroke }}>
                  <div className="absolute top-0 h-full w-0.5" style={{ left: '25%', background: CHART_COLORS.ink3, opacity: 0.6 }} />
                  <div className="absolute h-full rounded-full"
                    style={{ left: '22%', right: '5%', background: CHART_COLORS.teal, opacity: 0.35 }} />
                  <div className="absolute w-2.5 h-2.5 rounded-full -translate-y-1/4"
                    style={{ left: `calc(25% + ${(empMain.beta / (empMain.ci_hi - empMain.ci_lo)) * 50}% - 5px)`, background: CHART_COLORS.terra, border: '2px solid white', top: 0 }} />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: CHART_COLORS.ink3 }}>
                  <span>IC 95%: [{empMain.ci_lo.toFixed(2)}, +{empMain.ci_hi.toFixed(2)}]</span>
                  <span style={{ color: CHART_COLORS.teal }}>p = {empMain.pval.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Formalization */}
          <div className="p-5 rounded-sm border-l-4" style={{ background: '#fff', borderLeftColor: CHART_COLORS.terra, borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderRight: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderBottom: `1px solid ${CHART_DEFAULTS.gridStroke}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: CHART_COLORS.terra }}>
              Formalización
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: CHART_COLORS.ink }}>
              Mayor formalización en zonas de alta exposición
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: CHART_COLORS.ink3 }}>
              Hasta +4.1 puntos porcentuales en 2023 en los departamentos más expuestos al aumento.
            </p>
            {formalResult && (
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: CHART_COLORS.terra }}>
                  +{(formalResult.beta_2023 * 100).toFixed(1)}pp{pStars(formalResult.pval_2023)}
                </div>
                <div className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
                  Efecto en 2023: IC 95% [{(formalResult.ci_lo_2023 * 100).toFixed(1)}pp, {(formalResult.ci_hi_2023 * 100).toFixed(1)}pp]
                </div>
                <div className="relative h-2 rounded-full" style={{ background: CHART_DEFAULTS.gridStroke }}>
                  <div className="absolute h-full rounded-full" style={{ width: `${Math.min(100, formalResult.beta_2023 * 100 * 8)}%`, background: CHART_COLORS.terra, opacity: 0.7 }} />
                </div>
                <div className="flex justify-between text-xs mt-0.5" style={{ color: CHART_COLORS.ink3 }}>
                  <span>0pp</span><span style={{ color: CHART_COLORS.terra }}>+{(formalResult.beta_2023 * 100).toFixed(1)}pp</span>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Wages */}
          <div className="p-5 rounded-sm border-l-4" style={{ background: '#fff', borderLeftColor: CHART_COLORS.terra, borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderRight: `1px solid ${CHART_DEFAULTS.gridStroke}`, borderBottom: `1px solid ${CHART_DEFAULTS.gridStroke}` }}>
            <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: CHART_COLORS.terra }}>
              Salarios formales
            </div>
            <div className="text-2xl font-bold mb-2" style={{ color: CHART_COLORS.ink }}>
              Los salarios formales crecieron más rápido
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: CHART_COLORS.ink3 }}>
              +15.7% en departamentos más expuestos al aumento, comparado con departamentos de baja exposición.
            </p>
            {wageResult && (
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: CHART_COLORS.terra }}>
                  +{(wageResult.beta_2023 * 100).toFixed(1)}%{pStars(wageResult.pval_2023)}
                </div>
                <div className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
                  Efecto en 2023: IC 95% [{(wageResult.ci_lo_2023 * 100).toFixed(1)}%, {(wageResult.ci_hi_2023 * 100).toFixed(1)}%]
                </div>
                <div className="relative h-2 rounded-full" style={{ background: CHART_DEFAULTS.gridStroke }}>
                  <div className="absolute h-full rounded-full" style={{ width: `${Math.min(100, wageResult.beta_2023 * 100 * 4)}%`, background: CHART_COLORS.terra, opacity: 0.7 }} />
                </div>
                <div className="flex justify-between text-xs mt-0.5" style={{ color: CHART_COLORS.ink3 }}>
                  <span>0%</span><span style={{ color: CHART_COLORS.terra }}>+{(wageResult.beta_2023 * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 3: MAP
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            ¿Dónde afecta más el salario mínimo?
          </h2>
          <p className="text-sm mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Departamentos según nivel de exposición al salario mínimo en 2021 (pre-tratamiento).
            La exposición mide qué tan alto era el salario mínimo relativo al salario mediano formal.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Map */}
            <div className="md:col-span-2 border rounded-sm overflow-hidden relative" style={{ background: '#dce9f0', borderColor: CHART_DEFAULTS.gridStroke, minHeight: 480 }}>
              {/* Ocean label */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ fontSize: 9, color: '#6a9bb5', opacity: 0.5, writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)', letterSpacing: 2 }}>
                OCÉANO PACÍFICO
              </div>
              {kaitzData && (
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ center: [-75, -9.5], scale: 1550 }}
                  style={{ width: '100%', height: '480px' }}
                >
                  <ZoomableGroup center={[-75, -9.5]} zoom={1}>
                    {/* Neighbor countries — decorative, no interaction */}
                    <Geographies geography="/assets/geo/peru_neighbors.geojson">
                      {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill="#EEEEEE"
                            stroke="#DDDDDD"
                            strokeWidth={0.5}
                            style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                          />
                        ))
                      }
                    </Geographies>
                    {/* Peru departments — interactive */}
                    <Geographies geography={GEO_URL}>
                      {({ geographies }: { geographies: any[] }) =>
                        geographies.map((geo: any) => {
                          const code = String(geo.properties.FIRST_IDDP).padStart(2, '0');
                          const dept = kaitzData.departments[code];
                          const cat  = dept ? kaitzCategory(dept.kaitz_pre) : 'media';
                          return (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill={CAT_COLORS[cat]}
                              stroke="#fff"
                              strokeWidth={0.6}
                              style={{ default: { outline: 'none' }, hover: { outline: 'none', opacity: 0.8, cursor: 'pointer' }, pressed: { outline: 'none' } }}
                              onMouseEnter={() => setTooltipDept(dept ?? null)}
                              onMouseMove={(e: any) => setMapPos({ x: e.clientX, y: e.clientY })}
                              onMouseLeave={() => setTooltipDept(null)}
                            />
                          );
                        })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              )}
              {/* Map tooltip */}
              {tooltipDept && (
                <div className="fixed z-50 pointer-events-none px-3 py-2 rounded text-xs shadow-lg"
                  style={{ left: mapPos.x + 14, top: mapPos.y - 40, background: CHART_COLORS.ink, color: '#fff', maxWidth: 240 }}>
                  <div className="font-semibold mb-0.5">{tooltipDept.dept_name}</div>
                  <div>Exposición: <strong>{kaitzCategory(tooltipDept.kaitz_pre) === 'baja' ? 'Baja' : kaitzCategory(tooltipDept.kaitz_pre) === 'media' ? 'Media' : 'Alta'}</strong></div>
                  <div>El salario mínimo equivale al <strong>{(tooltipDept.kaitz_pre * 100).toFixed(0)}%</strong> del salario mediano formal</div>
                  <div style={{ opacity: 0.7 }}>Mediana 2021: S/ {Math.round(tooltipDept.median_formal_2021).toLocaleString('es-PE')}</div>
                </div>
              )}
            </div>
            {/* Legend + dept list */}
            <div className="space-y-4">
              <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
                <div className="text-xs font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>Nivel de exposición</div>
                {[
                  { cat: 'baja',  label: 'Baja exposición',   sub: 'El salario mediano es mucho mayor que el mínimo',      n: depts.filter(d => kaitzCategory(d.kaitz_pre) === 'baja').length },
                  { cat: 'media', label: 'Exposición media',   sub: 'El salario mediano es moderadamente mayor',             n: depts.filter(d => kaitzCategory(d.kaitz_pre) === 'media').length },
                  { cat: 'alta',  label: 'Alta exposición',    sub: 'El salario mínimo está cerca del mediano formal',       n: depts.filter(d => kaitzCategory(d.kaitz_pre) === 'alta').length },
                ].map(({ cat, label, sub, n }) => (
                  <div key={cat} className="flex items-start gap-2 mb-3">
                    <div className="w-4 h-4 rounded-sm flex-shrink-0 mt-0.5" style={{ background: CAT_COLORS[cat] }} />
                    <div>
                      <div className="text-xs font-medium" style={{ color: CHART_COLORS.ink }}>{label} ({n} dptos.)</div>
                      <div className="text-xs" style={{ color: CHART_COLORS.ink3 }}>{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Top exposed depts */}
              <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
                <div className="text-xs font-semibold mb-1" style={{ color: CHART_COLORS.ink }}>Mayor exposición</div>
                <div className="text-xs mb-2" style={{ color: CHART_COLORS.ink3 }}>SM como % del salario mediano</div>
                {[...depts].sort((a, b) => b.kaitz_pre - a.kaitz_pre).slice(0, 5).map(d => (
                  <div key={d.dept_code} className="flex justify-between text-xs py-1 border-b last:border-0" style={{ borderColor: CHART_DEFAULTS.gridStroke, color: CHART_COLORS.ink }}>
                    <span>{d.dept_name}</span>
                    <span className="font-medium" style={{ color: CHART_COLORS.terra }}>
                      {(d.kaitz_pre * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
                <div className="text-xs mt-3 pt-2 border-t" style={{ color: CHART_COLORS.ink3, borderColor: CHART_DEFAULTS.gridStroke }}>
                  Fuente: ENAHO Panel 2021, elaboración Qhawarina.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 4: WAGE DISTRIBUTION
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            Distribución salarial y el salario mínimo
          </h2>
          <p className="text-sm mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Distribución de salarios formales en Lima Metropolitana (EPE 2022). La línea vertical marca el salario mínimo vigente en ese momento (S/1,025). El apilamiento de trabajadores cerca del mínimo refleja la capacidad de fijación de precios del salario mínimo.
          </p>
          <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            {kdeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={kdeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <defs>
                    <linearGradient id="gFormalV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.teal} stopOpacity={0.5} />
                      <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} />
                  <XAxis
                    dataKey="wage" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => `S/${(v/1000).toFixed(1)}k`}
                    label={{ value: 'Salario mensual (S/)', position: 'insideBottom', offset: -12, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <YAxis
                    tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => v.toFixed(2)}
                    label={{ value: 'Densidad (×10⁻³)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v: number | undefined) => [(v ?? 0).toFixed(4), 'Formal'] as [string, string]}
                    labelFormatter={w => `S/ ${w}`}
                  />
                  <ReferenceLine
                    x={MW_1025} stroke={CHART_COLORS.terra} strokeWidth={2}
                    label={{ value: 'SM S/1,025 (may-2022)', position: 'insideTopRight', fontSize: 9, fill: CHART_COLORS.terra }}
                  />
                  <ReferenceLine
                    x={MW_930} stroke={CHART_COLORS.ink3} strokeWidth={1} strokeDasharray="4 3"
                    label={{ value: 'SM anterior S/930', position: 'insideTopLeft', fontSize: 9, fill: CHART_COLORS.ink3 }}
                  />
                  <Area type="monotone" dataKey="formal" stroke={CHART_COLORS.teal} strokeWidth={2} fill="url(#gFormalV2)" name="Formal" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 bg-gray-50 animate-pulse rounded" />
            )}
            <p className="text-xs mt-2 text-center" style={{ color: CHART_COLORS.ink3 }}>
              EPE Lima Metropolitana, código 766 (Abr–Jun 2022). Trabajadores formales.
              El apilamiento en S/1,025 refleja el efecto de fijación del salario mínimo.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 5: SIMULATOR
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            Simula un nuevo aumento
          </h2>
          <p className="text-sm mb-6" style={{ color: CHART_COLORS.ink3 }}>
            Mueve el deslizador para explorar los efectos de distintos niveles del salario mínimo.
            Las proyecciones se basan en la evidencia del aumento de 2022.
          </p>

          {/* Slider */}
          {(() => {
            const SL_MIN = MW_1025, SL_MAX = 1500;
            const pct = ((sliderMW - SL_MIN) / (SL_MAX - SL_MIN)) * 100;
            const ticks = [
              { val: MW_1025, label: 'S/1,025' },
              { val: MW_1130, label: 'S/1,130\n(vigente)' },
              { val: 1200,    label: 'S/1,200' },
              { val: 1300,    label: 'S/1,300' },
              { val: 1500,    label: 'S/1,500' },
            ];
            return (
              <div className="p-5 rounded-sm border mb-6" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium" style={{ color: CHART_COLORS.ink3 }}>Salario mínimo propuesto</span>
                  <div className="flex items-center gap-3">
                    {sliderMW === MW_1130 && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: '#fdf3f0', color: CHART_COLORS.terra, border: `1px solid ${CHART_COLORS.terra}` }}>
                        Vigente 2025
                      </span>
                    )}
                    <span className="text-3xl font-bold" style={{ color: CHART_COLORS.terra }}>
                      S/ {fmt(sliderMW)}
                    </span>
                  </div>
                </div>

                {/* Custom slider track */}
                <div className="relative mt-8 mb-2">
                  {/* Value bubble above thumb */}
                  <div className="absolute -top-7 text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap pointer-events-none"
                    style={{
                      left: `clamp(24px, calc(${pct}% - 20px), calc(100% - 44px))`,
                      background: CHART_COLORS.terra, color: '#fff', transform: 'translateY(0)',
                    }}>
                    S/{fmt(sliderMW)}
                    <span className="absolute left-1/2 -translate-x-1/2 top-full" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: `5px solid ${CHART_COLORS.terra}`, display: 'block', width: 0, height: 0 }} />
                  </div>

                  {/* Track background */}
                  <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: CHART_DEFAULTS.gridStroke }}>
                    {/* Filled portion */}
                    <div className="absolute h-full rounded-full transition-none"
                      style={{ width: `${pct}%`, background: CHART_COLORS.terra }} />
                  </div>

                  {/* Thumb (positioned over track) */}
                  <div className="absolute top-1/2 pointer-events-none"
                    style={{ left: `calc(${pct}% - 12px)`, transform: 'translateY(-50%) translateY(1px)', width: 24, height: 24, borderRadius: '50%', background: CHART_COLORS.terra, border: '3px solid white', boxShadow: '0 2px 8px rgba(198,93,62,0.4)' }} />

                  {/* Invisible native input on top for interaction */}
                  <input
                    type="range" min={SL_MIN} max={SL_MAX} step={25}
                    value={sliderMW}
                    onChange={e => setSliderMW(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    style={{ height: '100%' }}
                  />
                </div>

                {/* Tick marks */}
                <div className="relative mt-3" style={{ height: 32 }}>
                  {ticks.map(({ val, label }) => {
                    const tp = ((val - SL_MIN) / (SL_MAX - SL_MIN)) * 100;
                    return (
                      <div key={val} className="absolute flex flex-col items-center"
                        style={{ left: `${tp}%`, transform: 'translateX(-50%)' }}>
                        <div className="w-px h-2" style={{ background: CHART_COLORS.ink3, opacity: 0.4 }} />
                        <div className="text-center leading-tight mt-0.5 whitespace-pre-line"
                          style={{ fontSize: 9, color: val === sliderMW ? CHART_COLORS.terra : CHART_COLORS.ink3, fontWeight: val === sliderMW ? 700 : 400 }}>
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between text-xs mt-1" style={{ color: CHART_COLORS.ink3 }}>
                  <span>+0% vs S/1,025</span>
                  <span className="font-medium" style={{ color: CHART_COLORS.ink }}>
                    +{(((sliderMW / MW_1025) - 1) * 100).toFixed(1)}% vs S/1,025
                  </span>
                  <span>+{(((SL_MAX / MW_1025) - 1) * 100).toFixed(1)}%</span>
                </div>
              </div>
            );
          })()}

          {/* Dynamic paragraph */}
          {depts.length > 0 && (
            <div className="p-5 rounded-sm border mb-6" style={{ background: '#fdf3f0', borderColor: CHART_COLORS.terra, borderLeftWidth: 4 }}>
              <p className="text-sm leading-relaxed" style={{ color: CHART_COLORS.ink }}>
                Si el salario mínimo sube a{' '}
                <strong style={{ color: CHART_COLORS.terra }}>S/ {fmt(sliderMW)}</strong>,
                aproximadamente{' '}
                <strong>{fmt(Math.max(0, workersInBand))}</strong>{' '}
                trabajadores formales de Lima Metropolitana recibirían un aumento directo (estimación EPE 2022).
                La evidencia de 2022 muestra que no hubo pérdidas de empleo en los departamentos más expuestos.
                Los departamentos donde el impacto sería mayor incluyen{' '}
                <strong>{top3Depts.join(', ')}</strong>.
              </p>
              <div className="mt-3 text-xs flex items-center gap-1" style={{ color: CHART_COLORS.ink3 }}>
                <span>Kaitz nacional implícito: </span>
                <span className="font-semibold" style={{ color: CHART_COLORS.terra }}>
                  {(sliderMW / medianFormal2021).toFixed(3)}
                </span>
                <CITooltip tip="Kaitz = SM propuesto / mediana salarial formal ponderada (ENAHO 2021)">
                  <span className="ml-1 cursor-help underline dotted">(?)</span>
                </CITooltip>
              </div>
            </div>
          )}

          {/* Department table */}
          <div className="border rounded-sm overflow-x-auto" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <table className="w-full text-sm">
              <thead style={{ background: CHART_COLORS.surface }}>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleDeptSort('name')}>
                    Departamento {deptSort === 'name' ? (deptAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleDeptSort('kaitz')}>
                    Exposición 2021 {deptSort === 'kaitz' ? (deptAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold cursor-pointer hover:bg-gray-100" onClick={() => handleDeptSort('risk')}>
                    Kaitz c/ SM propuesto {deptSort === 'risk' ? (deptAsc ? '↑' : '↓') : ''}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Nivel de riesgo</th>
                </tr>
              </thead>
              <tbody>
                {sortedDepts.map((d, i) => {
                  const riskColor = d.riskZone === 'verde' ? CHART_COLORS.teal : d.riskZone === 'amarillo' ? CHART_COLORS.amber : '#9B2226';
                  const riskLabel = d.riskZone === 'verde' ? 'Verde' : d.riskZone === 'amarillo' ? 'Amarillo' : 'Rojo';
                  return (
                    <tr key={d.dept_code} style={{ borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: i % 2 === 0 ? '#fff' : CHART_COLORS.bg }}>
                      <td className="px-3 py-2 text-xs font-medium" style={{ color: CHART_COLORS.ink }}>{d.dept_name}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ background: CAT_COLORS[kaitzCategory(d.kaitz_pre)] + '30', color: CAT_COLORS[kaitzCategory(d.kaitz_pre)] }}>
                          {kaitzCategory(d.kaitz_pre) === 'baja' ? 'Baja' : kaitzCategory(d.kaitz_pre) === 'media' ? 'Media' : 'Alta'}
                          {' '}({(d.kaitz_pre * 100).toFixed(0)}%)
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs font-medium" style={{ color: CHART_COLORS.ink }}>
                        {(d.newKaitz * 100).toFixed(0)}%
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-0.5 rounded font-medium"
                          style={{ background: riskColor + '20', color: riskColor }}>
                          {riskLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
            Verde: Kaitz &lt; 0.65 (dentro del rango de evidencia causal) · Amarillo: 0.65–0.75 · Rojo: &gt; 0.75 (sin precedente histórico en Perú)
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 5.5: ¿SE PUEDE SEGUIR SUBIENDO? — LOS LÍMITES
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12 p-6 rounded-sm border-2" style={{ borderColor: CHART_COLORS.ink3, background: '#fff' }}>
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            ¿Pero se puede seguir subiendo?
          </h2>
          <p className="text-sm mb-6" style={{ color: CHART_COLORS.ink3 }}>Los límites de la evidencia</p>

          {/* Component A: Kaitz gradient bar */}
          <div className="mb-8">
            <div className="text-sm font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>
              El termómetro del salario mínimo — ¿en qué zona estamos?
            </div>
            <div className="relative h-8 rounded-full overflow-hidden mb-2" style={{ background: 'linear-gradient(to right, #2A9D8F 0%, #2A9D8F 41%, #E0A458 41%, #E0A458 58%, #9B2226 58%, #9B2226 100%)' }}>
              {/* Perú 2022 marker */}
              <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: kaitzPos(0.57) }}>
                <div className="h-full w-0.5 bg-white" />
              </div>
              {/* Perú 2025 marker */}
              <div className="absolute top-0 h-full flex flex-col items-center" style={{ left: kaitzPos(0.753) }}>
                <div className="h-full w-0.5 bg-white opacity-80" />
              </div>
              {/* Slider marker */}
              <div className="absolute top-0 h-full" style={{ left: kaitzPos(sliderKaitz) }}>
                <div className="h-full w-1" style={{ background: CHART_COLORS.ink, opacity: 0.9 }} />
              </div>
            </div>
            {/* Labels */}
            <div className="relative h-16 text-xs" style={{ color: CHART_COLORS.ink3 }}>
              <div className="absolute text-center" style={{ left: '5%', width: '30%' }}>
                <div className="font-semibold" style={{ color: CHART_COLORS.teal }}>Evidencia favorable</div>
                <div>0.30 – 0.55</div>
              </div>
              <div className="absolute text-center" style={{ left: '38%', width: '22%' }}>
                <div className="font-semibold" style={{ color: CHART_COLORS.amber }}>Efectos inciertos</div>
                <div>0.55 – 0.65</div>
              </div>
              <div className="absolute text-center" style={{ left: '65%', width: '30%' }}>
                <div className="font-semibold" style={{ color: '#9B2226' }}>Sin evidencia causal</div>
                <div>0.65 – 0.90+</div>
              </div>
            </div>
            {/* Marker labels */}
            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="p-2 rounded text-center" style={{ background: '#f0faf8', color: CHART_COLORS.teal }}>
                <div className="font-bold">Perú 2022</div>
                <div>Kaitz ≈ 0.57</div>
                <div className="text-xs opacity-70">Nuestro rango de evidencia</div>
              </div>
              <div className="p-2 rounded text-center" style={{ background: '#fff5e6', color: CHART_COLORS.amber }}>
                <div className="font-bold">Umbral Dube (2019)</div>
                <div>Kaitz = 0.60</div>
                <div className="text-xs opacity-70">Efectos negativos emergen</div>
              </div>
              <div className="p-2 rounded text-center" style={{ background: '#fff0f0', color: '#9B2226' }}>
                <div className="font-bold">Perú 2025 (actual)</div>
                <div>Kaitz = 0.75</div>
                <div className="text-xs opacity-70">Récord histórico — sin precedente</div>
              </div>
            </div>
            {sliderMW !== MW_1130 && (
              <div className="mt-2 p-2 rounded text-xs text-center" style={{ background: CHART_COLORS.surface, color: CHART_COLORS.ink }}>
                Con SM propuesto S/{fmt(sliderMW)}: Kaitz nacional ≈ <strong style={{ color: CHART_COLORS.terra }}>{sliderKaitz.toFixed(3)}</strong>
                {' '}— {sliderKaitz < 0.65 ? '✓ dentro del rango observado' : sliderKaitz < 0.75 ? '⚠ zona de efectos inciertos' : '🔴 sin precedente histórico en Perú'}
              </div>
            )}
          </div>

          {/* Component B: Scenario table */}
          <div className="mb-6">
            <div className="text-sm font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>Escenarios de riesgo</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: CHART_COLORS.surface }}>
                  <tr>
                    {['Escenario', 'SM', 'Kaitz nacional', 'Dptos. en zona roja', 'Riesgo'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold" style={{ color: CHART_COLORS.ink }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Aumento de 2022 (referencia)', sm: 1025, kaitz: 0.57, redN: 2,  risk: 'Moderado', riskColor: CHART_COLORS.teal },
                    { label: 'Actual 2025',                  sm: 1130, kaitz: 0.75, redN: 18, risk: 'Alto', riskColor: CHART_COLORS.amber },
                    { label: 'Propuesta moderada',           sm: 1200, kaitz: 0.80, redN: 21, risk: 'Muy alto', riskColor: '#9B2226' },
                    { label: 'Propuesta agresiva',           sm: 1300, kaitz: 0.87, redN: 24, risk: 'Extremo', riskColor: '#9B2226' },
                    { label: 'Hipotético',                   sm: 1500, kaitz: 1.00, redN: 25, risk: 'Sin precedente', riskColor: '#9B2226' },
                    ...(sliderMW !== 1130 && sliderMW !== 1025 && sliderMW !== 1200 && sliderMW !== 1300 && sliderMW !== 1500
                      ? [{ label: `Simulador (S/${fmt(sliderMW)})`, sm: sliderMW, kaitz: sliderKaitz, redN: redDepts, risk: sliderKaitz < 0.65 ? 'Moderado' : sliderKaitz < 0.75 ? 'Alto' : 'Muy alto', riskColor: sliderKaitz < 0.65 ? CHART_COLORS.teal : sliderKaitz < 0.75 ? CHART_COLORS.amber : '#9B2226' }]
                      : []),
                  ].map((row, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: row.sm === sliderMW ? '#fdf3f0' : i % 2 === 0 ? '#fff' : CHART_COLORS.bg }}>
                      <td className="px-3 py-2 text-xs" style={{ color: CHART_COLORS.ink }}>{row.label}</td>
                      <td className="px-3 py-2 text-xs font-medium" style={{ color: CHART_COLORS.terra }}>S/ {fmt(row.sm)}</td>
                      <td className="px-3 py-2 text-xs">{row.kaitz.toFixed(2)}</td>
                      <td className="px-3 py-2 text-xs">{row.redN}/25</td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-2 py-0.5 rounded font-medium"
                          style={{ background: row.riskColor + '20', color: row.riskColor }}>
                          {row.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Component C: Key message box */}
          <div className="p-5 rounded-sm border-l-4 mb-6" style={{ borderLeftColor: CHART_COLORS.terra, background: '#FFF5F0' }}>
            <p className="text-sm leading-relaxed" style={{ color: CHART_COLORS.ink }}>
              Nuestros resultados muestran que el aumento de 2022 (S/930 → S/1,025){' '}
              <strong>no destruyó empleo</strong>.
              Pero ese aumento ocurrió cuando el salario mínimo representaba ~57% del salario mediano formal.
              El aumento de 2025 (S/1,025 → S/1,130) llevó esa proporción a ~75%,{' '}
              <strong>un nivel sin precedente en la evidencia causal peruana</strong>.
              La evidencia internacional (Dube, 2019) sugiere que los efectos negativos aparecen
              cuando el salario mínimo supera el 60% del salario mediano.{' '}
              <strong>Perú ya superó ese umbral</strong>.
              Aumentos adicionales entran en territorio donde no podemos predecir los efectos con confianza.
            </p>
          </div>

          {/* Component D: Dynamic text linked to slider */}
          <div className="p-4 rounded-sm" style={{ background: CHART_COLORS.surface }}>
            <div className="text-xs font-semibold mb-2" style={{ color: CHART_COLORS.ink }}>
              ¿Qué pasaría con un aumento a S/ {fmt(sliderMW)}?
            </div>
            <p className="text-sm leading-relaxed" style={{ color: CHART_COLORS.ink }}>
              Un aumento a{' '}
              <strong style={{ color: CHART_COLORS.terra }}>S/ {fmt(sliderMW)}</strong>{' '}
              llevaría el Kaitz nacional a{' '}
              <strong>{sliderKaitz.toFixed(3)}</strong>.{' '}
              <strong>{redDepts}</strong> de 25 departamentos entrarían en la zona sin evidencia causal (Kaitz &gt; 0.75).{' '}
              {(() => {
                const huanc = depts.find(d => d.dept_code === '09');
                if (!huanc) return null;
                const newK = (sliderMW / huanc.median_formal_2021 * 100).toFixed(0);
                return <>En Huancavelica, el salario mínimo representaría el <strong>{newK}%</strong> del salario mediano formal — prácticamente todo trabajador formal ganaría el mínimo.</>;
              })()}
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 6: EVENT STUDY CHARTS
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            ¿Cómo evolucionó el efecto en el tiempo?
          </h2>
          <p className="text-sm mb-6" style={{ color: CHART_COLORS.ink3 }}>
            Estudio de evento: coeficientes DiD por año con el año 2021 como base (β₂₀₂₁ = 0 por construcción).
            La banda sombreada muestra el intervalo de confianza al 95%. Tratamiento: índice de Kaitz pre-política.
          </p>
          <div className="grid md:grid-cols-2 gap-4">

            {/* Left: Formalization */}
            <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="text-sm font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>Efecto sobre formalización</div>
              {eventStudyFormal.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={eventStudyFormal} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} />
                    <XAxis dataKey="year" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      label={{ value: 'Año', position: 'insideBottom', offset: -12, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={v => `${(v * 100).toFixed(1)}pp`}
                      label={{ value: 'Efecto (pp)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke } }} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(v: number | undefined, name: string | undefined) => [`${((v ?? 0) * 100).toFixed(2)}pp`, name ?? ''] as [string, string]}
                    />
                    <ReferenceLine y={0} stroke={CHART_COLORS.ink3} strokeDasharray="4 2" />
                    {/* CI area — must use ComposedChart for Area + Line together */}
                    <Area type="monotone" dataKey="hi" stroke="none" fill={CHART_COLORS.terra} fillOpacity={0.18} legendType="none" name="IC superior" />
                    <Area type="monotone" dataKey="lo" stroke="none" fill="#FAF8F4" fillOpacity={1} legendType="none" name="IC inferior" />
                    <Line type="monotone" dataKey="b" stroke={CHART_COLORS.terra} strokeWidth={2.5} dot={{ r: 5, fill: CHART_COLORS.terra }} name="β formalización" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 animate-pulse rounded" style={{ background: CHART_COLORS.surface }} />
              )}
              {formalResult && (
                <div className="mt-2 text-xs" style={{ color: CHART_COLORS.ink3 }}>
                  β₂₀₂₂ = {formalResult.beta_2022.toFixed(3)}{pStars(formalResult.pval_2022)}{' '}|{' '}
                  β₂₀₂₃ = {formalResult.beta_2023.toFixed(3)}{pStars(formalResult.pval_2023)}{' '}
                  · N = {fmt(formalResult.N)} · {formalResult.N_depts} dptos.
                </div>
              )}
            </div>

            {/* Right: Employment */}
            <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="text-sm font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>Efecto sobre empleo</div>
              {eventStudyEmp.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={eventStudyEmp} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} />
                    <XAxis dataKey="year" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      label={{ value: 'Año', position: 'insideBottom', offset: -12, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }} />
                    <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                      tickFormatter={v => `${(v * 100).toFixed(1)}pp`}
                      label={{ value: 'Efecto (pp)', angle: -90, position: 'insideLeft', offset: 5, style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke } }} />
                    <Tooltip
                      contentStyle={tooltipContentStyle}
                      formatter={(v: number | undefined, name: string | undefined) => [`${((v ?? 0) * 100).toFixed(2)}pp`, name ?? ''] as [string, string]}
                    />
                    <ReferenceLine y={0} stroke={CHART_COLORS.ink3} strokeDasharray="4 2" />
                    <Area type="monotone" dataKey="hi" stroke="none" fill={CHART_COLORS.teal} fillOpacity={0.18} legendType="none" name="IC superior" />
                    <Area type="monotone" dataKey="lo" stroke="none" fill="#FAF8F4" fillOpacity={1} legendType="none" name="IC inferior" />
                    <Line type="monotone" dataKey="b" stroke={CHART_COLORS.teal} strokeWidth={2.5} dot={{ r: 5, fill: CHART_COLORS.teal }} name="β empleo" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-52 animate-pulse rounded" style={{ background: CHART_COLORS.surface }} />
              )}
              {empResult && (
                <div className="mt-2 text-xs" style={{ color: CHART_COLORS.ink3 }}>
                  β₂₀₂₂ = {empResult.beta_2022.toFixed(3)}{pStars(empResult.pval_2022)}{' '}|{' '}
                  β₂₀₂₃ = {empResult.beta_2023.toFixed(4)}{pStars(empResult.pval_2023)}{' '}
                  · N = {fmt(empResult.N)} · {empResult.N_depts} dptos.
                </div>
              )}
              <div className="mt-1 text-xs italic" style={{ color: CHART_COLORS.ink3 }}>
                Ningún coeficiente es estadísticamente significativo al 5%.
              </div>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
            * p&lt;0.10 &nbsp;** p&lt;0.05 &nbsp;*** p&lt;0.01. Errores estándar clusterizados a nivel departamento (25 clusters).
            Formalidad: definición V4 (contrato + EsSalud + AFP + planilla). Tratamiento: índice de Kaitz pre-política (SM S/930 / mediana salarial formal 2021).
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 7: LITERATURA
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-1" style={{ color: CHART_COLORS.ink }}>
            ¿Qué encuentra la literatura?
          </h2>
          <p className="text-sm mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Los resultados están dentro del rango de la evidencia internacional. La mayoría de estudios modernos
            encuentran efectos pequeños o nulos sobre el empleo cuando el salario mínimo se mantiene por debajo del 60% del salario mediano.
          </p>
          <div className="border rounded-sm p-5" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="space-y-3 mb-4">
              {[
                { label: 'Perú — Este estudio (regional DiD 2022)', effect: '≈ 0 en empleo; +4.1pp formalización', color: CHART_COLORS.terra, bold: true },
                { label: 'Perú — Estudios previos (Céspedes 2005, Castellares 2022)', effect: '−0.05 a −1.1%', color: CHART_COLORS.amber, bold: false },
                { label: 'EE.UU. — Consenso reciente (Cengiz et al. 2019)', effect: '≈ 0 (bunching)', color: CHART_COLORS.teal, bold: false },
                { label: 'Internacional — Meta-análisis Dube (2019)', effect: 'Pequeños si Kaitz < 0.60', color: CHART_COLORS.ink3, bold: false },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 text-xs" style={{ color: row.bold ? CHART_COLORS.ink : CHART_COLORS.ink3, fontWeight: row.bold ? 600 : 400 }}>{row.label}</div>
                  <div className="text-sm px-4 py-1.5 rounded font-semibold" style={{ background: row.color + '20', color: row.color, minWidth: 150, textAlign: 'center', fontSize: 13 }}>{row.effect}</div>
                </div>
              ))}
            </div>

            {/* Expandable literature table */}
            <button
              onClick={() => setLitOpen(o => !o)}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: CHART_COLORS.terra }}
            >
              {litOpen ? '▲ Ocultar' : '▼ Ver'} comparación completa
            </button>
            {litOpen && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: CHART_COLORS.surface }}>
                    <tr>
                      {['Estudio', 'País', 'Período', 'Método', 'Efecto empleo', 'Efecto salarios'].map(h => (
                        <th key={h} className="px-2 py-2 text-left font-semibold" style={{ color: CHART_COLORS.ink }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { est: 'Este estudio (regional DiD)', pais: 'Perú', per: '2021–2023', met: 'DiD 25 dptos.', emp: '≈ 0 (p=0.95)', sal: '+15.7%***' },
                      { est: 'Céspedes & Sánchez (2005)', pais: 'Perú', per: '2002', met: 'DiD/Probit', emp: '−0.05 a −0.13', sal: '—' },
                      { est: 'Jaramillo (2004)', pais: 'Perú', per: '2000s', met: 'End. compliance', emp: '—', sal: '+' },
                      { est: 'Castellares et al. (2022)', pais: 'Perú', per: 'RNSSC', met: 'DiD', emp: '−1.1% formal', sal: '+6.3%' },
                      { est: 'Cengiz et al. (2019)', pais: 'EE.UU.', per: '1979–2016', met: 'Bunching', emp: '≈ 0', sal: '+' },
                      { est: 'Dube (2019)', pais: 'Internacional', per: 'Meta-análisis', met: 'Varios', emp: 'Pequeños si Kaitz<0.60', sal: '+' },
                    ].map((r, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: i === 0 ? '#fdf3f0' : i % 2 === 0 ? '#fff' : CHART_COLORS.bg }}>
                        <td className="px-2 py-2" style={{ color: i === 0 ? CHART_COLORS.terra : CHART_COLORS.ink, fontWeight: i === 0 ? 600 : 400 }}>{r.est}</td>
                        <td className="px-2 py-2" style={{ color: CHART_COLORS.ink3 }}>{r.pais}</td>
                        <td className="px-2 py-2" style={{ color: CHART_COLORS.ink3 }}>{r.per}</td>
                        <td className="px-2 py-2" style={{ color: CHART_COLORS.ink3 }}>{r.met}</td>
                        <td className="px-2 py-2" style={{ color: CHART_COLORS.ink }}>{r.emp}</td>
                        <td className="px-2 py-2" style={{ color: CHART_COLORS.ink }}>{r.sal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 8: METODOLOGÍA (collapsed)
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="mb-12">
          <button
            onClick={() => setMethOpen(o => !o)}
            className="w-full flex items-center justify-between p-4 border rounded-sm text-left"
            style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}
          >
            <span className="font-semibold text-sm" style={{ color: CHART_COLORS.ink }}>
              Metodología
            </span>
            <span style={{ color: CHART_COLORS.ink3 }}>{methOpen ? '▲' : '▼'}</span>
          </button>
          {methOpen && (
            <div className="border border-t-0 rounded-b-sm p-5 space-y-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Diseño de investigación</h3>
                <p className="text-xs leading-relaxed" style={{ color: CHART_COLORS.ink }}>
                  Usamos diferencias en diferencias (DiD) aprovechando que el salario mínimo es nacional pero su impacto varía
                  según el nivel salarial de cada departamento. Departamentos donde los salarios son más bajos (como Huancavelica)
                  se ven más afectados que departamentos con salarios altos (como Lima). Comparamos cambios en empleo y formalización
                  entre departamentos de alta y baja exposición, antes y después del aumento de mayo 2022.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Datos</h3>
                <p className="text-xs leading-relaxed" style={{ color: CHART_COLORS.ink }}>
                  Encuesta Nacional de Hogares (ENAHO) 2021–2023, panel de 25 departamentos (código srienaho 978,
                  Módulo 1477). 224,780 observaciones persona-año. Definición de formalidad: V4 (contrato laboral +
                  seguro de salud EsSalud + pensión AFP/ONP + planilla).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Variable de tratamiento</h3>
                <p className="text-xs leading-relaxed" style={{ color: CHART_COLORS.ink }}>
                  Exposición al salario mínimo = índice de Kaitz pre-política (SM S/930 / mediana salarial formal 2021
                  por departamento). Departamentos con Kaitz alto son más expuestos al aumento. Rango observado: 0.45
                  (Amazonas) a 0.72 (Huancavelica).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Especificación</h3>
                <p className="text-xs font-mono p-3 rounded" style={{ background: CHART_COLORS.surface, color: CHART_COLORS.ink }}>
                  Y_idt = α_d + γ_t + β(Post_t × Kaitz_d_pre) + Edad + Edad² + Sexo + ε_idt
                </p>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: CHART_COLORS.ink3 }}>
                  Efectos fijos de departamento (α_d) y año (γ_t). Errores estándar clusterizados a nivel departamento
                  (25 clusters). Ponderado por factores de expansión ENAHO (fac500a).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            SECTION 9: FOOTER
            ══════════════════════════════════════════════════════════════════════ */}
        <div className="border rounded-sm p-6 mb-8" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: CHART_COLORS.ink }}>Acceso a datos</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href="/assets/data/mw_regional_did_results.json" className="flex items-center gap-1 px-3 py-1.5 border rounded"
                  style={{ borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }} download>
                  Resultados DiD regional (JSON)
                </a>
                <a href="/assets/data/mw_pre_policy_kaitz.json" className="flex items-center gap-1 px-3 py-1.5 border rounded"
                  style={{ borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }} download>
                  Kaitz por departamento (JSON)
                </a>
                <Link href="/simuladores" className="flex items-center gap-1 px-3 py-1.5 border rounded"
                  style={{ borderColor: CHART_COLORS.ink3, color: CHART_COLORS.ink3 }}>
                  Todos los simuladores
                </Link>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: CHART_COLORS.ink }}>Fuentes y contacto</div>
              <div className="text-xs space-y-1" style={{ color: CHART_COLORS.ink3 }}>
                <p>Fuente: ENAHO 2021–2023, INEI. Elaboración: Qhawarina.</p>
                <p>Última actualización: Marzo 2026</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t text-xs leading-relaxed" style={{ borderColor: CHART_DEFAULTS.gridStroke, color: CHART_COLORS.ink3 }}>
            <strong>Aviso:</strong> Los resultados del simulador son proyecciones basadas en la evidencia del aumento de 2022.
            No constituyen predicciones del efecto de futuros aumentos. Las proyecciones más allá del rango observado
            (Kaitz &gt; 0.63) deben interpretarse con extrema cautela. Los resultados no representan posición oficial del INEI, del BCRP ni del gobierno del Perú.
          </div>
        </div>

      </div>
    </div>
  );
}
