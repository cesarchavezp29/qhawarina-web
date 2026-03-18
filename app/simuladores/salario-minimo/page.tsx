'use client';

import { useState, useMemo, useEffect } from 'react';
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
const WATERMARK  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.04'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// ── Bunching bin data (formal-dep, delta_adj ×100, pp) ────────────────────────
// Source: mw_complete_margins.json › bunching_revised.[A/B/C].formal_dep.bin_data
const BINS_A = [{"bc":488,"delta":0.017},{"bc":512,"delta":-0.07},{"bc":538,"delta":-0.017},{"bc":562,"delta":0.066},{"bc":588,"delta":0.021},{"bc":612,"delta":-0.051},{"bc":638,"delta":0.005},{"bc":662,"delta":0.143},{"bc":688,"delta":-0.026},{"bc":712,"delta":0.015},{"bc":738,"delta":-0.051},{"bc":762,"delta":-4.641},{"bc":788,"delta":-0.13},{"bc":812,"delta":-1.727},{"bc":838,"delta":-0.204},{"bc":862,"delta":4.24},{"bc":888,"delta":-0.005},{"bc":912,"delta":-1.063},{"bc":938,"delta":0.131},{"bc":962,"delta":0.19},{"bc":988,"delta":0.134},{"bc":1012,"delta":0.026},{"bc":1038,"delta":-0.067},{"bc":1062,"delta":-0.124},{"bc":1088,"delta":-0.022},{"bc":1112,"delta":0.061},{"bc":1138,"delta":-0.2},{"bc":1162,"delta":0.022},{"bc":1188,"delta":-0.01},{"bc":1212,"delta":-0.728},{"bc":1238,"delta":-0.036},{"bc":1262,"delta":-0.12},{"bc":1288,"delta":0.095},{"bc":1312,"delta":-0.994},{"bc":1338,"delta":-0.021},{"bc":1362,"delta":-0.202},{"bc":1388,"delta":-0.292},{"bc":1412,"delta":-0.103},{"bc":1438,"delta":0.059},{"bc":1462,"delta":-0.021},{"bc":1488,"delta":-0.051},{"bc":1512,"delta":0.69},{"bc":1538,"delta":0.154},{"bc":1562,"delta":0.104},{"bc":1588,"delta":0.039},{"bc":1612,"delta":0.297},{"bc":1638,"delta":-0.114},{"bc":1662,"delta":-0.016},{"bc":1688,"delta":0.091},{"bc":1712,"delta":0.972},{"bc":1738,"delta":-0.018},{"bc":1762,"delta":0.195},{"bc":1788,"delta":0.15},{"bc":1812,"delta":-0.714},{"bc":1838,"delta":-0.026},{"bc":1862,"delta":0.131},{"bc":1888,"delta":-0.033},{"bc":1912,"delta":0.416},{"bc":1938,"delta":-0.141},{"bc":1962,"delta":0.031},{"bc":1988,"delta":0.142},{"bc":2012,"delta":0.852}];
const BINS_B = [{"bc":488,"delta":0.095},{"bc":512,"delta":-0.187},{"bc":538,"delta":0.035},{"bc":562,"delta":-0.081},{"bc":588,"delta":0.006},{"bc":612,"delta":0.22},{"bc":638,"delta":-0.038},{"bc":662,"delta":0.023},{"bc":688,"delta":0.057},{"bc":712,"delta":0.113},{"bc":738,"delta":0.046},{"bc":762,"delta":-0.197},{"bc":788,"delta":0.129},{"bc":812,"delta":-0.158},{"bc":838,"delta":-0.071},{"bc":862,"delta":-6.516},{"bc":888,"delta":-0.062},{"bc":912,"delta":-1.028},{"bc":938,"delta":5.064},{"bc":962,"delta":1.277},{"bc":988,"delta":-0.168},{"bc":1012,"delta":-0.823},{"bc":1038,"delta":-0.035},{"bc":1062,"delta":0.199},{"bc":1088,"delta":0.025},{"bc":1112,"delta":0.027},{"bc":1138,"delta":0.063},{"bc":1162,"delta":-0.08},{"bc":1188,"delta":-0.111},{"bc":1212,"delta":-0.624},{"bc":1238,"delta":0.042},{"bc":1262,"delta":-0.229},{"bc":1288,"delta":-0.173},{"bc":1312,"delta":-0.572},{"bc":1338,"delta":-0.003},{"bc":1362,"delta":0.014},{"bc":1388,"delta":0.042},{"bc":1412,"delta":-0.373},{"bc":1438,"delta":0.042},{"bc":1462,"delta":-0.02},{"bc":1488,"delta":0.001},{"bc":1512,"delta":-1.423},{"bc":1538,"delta":-0.203},{"bc":1562,"delta":-0.206},{"bc":1588,"delta":0.025},{"bc":1612,"delta":-0.515},{"bc":1638,"delta":-0.013},{"bc":1662,"delta":-0.137},{"bc":1688,"delta":-0.118},{"bc":1712,"delta":-0.849},{"bc":1738,"delta":-0.064},{"bc":1762,"delta":-0.168},{"bc":1788,"delta":-0.175},{"bc":1812,"delta":0.271},{"bc":1838,"delta":-0.045},{"bc":1862,"delta":0.037},{"bc":1888,"delta":-0.007},{"bc":1912,"delta":-0.122},{"bc":1938,"delta":-0.045},{"bc":1962,"delta":-0.038},{"bc":1988,"delta":0.026},{"bc":2012,"delta":1.166}];
const BINS_C = [{"bc":488,"delta":-0.186},{"bc":512,"delta":0.226},{"bc":538,"delta":0.063},{"bc":562,"delta":-0.095},{"bc":588,"delta":-0.024},{"bc":612,"delta":-0.056},{"bc":638,"delta":-0.072},{"bc":662,"delta":0.247},{"bc":688,"delta":-0.055},{"bc":712,"delta":0.047},{"bc":738,"delta":0.077},{"bc":762,"delta":0.011},{"bc":788,"delta":0.148},{"bc":812,"delta":0.147},{"bc":838,"delta":-0.055},{"bc":862,"delta":-0.095},{"bc":888,"delta":-0.009},{"bc":912,"delta":-0.231},{"bc":938,"delta":-8.477},{"bc":962,"delta":-2.045},{"bc":988,"delta":-0.144},{"bc":1012,"delta":-1.964},{"bc":1038,"delta":6.916},{"bc":1062,"delta":1.197},{"bc":1088,"delta":0.067},{"bc":1112,"delta":-1.201},{"bc":1138,"delta":0.615},{"bc":1162,"delta":0.878},{"bc":1188,"delta":0.195},{"bc":1212,"delta":-2.137},{"bc":1238,"delta":0.245},{"bc":1262,"delta":0.687},{"bc":1288,"delta":-0.012},{"bc":1312,"delta":-0.63},{"bc":1338,"delta":0.477},{"bc":1362,"delta":0.44},{"bc":1388,"delta":0.111},{"bc":1412,"delta":-0.503},{"bc":1438,"delta":0.059},{"bc":1462,"delta":0.315},{"bc":1488,"delta":0.055},{"bc":1512,"delta":-0.919},{"bc":1538,"delta":0.175},{"bc":1562,"delta":0.056},{"bc":1588,"delta":0.085},{"bc":1612,"delta":0.127},{"bc":1638,"delta":0.143},{"bc":1662,"delta":0.197},{"bc":1688,"delta":0.247},{"bc":1712,"delta":0.119},{"bc":1738,"delta":0.144},{"bc":1762,"delta":-0.095},{"bc":1788,"delta":0.118},{"bc":1812,"delta":0.303},{"bc":1838,"delta":0.13},{"bc":1862,"delta":0.194},{"bc":1888,"delta":0.141},{"bc":1912,"delta":0.11},{"bc":1938,"delta":0.016},{"bc":1962,"delta":0.142},{"bc":1988,"delta":0.168},{"bc":2012,"delta":0.432}];

