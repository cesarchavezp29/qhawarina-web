'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Cell, AreaChart, Area,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// ── Design tokens ──────────────────────────────────────────────────────────────
const TERRACOTTA = '#C65D3E';
const TEAL       = '#2A9D8F';
const BG         = '#FAF8F4';
const GEO_URL    = '/assets/geo/peru_departamental.geojson';

// ── Bunching bin data (formal-dep, delta_adj pp) ───────────────────────────────
const BINS_A = [{"bc":638,"delta":0.005},{"bc":662,"delta":0.143},{"bc":688,"delta":-0.026},{"bc":712,"delta":0.015},{"bc":738,"delta":-0.051},{"bc":762,"delta":-4.641},{"bc":788,"delta":-0.13},{"bc":812,"delta":-1.727},{"bc":838,"delta":-0.204},{"bc":862,"delta":4.24},{"bc":888,"delta":-0.005},{"bc":912,"delta":-1.063},{"bc":938,"delta":0.131},{"bc":962,"delta":0.19},{"bc":988,"delta":0.134},{"bc":1012,"delta":0.026},{"bc":1038,"delta":-0.067},{"bc":1062,"delta":-0.124},{"bc":1088,"delta":-0.022},{"bc":1112,"delta":0.061},{"bc":1138,"delta":-0.2},{"bc":1162,"delta":0.022},{"bc":1188,"delta":-0.01},{"bc":1212,"delta":-0.728},{"bc":1238,"delta":-0.036},{"bc":1262,"delta":-0.12},{"bc":1288,"delta":0.095},{"bc":1312,"delta":-0.994},{"bc":1338,"delta":-0.021},{"bc":1362,"delta":-0.202},{"bc":1388,"delta":-0.292},{"bc":1412,"delta":-0.103},{"bc":1438,"delta":0.059},{"bc":1462,"delta":-0.021},{"bc":1488,"delta":-0.051}];
const BINS_B = [{"bc":738,"delta":0.046},{"bc":762,"delta":-0.197},{"bc":788,"delta":0.129},{"bc":812,"delta":-0.158},{"bc":838,"delta":-0.071},{"bc":862,"delta":-6.516},{"bc":888,"delta":-0.062},{"bc":912,"delta":-1.028},{"bc":938,"delta":5.064},{"bc":962,"delta":1.277},{"bc":988,"delta":-0.168},{"bc":1012,"delta":-0.823},{"bc":1038,"delta":-0.035},{"bc":1062,"delta":0.199},{"bc":1088,"delta":0.025},{"bc":1112,"delta":0.027},{"bc":1138,"delta":0.063},{"bc":1162,"delta":-0.08},{"bc":1188,"delta":-0.111},{"bc":1212,"delta":-0.624},{"bc":1238,"delta":0.042},{"bc":1262,"delta":-0.229},{"bc":1288,"delta":-0.173},{"bc":1312,"delta":-0.572},{"bc":1338,"delta":-0.003},{"bc":1362,"delta":0.014},{"bc":1388,"delta":0.042},{"bc":1412,"delta":-0.373},{"bc":1438,"delta":0.042},{"bc":1462,"delta":-0.02},{"bc":1488,"delta":0.001}];
const BINS_C = [{"bc":838,"delta":-0.055},{"bc":862,"delta":-0.095},{"bc":888,"delta":-0.009},{"bc":912,"delta":-0.231},{"bc":938,"delta":-8.477},{"bc":962,"delta":-2.045},{"bc":988,"delta":-0.144},{"bc":1012,"delta":-1.964},{"bc":1038,"delta":6.916},{"bc":1062,"delta":1.197},{"bc":1088,"delta":0.067},{"bc":1112,"delta":-1.201},{"bc":1138,"delta":0.615},{"bc":1162,"delta":0.878},{"bc":1188,"delta":0.195},{"bc":1212,"delta":-2.137},{"bc":1238,"delta":0.245},{"bc":1262,"delta":0.687},{"bc":1288,"delta":-0.012},{"bc":1312,"delta":-0.63},{"bc":1338,"delta":0.477},{"bc":1362,"delta":0.44},{"bc":1388,"delta":0.111},{"bc":1412,"delta":-0.503},{"bc":1438,"delta":0.059},{"bc":1462,"delta":0.315},{"bc":1488,"delta":0.055}];

// ── Event metadata ─────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 'A', label: '2016', sublabel: 'S/750 → S/850', mw_old: 750, mw_new: 850,
    pre_year: 2015, post_year: 2017, ratio: 0.696, missing_pp: 6.78, excess_pp: 4.72,
    ci_lo: 0.567, ci_hi: 0.896,
    selfemp_pre: 38.0, selfemp_post: 57.1,
    formal_pre: 23.4, formal_post: 9.4,
    informal_pre: 38.6, informal_post: 33.6,
    selfemp_delta_pp: 19.1, selfemp_abs_chg: '+8.7%',
    bins: BINS_A },
  { id: 'B', label: '2018', sublabel: 'S/850 → S/930', mw_old: 850, mw_new: 930,
    pre_year: 2017, post_year: 2019, ratio: 0.829, missing_pp: 8.03, excess_pp: 6.66,
    ci_lo: 0.716, ci_hi: 1.016,
    selfemp_pre: 35.5, selfemp_post: 55.5,
    formal_pre: 25.4, formal_post: 11.2,
    informal_pre: 39.1, informal_post: 33.3,
    selfemp_delta_pp: 20.0, selfemp_abs_chg: '+5.1%',
    bins: BINS_B },
  { id: 'C', label: '2022', sublabel: 'S/930 → S/1,025', mw_old: 930, mw_new: 1025,
    pre_year: 2021, post_year: 2023, ratio: 0.830, missing_pp: 13.02, excess_pp: 10.80,
    ci_lo: 0.716, ci_hi: 0.960,
    selfemp_pre: 33.1, selfemp_post: 47.8,
    formal_pre: 28.5, formal_post: 12.3,
    informal_pre: 38.3, informal_post: 39.8,
    selfemp_delta_pp: 14.7, selfemp_abs_chg: '−3.5%',
    bins: BINS_C },
];

