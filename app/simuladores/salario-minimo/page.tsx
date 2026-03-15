'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, ScatterChart, Scatter, BarChart, Bar, Cell,
  Legend, ZAxis,
} from 'recharts';
import {
  CHART_COLORS, CHART_DEFAULTS, tooltipContentStyle, axisTickStyle,
} from '../../lib/chartTheme';

// ── Types ─────────────────────────────────────────────────────────────────────
interface KDEPoint   { wage: number; density: number }
interface MWEvent    { label: string; mw_old: number; mw_new: number; dln_mw: number; dmw_pct: number; epsilon: number | null; se_epsilon: number | null; n_treat: number; n_ctrl: number; A_employment: { beta: number | null; se: number | null; pval: number | null }; B_wage_all: { beta_pct: number | null }; D_lighthouse: { beta_pct: number | null }; E_formal_wage: { beta_pct: number | null }; kaitz: { kaitz_formal: number | null } | null; context: { phase: string } }
interface CanonicalData { events: MWEvent[]; pooled_main: { epsilon_pool: number; se_eps_pool: number; p_eps_pool: number; E_formal_wage_pool: { beta: number } } }
interface EvidenceData  { employment: { epsilon_wide: number; epsilon_narrow: number }; lighthouse: { pct_pooled: number }; simulator_scenario_1130: { employment: { formal_in_band: number }; lighthouse: { informal_near_mw: number } }; literature_comparison: Record<string, { epsilon?: number; informality_elasticity?: number; method: string }> }
interface WageDist      { n_formal: number; n_informal: number; kde_formal: KDEPoint[]; kde_informal: KDEPoint[]; mw_at_survey: number }

// ── Constants ──────────────────────────────────────────────────────────────────
const MW_BASE       = 1025;   // Reference MW (Apr 2022 EPE survey)
const MW_CURRENT    = 1130;   // Enacted 2025 increase
const MW_MIN_SLIDE  = 1025;
const MW_MAX_SLIDE  = 1500;
const MW_STEP       = 25;
const FORMAL_IN_BAND_REF  = 324_722;   // evidence: 1025→1130 scenario
const INFORMAL_NEAR_REF   = 1_038_243;  // evidence: 1025→1130 scenario
const EPS_OPT       = 0.10;    // Céspedes & Sánchez (2005) lower bound
const EPS_CENTRAL   = 0.254;   // epsilon_narrow (IVW pool, excl. 2022)
const EPS_PESS      = 0.433;   // epsilon_wide

// ── Helpers ────────────────────────────────────────────────────────────────────
function integrateKDE(kde: KDEPoint[], lo: number, hi: number): number {
  const step = 25;
  return kde
    .filter(p => p.wage >= lo && p.wage < hi)
    .reduce((s, p) => s + p.density * step, 0);
}

function pStars(p: number | null | undefined): string {
  if (p == null) return '';
  if (p < 0.01) return '***';
  if (p < 0.05) return '**';
  if (p < 0.10) return '*';
  return '';
}

function linReg(pts: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = pts.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const ssXX = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const ssXY = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const ssYY = pts.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const slope = ssXX > 0 ? ssXY / ssXX : 0;
  const intercept = my - slope * mx;
  const r2 = ssYY > 0 ? (ssXY ** 2) / (ssXX * ssYY) : 0;
  return { slope, intercept, r2 };
}