// ── Event metadata — source: mw_falsification_audit.json › part1_bunching.standard
// Bootstrap CIs: mw_power_analysis.json › bootstrap_cis
const EVENTS = [
  { id: 'A', label: '2016 (S/750→850)', mw_old: 750, mw_new: 850, pre_year: 2015, post_year: 2017,
    ratio: 0.696, missing_pp: 6.78, excess_pp: 4.72,
    ci_lo: 0.567, ci_hi: 0.896, rejects_r1: true, bins: BINS_A },
  { id: 'B', label: '2018 (S/850→930)', mw_old: 850, mw_new: 930, pre_year: 2017, post_year: 2019,
    ratio: 0.829, missing_pp: 8.03, excess_pp: 6.66,
    ci_lo: 0.716, ci_hi: 1.016, rejects_r1: false, bins: BINS_B },
  { id: 'C', label: '2022 (S/930→1,025)', mw_old: 930, mw_new: 1025, pre_year: 2021, post_year: 2023,
    ratio: 0.830, missing_pp: 13.02, excess_pp: 10.80,
    ci_lo: 0.716, ci_hi: 0.960, rejects_r1: true, bins: BINS_C },
];

// ── Department Kaitz — 2015 values (pre-Event A)
// Source: mw_data_audit_complete.json › dept_kaitz['2015']
// Ica (11) is HIGHEST (0.933): agro-export workers with low monthly wages despite full-time hours.
// Huancavelica (09) = 0.500 because ~85% of its formal workers are public-sector employees.
const DEPTS_KAITZ = [
  { code:'11', name:'Ica',            kaitz: 0.933 },
  { code:'20', name:'Piura',          kaitz: 0.649 },
  { code:'14', name:'Lambayeque',     kaitz: 0.625 },
  { code:'07', name:'Callao',         kaitz: 0.625 },
  { code:'02', name:'Ancash',         kaitz: 0.577 },
  { code:'13', name:'La Libertad',    kaitz: 0.577 },
  { code:'25', name:'Ucayali',        kaitz: 0.556 },
  { code:'04', name:'Arequipa',       kaitz: 0.536 },
  { code:'15', name:'Lima',           kaitz: 0.536 },
  { code:'12', name:'Junín',          kaitz: 0.534 },
  { code:'24', name:'Tumbes',         kaitz: 0.529 },
  { code:'01', name:'Amazonas',       kaitz: 0.515 },
  { code:'22', name:'San Martín',     kaitz: 0.506 },
  { code:'05', name:'Ayacucho',       kaitz: 0.500 },
  { code:'06', name:'Cajamarca',      kaitz: 0.500 },
  { code:'08', name:'Cusco',          kaitz: 0.500 },
  { code:'09', name:'Huancavelica',   kaitz: 0.500 },
  { code:'16', name:'Loreto',         kaitz: 0.500 },
  { code:'17', name:'Madre de Dios',  kaitz: 0.500 },
  { code:'19', name:'Pasco',          kaitz: 0.500 },
  { code:'03', name:'Apurímac',       kaitz: 0.479 },
  { code:'23', name:'Tacna',          kaitz: 0.470 },
  { code:'10', name:'Huánuco',        kaitz: 0.469 },
  { code:'21', name:'Puno',           kaitz: 0.458 },
  { code:'18', name:'Moquegua',       kaitz: 0.440 },
];

// ── Lima formal wage percentiles (EPE 2022, n=2,737 survey obs ≈ 1.7M workers) ─
const LIMA_PERC: Record<string,number> = {
  p1:158.3, p5:480, p10:800, p15:930, p20:1016, p25:1100,
  p30:1200, p40:1500, p50:1700, p60:2000, p70:2500, p75:2800,
  p80:3000, p85:3712, p90:4519, p95:6000, p99:11256,
};
const LIMA_FORMAL_POP = 1_700_000;
const MW_CURRENT      = 1130;
const MW_SLIDER_BASE  = 1025;