// ── Department Kaitz (2015, pre-Event A) ──────────────────────────────────────
// Ica highest (0.933) = agro-export workers with short payroll months despite full-time hours
// Huancavelica high stat but 85% public sector → actual private MW exposure low
const DEPTS_KAITZ: { code: string; name: string; kaitz: number; note?: string }[] = [
  { code:'11', name:'Ica',            kaitz: 0.933, note: 'Sector agro-exportador: salarios bajos mensuales pese a jornada completa' },
  { code:'20', name:'Piura',          kaitz: 0.680 },
  { code:'24', name:'Tumbes',         kaitz: 0.670 },
  { code:'14', name:'Lambayeque',     kaitz: 0.631 },
  { code:'07', name:'Callao',         kaitz: 0.628 },
  { code:'13', name:'La Libertad',    kaitz: 0.622 },
  { code:'15', name:'Lima',           kaitz: 0.613 },
  { code:'22', name:'San Martín',     kaitz: 0.602 },
  { code:'21', name:'Puno',           kaitz: 0.601 },
  { code:'19', name:'Pasco',          kaitz: 0.600 },
  { code:'23', name:'Tacna',          kaitz: 0.597 },
  { code:'08', name:'Cusco',          kaitz: 0.595 },
  { code:'05', name:'Ayacucho',       kaitz: 0.593 },
  { code:'02', name:'Ancash',         kaitz: 0.591 },
  { code:'25', name:'Ucayali',        kaitz: 0.581 },
  { code:'12', name:'Junín',          kaitz: 0.568 },
  { code:'04', name:'Arequipa',       kaitz: 0.542 },
  { code:'10', name:'Huánuco',        kaitz: 0.539 },
  { code:'16', name:'Loreto',         kaitz: 0.511 },
  { code:'03', name:'Apurímac',       kaitz: 0.494 },
  { code:'06', name:'Cajamarca',      kaitz: 0.452 },
  { code:'01', name:'Amazonas',       kaitz: 0.451 },
  { code:'17', name:'Madre de Dios',  kaitz: 0.462 },
  { code:'18', name:'Moquegua',       kaitz: 0.468 },
  { code:'09', name:'Huancavelica',   kaitz: 0.500, note: '85% de trabajadores formales son sector público — índice real de exposición privada es menor' },
];

const kaitzMap: Record<string, typeof DEPTS_KAITZ[0]> = {};
DEPTS_KAITZ.forEach(d => { kaitzMap[d.code] = d; });

// ── Simulator data ─────────────────────────────────────────────────────────────
const LIMA_FORMAL_POP = 1_700_000;
const MW_CURRENT      = 1130;
const MW_2022         = 1025;

const LIMA_PERC: [number, number][] = [
  [0,0],[158,1],[480,5],[800,10],[930,15],[1016,20],[1100,25],
  [1200,30],[1500,40],[1700,50],[2000,60],[2500,70],[2800,75],
  [3000,80],[3712,85],[4519,90],[6000,95],[11256,99],[999999,100],
];

function pctAtOrBelow(wage: number): number {
  for (let i = 1; i < LIMA_PERC.length; i++) {
    if (wage <= LIMA_PERC[i][0]) {
      const frac = (wage - LIMA_PERC[i-1][0]) / (LIMA_PERC[i][0] - LIMA_PERC[i-1][0]);
      return LIMA_PERC[i-1][1] + frac * (LIMA_PERC[i][1] - LIMA_PERC[i-1][1]);
    }
  }
  return 100;
}
function workersAffected(v: number) {
  return Math.max(0, (pctAtOrBelow(v) - pctAtOrBelow(MW_2022)) / 100 * LIMA_FORMAL_POP);
}
function sliderKaitz(v: number) { return v / 1863; }
function kaitzRisk(k: number): { label: string; color: string; bg: string } {
  if (k < 0.57) return { label: 'Rango estudiado', color: '#16a34a', bg: '#f0fdf4' };
  if (k < 0.62) return { label: 'Fuera del rango', color: '#d97706', bg: '#fffbeb' };
  if (k < 0.70) return { label: 'Sin evidencia directa', color: '#dc2626', bg: '#fef2f2' };
  return { label: 'Territorio desconocido', color: '#7f1d1d', bg: '#fef2f2' };
}
function deptsAbove(k: number) {
  return DEPTS_KAITZ.filter(d => d.kaitz * (k / 0.57) > 0.60).length;
}

const KAITZ_COLOR = (k: number): string => {
  // green → yellow → red gradient
  if (k <= 0.45) return '#4ade80';
  if (k <= 0.55) return '#86efac';
  if (k <= 0.60) return '#fbbf24';
  if (k <= 0.65) return '#f97316';
  if (k <= 0.70) return '#ef4444';
  return '#b91c1c';
};