function fmt(n: number): string {
  return n.toLocaleString('es-PE');
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SalarioMinimoPage() {
  const [canonical, setCanonical] = useState<CanonicalData | null>(null);
  const [evidence,  setEvidence]  = useState<EvidenceData  | null>(null);
  const [wageDist,  setWageDist]  = useState<WageDist      | null>(null);
  const [sliderMW,  setSliderMW]  = useState(MW_CURRENT);
  const [sortKey,   setSortKey]   = useState<string>('label');
  const [sortAsc,   setSortAsc]   = useState(true);
  const [methOpen,  setMethOpen]  = useState(false);

  useEffect(() => {
    const base = '/assets/data';
    fetch(`${base}/mw_canonical_results.json`).then(r => r.json()).then(setCanonical).catch(() => {});
    fetch(`${base}/mw_complete_evidence.json`).then(r => r.json()).then(setEvidence).catch(() => {});
    fetch(`${base}/lima_wage_distribution.json`).then(r => r.json()).then(setWageDist).catch(() => {});
  }, []);

  // ── Slider computation ──────────────────────────────────────────────────────
  const sim = useMemo(() => {
    if (!wageDist) return null;
    const kdeF = wageDist.kde_formal;
    const kdeI = wageDist.kde_informal;
    const refF  = integrateKDE(kdeF, MW_BASE, MW_CURRENT);
    const refI  = integrateKDE(kdeI, MW_BASE, MW_CURRENT);
    const curF  = sliderMW <= MW_BASE ? 0 : integrateKDE(kdeF, MW_BASE, sliderMW);
    const curI  = sliderMW <= MW_BASE ? 0 : integrateKDE(kdeI, MW_BASE, sliderMW);
    const ratioF = refF > 0 ? curF / refF : 0;
    const ratioI = refI > 0 ? curI / refI : 0;
    const formalInBand   = Math.round(FORMAL_IN_BAND_REF  * ratioF);
    const informalNear   = Math.round(INFORMAL_NEAR_REF   * ratioI);
    const dln = sliderMW > MW_BASE ? Math.log(sliderMW / MW_BASE) : 0;
    const displOpt     = Math.round(formalInBand * EPS_OPT     * dln);
    const displCentral = Math.round(formalInBand * EPS_CENTRAL * dln);
    const displPess    = Math.round(formalInBand * EPS_PESS    * dln);
    const pctIncrease  = ((sliderMW / MW_BASE) - 1) * 100;
    const ratioBC = displCentral > 0 ? Math.round(formalInBand / displCentral) : 0;
    const lighthousePct = 7.7 * (dln / Math.log(MW_CURRENT / MW_BASE));
    return { formalInBand, informalNear, displOpt, displCentral, displPess, dln, pctIncrease, ratioBC, lighthousePct };
  }, [sliderMW, wageDist]);

  // ── KDE chart data ─────────────────────────────────────────────────────────
  const kdeChartData = useMemo(() => {
    if (!wageDist) return [];
    const fByWage = new Map(wageDist.kde_formal.map(p   => [p.wage, p.density]));
    const iByWage = new Map(wageDist.kde_informal.map(p => [p.wage, p.density]));
    const wages = Array.from(new Set([
      ...wageDist.kde_formal.map(p   => p.wage),
      ...wageDist.kde_informal.map(p => p.wage),
    ])).sort((a, b) => a - b).filter(w => w >= 400 && w <= 3500);
    return wages.map(w => ({
      wage:    w,
      formal:  (fByWage.get(w) ?? 0) * 1000,
      informal:(iByWage.get(w) ?? 0) * 1000,
    }));
  }, [wageDist]);

  // ── Kaitz scatter data ─────────────────────────────────────────────────────
  const { kaitzPts, kaitzReg, maxObsKaitz } = useMemo(() => {
    if (!canonical) return { kaitzPts: [], kaitzReg: null, maxObsKaitz: 0 };
    const pts = canonical.events
      .filter(e => e.epsilon != null && e.kaitz?.kaitz_formal != null)
      .map(e => ({
        x:     e.kaitz!.kaitz_formal!,
        y:     e.epsilon!,
        label: e.label.replace('_', '\u2019').split("'")[0],
        year:  e.label.split('_')[0],
      }));
    const reg = linReg(pts.map(p => ({ x: p.x, y: p.y })));
    const maxObsKaitz = pts.length > 0 ? Math.max(...pts.map(p => p.x)) : 1;
    return { kaitzPts: pts, kaitzReg: reg, maxObsKaitz };
  }, [canonical]);

  const kaitzTrendLine = useMemo(() => {
    if (!kaitzReg || kaitzPts.length < 2) return [];
    const xs = kaitzPts.map(p => p.x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return Array.from({ length: 30 }, (_, i) => {
      const x = xMin + (xMax - xMin) * i / 29;
      return { x, y: kaitzReg.slope * x + kaitzReg.intercept };
    });
  }, [kaitzReg, kaitzPts]);

  // Current proposal Kaitz (2025): MW_1130 / median_formal_2022
  // Median formal wage in Lima 2022 (from wageDist) ≈ 1700
  const kaitz2025 = useMemo(() => {
    if (!wageDist) return null;
    // Use the canonical event 2022 kaitz as reference (MW=1025, median=1700)
    // Scale: kaitz(1130) = 1130/1700 ≈ 0.665
    return (sliderMW / 1700).toFixed(3);
  }, [sliderMW, wageDist]);

  // ── Sort events table ─────────────────────────────────────────────────────
  const sortedEvents = useMemo(() => {
    if (!canonical) return [];
    const evts = [...canonical.events];
    evts.sort((a, b) => {
      let av: any, bv: any;
      switch (sortKey) {
        case 'label':   av = a.label;      bv = b.label;      break;
        case 'mw':      av = a.mw_new;     bv = b.mw_new;     break;
        case 'dln':     av = a.dmw_pct;    bv = b.dmw_pct;    break;
        case 'kaitz':   av = a.kaitz?.kaitz_formal ?? 0; bv = b.kaitz?.kaitz_formal ?? 0; break;
        case 'eps':     av = a.epsilon ?? 0;              bv = b.epsilon ?? 0;              break;
        case 'wage':    av = a.E_formal_wage?.beta_pct ?? 0; bv = b.E_formal_wage?.beta_pct ?? 0; break;
        case 'light':   av = a.D_lighthouse?.beta_pct ?? 0;  bv = b.D_lighthouse?.beta_pct ?? 0;  break;
        case 'n':       av = a.n_treat + a.n_ctrl;        bv = b.n_treat + b.n_ctrl;        break;
        default:        av = a.label;      bv = b.label;
      }
      if (av < bv) return sortAsc ? -1 : 1;
      if (av > bv) return sortAsc ?  1 : -1;
      return 0;
    });
    return evts;
  }, [canonical, sortKey, sortAsc]);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }, [sortKey]);

  const thSort = (key: string, label: string) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
      onClick={() => handleSort(key)}
    >
      {label} {sortKey === key ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  );

  // ── Literature comparison data ──────────────────────────────────────────────
  const litData = [
    { name: 'Céspedes & Sánchez\n(2005)',       value: -0.10,  color: CHART_COLORS.ink3 },
    { name: 'Neumark & Wascher\n(meta, 2007)',   value: -0.20,  color: CHART_COLORS.ink3 },
    { name: 'Qhawarina — optimista\n(2026)',      value: -0.10,  color: CHART_COLORS.teal },
    { name: 'Qhawarina — central\n(2026)',        value: -0.25,  color: CHART_COLORS.terra },
    { name: 'Qhawarina — pesimista\n(2026)',      value: -0.43,  color: CHART_COLORS.red  },
    { name: 'Del Valle\n(2009)',                  value: -0.75,  color: CHART_COLORS.ink3 },
  ];

  const loading = !canonical || !evidence || !wageDist;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: CHART_COLORS.bg }}>

      {/* Breadcrumb */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4">
        <p className="text-xs" style={{ color: CHART_COLORS.ink3 }}>
          <Link href="/simuladores" className="hover:underline">Simuladores</Link>
          {' / '}Salario Mínimo
        </p>
      </div>

      {/* ═══ SECTION 1: HERO ══════════════════════════════════════════════════ */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
        <div className="border-b pb-6 mb-8" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl">💼</span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: CHART_COLORS.ink }}>
                Simulador de Salario Mínimo
              </h1>
              <p className="text-sm mt-1" style={{ color: CHART_COLORS.ink3 }}>
                ¿Qué pasa si el salario mínimo sube a{' '}
                <strong style={{ color: CHART_COLORS.terra }}>S/ {fmt(sliderMW)}</strong>?
                {' '}Estimaciones basadas en{' '}
                <strong>9 experimentos naturales</strong> en Lima Metropolitana (2003–2022).
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mt-6 p-5 rounded-sm border" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: CHART_COLORS.ink3 }}>
                Salario mínimo propuesto
              </span>
              <div className="flex items-center gap-3">
                {sliderMW === MW_CURRENT && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#f0faf8', color: CHART_COLORS.teal, border: `1px solid ${CHART_COLORS.teal}` }}>
                    Decreto 2025
                  </span>
                )}
                <span className="text-3xl font-bold" style={{ color: CHART_COLORS.terra }}>
                  S/ {fmt(sliderMW)}
                </span>
              </div>
            </div>
            <input
              type="range"
              min={MW_MIN_SLIDE}
              max={MW_MAX_SLIDE}
              step={MW_STEP}
              value={sliderMW}
              onChange={e => setSliderMW(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: CHART_COLORS.terra }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: CHART_COLORS.ink3 }}>
              <span>S/ {fmt(MW_MIN_SLIDE)} (actual 2022)</span>
              <span className="font-medium" style={{ color: CHART_COLORS.ink }}>
                +{sim?.pctIncrease.toFixed(1) ?? '0.0'}% vs S/ {fmt(MW_BASE)}
              </span>
              <span>S/ {fmt(MW_MAX_SLIDE)}</span>
            </div>
            <div className="mt-2 text-xs" style={{ color: CHART_COLORS.ink3 }}>
              <span className="mr-4">📍 S/ {fmt(MW_BASE)} = referencia EPE 2022</span>
              <span>📌 S/ {fmt(MW_CURRENT)} = vigente desde abr-2025</span>
            </div>
          </div>
        </div>

        {/* ═══ SECTION 2: IMPACT DASHBOARD ═════════════════════════════════════ */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">

          {/* Card 1: Benefited */}
          <div className="p-5 rounded-sm border" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: CHART_COLORS.ink3 }}>
              Trabajadores beneficiados
            </div>
            {loading || !sim ? (
              <div className="h-12 bg-gray-100 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold mb-1" style={{ color: CHART_COLORS.teal }}>
                  {fmt(sim.formalInBand)}
                </div>
                <p className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
                  trabajadores formales recibirían aumento directo
                </p>
                <div className="text-xs p-2 rounded" style={{ background: '#f0faf8', color: CHART_COLORS.teal }}>
                  + {fmt(sim.informalNear)} informales (efecto faro)
                </div>
              </>
            )}
          </div>

          {/* Card 2: Employment effect — 3 scenarios */}
          <div className="p-5 rounded-sm border" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: CHART_COLORS.ink3 }}>
              Efecto sobre empleo formal
            </div>
            {loading || !sim ? (
              <div className="h-20 bg-gray-100 animate-pulse rounded" />
            ) : (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: CHART_COLORS.teal }} />
                      <span>Optimista (ε = −0.10)</span>
                    </span>
                    <span className="font-semibold" style={{ color: CHART_COLORS.teal }}>
                      −{fmt(sim.displOpt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: CHART_COLORS.amber }} />
                      <span>Central (ε = −0.25)</span>
                    </span>
                    <span className="font-semibold" style={{ color: CHART_COLORS.amber }}>
                      −{fmt(sim.displCentral)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ background: CHART_COLORS.red }} />
                      <span>Pesimista (ε = −0.43)</span>
                    </span>
                    <span className="font-semibold" style={{ color: CHART_COLORS.red }}>
                      −{fmt(sim.displPess)}
                    </span>
                  </div>
                </div>
                {sim.ratioBC > 0 && (
                  <div className="text-xs p-2 rounded" style={{ background: '#fffaf5', color: CHART_COLORS.amber, border: `1px solid ${CHART_COLORS.amber}` }}>
                    Ratio beneficiados/desplazados: <strong>{fmt(sim.ratioBC)}:1</strong> (central)
                  </div>
                )}
              </>
            )}
          </div>

          {/* Card 3: Lighthouse effect */}
          <div className="p-5 rounded-sm border" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <div className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: CHART_COLORS.ink3 }}>
              Efecto faro (informales)
            </div>
            {loading || !sim ? (
              <div className="h-12 bg-gray-100 animate-pulse rounded" />
            ) : (
              <>
                <div className="text-3xl font-bold mb-1" style={{ color: CHART_COLORS.terra }}>
                  +{sim.lighthousePct.toFixed(1)}%
                </div>
                <p className="text-xs mb-3" style={{ color: CHART_COLORS.ink3 }}>
                  aumento estimado en salarios informales cercanos al SM
                </p>
                <div className="text-xs p-2 rounded" style={{ background: '#fdf3f0', color: CHART_COLORS.terra }}>
                  El SM actúa como ancla salarial en el sector informal.
                  Maloney (2004), Lombardo et al. (2024).
                </div>
              </>
            )}
          </div>
        </div>

        {/* ═══ SECTION 3: WAGE DISTRIBUTION ════════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: CHART_COLORS.ink }}>
            Distribución salarial en Lima Metropolitana
          </h2>
          <p className="text-xs mb-4" style={{ color: CHART_COLORS.ink3 }}>
            EPE, código 766 (Abr–Jun 2022). La banda sombreada muestra la zona de tratamiento —
            trabajadores que recibirían aumento directo con el SM propuesto.
          </p>
          <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            {kdeChartData.length === 0 ? (
              <div className="h-64 bg-gray-50 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={kdeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gFormal"   x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.teal}  stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_COLORS.teal}  stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gInformal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={CHART_COLORS.terra} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={CHART_COLORS.terra} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} />
                  <XAxis
                    dataKey="wage"
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => `S/${(v/1000).toFixed(1)}k`}
                    label={{ value: 'Salario mensual (S/)', position: 'insideBottom', offset: -5, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <YAxis
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                    tickFormatter={v => v.toFixed(2)}
                    label={{ value: 'Densidad (×10⁻³)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 9, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0).toFixed(4), name === 'formal' ? 'Formal' : 'Informal'] as [string, string]}
                    labelFormatter={w => `S/ ${w}`}
                  />
                  {/* Treatment zone */}
                  {sliderMW > MW_BASE && (
                    <ReferenceArea
                      x1={MW_BASE}
                      x2={sliderMW}
                      fill={CHART_COLORS.terra}
                      fillOpacity={0.12}
                    />
                  )}
                  {/* Reference lines */}
                  <ReferenceLine x={MW_BASE} stroke={CHART_COLORS.ink3} strokeDasharray="6 3" strokeWidth={1.5}
                    label={{ value: `S/ ${MW_BASE}`, position: 'insideTopLeft', fontSize: 9, fill: CHART_COLORS.ink3 }} />
                  <ReferenceLine x={sliderMW} stroke={CHART_COLORS.terra} strokeWidth={2}
                    label={{ value: `S/ ${sliderMW}`, position: 'insideTopRight', fontSize: 9, fill: CHART_COLORS.terra }} />
                  <Area type="monotone" dataKey="informal" stroke={CHART_COLORS.terra} strokeWidth={1.5} fill="url(#gInformal)" name="Informal" />
                  <Area type="monotone" dataKey="formal"   stroke={CHART_COLORS.teal}  strokeWidth={1.5} fill="url(#gFormal)"   name="Formal"   />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs mt-2 text-center" style={{ color: CHART_COLORS.ink3 }}>
              Zona sombreada = trabajadores con salario entre S/ {fmt(MW_BASE)} y S/ {fmt(sliderMW)}{' '}
              → impacto directo del aumento propuesto
            </p>
          </div>
        </div>

        {/* ═══ SECTION 4: EVENTS TABLE ══════════════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: CHART_COLORS.ink }}>
            Evidencia evento por evento — 9 experimentos naturales
          </h2>
          <p className="text-xs mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Panel EPE Lima Metropolitana. Diseño DiD con matching trimestral consecutivo (conglome + vivienda + hogar + codperso).
            Haz clic en los encabezados para ordenar.
          </p>
          <div className="border rounded-sm overflow-x-auto" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <table className="w-full text-sm">
              <thead style={{ background: CHART_COLORS.surface }}>
                <tr>
                  {thSort('label', 'Año')}
                  {thSort('mw',    'SM ant. → nuevo')}
                  {thSort('dln',   'Δ%')}
                  {thSort('kaitz', 'Kaitz')}
                  {thSort('eps',   'ε empleo')}
                  {thSort('wage',  'Sal. formal (%)')}
                  {thSort('light', 'Efecto faro (%)')}
                  {thSort('n',     'N panel')}
                </tr>
              </thead>
              <tbody>
                {sortedEvents.map((ev, i) => {
                  const eps    = ev.epsilon;
                  const epsSe  = ev.se_epsilon;
                  const pval   = ev.A_employment?.pval;
                  const epsStr = eps != null ? eps.toFixed(3) : '—';
                  const seStr  = epsSe != null ? `(${epsSe.toFixed(3)})` : '';
                  const wageB  = ev.E_formal_wage?.beta_pct;
                  const lightB = ev.D_lighthouse?.beta_pct;
                  const kaitz  = ev.kaitz?.kaitz_formal;
                  return (
                    <tr key={ev.label} style={{ borderTop: `1px solid ${CHART_DEFAULTS.gridStroke}`, background: i % 2 === 0 ? '#fff' : CHART_COLORS.bg }}>
                      <td className="px-3 py-2 font-medium text-xs whitespace-nowrap" style={{ color: CHART_COLORS.terra }}>
                        {ev.label.replace('_', ' ')}
                        <span className="ml-1 text-gray-400 font-normal">({ev.context?.phase?.replace('_', ' ')})</span>
                      </td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        S/ {ev.mw_old} → S/ {ev.mw_new}
                      </td>
                      <td className="px-3 py-2 text-xs">{ev.dmw_pct.toFixed(1)}%</td>
                      <td className="px-3 py-2 text-xs">{kaitz != null ? kaitz.toFixed(3) : '—'}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap" style={{ color: eps != null && eps < -0.3 ? CHART_COLORS.red : eps != null && eps < 0 ? CHART_COLORS.amber : CHART_COLORS.teal }}>
                        {epsStr}{pStars(pval)} <span className="text-gray-400">{seStr}</span>
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: wageB != null && wageB > 0 ? CHART_COLORS.teal : CHART_COLORS.ink3 }}>
                        {wageB != null ? `${wageB > 0 ? '+' : ''}${wageB.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs" style={{ color: lightB != null && lightB > 0 ? CHART_COLORS.terra : CHART_COLORS.ink3 }}>
                        {lightB != null ? `${lightB > 0 ? '+' : ''}${lightB.toFixed(1)}%` : '—'}
                      </td>
                      <td className="px-3 py-2 text-xs">{fmt(ev.n_treat + ev.n_ctrl)}</td>
                    </tr>
                  );
                })}
                {/* Pooled row */}
                {canonical?.pooled_main && (
                  <tr style={{ borderTop: `2px solid ${CHART_COLORS.terra}`, background: '#fdf3f0' }}>
                    <td className="px-3 py-2 text-xs font-bold" style={{ color: CHART_COLORS.terra }}>
                      Pooled (IVW)
                    </td>
                    <td className="px-3 py-2 text-xs" colSpan={3} style={{ color: CHART_COLORS.ink3 }}>
                      9 eventos, N excl. 2022 para empleo
                    </td>
                    <td className="px-3 py-2 text-xs font-bold">
                      {canonical.pooled_main.epsilon_pool?.toFixed(3)}
                      <span className="ml-1 text-gray-400 font-normal">
                        ({canonical.pooled_main.se_eps_pool?.toFixed(3)})
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs font-bold">
                      {canonical.pooled_main.E_formal_wage_pool?.beta != null
                        ? `+${(canonical.pooled_main.E_formal_wage_pool.beta * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs">+7.7%</td>
                    <td className="px-3 py-2 text-xs">—</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2" style={{ color: CHART_COLORS.ink3 }}>
            * p&lt;0.10 &nbsp;** p&lt;0.05 &nbsp;*** p&lt;0.01. Errores estándar HC1 entre paréntesis.
            Kaitz = SM / mediana salario formal. Efecto faro = β trabajadores informales cercanos al SM.
          </p>
        </div>

        {/* ═══ SECTION 5: KAITZ SCATTER ═════════════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: CHART_COLORS.ink }}>
            ¿A partir de qué nivel el SM destruye empleo?
          </h2>
          <p className="text-xs mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Índice de Kaitz (SM / mediana salarial) vs elasticidad de empleo. Los puntos son los 9 eventos.
            La región gris rayada indica extrapolación fuera del rango observado.
          </p>
          <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            {kaitzPts.length === 0 ? (
              <div className="h-64 bg-gray-50 animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 60, bottom: 30, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} />
                  <XAxis
                    type="number" dataKey="x"
                    name="Kaitz" domain={['dataMin - 0.05', 'dataMax + 0.12']}
                    tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                    label={{ value: 'Índice de Kaitz (SM / mediana formal)', position: 'insideBottom', offset: -10, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <YAxis
                    type="number" dataKey="y"
                    name="ε empleo" domain={[-1.2, 0.5]}
                    tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                    label={{ value: 'ε empleo', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                  />
                  <ZAxis range={[60, 60]} />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    content={({ payload }) => {
                      if (!payload?.length) return null;
                      const p = payload[0]?.payload as any;
                      return (
                        <div style={{ ...tooltipContentStyle, padding: '6px 10px' }}>
                          <div className="font-semibold" style={{ color: CHART_COLORS.terra }}>{p.year}</div>
                          <div style={{ color: CHART_COLORS.ink }}>Kaitz: {p.x?.toFixed(3)}</div>
                          <div style={{ color: CHART_COLORS.ink }}>ε: {p.y?.toFixed(3)}</div>
                        </div>
                      );
                    }}
                  />
                  {/* Extrapolation zone */}
                  <ReferenceArea
                    x1={maxObsKaitz} x2={0.85}
                    fill={CHART_COLORS.ink3} fillOpacity={0.08}
                    label={{ value: 'Zona sin datos — extrapolación', position: 'insideTop', fontSize: 9, fill: CHART_COLORS.ink3 }}
                  />
                  {/* Zero elasticity line */}
                  <ReferenceLine y={0} stroke={CHART_COLORS.ink3} strokeDasharray="4 2" />
                  {/* Current proposal Kaitz */}
                  {kaitz2025 && (
                    <ReferenceLine
                      x={parseFloat(kaitz2025)}
                      stroke={CHART_COLORS.terra}
                      strokeWidth={2}
                      strokeDasharray="8 3"
                      label={{ value: `S/${sliderMW} (propuesto)`, position: 'insideTopRight', fontSize: 9, fill: CHART_COLORS.terra }}
                    />
                  )}
                  {/* Trend line as Scatter */}
                  <Scatter
                    name="Tendencia"
                    data={kaitzTrendLine}
                    line={{ stroke: CHART_COLORS.ink3, strokeWidth: 1.5, strokeDasharray: '4 2' }}
                    lineType="fitting"
                    shape={() => null as any}
                    legendType="none"
                  />
                  {/* Data points */}
                  <Scatter
                    name="Eventos"
                    data={kaitzPts}
                    fill={CHART_COLORS.terra}
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <g>
                          <circle cx={cx} cy={cy} r={6} fill={CHART_COLORS.terra} fillOpacity={0.85} />
                          <text x={cx} y={cy - 10} textAnchor="middle" fontSize={9} fill={CHART_COLORS.ink}>{payload.year}</text>
                        </g>
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
            {kaitzReg && kaitzPts.length >= 3 && (
              <p className="text-xs text-center mt-1" style={{ color: CHART_COLORS.ink3 }}>
                Tendencia: ε = {kaitzReg.intercept.toFixed(3)} + ({kaitzReg.slope.toFixed(3)}) × Kaitz &nbsp;|&nbsp;
                R² = {kaitzReg.r2.toFixed(2)} &nbsp;|&nbsp;
                <em>Nota: relación estimada con sólo 9 eventos; interpretar con cautela</em>
              </p>
            )}
          </div>
        </div>

        {/* ═══ SECTION 6: METHODOLOGY ════════════════════════════════════════════ */}
        <div className="mb-10">
          <button
            onClick={() => setMethOpen(o => !o)}
            className="w-full flex items-center justify-between p-4 border rounded-sm text-left"
            style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}
          >
            <span className="font-semibold text-sm" style={{ color: CHART_COLORS.ink }}>
              📋 Metodología de investigación
            </span>
            <span style={{ color: CHART_COLORS.ink3 }}>{methOpen ? '▲' : '▼'}</span>
          </button>
          {methOpen && (
            <div className="border border-t-0 rounded-b-sm p-5 space-y-3" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Diseño de identificación</h3>
                  <ul className="text-xs space-y-1.5" style={{ color: CHART_COLORS.ink }}>
                    <li><strong>Estrategia:</strong> Diferencias en diferencias (DiD) con panel de personas</li>
                    <li><strong>Datos:</strong> EPE Lima Metropolitana — INEI, 9 eventos 2003–2022</li>
                    <li><strong>Matching:</strong> Panel trimestral consecutivo — conglome + vivienda + hogar + codperso</li>
                    <li><strong>Tratamiento:</strong> Asalariados con salario ∈ [0.85 × SM_viejo, SM_nuevo)</li>
                    <li><strong>Control:</strong> Asalariados con salario ∈ [SM_nuevo, 1.40 × SM_nuevo)</li>
                    <li><strong>Inferencia:</strong> Errores estándar HC1 robustos a heterocedasticidad</li>
                    <li><strong>Pooling:</strong> Ponderación por varianza inversa (IVW) — δ = 1/SE²</li>
                    <li><strong>Cotas de Lee (2009):</strong> Corrección de attrition selectiva en salarios</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Supuestos y limitaciones</h3>
                  <ul className="text-xs space-y-1.5" style={{ color: CHART_COLORS.ink3 }}>
                    <li>• Tendencias paralelas en el período de placebo (verificadas para 8/9 eventos)</li>
                    <li>• 2022 excluido del pool de empleo: pre-trend COVID viola paralelas (β placebo = +0.296, p=0.018)</li>
                    <li>• Muestra limitada a Lima Metro — no generalizable a regiones</li>
                    <li>• N panel reducido en eventos 2007–2011 por rediseño EPE</li>
                    <li>• Efecto faro calibrado en sector informal Lima; puede diferir en provincias</li>
                    <li>• Elasticidades estimadas para incrementos moderados (10–15%); extrapolación con cautela</li>
                  </ul>
                </div>
              </div>
              <div className="pt-3 border-t" style={{ borderColor: CHART_DEFAULTS.gridStroke }}>
                <h3 className="text-sm font-semibold mb-2" style={{ color: CHART_COLORS.terra }}>Referencias</h3>
                <ul className="text-xs space-y-1" style={{ color: CHART_COLORS.ink3 }}>
                  <li>Céspedes & Sánchez (2005). <em>El salario mínimo en el Perú.</em> BCRP.</li>
                  <li>Castellares et al. (2022). <em>Minimum wages and informality in Peru.</em> BCRP Working Paper.</li>
                  <li>Cengiz et al. (2019). <em>The effect of minimum wages on low-wage jobs.</em> QJE.</li>
                  <li>Lee (2009). <em>Training, wages, and sample selection.</em> RES.</li>
                  <li>Maloney & Nuñez (2004). <em>Measuring the impact of minimum wages.</em> IZA DP 990.</li>
                  <li>Lombardo et al. (2024). <em>Lighthouse effect in LAC.</em> IZA.</li>
                  <li>Neumark & Wascher (2007). <em>Minimum wages and employment.</em> FRBF WP.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ═══ SECTION 7: LITERATURE COMPARISON ════════════════════════════════ */}
        <div className="mb-10">
          <h2 className="text-base font-semibold mb-1" style={{ color: CHART_COLORS.ink }}>
            Qhawarina en el contexto de la literatura
          </h2>
          <p className="text-xs mb-4" style={{ color: CHART_COLORS.ink3 }}>
            Elasticidades de empleo estimadas. Qhawarina (2026) cubre el rango de incertidumbre de la literatura peruana y regional.
          </p>
          <div className="border rounded-sm p-4" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={litData.map(d => ({ ...d, value: Math.abs(d.value) }))}
                layout="vertical"
                margin={{ top: 5, right: 50, left: 160, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={0.5} horizontal={false} />
                <XAxis
                  type="number" domain={[0, 0.85]}
                  tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke}
                  tickFormatter={v => `-${v.toFixed(2)}`}
                  label={{ value: 'Elasticidad de empleo |ε|', position: 'insideBottom', offset: -3, style: { fontSize: 10, fill: CHART_DEFAULTS.axisStroke } }}
                />
                <YAxis
                  type="category" dataKey="name"
                  tick={{ fontSize: 10, fontFamily: CHART_DEFAULTS.axisFontFamily, fill: CHART_COLORS.ink }}
                  stroke="none" width={150}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  formatter={(v: number | undefined) => [`ε = −${(v ?? 0).toFixed(2)}`, 'Elasticidad'] as [string, string]}
                />
                <Bar dataKey="value" radius={[0, 3, 3, 0]}>
                  {litData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={d.color === CHART_COLORS.terra ? 1 : 0.6} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center mt-2" style={{ color: CHART_COLORS.ink3 }}>
              Qhawarina (terracota) cubre todo el rango de la literatura peruana.
              La incertidumbre es intrínseca — reportamos los tres escenarios.
            </p>
          </div>
        </div>

        {/* ═══ SECTION 8: FOOTER LINKS ══════════════════════════════════════════ */}
        <div className="border rounded-sm p-5" style={{ background: '#fff', borderColor: CHART_DEFAULTS.gridStroke }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: CHART_COLORS.ink }}>Acceso a datos y código</h3>
          <div className="flex flex-wrap gap-3 text-xs">
            <a
              href="/assets/data/mw_canonical_results.json"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }}
              download
            >
              ⬇ Resultados DiD (JSON)
            </a>
            <a
              href="/assets/data/mw_complete_evidence.json"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }}
              download
            >
              ⬇ Evidencia completa (JSON)
            </a>
            <a
              href="/assets/data/lima_wage_distribution.json"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }}
              download
            >
              ⬇ Distribución salarial Lima (JSON)
            </a>
            <a
              href="https://github.com/cesarchavezp29/qhawarina"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.ink3, color: CHART_COLORS.ink3 }}
            >
              🔗 Código fuente
            </a>
            <Link
              href="/metodologia"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.ink3, color: CHART_COLORS.ink3 }}
            >
              📄 Metodología completa
            </Link>
            <Link
              href="/simuladores"
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded"
              style={{ borderColor: CHART_COLORS.ink3, color: CHART_COLORS.ink3 }}
            >
              ← Todos los simuladores
            </Link>
          </div>
          <p className="text-xs mt-4" style={{ color: CHART_COLORS.ink3 }}>
            Fuente primaria: EPE Lima Metropolitana — INEI. Análisis: Qhawarina (2026).
            Los resultados no representan posición oficial del INEI ni del BCRP.
          </p>
        </div>
      </div>
    </div>
  );
}