// ── Helpers ────────────────────────────────────────────────────────────────────
function pctAtOrBelow(wage: number): number {
  const pts = [
    [0,0],[158.3,1],[480,5],[800,10],[930,15],[1016,20],[1100,25],
    [1200,30],[1500,40],[1700,50],[2000,60],[2500,70],[2800,75],
    [3000,80],[3712,85],[4519,90],[6000,95],[11256,99],[999999,100],
  ];
  for (let i = 1; i < pts.length; i++) {
    if (wage <= pts[i][0]) {
      const frac = (wage - pts[i-1][0]) / (pts[i][0] - pts[i-1][0]);
      return pts[i-1][1] + frac * (pts[i][1] - pts[i-1][1]);
    }
  }
  return 100;
}
function workersAffected(sliderValue: number): number {
  const shareBase     = pctAtOrBelow(MW_SLIDER_BASE) / 100;
  const shareProposed = pctAtOrBelow(sliderValue) / 100;
  return Math.max(0, (shareProposed - shareBase) * LIMA_FORMAL_POP);
}
function sliderKaitz(sliderValue: number): number {
  // Anchored: 930/1673 = 0.556 for 2018; 1025/1800 = 0.569 for 2022
  // Use 2023 national median ~S/1,863 as denominator
  return sliderValue / 1863;
}
function topDepts(sliderValue: number, n = 3): string[] {
  return DEPTS_KAITZ
    .filter(d => d.kaitz > 0.55)
    .sort((a, b) => b.kaitz - a.kaitz)
    .slice(0, n)
    .map(d => d.name);
}

function kaitzCategory(k: number): 'baja' | 'media' | 'alta' {
  if (k < 0.50) return 'baja';
  if (k <= 0.62) return 'media';
  return 'alta';
}
const CAT_LABEL: Record<string,string> = {
  baja:  'Salario mediano muy por encima del mínimo (Kaitz < 0.50)',
  media: 'Salario mediano moderadamente mayor (Kaitz 0.50–0.62)',
  alta:  'Salario mínimo cercano al mediano (Kaitz > 0.62)',
};
const CAT_COLOR: Record<string,string> = {
  alta:  '#C65D3E',
  media: '#E59959',
  baja:  '#2A9D8F',
};

const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');

// ── KDE-based wage distribution data ──────────────────────────────────────────
const SCALE = 913;
const MW_VIGENTE = 1130;
const MW_PREV = 1025;