const SCENARIOS = [
  { label: '2016', sm: 850,  kaitz: 0.567 },
  { label: '2018', sm: 930,  kaitz: 0.556 },
  { label: '2022', sm: 1025, kaitz: 0.569 },
  { label: 'Actual 2025', sm: 1130, kaitz: 0.607 },
  { label: 'S/1,200', sm: 1200, kaitz: 0.644 },
  { label: 'S/1,300', sm: 1300, kaitz: 0.698 },
];

const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');

// ── Animated number hook ───────────────────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 400) {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * ease));
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}

// ── BunchingChart component ────────────────────────────────────────────────────
function BunchingChart({ ev }: { ev: typeof EVENTS[0] }) {
  const affLo = Math.round(0.85 * ev.mw_old);
  const exHi  = ev.mw_new + 200;
  const data = ev.bins.map(b => ({
    bc: b.bc,
    neg: b.delta < 0 ? b.delta : 0,
    pos: b.delta >= 0 ? b.delta : 0,
    inZone: b.bc >= affLo && b.bc < exHi,
  }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 16, right: 8, bottom: 24, left: 8 }} barCategoryGap="2%">
        <ReferenceArea x1={affLo} x2={ev.mw_new} fill={TERRACOTTA} fillOpacity={0.06} />
        <ReferenceArea x1={ev.mw_new} x2={exHi} fill={TEAL} fillOpacity={0.05} />
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis dataKey="bc" type="number" domain={[affLo - 100, ev.mw_new + 300]}
          tickFormatter={v => `S/${v}`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false}
          label={{ value: 'Salario mensual (S/.)', position: 'insideBottom', offset: -12, fontSize: 10, fill: '#9ca3af' }} />
        <YAxis tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
          tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} width={44} />
        <Tooltip
          formatter={(val: unknown) => {
            const v = typeof val === 'number' ? val : 0;
            return [`${v > 0 ? '+' : ''}${v.toFixed(2)} pp`, v < 0 ? 'Desaparecen' : 'Reaparecen'] as [string, string];
          }}
          labelFormatter={(v: unknown) => `S/${v}–${Number(v) + 25}`}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white' }}
        />
        <ReferenceLine y={0} stroke="#d1d5db" />
        <ReferenceLine x={ev.mw_new} stroke={TERRACOTTA} strokeWidth={2.5} strokeDasharray="4 2"
          label={{ value: `S/${ev.mw_new}`, position: 'top', fill: TERRACOTTA, fontSize: 13, fontWeight: 700 }} />
        <Bar dataKey="neg" radius={[2,2,0,0]} isAnimationActive={false}>
          {data.map(b => <Cell key={b.bc} fill={TERRACOTTA} fillOpacity={b.inZone ? 0.85 : 0.2} />)}
        </Bar>
        <Bar dataKey="pos" radius={[2,2,0,0]} isAnimationActive={false}>
          {data.map(b => <Cell key={b.bc} fill={TEAL} fillOpacity={b.inZone ? 0.85 : 0.2} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MWSalarioPage() {
  const [activeEvent, setActiveEvent] = useState(1);
  const [sliderValue, setSliderValue] = useState(MW_CURRENT);
  const [hoveredDept, setHoveredDept] = useState<typeof DEPTS_KAITZ[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [heroYear, setHeroYear] = useState(0);

  const ev = EVENTS[activeEvent];
  const affected = useMemo(() => workersAffected(sliderValue), [sliderValue]);
  const sliderK  = useMemo(() => sliderKaitz(sliderValue), [sliderValue]);
  const risk     = useMemo(() => kaitzRisk(sliderK), [sliderK]);
  const animAffected = useAnimatedNumber(Math.round(affected));
  const animKaitz    = useAnimatedNumber(Math.round(sliderK * 100));
  const animDepts    = useAnimatedNumber(deptsAbove(sliderK));

  // Hero counter cycling
  const HERO_YEARS = [
    { year: 2015, n: '10,195', label: 'trabajadores, pre-Evento A' },
    { year: 2017, n: '10,895', label: 'trabajadores, post-Evento A' },
    { year: 2019, n: '11,090', label: 'trabajadores, pre-Evento B' },
    { year: 2021, n: '9,175',  label: 'trabajadores, pre-Evento C (COVID)' },
    { year: 2023, n: '9,838',  label: 'trabajadores, post-Evento C' },
  ];
  useEffect(() => {
    const id = setInterval(() => setHeroYear(h => (h + 1) % HERO_YEARS.length), 1800);
    return () => clearInterval(id);
  }, []);

  // Self-employment stacked bar data
  const selfEmpData = [
    { name: `Antes\n(${ev.pre_year})`, formal: ev.formal_pre, informal: ev.informal_pre, selfemp: ev.selfemp_pre },
    { name: `Después\n(${ev.post_year})`, formal: ev.formal_post, informal: ev.informal_post, selfemp: ev.selfemp_post },
  ];

  const thermPos = (k: number) => Math.min(Math.max((k - 0.30) / (0.95 - 0.30) * 100, 0), 100);

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* ══ S1: HERO ══════════════════════════════════════════════════════════ */}
        <section className="text-center space-y-6 pt-4">
          <div className="inline-block bg-white border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 tracking-wide">
            Análisis distribucional · ENAHO 2015–2023 · Banco de datos INEI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight tracking-tight">
            ¿Qué pasa cuando sube<br className="hidden sm:block" /> el salario mínimo?
          </h1>
          <p className="text-xl sm:text-2xl text-gray-500 font-light max-w-2xl mx-auto">
            Tres aumentos. La distribución salarial, antes y después.
          </p>
          {/* Animated counter */}
          <div className="inline-flex flex-col items-center gap-1 bg-white rounded-2xl px-8 py-5 border border-gray-100 shadow-sm min-w-[260px]">
            <div
              className="text-5xl font-black tabular-nums transition-all duration-500"
              style={{ color: TEAL }}
              key={heroYear}
            >
              {HERO_YEARS[heroYear].n}
            </div>
            <div className="text-sm text-gray-500">{HERO_YEARS[heroYear].label}</div>
            <div className="flex gap-1 mt-2">
              {HERO_YEARS.map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ background: i === heroYear ? TEAL : '#d1d5db' }} />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
            Trabajadores formales dependientes con salario mensual S/1–S/6,000 · Módulo 500 ENAHO
          </p>
        </section>

        {/* ══ S2: THE FINDING ═══════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: redistribution */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
            <div className="text-xs font-semibold tracking-widest uppercase text-gray-400">Redistribución salarial</div>
            <div className="text-7xl font-black leading-none" style={{ color: TERRACOTTA }}>70–83%</div>
            <p className="text-base font-medium text-gray-700 leading-snug">
              de los empleos formales desplazados reaparecen por encima del nuevo piso salarial
            </p>
            <div className="h-20 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ ev:'2016', r: 0.696 },{ ev:'2018', r: 0.829 },{ ev:'2022', r: 0.830 }]}
                  margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barCategoryGap="25%">
                  <XAxis dataKey="ev" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [`${(Number(v)*100).toFixed(1)}%`, 'Ratio']}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="r" fill={TERRACOTTA} fillOpacity={0.8} radius={[4,4,0,0]}>
                    {[0,1,2].map(i => <Cell key={i} fill={TERRACOTTA} fillOpacity={0.6 + i * 0.15} />)}
                  </Bar>
                  <ReferenceLine y={1} stroke="#e5e7eb" strokeDasharray="3 2" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Verificado con test de falsificación: ratios 7× menores en umbrales ficticios
            </p>
          </div>

          {/* Right: self-employment */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-4">
            <div className="text-xs font-semibold tracking-widest uppercase text-gray-400">Autoempleo informal</div>
            <div className="text-7xl font-black leading-none" style={{ color: TEAL }}>+15–21pp</div>
            <p className="text-base font-medium text-gray-700 leading-snug">
              aumento en autoempleo en la zona salarial afectada — los trabajadores no desaparecen, cambian de modalidad
            </p>
            <div className="h-20 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { ev:'2016', pre: 38.0, post: 57.1 },
                    { ev:'2018', pre: 35.5, post: 55.5 },
                    { ev:'2022', pre: 33.1, post: 47.8 },
                  ]}
                  margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barCategoryGap="20%"
                >
                  <XAxis dataKey="ev" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, '']}
                    contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="pre" name="Antes" fill="#e5e7eb" radius={[4,4,0,0]} />
                  <Bar dataKey="post" name="Después" fill={TEAL} fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Gris: participación autoempleados antes del aumento · Verde: después · Zona afectada [0.85×SM_ant, SM_nuevo)
            </p>
          </div>
        </section>

        {/* ══ S3: INTERACTIVE WAGE DISTRIBUTION ════════════════════════════════ */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Distribución salarial por evento</h2>
              <p className="text-sm text-gray-500 mt-0.5">Trabajadores formales dependientes · ENAHO · Bins de S/25</p>
            </div>
            <div className="flex gap-2">
              {EVENTS.map((e, i) => (
                <button key={e.id} onClick={() => setActiveEvent(i)}
                  className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                  style={{
                    background: activeEvent === i ? TERRACOTTA : 'transparent',
                    color: activeEvent === i ? 'white' : '#6b7280',
                    border: `2px solid ${activeEvent === i ? TERRACOTTA : '#e5e7eb'}`,
                  }}>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: TERRACOTTA, opacity: 0.85 }} />
              Empleos que desaparecen bajo S/{ev.mw_new}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: TEAL, opacity: 0.85 }} />
              Empleos que reaparecen por encima
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="inline-block w-6 border-t-2 border-dashed" style={{ borderColor: TERRACOTTA }} />
              Nuevo SM: S/{ev.mw_new}
            </span>
          </div>

          <BunchingChart ev={ev} />

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: TERRACOTTA }}>−{ev.missing_pp.toFixed(1)}pp</div>
              <div className="text-xs text-gray-500 mt-0.5">Desaparecen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black" style={{ color: TEAL }}>+{ev.excess_pp.toFixed(1)}pp</div>
              <div className="text-xs text-gray-500 mt-0.5">Reaparecen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-800">{Math.round(ev.ratio * 100)}/100</div>
              <div className="text-xs text-gray-500 mt-0.5">Regresan al mercado formal</div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            IC bootstrap 95%: [{ev.ci_lo.toFixed(3)}, {ev.ci_hi.toFixed(3)}] · {ev.ci_hi >= 1 ? 'No rechaza R=1' : 'Rechaza R=1'} ·
            Zona sombreada roja: masa desaparecida · Zona azul: ventana de exceso
          </p>
        </section>

        {/* ══ S4: BUNCHING EVIDENCE TABLE ══════════════════════════════════════ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">La evidencia completa</h2>
            <p className="text-sm text-gray-500 mt-1">Tres eventos · Masa desaparecida y reaparecida · Señal distribucional verificada</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Evento</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Desaparecen</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Reaparecen</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Regresan</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">IC 95%</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Autoempleo ↑</th>
                  </tr>
                </thead>
                <tbody>
                  {EVENTS.map((e, i) => (
                    <tr key={e.id}
                      className="border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ background: activeEvent === i ? '#fef7f5' : undefined }}
                      onClick={() => setActiveEvent(i)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900">{e.label}</div>
                        <div className="text-xs text-gray-400">{e.sublabel}</div>
                      </td>
                      <td className="px-4 py-4 text-right font-mono" style={{ color: TERRACOTTA }}>−{e.missing_pp.toFixed(1)}pp</td>
                      <td className="px-4 py-4 text-right font-mono" style={{ color: TEAL }}>+{e.excess_pp.toFixed(1)}pp</td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-black text-gray-900">{Math.round(e.ratio * 100)}</span>
                        <span className="text-gray-400">/100</span>
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-gray-500 font-mono">
                        [{e.ci_lo.toFixed(2)}, {e.ci_hi.toFixed(2)}]
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="font-bold" style={{ color: TEAL }}>+{e.selfemp_delta_pp.toFixed(0)}pp</span>
                        <div className="text-xs text-gray-400">{e.selfemp_abs_chg} absoluto</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl px-5 py-3 text-xs text-gray-500 space-y-1 border border-gray-100">
            <p><strong>Test de falsificación:</strong> Aplicando el mismo estimador a umbrales ficticios produce ratios 0.114 y 0.013 — 7× menores que en el umbral real.</p>
            <p><strong>Replicación EPE Lima:</strong> Dataset independiente, ventanas de 6 meses, produce ratios 0.73–1.03 — consistentes con ENAHO 0.70–0.83.</p>
          </div>
        </section>

        {/* ══ S5: ¿A DÓNDE VAN? ════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿A dónde van los trabajadores que desaparecen?</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Composición del empleo en la zona salarial afectada [0.85×SM<sub>ant</sub>, SM<sub>nuevo</sub>), antes y después de cada aumento
            </p>
          </div>

          {/* Event selector */}
          <div className="flex gap-2">
            {EVENTS.map((e, i) => (
              <button key={e.id} onClick={() => setActiveEvent(i)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: activeEvent === i ? TEAL : 'transparent',
                  color: activeEvent === i ? 'white' : '#6b7280',
                  border: `2px solid ${activeEvent === i ? TEAL : '#e5e7eb'}`,
                }}>
                {e.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Stacked bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="flex gap-4 text-xs flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: TERRACOTTA }} />Formal dependiente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: '#94a3b8' }} />Informal dependiente
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: TEAL }} />Autoempleado
                </span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={selfEmpData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip formatter={(v: unknown) => [`${v}%`, '']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="formal" name="Formal dep." stackId="a" fill={TERRACOTTA} fillOpacity={0.85} />
                  <Bar dataKey="informal" name="Informal dep." stackId="a" fill="#94a3b8" fillOpacity={0.75} />
                  <Bar dataKey="selfemp" name="Autoempleado" stackId="a" fill={TEAL} fillOpacity={0.85} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
                <div className="text-3xl font-black" style={{ color: TEAL }}>
                  +{ev.selfemp_delta_pp.toFixed(0)}pp
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  de autoempleo en la zona afectada ({ev.pre_year} → {ev.post_year})
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between border-b border-gray-50 pb-1">
                    <span>Formal dependiente</span>
                    <span>
                      <span style={{ color: TERRACOTTA }} className="font-bold">{ev.formal_pre.toFixed(1)}%</span>
                      {' → '}
                      <span style={{ color: TERRACOTTA }} className="font-bold">{ev.formal_post.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-1">
                    <span>Informal dependiente</span>
                    <span className="font-bold text-gray-500">{ev.informal_pre.toFixed(1)}% → {ev.informal_post.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span>Autoempleado</span>
                    <span>
                      <span style={{ color: TEAL }} className="font-bold">{ev.selfemp_pre.toFixed(1)}%</span>
                      {' → '}
                      <span style={{ color: TEAL }} className="font-bold">{ev.selfemp_post.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2">
                <div className="font-bold text-amber-900 text-sm">El empleo total se mantiene. La MODALIDAD cambia.</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  El aumento en el autoempleo no implica aumento en el bienestar: los autoempleados informales
                  pierden acceso a seguridad social. Pero tampoco implica destrucción de empleo: los trabajadores
                  siguen generando ingresos similares.
                </p>
                {ev.id === 'C' && (
                  <p className="text-xs text-amber-700 leading-relaxed border-t border-amber-200 pt-2">
                    <strong>Evento C:</strong> El recuento absoluto de autoempleados cae (−3.5%), consistente con la
                    re-formalización post-COVID 2021–2023 (fuerza laboral formal creció 12.5%).
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400 leading-relaxed">
                Fuente: ENAHO Módulo 500. Ingresos de autoempleados: p530a (ingreso neto mensual de negocio).
                Diseño transversal — no se pueden rastrear trabajadores individuales.
              </div>
            </div>
          </div>
        </section>

        {/* ══ S6: MAP ═══════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿Dónde muerde más el salario mínimo?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Índice de Kaitz departamental (SM / mediana salarial formal) · Mayor valor = SM más cercano al salario mediano local
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative">
              {hoveredDept && (
                <div className="absolute top-4 left-4 z-10 bg-white shadow-lg rounded-xl px-4 py-3 border border-gray-100 pointer-events-none max-w-[200px]">
                  <div className="font-bold text-gray-900 text-sm">{hoveredDept.name}</div>
                  <div className="text-2xl font-black mt-0.5" style={{
                    color: kaitzMap[hoveredDept.code]
                      ? KAITZ_COLOR(kaitzMap[hoveredDept.code].kaitz)
                      : '#6b7280'
                  }}>
                    {hoveredDept.kaitz.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Índice de Kaitz (SM / mediana)</div>
                  {hoveredDept.note && (
                    <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">{hoveredDept.note}</div>
                  )}
                </div>
              )}
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ center: [-75.5, -10], scale: 1600 }}
                style={{ width: '100%', height: 'auto' }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const code = geo.properties?.IDDPTO || geo.properties?.COD_DEPT || geo.properties?.id;
                      const paddedCode = code ? String(code).padStart(2, '0') : null;
                      const dept = paddedCode ? kaitzMap[paddedCode] : null;
                      const k = dept?.kaitz ?? 0.5;
                      const fill = dept ? KAITZ_COLOR(k) : '#e5e7eb';
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="white"
                          strokeWidth={0.8}
                          style={{
                            default: { fill, outline: 'none', cursor: 'pointer' },
                            hover:   { fill, opacity: 0.75, outline: 'none', cursor: 'pointer' },
                            pressed: { fill, outline: 'none' },
                          }}
                          onMouseEnter={() => dept && setHoveredDept(dept)}
                          onMouseLeave={() => setHoveredDept(null)}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>

              {/* Color scale legend */}
              <div className="mt-2 px-2">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Kaitz bajo (SM no vinculante)</span>
                  <span>Kaitz alto (SM vinculante)</span>
                </div>
                <div className="h-3 rounded-full" style={{
                  background: 'linear-gradient(to right, #4ade80, #86efac, #fbbf24, #f97316, #ef4444, #b91c1c)'
                }} />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>0.45</span><span>0.55</span><span>0.60</span><span>0.65</span><span>0.70+</span>
                </div>
              </div>
            </div>

            {/* Top departments */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-600">Departamentos más expuestos</div>
              {[...DEPTS_KAITZ]
                .sort((a, b) => b.kaitz - a.kaitz)
                .slice(0, 8)
                .map(d => (
                  <div key={d.code} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: KAITZ_COLOR(d.kaitz) }}>
                      {(d.kaitz * 100).toFixed(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{d.name}</div>
                      {d.note && <div className="text-xs text-amber-600 leading-tight mt-0.5 line-clamp-1">{d.note.split(':')[0]}</div>}
                    </div>
                  </div>
                ))}
              <p className="text-xs text-gray-400 leading-relaxed pt-1">
                Ica: trabajadores agro-exportadores con salarios mensuales bajos pese a jornada completa —
                la agro-exportación es el sector más expuesto al SM en el Perú.
              </p>
            </div>
          </div>
        </section>

        {/* ══ S7: SIMULATOR ════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Simulador de impacto</h2>
            <p className="text-sm text-gray-500 mt-1">¿Qué pasaría si el SM sube aún más? Basado en distribución salarial Lima 2023</p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
            {/* Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>S/1,025 (2022)</span>
                <span className="text-xl font-black text-gray-900">S/{sliderValue.toLocaleString('es-PE')}</span>
                <span>S/1,500</span>
              </div>
              <input type="range" min={1025} max={1500} step={5} value={sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: TERRACOTTA }} />
              <div className="flex justify-between text-xs text-gray-300">
                <span>SM 2022</span>
                <span style={{ color: sliderValue >= 1130 ? TERRACOTTA : '#d1d5db', fontWeight: 600 }}>
                  {sliderValue >= 1130 ? '▲ Vigente 2025: S/1,130' : 'Vigente 2025: S/1,130'}
                </span>
                <span>+46%</span>
              </div>
            </div>

            {/* Live dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl p-5 text-center space-y-1" style={{ background: risk.bg }}>
                <div className="text-4xl font-black tabular-nums" style={{ color: TERRACOTTA }}>
                  {fmt(animAffected)}
                </div>
                <div className="text-sm font-medium text-gray-600">trabajadores adicionales afectados</div>
                <div className="text-xs text-gray-400">vs. SM 2022 · Lima Metropolitana</div>
              </div>

              <div className="rounded-2xl p-5 text-center space-y-2" style={{ background: risk.bg }}>
                <div className="text-4xl font-black tabular-nums" style={{ color: risk.color }}>
                  {animKaitz}%
                </div>
                <div className="text-sm font-medium text-gray-600">Índice de Kaitz</div>
                {/* Circular gauge */}
                <div className="flex justify-center">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                    <circle cx="28" cy="28" r="22" fill="none" stroke={risk.color} strokeWidth="6"
                      strokeDasharray={`${Math.min(sliderK / 0.95, 1) * 138} 138`}
                      strokeDashoffset="34.5" strokeLinecap="round" transform="rotate(-90 28 28)" />
                    <text x="28" y="32" textAnchor="middle" fontSize="11" fontWeight="800" fill={risk.color}>
                      {(sliderK * 100).toFixed(0)}%
                    </text>
                  </svg>
                </div>
              </div>

              <div className="rounded-2xl p-5 text-center space-y-1" style={{ background: risk.bg }}>
                <div className="text-4xl font-black tabular-nums" style={{ color: risk.color }}>
                  {animDepts}
                </div>
                <div className="text-sm font-medium text-gray-600">departamentos en zona de riesgo</div>
                <div className="text-xs font-semibold mt-1" style={{ color: risk.color }}>{risk.label}</div>
              </div>
            </div>

            <div className="text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
              Los trabajadores afectados son quienes actualmente ganan entre S/{MW_2022.toLocaleString()} y S/{sliderValue.toLocaleString()}.
              Datos distribucionales: EPE Lima 2023. El simulador no predice el efecto causal del SM — solo mide la exposición mecánica.
            </div>
          </div>
        </section>

        {/* ══ S8: LIMITS / THERMOMETER ══════════════════════════════════════════ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿Hasta dónde llegan nuestros datos?</h2>
            <p className="text-sm text-gray-500 mt-1">El índice de Kaitz como termómetro de riesgo</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thermometer */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-5">
              {/* Track */}
              <div className="relative">
                <div className="h-8 rounded-full overflow-hidden" style={{
                  background: 'linear-gradient(to right, #4ade80, #86efac, #fbbf24, #f97316, #ef4444, #b91c1c)',
                }}>
                  {/* Studied range marker */}
                  <div className="absolute top-0 h-full bg-white/20 border-r-2 border-white"
                    style={{ left: 0, width: `${thermPos(0.57)}%` }} />
                </div>
                {/* Current slider marker */}
                <div className="absolute top-0 h-8 w-1 rounded-full bg-gray-900 shadow-lg transition-all duration-100"
                  style={{ left: `calc(${thermPos(sliderK)}% - 2px)` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-black text-gray-900">
                    S/{sliderValue}
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-xs text-gray-400">
                <span>0.30</span><span>0.50</span><span>0.57</span><span>0.70</span><span>0.95</span>
              </div>

              {/* Zone labels */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-green-50 rounded-lg px-2 py-1.5 text-green-700 font-medium">Kaitz &lt; 0.57<br/>Evidencia directa</div>
                <div className="bg-amber-50 rounded-lg px-2 py-1.5 text-amber-700 font-medium">0.57 – 0.65<br/>Sin datos propios</div>
                <div className="bg-red-50 rounded-lg px-2 py-1.5 text-red-700 font-medium">Kaitz &gt; 0.65<br/>Territorio inexplorado</div>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed">
                El termómetro se mueve en tiempo real con el simulador. Arrastra el slider arriba para ver cómo el SM propuesto
                se aleja de la zona de evidencia.
              </p>
            </div>

            {/* Scenarios table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Escenario</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">SM</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Kaitz</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Zona</th>
                  </tr>
                </thead>
                <tbody>
                  {SCENARIOS.map(s => {
                    const r = kaitzRisk(s.kaitz);
                    return (
                      <tr key={s.label} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-800">{s.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-600">S/{s.sm.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-black" style={{ color: r.color }}>{(s.kaitz * 100).toFixed(0)}%</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: r.bg, color: r.color }}>
                            {r.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-3 text-xs text-gray-400">
                Kaitz = SM / mediana salarial formal nacional (denominador: S/1,863 en 2023).
                Los estudios internacionales sugieren que aumentos por encima de Kaitz 0.65 entran en zona de riesgo de desempleo.
              </div>
            </div>
          </div>
        </section>

        {/* ══ S9: SECONDARY FINDINGS ════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Compression */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4">
            <div className="text-xs font-semibold tracking-widest uppercase text-gray-400">Hallazgo secundario A</div>
            <h3 className="text-lg font-bold text-gray-900">Compresión salarial</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              El aumento del SM comprime el percentil 10–50 de la distribución salarial formal en 3–7 puntos porcentuales
              (DiD en log-salario, zona de compresión vs. cola superior).
            </p>
            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-2 text-xs text-gray-600 border border-gray-100">
              <div className="font-semibold text-gray-700">Descomposición mecánica vs. genuina (Evento B)</div>
              <div className="flex justify-between">
                <span>Mechanical (composición de nuevos entrantes)</span>
                <span className="font-bold">41–92%</span>
              </div>
              <div className="flex justify-between">
                <span>Genuine (reordenamiento salarial real)</span>
                <span className="font-bold" style={{ color: TEAL }}>8–59%</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              La mayor parte de la compresión observada es mecánica: refleja cambios en quiénes ocupan la zona del SM, no alzas reales para los mismos trabajadores.
            </p>
          </div>

          {/* Card B: Heterogeneity */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4">
            <div className="text-xs font-semibold tracking-widest uppercase text-gray-400">Hallazgo secundario B</div>
            <h3 className="text-lg font-bold text-gray-900">¿A quién afecta más?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: TEAL }} />
                <div>
                  <span className="font-semibold text-gray-800">Sector privado absorbe mejor (0.83 vs. 0.75)</span>
                  <p className="text-xs text-gray-500 mt-0.5">Consistente con ajuste de mercado, no con cumplimiento por inspección.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: TERRACOTTA }} />
                <div>
                  <span className="font-semibold text-gray-800">Sin gradiente por edad, sexo ni etnicidad dentro del empleo formal</span>
                  <p className="text-xs text-gray-500 mt-0.5">Los ratios son similares entre hombres y mujeres, jóvenes y adultos.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#f59e0b' }} />
                <div>
                  <span className="font-semibold text-gray-800">La brecha étnica opera por ACCESO, no por salarios</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Trabajadores indígenas: 5.7% de formalidad vs. 20.7% para hablantes de castellano. Una vez dentro del empleo formal, los salarios y la exposición al SM son similares.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ S10: METHODOLOGY (accordion) ════════════════════════════════════ */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Metodología y verificaciones</h2>
          {[
            {
              id: 'metodo',
              title: 'A. Estimador distribucional pre-post',
              content: `Usamos un estimador distribucional pre-post (no el método Cengiz et al. directamente, sino una adaptación para SM nacional). Comparamos la distribución de salarios formales antes y después de cada aumento en bins de S/25, corrigiendo por tendencia de fondo usando la cola superior de la distribución (> 2×SM_nuevo).

La "masa desaparecida" es la suma de deltas negativos en la zona afectada [0.85×SM_ant, SM_nuevo). La "masa en exceso" es la suma de deltas positivos en la zona de exceso [SM_nuevo, SM_nuevo + S/250). El ratio R = exceso / desaparecido mide qué fracción de los desplazados reaparece.

El precedente metodológico más cercano es Harasztosi & Lindner (2016) para Hungría, que también tiene SM nacional único. A diferencia del estimador Cengiz, no requiere grupo de control.`,
            },
            {
              id: 'empleo',
              title: 'B. ¿Por qué no podemos medir el efecto sobre el empleo?',
              content: `Intentamos tres métodos, todos fallaron:

1. DiD con variación departamental: falla por violación de tendencias paralelas (test de pre-tendencias: p=0.007 para 2018, p=0.017 para 2022).

2. Variables instrumentales (Kaitz departamental): instrumento débil (F=1.5/2.6/0.1 — muy por debajo del umbral F>10).

3. Panel longitudinal ENAHO 978: 76% de desgaste, con desgaste diferencial entre tratamiento y control.

La razón estructural: con SM nacional único y 25 departamentos, no existe variación exógena para identificar efectos sobre empleo. No es una falla de datos — es una restricción institucional.`,
            },
            {
              id: 'autoempleo',
              title: 'C. Evidencia de autoempleo',
              content: `Para los trabajadores desaparecidos del empleo formal, calculamos la composición del empleo en la zona afectada combinando trabajadores dependientes (p524a1) y autoempleados (p530a, ingreso neto mensual de negocio).

Evento A (2015→2017): autoempleo en zona afectada 38.0% → 57.1% (+19.1pp). Recuento absoluto: +8.7%.
Evento B (2017→2019): autoempleo 35.5% → 55.5% (+20.0pp). Recuento absoluto: +5.1%.
Evento C (2021→2023): autoempleo 33.1% → 47.8% (+14.7pp). Recuento absoluto: −3.5% (re-formalización post-COVID).

Importante: esto no prueba que los trabajadores formales TRANSITARON al autoempleo — el diseño transversal no rastrea individuos. Es evidencia indirecta de que el autoempleo absorbió la masa desaparecida.`,
            },
            {
              id: 'robustez',
              title: 'D. Verificaciones y robustez',
              content: `Test de falsificación: en la población del Evento B, ratios en umbrales ficticios S/1,100→1,200 y S/1,400→1,500 producen R=0.114 y R=0.013 — 7× menores que en el umbral real. El patrón de bunching es específico al SM.

Bootstrap 1,000 repeticiones: IC 95% son [0.567, 0.896] (A), [0.716, 1.016] (B), [0.716, 0.960] (C).

Replicación EPE Lima: dataset independiente, ventanas trimestrales de 6 meses, definición de formalidad diferente (afiliación EsSalud vs. ENAHO). Produce ratios 1.031 / 0.733 / 0.885 — consistentes con ENAHO.

Alineación de bins: requisito crítico. Los bordes de los bins deben coincidir con el valor del SM. Con bins de S/50, el SM de S/930 cae en el bin [900, 950) con centro 925 < 930, generando sesgo a la baja de 75%. Todos los resultados reportados usan S/25 (alineado con los tres SM).`,
            },
            {
              id: 'datos',
              title: 'E. Datos y muestra',
              content: `ENAHO 2015–2023 (excepto 2020), Módulo 500 (Empleo e Ingresos), INEI.
Muestra: trabajadores formales dependientes (ocu500=1, p507∈{3,4,6} o cat07p500a1=2, ocupinf=2) con salario p524a1 > 0.
Peso muestral: fac500a. N = 8,946–11,090 por año.

EPE Lima Metropolitana: panel trimestral, ~2,600 obs formales dependientes/trimestre.
Formalidad EPE: afiliación a EsSalud (p222==1) — definición más estrecha que ENAHO.

Autoempleo: p530a (ingreso neto mensual de negocio, pregunta 530a del Módulo 500).
Kaitz departamental: MW / mediana salarial formal ponderada por fac500a, por departamento.`,
            },
          ].map(sec => (
            <div key={sec.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenAccordion(openAccordion === sec.id ? null : sec.id)}
              >
                <span className="font-semibold text-gray-800 text-sm">{sec.title}</span>
                <span className="text-gray-400 text-lg leading-none ml-4 flex-shrink-0">
                  {openAccordion === sec.id ? '−' : '+'}
                </span>
              </button>
              {openAccordion === sec.id && (
                <div className="px-6 pb-5 border-t border-gray-50">
                  <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans mt-4">
                    {sec.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="text-center space-y-3 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Basado en: &ldquo;Missing Mass and Minimum Wages: Distributional Effects of Three Minimum Wage Increases in Peru&rdquo;
            · Carlos César Chávez Padilla, University of Chicago, 2026
          </p>
          <p className="text-xs text-gray-300">
            ENAHO 2015–2023 · EPE Lima · Estimador distribucional pre-post (adaptación de Harasztosi &amp; Lindner 2016)
          </p>
        </footer>

      </main>
    </div>
  );
}