function getAffectedWorkers(distData: any, sliderValue: number): number {
  if (!distData) return 0;
  const keys = [930, 1025, 1130, 1200, 1300, 1500];
  const key = `mw_${sliderValue}`;
  if (distData[key]) {
    return Math.round(distData[key].treat.formal * SCALE);
  }
  const lower = keys.filter(k => k <= sliderValue).pop() || 1130;
  const upper = keys.find(k => k > sliderValue) || 1500;
  const lowerCount = distData[`mw_${lower}`]?.treat?.formal || 0;
  const upperCount = distData[`mw_${upper}`]?.treat?.formal || 0;
  const t = upper === lower ? 0 : (sliderValue - lower) / (upper - lower);
  return Math.round((lowerCount + t * (upperCount - lowerCount)) * SCALE);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUNCHING CHART COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function BunchingChart({ ev }: { ev: typeof EVENTS[0] }) {
  const affectedLow  = Math.round(0.85 * ev.mw_old);
  const affectedHigh = ev.mw_new;
  const excessHigh   = ev.mw_new + 200;

  const chartData = ev.bins
    .filter(b => b.bc >= 500 && b.bc <= 1500)
    .map(b => {
      const inFocus = b.bc >= affectedLow - 50 && b.bc <= excessHigh;
      return {
        bc:      b.bc,
        neg:     b.delta < 0 ? b.delta : null,
        pos:     b.delta >= 0 ? b.delta : null,
        inFocus,
      };
    });

  const xTicks = [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500];

  return (
    <div className="space-y-3">
      <div className="flex gap-6 text-xs flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ background: TERRACOTTA, opacity: 0.85 }} />
          Empleos desaparecidos bajo el nuevo mínimo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm inline-block flex-shrink-0" style={{ background: TEAL, opacity: 0.85 }} />
          Empleos que reaparecen por encima
        </span>
        <span className="flex items-center gap-1.5 text-gray-400">
          <span className="inline-block w-4 border-t-2 border-dashed flex-shrink-0" style={{ borderColor: TERRACOTTA }} />
          Nuevo salario mínimo
        </span>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 24, right: 16, bottom: 28, left: 8 }} barCategoryGap="1%">
          <ReferenceArea x1={affectedLow} x2={affectedHigh} fill={TERRACOTTA} fillOpacity={0.06} />
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="bc"
            type="number"
            domain={[500, 1500]}
            ticks={xTicks}
            tickFormatter={v => `S/${v.toLocaleString('es-PE')}`}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            label={{ value: 'Salario mensual (S/)', position: 'insideBottom', offset: -14, fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            formatter={(val: unknown) => {
              const v = typeof val === 'number' ? val : 0;
              return [`${v > 0 ? '+' : ''}${v.toFixed(2)}%`, 'Cambio en participación'] as [string, string];
            }}
            labelFormatter={(v: unknown) => `Rango S/${v}–${Number(v)+25}`}
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1} />
          <ReferenceLine x={ev.mw_new} stroke={TERRACOTTA} strokeWidth={2} strokeDasharray="4 2"
            label={{ value: `S/${ev.mw_new}`, position: 'top', fill: TERRACOTTA, fontSize: 12, fontWeight: 700 }}
          />
          <ReferenceLine x={ev.mw_old} stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="3 2"
            label={{ value: `S/${ev.mw_old}`, position: 'insideTopLeft', fill: '#9ca3af', fontSize: 10 }}
          />
          <Bar dataKey="neg" name="Empleos desaparecidos" radius={[2,2,0,0]} isAnimationActive={false}>
            {chartData.map(b => (
              <Cell key={b.bc} fill={TERRACOTTA} fillOpacity={b.inFocus ? 0.85 : 0.25} />
            ))}
          </Bar>
          <Bar dataKey="pos" name="Empleos reaparecidos" radius={[2,2,0,0]} isAnimationActive={false}>
            {chartData.map(b => (
              <Cell key={b.bc} fill={TEAL} fillOpacity={b.inFocus ? 0.85 : 0.25} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center">
        Zona sombreada: rango directamente afectado por el aumento (S/{affectedLow}–S/{affectedHigh}) ·
        Barras más transparentes fuera del foco
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MWSalarioPage() {
  const [activeEvent, setActiveEvent] = useState(1);
  const [sliderValue, setSliderValue] = useState(MW_CURRENT);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [hoveredDept, setHoveredDept] = useState<{ name: string; kaitz: number; cat: string; note?: string } | null>(null);
  const [distData, setDistData] = useState<any>(null);

  useEffect(() => {
    fetch('/assets/data/lima_wage_distribution.json')
      .then(r => r.json())
      .then(setDistData)
      .catch(() => {});
  }, []);

  const ev = EVENTS[activeEvent];
  const affected = useMemo(() => workersAffected(sliderValue), [sliderValue]);
  const sliderK  = useMemo(() => sliderKaitz(sliderValue), [sliderValue]);
  const topD     = useMemo(() => topDepts(sliderValue), [sliderValue]);

  const thermPos = (k: number) => Math.min(Math.max((k - 0.30) / (0.95 - 0.30) * 100, 0), 100);

  // Source: Table 1 + mw_data_audit_complete.json
  // Kaitz = MW / national median formal wage
  // 2016: 850/1500=0.567; 2018: 930/1673=0.556; 2022: 1025/1800=0.569; 2025: 1130/1863≈0.607
  const SCENARIOS = [
    { label: '2016 (referencia)', sm: 850,  kaitz: 0.567, risk: 'Rango estudiado', riskColor: '#16a34a' },
    { label: '2018',              sm: 930,  kaitz: 0.556, risk: 'Rango estudiado', riskColor: '#16a34a' },
    { label: '2022',              sm: 1025, kaitz: 0.569, risk: 'Rango estudiado', riskColor: '#16a34a' },
    { label: 'Actual 2025',       sm: 1130, kaitz: 0.607, risk: 'Fuera del rango', riskColor: '#d97706' },
    { label: 'Propuesta S/1,200', sm: 1200, kaitz: 0.644, risk: 'Sin evidencia',   riskColor: '#dc2626' },
    { label: 'Propuesta S/1,300', sm: 1300, kaitz: 0.698, risk: 'Sin evidencia',   riskColor: '#7f1d1d' },
  ];

  const ACCORDION_SECTIONS = [
    {
      id: 'metodo',
      title: '9A. Método principal',
      content: `Usamos un estimador distribucional pre-post inspirado en Cengiz et al. (2019), adaptado para un salario mínimo nacional sin jurisdicciones de control. Comparamos la distribución de salarios formales antes y después de cada aumento, corrigiendo por la tendencia general de salarios en la cola superior (> 2×SM).

A diferencia del método original, que compara estados con y sin aumentos (posible en EE.UU. donde cada estado fija su propio mínimo), en Perú todos los departamentos reciben el mismo aumento simultáneamente. El precedente metodológico más cercano para un SM nacional único es Harasztosi & Lindner (2016, Hungría).

Resultado: missing mass (empleos que desaparecen bajo el nuevo piso) y excess mass (empleos que reaparecen arriba). La razón excess/missing = ratio de redistribución. Verificado con test de falsificación en umbrales ficticios.`,
    },
    {
      id: 'empleo',
      title: '9B. ¿Por qué no podemos medir el efecto sobre el empleo?',
      content: `Intentamos tres métodos regresionales:

1. Diferencia en diferencias (DiD) usando variación departamental en exposición al SM — falla porque las tendencias de empleo previas al aumento difieren entre departamentos (test de pre-tendencias: p=0.007 para 2018, p=0.017 para 2022). El supuesto de tendencias paralelas no se cumple.

2. Variables instrumentales usando el índice de Kaitz departamental como instrumento — falla porque la primera etapa es muy débil (estadístico F=1.5/2.6/0.1 en los tres eventos; umbral mínimo: F>10). La variación del Kaitz entre departamentos refleja diferencias estructurales (agricultura vs. sector público) con dinámicas propias, no diferencial de exposición al SM.

3. Panel longitudinal de hogares (ENAHO Panel 978) — falla porque el 76% de los trabajadores no son re-entrevistados a los dos años, con desgaste diferencial por grupo de tratamiento.

La razón estructural: Perú tiene un salario mínimo nacional único. Sin variación sub-nacional válida, no existe grupo de comparación creíble para efectos sobre el empleo.`,
    },
    {
      id: 'datos',
      title: '9C. Datos',
      content: `ENAHO 2015–2023, Módulo 500 (Empleo e Ingresos), INEI.
Muestra: trabajadores formales dependientes (ocu500=1, p507∈{3,4,6}, ocupinf=2) con salario mensual entre S/1 y S/6,000.
Variable salarial: p524a1 (ingreso mensual, ocupación principal). Peso: fac500a.
N = 8,946–11,488 por año (ver Tabla 1 del documento técnico).

EPE Lima Metropolitana 2016–2022: panel trimestral, ~2,600 trabajadores formales dependientes por trimestre.
Formalidad EPE: p222==1 (afiliación a EsSalud) — definición más estrecha que ENAHO.`,
    },
    {
      id: 'verificaciones',
      title: '9D. Verificaciones y robustez',
      content: `Test de falsificación: aplicando el mismo estimador a umbrales ficticios S/1,100→1,200 y S/1,400→1,500 en la población del Evento B se obtienen ratios de 0.114 y 0.013, frente a 0.829 en el umbral real (S/930). El patrón de bunching es específico al salario mínimo (7× más pequeño en umbrales ficticios).

Intervalos de confianza bootstrap (1,000 repeticiones):
- 2016: [0.567, 0.896] — rechaza R=1
- 2018: [0.716, 1.016] — NO rechaza R=1 (incluye redistribución perfecta)
- 2022: [0.716, 0.960] — rechaza R=1

Replicación independiente: EPE Lima (datos trimestrales, definición de formalidad diferente) produce ratios 0.73–1.03, consistentes con ENAHO 0.70–0.83. Los tres ratios ENAHO caen dentro de los intervalos bootstrap de EPE Lima.

Estabilidad del estimador: resultados robustos con anchos de bin de S/25, S/50 y S/100.`,
    },
  ];

  return (
    <div style={{ backgroundColor: BG, backgroundImage: WATERMARK, minHeight: '100vh' }}>
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-20">

        {/* ── SECTION 1: HEADLINE ─────────────────────────────────────────────── */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            ¿Qué pasa cuando sube el salario mínimo?
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Evidencia de tres aumentos en Perú (2016, 2018, 2022)
          </p>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Analizamos los aumentos de S/750→S/850 (2016), S/850→S/930 (2018) y S/930→S/1,025 (2022)
            usando la distribución nacional de salarios formales.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
            ENAHO 2015–2023 · EPE Lima · 10,000+ trabajadores formales por año
          </div>
        </section>

        {/* ── SECTION 2: TWO HEADLINE CARDS ───────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Redistribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">Salarios</h2>
            <div className="space-y-1">
              <div className="text-7xl font-black leading-none" style={{ color: TERRACOTTA }}>70–83%</div>
              <p className="text-base font-semibold text-gray-800">
                de los empleos formales desplazados por debajo del nuevo mínimo reaparecen por encima del nuevo piso salarial.
              </p>
            </div>
            <div className="h-40 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={BINS_B.filter(b => b.bc >= 600 && b.bc <= 1300)}
                  margin={{ top: 2, right: 4, bottom: 2, left: 4 }}
                  barCategoryGap="1%"
                >
                  <ReferenceLine x={930} stroke={TERRACOTTA} strokeWidth={2} />
                  <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
                  <Bar dataKey="delta" isAnimationActive={false}>
                    {BINS_B.filter(b => b.bc >= 600 && b.bc <= 1300).map((b) => (
                      <Cell key={b.bc} fill={b.delta < 0 ? TERRACOTTA : TEAL} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Promedio de tres aumentos. Verificado con test de falsificación en umbrales ficticios
              (ratios 7× menores que en el umbral real).
            </p>
            <p className="text-xs text-gray-400">
              Rojo: empleos desaparecidos bajo S/930 · Verde: empleos reaparecidos por encima ·
              Gráfico muestra el evento de 2018.
            </p>
          </div>

          {/* Card 2: Employment — HONEST */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">Empleo</h2>
            <div className="space-y-1">
              <div className="text-5xl font-black leading-none" style={{ color: TEAL }}>No identificado</div>
              <p className="text-base font-semibold text-gray-800">
                El efecto sobre el empleo no pudo medirse con los datos disponibles.
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-300 text-xs text-gray-600 leading-relaxed space-y-2">
              <p>Con un salario mínimo nacional único y 24 departamentos, los datos no tienen suficiente variación geográfica para medir el efecto causal sobre el empleo.</p>
              <p><strong>No es lo mismo que "sin efecto"</strong> — significa que no podemos medirlo. Los ratios de redistribución (0.70–0.83) son consistentes tanto con desplazamiento moderado (hasta el 28% de los trabajadores afectados) como con redistribución perfecta.</p>
            </div>
            <p className="text-xs text-gray-400">
              Todos los métodos regresionales fallan: test de pre-tendencias (DiD p&lt;0.02),
              instrumento débil (IV F&lt;3), deserción de panel (76%). Solo el análisis distribucional
              produce resultados confiables.
            </p>
          </div>
        </section>

        {/* ── Interactive Wage Distribution ── */}
        {distData && (
          <div className="bg-[#FAF8F4] rounded-xl border border-gray-200 p-5 mb-6">
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  Distribución salarial · Lima Metropolitana
                </h3>
                <p className="text-xs text-gray-500">
                  Trabajadores formales dependientes · EPE 2022
                </p>
              </div>
              {sliderValue > MW_PREV && (
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: TERRACOTTA }}>
                    {getAffectedWorkers(distData, sliderValue).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">trabajadores afectados</div>
                </div>
              )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(distData.kde_formal as {wage:number,density:number}[]).filter(d => d.wage >= 400 && d.wage <= 3000)}
                margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="wage"
                  tickFormatter={(v) => `S/${v.toLocaleString()}`}
                  ticks={[500, 750, 1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000]}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(val: number | undefined) => [(val ?? 0).toFixed(5), 'Densidad']}
                  labelFormatter={(v) => `S/${Number(v).toLocaleString()}`}
                />
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke={TEAL}
                  strokeWidth={2}
                  fill={TEAL}
                  fillOpacity={0.15}
                />
                <ReferenceArea x1={400} x2={MW_PREV} fill="#999" fillOpacity={0.08} />
                {sliderValue > MW_PREV && (
                  <ReferenceArea
                    x1={MW_PREV}
                    x2={sliderValue}
                    fill={TERRACOTTA}
                    fillOpacity={0.20}
                  />
                )}
                <ReferenceLine
                  x={MW_PREV}
                  stroke="#bbb"
                  strokeDasharray="4 4"
                  label={{ value: `SM 2022: S/${MW_PREV}`, position: 'insideTopRight', fill: '#aaa', fontSize: 10 }}
                />
                <ReferenceLine
                  x={MW_VIGENTE}
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{ value: 'Vigente 2025: S/1,130', position: 'insideTopLeft', fill: '#666', fontSize: 10 }}
                />
                {sliderValue > MW_VIGENTE && (
                  <ReferenceLine
                    x={sliderValue}
                    stroke={TERRACOTTA}
                    strokeWidth={3}
                    label={{ value: `Propuesto: S/${sliderValue.toLocaleString()}`, position: 'top', fill: TERRACOTTA, fontSize: 12, fontWeight: 700 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 px-2">
              <input
                type="range"
                min={1130}
                max={1500}
                step={10}
                value={sliderValue < 1130 ? 1130 : sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full accent-[#C65D3E]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>S/1,130 (vigente)</span>
                <span>S/1,500</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              {sliderValue <= MW_VIGENTE
                ? `Con el aumento vigente a S/1,130, aproximadamente ${getAffectedWorkers(distData, sliderValue).toLocaleString()} trabajadores formales de Lima Metropolitana ya recibieron un aumento directo.`
                : `Si el salario mínimo sube a S/${sliderValue.toLocaleString()}, aproximadamente ${getAffectedWorkers(distData, sliderValue).toLocaleString()} trabajadores formales en Lima recibirían un aumento directo.`
              }
              {' '}Estimación basada en EPE Lima 2022, extrapolada a la fuerza laboral formal actual.
            </p>
          </div>
        )}

        {/* ── SECTION 4: BUNCHING EVIDENCE ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ¿A dónde van los empleos por debajo del nuevo mínimo?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Redistribución salarial antes y después de cada aumento · Trabajadores formales dependientes
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {EVENTS.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setActiveEvent(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  activeEvent === i
                    ? 'border-transparent text-white'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                }`}
                style={activeEvent === i ? { background: TERRACOTTA } : {}}
              >
                {e.label}
              </button>
            ))}
          </div>

          <BunchingChart ev={ev} />

          {/* Summary table — no employment column */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">Evento</th>
                  <th className="py-2 pr-4 font-medium text-right">Empleos desaparecen</th>
                  <th className="py-2 pr-4 font-medium text-right">Empleos reaparecen</th>
                  <th className="py-2 pr-4 font-medium text-right">¿Cuántos regresan?</th>
                  <th className="py-2 font-medium text-right">IC 95%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {EVENTS.map(e => (
                  <tr key={e.id} className={e.id === ev.id ? 'bg-orange-50' : ''}>
                    <td className="py-2 pr-4 font-medium text-gray-700">{e.label}</td>
                    <td className="py-2 pr-4 text-right" style={{ color: TERRACOTTA }}>−{e.missing_pp.toFixed(1)}%</td>
                    <td className="py-2 pr-4 text-right" style={{ color: TEAL }}>+{e.excess_pp.toFixed(1)}%</td>
                    <td className="py-2 pr-4 text-right font-bold text-gray-800">{Math.round(e.ratio * 100)} de cada 100</td>
                    <td className="py-2 text-right text-gray-500 font-mono text-xs">
                      [{Math.round(e.ci_lo*100)}, {Math.round(e.ci_hi*100)}]
                      {!e.rejects_r1 && <span className="ml-1 text-amber-600">*</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
            <p>
              &ldquo;¿Cuántos regresan?&rdquo; indica cuántos de los empleos que desaparecieron por debajo del nuevo
              mínimo volvieron a aparecer por encima de él. Un valor de 100 de cada 100 sería redistribución perfecta.
              IC 95% = intervalo de confianza bootstrap (1,000 repeticiones). * El IC del evento 2018 incluye 100,
              por lo que no se puede descartar redistribución perfecta a ese nivel de confianza.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border-l-4" style={{ borderColor: '#9ca3af' }}>
              <strong>Test de falsificación:</strong> el mismo método aplicado a umbrales ficticios (S/1,100→S/1,200
              y S/1,400→S/1,500) produce redistribución 7 veces menor que en el umbral real, confirmando que el
              patrón es específico al salario mínimo.
            </div>
          </div>
        </section>

        {/* ── SECTION 5: MAP ────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿Dónde afecta más?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Índice de Kaitz departamental · 2015 (SM/salario mediano formal) · ENAHO Módulo 500
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2 relative">
              {hoveredDept && (
                <div className="absolute top-2 left-2 z-10 bg-white rounded-lg shadow-md border border-gray-100 px-3 py-2 text-xs pointer-events-none">
                  <div className="font-semibold text-gray-800">{hoveredDept.name}</div>
                  <div className="text-gray-500">
                    Exposición: <span className="font-medium" style={{ color: CAT_COLOR[hoveredDept.cat] }}>
                      {hoveredDept.cat === 'alta' ? 'Alta' : hoveredDept.cat === 'media' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    Kaitz 2015: {hoveredDept.kaitz.toFixed(2)} (SM = {Math.round(hoveredDept.kaitz * 100)}% del mediano)
                  </div>
                  {hoveredDept.note && (
                    <div className="text-gray-400 mt-1 italic">{hoveredDept.note}</div>
                  )}
                </div>
              )}
              <div style={{ background: '#E8F4F8', borderRadius: 12, overflow: 'hidden' }}>
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ scale: 1700, center: [-75.0, -9.5] }}
                  style={{ width: '100%', height: 460 }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, string> }> }) =>
                      geographies.map(geo => {
                        const code = String(geo.properties.FIRST_IDDP || '').padStart(2, '0');
                        const dept = DEPTS_KAITZ.find(d => d.code === code);
                        const cat  = dept ? kaitzCategory(dept.kaitz) : 'baja';
                        const notes: Record<string,string> = {
                          '11': 'Trabajadores agro-exportadores con salarios mensuales bajos',
                          '09': '~85% del sector formal son empleados públicos',
                        };
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={CAT_COLOR[cat]}
                            fillOpacity={0.80}
                            stroke="#fff"
                            strokeWidth={0.8}
                            style={{
                              default: { outline: 'none' },
                              hover:   { outline: 'none', fillOpacity: 1, cursor: 'pointer' },
                              pressed: { outline: 'none' },
                            }}
                            onMouseEnter={() => dept && setHoveredDept({ name: dept.name, kaitz: dept.kaitz, cat, note: notes[code] })}
                            onMouseLeave={() => setHoveredDept(null)}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                {(['alta','media','baja'] as const).map(cat => (
                  <div key={cat} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded flex-shrink-0 mt-0.5" style={{ background: CAT_COLOR[cat] }} />
                    <div className="text-xs text-gray-700">{CAT_LABEL[cat]}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  5 departamentos más expuestos (2015)
                </div>
                <div className="space-y-1">
                  {[...DEPTS_KAITZ].sort((a,b) => b.kaitz - a.kaitz).slice(0,5).map(d => (
                    <div key={d.code} className="flex justify-between text-xs">
                      <span className="text-gray-700">{d.name}</span>
                      <span className="font-mono text-gray-500">
                        {Math.round(d.kaitz*100)}%
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  <strong>Ica</strong>: Kaitz 0.93 por trabajadores agro-exportadores formales con salarios mensuales bajos a pesar de jornada completa.
                  <br />
                  <strong>Huancavelica</strong>: Kaitz 0.50 porque ~85% de sus trabajadores formales son empleados públicos con salarios por encima del mínimo.
                </p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                ENAHO 2015, Módulo 500. Trabajadores formales dependientes.
                Kaitz = SM/mediana departamental de salario mensual formal.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 6: SIMULATOR SLIDER ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Simula un nuevo aumento</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>S/1,025 (pre-2025)</span>
              <span className="font-bold text-lg" style={{ color: TERRACOTTA }}>S/{fmt(sliderValue)}</span>
              <span>S/1,500</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={1025} max={1500} step={25}
                value={sliderValue < 1025 ? 1025 : sliderValue}
                onChange={e => setSliderValue(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${TERRACOTTA} ${((Math.max(sliderValue,1025)-1025)/(1500-1025))*100}%, #e5e7eb ${((Math.max(sliderValue,1025)-1025)/(1500-1025))*100}%)`,
                  accentColor: TERRACOTTA,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              {[1025,1130,1200,1300,1500].map(v => (
                <button key={v} onClick={() => setSliderValue(v)}
                  className={`px-2 py-0.5 rounded transition-colors ${sliderValue===v ? 'text-white rounded-full' : 'hover:text-gray-600'}`}
                  style={sliderValue===v ? { background: TERRACOTTA } : {}}>
                  {v===1130 ? 'S/1,130 (vigente)' : `S/${v.toLocaleString('es-PE')}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-5 space-y-3 border border-orange-100">
            {sliderValue <= MW_VIGENTE ? (
              <p className="text-sm text-gray-700 leading-relaxed">
                Con el aumento vigente a <strong>S/1,130</strong>:
              </p>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                Si el salario mínimo sube a <strong>S/{fmt(sliderValue)}</strong>:
              </p>
            )}
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span style={{ color: TEAL }}>•</span>
                {sliderValue <= MW_VIGENTE ? (
                  <>Aproximadamente <strong>{fmt(affected)}</strong> trabajadores formales de Lima
                  Metropolitana ya recibieron un aumento directo. Mueva el deslizador para
                  simular aumentos futuros.</>
                ) : (
                  <>Aproximadamente <strong>{fmt(affected)}</strong> trabajadores formales de Lima
                  Metropolitana recibirían un aumento directo.</>
                )}
              </li>
              <li className="flex gap-2">
                <span style={{ color: TEAL }}>•</span>
                Los aumentos estudiados (2016–2022) tuvieron un Kaitz nacional de 52%–57%. Este nivel
                ({Math.round(sliderK * 100)}%) {sliderK <= 0.57 ? 'está dentro' : 'supera'} ese rango.
                El efecto sobre el empleo total no pudo identificarse con los datos disponibles.
              </li>
              {topD.length > 0 && (
                <li className="flex gap-2">
                  <span style={{ color: TEAL }}>•</span>
                  Los departamentos donde el impacto {sliderValue <= MW_VIGENTE ? 'fue' : 'sería'} mayor:{' '}
                  <strong>{topD.join(', ')}</strong>.
                </li>
              )}
            </ul>
            <div className="pt-2 border-t border-orange-200 flex gap-6 text-xs text-gray-500">
              <div>
                <span className="block font-semibold text-gray-700">SM como % del salario mediano</span>
                <span>{Math.round(sliderK * 100)}%</span>
                <span className="ml-1 text-gray-400">(estimado nacional, base mediana 2023 S/1,863)</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-700">Rango con evidencia</span>
                <span>52%–57%</span>
                <span className="ml-1 text-gray-400">(aumentos 2016–2022)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Estimación basada en la distribución salarial formal de Lima Metropolitana (EPE 2022, ~1.7 M trabajadores formales).
            La cifra nacional sería significativamente mayor. Proyección válida solo dentro del rango de Kaitz históricamente observado.
          </p>
        </section>

        {/* ── SECTION 7: LIMITS ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Los límites de la evidencia</h2>
          <p className="text-sm text-gray-500">
            ¿Se puede seguir subiendo el salario mínimo? La evidencia tiene fronteras claras.
          </p>

          {/* Thermometer */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Salario mínimo como porcentaje del salario mediano formal
            </div>
            <div className="relative h-8 rounded-full overflow-hidden"
              style={{ background: 'linear-gradient(to right, #16a34a 0%, #84cc16 35%, #f59e0b 55%, #ef4444 75%, #7f1d1d 100%)' }}>
              {[
                { label: '2016 (57%)', k: 0.567 },
                { label: '2018 (56%)', k: 0.556 },
                { label: '2022 (57%)', k: 0.569 },
                { label: '2025 (~61%)', k: 0.607 },
                ...(sliderValue !== MW_CURRENT && sliderValue > 1025 ? [{ label: `S/${fmt(sliderValue)} (${Math.round(sliderK*100)}%)`, k: sliderK }] : []),
              ].map(m => (
                <div key={m.label}
                  className="absolute top-0 bottom-0 flex flex-col items-center"
                  style={{ left: `${thermPos(m.k)}%`, transform: 'translateX(-50%)' }}>
                  <div className="w-0.5 h-full bg-white opacity-80" />
                  <div className="absolute -bottom-5 whitespace-nowrap text-xs font-medium text-gray-600"
                    style={{ fontSize: 10 }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-7">
              <span>30%</span>
              <span className="font-medium text-amber-600">Umbral de referencia internacional: 60%</span>
              <span>95%</span>
            </div>
          </div>

          {/* Scenario table — corrected Kaitz values */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="py-2 pr-3 font-medium">Escenario</th>
                  <th className="py-2 pr-3 font-medium text-right">SM</th>
                  <th className="py-2 pr-3 font-medium text-right">SM vs mediana</th>
                  <th className="py-2 font-medium">Situación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SCENARIOS.map(s => (
                  <tr key={s.label} className={s.sm === MW_CURRENT ? 'bg-amber-50' : ''}>
                    <td className="py-2 pr-3 text-gray-700 font-medium">{s.label}</td>
                    <td className="py-2 pr-3 text-right text-gray-600 font-mono">S/{s.sm.toLocaleString('es-PE')}</td>
                    <td className="py-2 pr-3 text-right text-gray-600 font-mono">{Math.round(s.kaitz*100)}%</td>
                    <td className="py-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: s.riskColor, background: s.riskColor + '18' }}>
                        {s.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key message */}
          <div className="rounded-xl p-4 border-l-4 text-sm text-gray-600 leading-relaxed bg-orange-50" style={{ borderColor: TERRACOTTA }}>
            Nuestros resultados cubren aumentos donde el salario mínimo representaba entre el 52% y el 57%
            del salario mediano formal. En ese rango, observamos redistribución salarial efectiva: 70–83% de
            los empleos afectados reaparecen por encima del nuevo piso. No pudimos medir el efecto neto sobre
            el empleo total debido a la falta de un grupo de control válido. Aumentos que lleven la proporción
            por encima del 60% entran en territorio donde la evidencia internacional sugiere mayor riesgo.
          </div>
        </section>

        {/* ── SECTION 8: HALLAZGOS SECUNDARIOS ─────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Otros hallazgos</h2>
          <p className="text-sm text-gray-500">Resultados complementarios del análisis distribucional.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compression */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#9ca3af' }} />
                <h3 className="font-bold text-gray-800 text-sm">Compresión salarial</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Los trabajadores que ganan justo por encima del mínimo ven un crecimiento salarial más
                lento que los que ganan mucho más. Entre el 41% y el 92% de esta compresión es mecánica —
                trabajadores que subieron desde debajo del mínimo al nuevo piso y ahora están en la zona
                de compresión. El resto refleja una compresión genuina de la distribución salarial.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Con controles individuales</strong> (edad, sexo, educación, sector), el coeficiente
                  de compresión es −0.045 (p&lt;0.001), confirmando que no es puramente composicional.
                </p>
              </div>
            </div>

            {/* Who's affected */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#9ca3af' }} />
                <h3 className="font-bold text-gray-800 text-sm">¿A quién afecta más?</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                El salario mínimo afecta principalmente al sector privado formal (ratio 0.83) más que al
                sector público (0.75). Por sector económico, manufactura y comercio absorben mejor los
                aumentos. No hay diferencias importantes por edad ni sexo dentro del empleo formal.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Etnicicidad y empleo formal:</strong> No hay diferencias salariales entre
                  trabajadores indígenas y no indígenas dentro del sector formal (ambos mediana S/1,400).
                  La brecha étnica opera por acceso al empleo formal: solo el 5.7% de los trabajadores
                  indígenas tienen empleo formal, frente al 20.7% de los hispanohablantes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 9: METHODOLOGY ACCORDION ─────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            className="w-full text-left px-6 py-4 flex justify-between items-center"
            onClick={() => setOpenAccordion(openAccordion === 'main' ? null : 'main')}
          >
            <h2 className="text-lg font-bold text-gray-900">Metodología</h2>
            <span className="text-gray-400 text-xl">{openAccordion === 'main' ? '−' : '+'}</span>
          </button>

          {openAccordion === 'main' && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {ACCORDION_SECTIONS.map(sec => (
                <div key={sec.id}>
                  <button
                    className="w-full text-left px-6 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => setOpenAccordion(openAccordion === sec.id ? 'main' : sec.id)}
                  >
                    <span className="text-sm font-semibold text-gray-700">{sec.title}</span>
                    <span className="text-gray-400">{openAccordion === sec.id ? '▲' : '▼'}</span>
                  </button>
                  {openAccordion === sec.id && (
                    <div className="px-6 py-4">
                      <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans">
                        {sec.content}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
        <section className="border-t border-gray-200 pt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Acceso a datos</h3>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="/assets/data/mw_complete_margins.json"
                  download
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Resultados completos (JSON)
                </a>
                <a
                  href="/assets/data/mw_falsification_audit.json"
                  download
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Auditoría de falsificación (JSON)
                </a>
                <a
                  href="/assets/data/mw_power_analysis.json"
                  download
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Bootstrap CIs (JSON)
                </a>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Fuentes y contacto</h3>
              <p className="text-xs text-gray-500">Fuente: ENAHO 2015–2023 (Módulo 500), EPE Lima. INEI.</p>
              <p className="text-xs text-gray-500">Elaboración: Qhawarina.</p>
              <p className="text-xs text-gray-500">Última actualización: Marzo 2026</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Los resultados son proyecciones basadas en evidencia de tres aumentos entre 2016 y 2022.
              No pudimos identificar el efecto neto sobre el empleo total. No constituyen predicciones
              del efecto de futuros aumentos. Las proyecciones más allá del rango observado (Kaitz &gt; 0.57)
              deben interpretarse con cautela. Los resultados no representan posición oficial del INEI,
              del BCRP, ni del gobierno del Perú.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
