'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from 'recharts';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

// ── Design tokens ──────────────────────────────────────────────────────────────
const TERRACOTTA = '#C65D3E';
const TEAL       = '#2A9D8F';
const BG         = '#FAF8F4';
const GEO_URL    = '/assets/geo/peru_departamental.geojson';
const WATERMARK  = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext transform='rotate(-45 150 150)' x='20' y='160' font-family='sans-serif' font-size='28' font-weight='700' letter-spacing='4' fill='%232D3142' opacity='0.02'%3EQHAWARINA%3C/text%3E%3C/svg%3E")`;

// ── Bunching bin data (formal-dep, delta_adj ×100, pp) ────────────────────────
const BINS_A = [{"bc":488,"delta":0.017},{"bc":512,"delta":-0.07},{"bc":538,"delta":-0.017},{"bc":562,"delta":0.066},{"bc":588,"delta":0.021},{"bc":612,"delta":-0.051},{"bc":638,"delta":0.005},{"bc":662,"delta":0.143},{"bc":688,"delta":-0.026},{"bc":712,"delta":0.015},{"bc":738,"delta":-0.051},{"bc":762,"delta":-4.641},{"bc":788,"delta":-0.13},{"bc":812,"delta":-1.727},{"bc":838,"delta":-0.204},{"bc":862,"delta":4.24},{"bc":888,"delta":-0.005},{"bc":912,"delta":-1.063},{"bc":938,"delta":0.131},{"bc":962,"delta":0.19},{"bc":988,"delta":0.134},{"bc":1012,"delta":0.026},{"bc":1038,"delta":-0.067},{"bc":1062,"delta":-0.124},{"bc":1088,"delta":-0.022},{"bc":1112,"delta":0.061},{"bc":1138,"delta":-0.2},{"bc":1162,"delta":0.022},{"bc":1188,"delta":-0.01},{"bc":1212,"delta":-0.728},{"bc":1238,"delta":-0.036},{"bc":1262,"delta":-0.12},{"bc":1288,"delta":0.095},{"bc":1312,"delta":-0.994},{"bc":1338,"delta":-0.021},{"bc":1362,"delta":-0.202},{"bc":1388,"delta":-0.292},{"bc":1412,"delta":-0.103},{"bc":1438,"delta":0.059},{"bc":1462,"delta":-0.021},{"bc":1488,"delta":-0.051},{"bc":1512,"delta":0.69},{"bc":1538,"delta":0.154},{"bc":1562,"delta":0.104},{"bc":1588,"delta":0.039},{"bc":1612,"delta":0.297},{"bc":1638,"delta":-0.114},{"bc":1662,"delta":-0.016},{"bc":1688,"delta":0.091},{"bc":1712,"delta":0.972},{"bc":1738,"delta":-0.018},{"bc":1762,"delta":0.195},{"bc":1788,"delta":0.15},{"bc":1812,"delta":-0.714},{"bc":1838,"delta":-0.026},{"bc":1862,"delta":0.131},{"bc":1888,"delta":-0.033},{"bc":1912,"delta":0.416},{"bc":1938,"delta":-0.141},{"bc":1962,"delta":0.031},{"bc":1988,"delta":0.142},{"bc":2012,"delta":0.852}];
const BINS_B = [{"bc":488,"delta":0.095},{"bc":512,"delta":-0.187},{"bc":538,"delta":0.035},{"bc":562,"delta":-0.081},{"bc":588,"delta":0.006},{"bc":612,"delta":0.22},{"bc":638,"delta":-0.038},{"bc":662,"delta":0.023},{"bc":688,"delta":0.057},{"bc":712,"delta":0.113},{"bc":738,"delta":0.046},{"bc":762,"delta":-0.197},{"bc":788,"delta":0.129},{"bc":812,"delta":-0.158},{"bc":838,"delta":-0.071},{"bc":862,"delta":-6.516},{"bc":888,"delta":-0.062},{"bc":912,"delta":-1.028},{"bc":938,"delta":5.064},{"bc":962,"delta":1.277},{"bc":988,"delta":-0.168},{"bc":1012,"delta":-0.823},{"bc":1038,"delta":-0.035},{"bc":1062,"delta":0.199},{"bc":1088,"delta":0.025},{"bc":1112,"delta":0.027},{"bc":1138,"delta":0.063},{"bc":1162,"delta":-0.08},{"bc":1188,"delta":-0.111},{"bc":1212,"delta":-0.624},{"bc":1238,"delta":0.042},{"bc":1262,"delta":-0.229},{"bc":1288,"delta":-0.173},{"bc":1312,"delta":-0.572},{"bc":1338,"delta":-0.003},{"bc":1362,"delta":0.014},{"bc":1388,"delta":0.042},{"bc":1412,"delta":-0.373},{"bc":1438,"delta":0.042},{"bc":1462,"delta":-0.02},{"bc":1488,"delta":0.001},{"bc":1512,"delta":-1.423},{"bc":1538,"delta":-0.203},{"bc":1562,"delta":-0.206},{"bc":1588,"delta":0.025},{"bc":1612,"delta":-0.515},{"bc":1638,"delta":-0.013},{"bc":1662,"delta":-0.137},{"bc":1688,"delta":-0.118},{"bc":1712,"delta":-0.849},{"bc":1738,"delta":-0.064},{"bc":1762,"delta":-0.168},{"bc":1788,"delta":-0.175},{"bc":1812,"delta":0.271},{"bc":1838,"delta":-0.045},{"bc":1862,"delta":0.037},{"bc":1888,"delta":-0.007},{"bc":1912,"delta":-0.122},{"bc":1938,"delta":-0.045},{"bc":1962,"delta":-0.038},{"bc":1988,"delta":0.026},{"bc":2012,"delta":1.166}];
const BINS_C = [{"bc":488,"delta":-0.186},{"bc":512,"delta":0.226},{"bc":538,"delta":0.063},{"bc":562,"delta":-0.095},{"bc":588,"delta":-0.024},{"bc":612,"delta":-0.056},{"bc":638,"delta":-0.072},{"bc":662,"delta":0.247},{"bc":688,"delta":-0.055},{"bc":712,"delta":0.047},{"bc":738,"delta":0.077},{"bc":762,"delta":0.011},{"bc":788,"delta":0.148},{"bc":812,"delta":0.147},{"bc":838,"delta":-0.055},{"bc":862,"delta":-0.095},{"bc":888,"delta":-0.009},{"bc":912,"delta":-0.231},{"bc":938,"delta":-8.477},{"bc":962,"delta":-2.045},{"bc":988,"delta":-0.144},{"bc":1012,"delta":-1.964},{"bc":1038,"delta":6.916},{"bc":1062,"delta":1.197},{"bc":1088,"delta":0.067},{"bc":1112,"delta":-1.201},{"bc":1138,"delta":0.615},{"bc":1162,"delta":0.878},{"bc":1188,"delta":0.195},{"bc":1212,"delta":-2.137},{"bc":1238,"delta":0.245},{"bc":1262,"delta":0.687},{"bc":1288,"delta":-0.012},{"bc":1312,"delta":-0.63},{"bc":1338,"delta":0.477},{"bc":1362,"delta":0.44},{"bc":1388,"delta":0.111},{"bc":1412,"delta":-0.503},{"bc":1438,"delta":0.059},{"bc":1462,"delta":0.315},{"bc":1488,"delta":0.055},{"bc":1512,"delta":-0.919},{"bc":1538,"delta":0.175},{"bc":1562,"delta":0.056},{"bc":1588,"delta":0.085},{"bc":1612,"delta":0.127},{"bc":1638,"delta":0.143},{"bc":1662,"delta":0.197},{"bc":1688,"delta":0.247},{"bc":1712,"delta":0.119},{"bc":1738,"delta":0.144},{"bc":1762,"delta":-0.095},{"bc":1788,"delta":0.118},{"bc":1812,"delta":0.303},{"bc":1838,"delta":0.13},{"bc":1862,"delta":0.194},{"bc":1888,"delta":0.141},{"bc":1912,"delta":0.11},{"bc":1938,"delta":0.016},{"bc":1962,"delta":0.142},{"bc":1988,"delta":0.168},{"bc":2012,"delta":0.432}];

// ── Event metadata ─────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 'A', label: '2016 (S/750→850)', mw_old: 750, mw_new: 850, pre_year: 2015, post_year: 2017,
    ratio: 0.696, missing_pp: 6.78, excess_pp: 4.72, emp_chg: 1.3, bins: BINS_A },
  { id: 'B', label: '2018 (S/850→930)', mw_old: 850, mw_new: 930, pre_year: 2017, post_year: 2019,
    ratio: 0.829, missing_pp: 8.03, excess_pp: 6.66, emp_chg: 5.6, bins: BINS_B },
  { id: 'C', label: '2022 (S/930→1,025)', mw_old: 930, mw_new: 1025, pre_year: 2021, post_year: 2023,
    ratio: 0.830, missing_pp: 13.02, excess_pp: 10.80, emp_chg: 17.2, bins: BINS_C },
];

// ── Department Kaitz (MW=930, pre-2022, ENAHO annual formal dep) ───────────────
const DEPTS_KAITZ = [
  { code:'15', name:'Lima',           kaitz:0.613, median:1516, share:0.251 },
  { code:'07', name:'Callao',         kaitz:0.628, median:1481, share:0.277 },
  { code:'20', name:'Piura',          kaitz:0.646, median:1440, share:0.192 },
  { code:'24', name:'Tumbes',         kaitz:0.632, median:1471, share:0.260 },
  { code:'14', name:'Lambayeque',     kaitz:0.631, median:1474, share:0.215 },
  { code:'13', name:'La Libertad',    kaitz:0.622, median:1494, share:0.205 },
  { code:'09', name:'Huancavelica',   kaitz:0.718, median:1295, share:0.247 },
  { code:'11', name:'Ica',            kaitz:0.608, median:1529, share:0.138 },
  { code:'22', name:'San Martin',     kaitz:0.602, median:1544, share:0.168 },
  { code:'21', name:'Puno',           kaitz:0.602, median:1546, share:0.131 },
  { code:'19', name:'Pasco',          kaitz:0.600, median:1550, share:0.141 },
  { code:'23', name:'Tacna',          kaitz:0.597, median:1558, share:0.220 },
  { code:'08', name:'Cusco',          kaitz:0.595, median:1562, share:0.155 },
  { code:'05', name:'Ayacucho',       kaitz:0.593, median:1568, share:0.112 },
  { code:'02', name:'Ancash',         kaitz:0.591, median:1575, share:0.154 },
  { code:'25', name:'Ucayali',        kaitz:0.581, median:1600, share:0.213 },
  { code:'12', name:'Junin',          kaitz:0.568, median:1639, share:0.175 },
  { code:'04', name:'Arequipa',       kaitz:0.542, median:1716, share:0.183 },
  { code:'10', name:'Huanuco',        kaitz:0.539, median:1725, share:0.167 },
  { code:'16', name:'Loreto',         kaitz:0.511, median:1819, share:0.150 },
  { code:'03', name:'Apurimac',       kaitz:0.494, median:1881, share:0.159 },
  { code:'18', name:'Moquegua',       kaitz:0.468, median:1986, share:0.120 },
  { code:'17', name:'Madre de Dios',  kaitz:0.462, median:2013, share:0.141 },
  { code:'06', name:'Cajamarca',      kaitz:0.452, median:2060, share:0.149 },
  { code:'01', name:'Amazonas',       kaitz:0.451, median:2063, share:0.130 },
];

// ── Lima formal wage percentiles (EPE 2022, n=2,737 survey obs ≈ 1.7M workers) ─
const LIMA_PERC: Record<string,number> = {
  p1:158.3, p5:480, p10:800, p15:930, p20:1016, p25:1100,
  p30:1200, p40:1500, p50:1700, p60:2000, p70:2500, p75:2800,
  p80:3000, p85:3712, p90:4519, p95:6000, p99:11256,
};
const LIMA_FORMAL_POP = 1_700_000;   // Lima Metro formal workers (expansion)
const MW_CURRENT      = 1130;         // Vigente 2025
const MW_SLIDER_BASE  = 1025;         // Pre-2025 MW — baseline for simulator

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
function workersAffected(proposedMW: number): number {
  const shareBase     = pctAtOrBelow(MW_SLIDER_BASE) / 100;
  const shareProposed = pctAtOrBelow(proposedMW) / 100;
  return Math.max(0, (shareProposed - shareBase) * LIMA_FORMAL_POP);
}
function sliderKaitz(proposedMW: number): number {
  return (proposedMW / 850) * 0.567;   // anchored to 2018 reference
}
function topDepts(proposedMW: number, n = 3): string[] {
  return DEPTS_KAITZ
    .filter(d => d.median < proposedMW * 1.3)
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
  baja:  'Baja exposición',
  media: 'Exposición media',
  alta:  'Alta exposición',
};
const CAT_COLOR: Record<string,string> = {
  alta:  '#C65D3E',
  media: '#E59959',
  baja:  '#2A9D8F',
};

const fmt = (n: number) => Math.round(n).toLocaleString('es-PE');

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 CHART — Bunching BarChart
// ─────────────────────────────────────────────────────────────────────────────
function BunchingChart({ ev }: { ev: typeof EVENTS[0] }) {
  const chartData = ev.bins.map(b => ({
    bc: b.bc,
    neg: b.delta < 0 ? b.delta : null,
    pos: b.delta >= 0 ? b.delta : null,
  }));

  return (
    <div className="space-y-3">
      {/* Annotation bar */}
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
        <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 24, left: 8 }} barCategoryGap="1%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="bc"
            tickFormatter={v => `S/${v}`}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            interval={3}
            tickLine={false}
            label={{ value: 'Salario mensual (S/)', position: 'insideBottom', offset: -12, fontSize: 11, fill: '#9ca3af' }}
          />
          <YAxis
            tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={48}
            label={{ value: 'Cambio en participación', angle: -90, position: 'insideLeft', offset: 12, fontSize: 10, fill: '#9ca3af' }}
          />
          <Tooltip
            formatter={(val: unknown) => {
              const v = typeof val === 'number' ? val : 0;
              return [`${v > 0 ? '+' : ''}${v.toFixed(2)}%`, 'Cambio en participación'] as [string, string];
            }}
            labelFormatter={(v: unknown) => `Rango S/${v}–${Number(v)+25}`}
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }}
          />
          <ReferenceLine x={ev.mw_new} stroke={TERRACOTTA} strokeWidth={2} strokeDasharray="4 2"
            label={{ value: `S/${ev.mw_new} (nuevo mínimo)`, position: 'top', fill: TERRACOTTA, fontSize: 11, fontWeight: 700 }}
          />
          <ReferenceLine x={ev.mw_old} stroke="#d1d5db" strokeWidth={1.5} strokeDasharray="3 2"
            label={{ value: `S/${ev.mw_old} (mínimo anterior)`, position: 'insideTopLeft', fill: '#9ca3af', fontSize: 10 }}
          />
          <ReferenceLine y={0} stroke="#d1d5db" strokeWidth={1} />
          <Bar dataKey="neg" name="Empleos desaparecidos" fill={TERRACOTTA} opacity={0.85} radius={[2,2,0,0]} />
          <Bar dataKey="pos" name="Empleos reaparecidos" fill={TEAL} opacity={0.85} radius={[2,2,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 text-center">
        Zona directamente afectada: S/{Math.round(0.85*ev.mw_old)}–S/{ev.mw_new} &nbsp;·&nbsp;
        Excedente esperado: S/{ev.mw_new}–S/{ev.mw_new + 200}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MWSalarioPage() {
  const [activeEvent, setActiveEvent] = useState(1);   // default: Event B (cleanest)
  const [proposedMW, setProposedMW] = useState(MW_CURRENT);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const ev = EVENTS[activeEvent];
  const affected = useMemo(() => workersAffected(proposedMW), [proposedMW]);
  const sliderK  = useMemo(() => sliderKaitz(proposedMW), [proposedMW]);
  const topD     = useMemo(() => topDepts(proposedMW), [proposedMW]);

  // Kaitz thermometer position
  const thermPos = (k: number) => Math.min(Math.max((k - 0.30) / (0.95 - 0.30) * 100, 0), 100);

  const SCENARIOS = [
    { label: '2018 (referencia)', sm: 850,  kaitz: 0.57, red_depts: 2,  risk: 'Moderado',  riskColor: '#16a34a' },
    { label: '2022',              sm: 1025, kaitz: 0.62, red_depts: 5,  risk: 'Moderado',  riskColor: '#16a34a' },
    { label: 'Actual 2025',       sm: 1130, kaitz: 0.75, red_depts: 18, risk: 'Alto',       riskColor: '#d97706' },
    { label: 'Propuesta S/1,200', sm: 1200, kaitz: 0.80, red_depts: 21, risk: 'Muy alto',   riskColor: '#dc2626' },
    { label: 'Propuesta S/1,300', sm: 1300, kaitz: 0.87, red_depts: 24, risk: 'Extremo',    riskColor: '#7f1d1d' },
  ];

  const ACCORDION_SECTIONS = [
    {
      id: 'estrategias',
      title: '8A. Estrategias de identificación',
      content: `Usamos seis estrategias complementarias:
1. Bunching salarial (Cengiz et al. 2019): ¿Se redistribuyen los empleos alrededor del nuevo piso?
2. DiD trimestral con intensidad de exposición: ¿Los departamentos más expuestos se ven más afectados?
3. Panel EPE Lima: ¿Qué pasa con trabajadores individuales cerca del mínimo?
4. DiD anual ENAHO: Robustez con datos anuales.
5. EPEN departamental: Verificación con encuesta nueva.
6. EPEN ciudades: Bunching urbano.

No todos los métodos son igual de confiables. Los resultados principales se basan en bunching (verificado con test placebo) y DiD trimestral (con test de tendencias paralelas).`,
    },
    {
      id: 'datos',
      title: '8B. Datos',
      content: `ENAHO 2015–2023 (corte transversal anual y trimestral): ~80,000 observaciones por año, 25 departamentos. Módulo 500 (Empleo).

EPE Lima Metropolitana 2016–2022: panel trimestral, ~3,000 hogares por trimestre.

EPEN Departamentos 2022–2023: ~440,000 observaciones anuales.

Variable salarial: p524a1 (ingreso mensual ocupación principal).
Formalidad: ocupinf == 2 (sector formal INEI).
Pesos: fac500a (factores de expansión ENAHO).`,
    },
    {
      id: 'especificacion',
      title: '8C. Especificación econométrica',
      content: `DiD: Y_idt = α_d + γ_t + β(Post_t × Kaitz_{d,pre}) + controles + ε_idt

Kaitz = SM_vigente / mediana_salarial_formal_departamento_pre

Errores estándar clusterizados a nivel departamento (25 clusters).

Controles: edad, edad², sexo.`,
    },
    {
      id: 'verificaciones',
      title: '8D. Verificaciones y robustez',
      content: `Test placebo: bunching en umbrales ficticios (S/1,200, S/1,500) produce ratios de 0.01–0.11, vs 0.83 en el umbral real (S/930). El patrón es específico al salario mínimo.

Test de tendencias paralelas: Evento B pasa (β pre-período ≈ 0).

Consistencia entre muestras: ratios estables en empleados formales (0.70–0.83), informales dependientes (0.99–1.19), y todos los trabajadores.

Compresión salarial: significativa en promedio (t = −6.2, p < 0.001) pero no se intensifica con el Kaitz (β = +0.05, p = 0.79), lo que sugiere un fenómeno nacional de dinámica salarial.`,
    },
  ];

  return (
    <div style={{ background: BG, backgroundImage: WATERMARK, minHeight: '100vh' }}>
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
            usando la distribución nacional de salarios y diferencias regionales en exposición al salario mínimo.
          </p>
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
            ENAHO 2015–2023 · EPE Lima · EPEN Departamentos · 6 estrategias de identificación
          </div>
        </section>

        {/* ── SECTION 2: TWO HEADLINE CARDS ───────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">Hallazgo 1</h2>
            <div className="space-y-1">
              <div className="text-7xl font-black leading-none" style={{ color: TERRACOTTA }}>83%</div>
              <p className="text-base font-semibold text-gray-800">
                de los empleos reaparece por encima del nuevo piso
              </p>
            </div>
            {/* Mini bunching chart */}
            <div className="h-32 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BINS_B} margin={{ top: 2, right: 4, bottom: 2, left: 4 }} barCategoryGap="1%">
                  <ReferenceLine x={930} stroke={TERRACOTTA} strokeWidth={2} />
                  <Bar dataKey="delta" isAnimationActive={false}>
                    {BINS_B.map((b) => (
                      <Cell key={b.bc} fill={b.delta < 0 ? TERRACOTTA : TEAL} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cuando el salario mínimo subió de S/850 a S/930, los trabajadores que
              ganaban menos del nuevo mínimo recibieron aumentos. En promedio, 83 de
              cada 100 empleos desplazados reaparecieron por encima del nuevo piso.
            </p>
            <p className="text-xs text-gray-400">
              Rojo: empleos desaparecidos bajo S/930 · Verde: empleos reaparecidos por encima ·
              Verificado con prueba de falsificación en umbrales ficticios.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-4">
            <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wide">Hallazgo 2</h2>
            <div className="space-y-1">
              <div className="text-5xl font-black leading-none" style={{ color: TEAL }}>Sin destrucción</div>
              <p className="text-base font-semibold text-gray-800">
                de empleo en ninguno de los tres aumentos
              </p>
            </div>
            <div className="h-32 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-5xl font-black text-gray-100">→→→</div>
                <div className="text-sm text-gray-400">2016 · 2018 · 2022</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              En los tres aumentos analizados no se observa destrucción de empleo
              a nivel departamental. El empleo total creció entre 1% y 6% en los
              períodos posteriores a cada aumento.
            </p>
            <p className="text-xs text-gray-400">
              Comparación entre departamentos más y menos expuestos al aumento:
              sin efecto estadístico significativo. Resultado consistente en ENAHO y EPEN.
            </p>
          </div>
        </section>

        {/* ── SECTION 3: INTERACTIVE BUNCHING CHART ────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              ¿A dónde van los empleos por debajo del nuevo mínimo?
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Redistribución salarial antes y después de cada aumento · Trabajadores formales dependientes
            </p>
          </div>

          {/* Event tabs */}
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

          {/* Summary table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="py-2 pr-4 font-medium">Evento</th>
                  <th className="py-2 pr-4 font-medium text-right">Empleos desaparecen</th>
                  <th className="py-2 pr-4 font-medium text-right">Empleos reaparecen</th>
                  <th className="py-2 pr-4 font-medium text-right">¿Cuántos regresan?</th>
                  <th className="py-2 font-medium text-right">Empleo total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {EVENTS.map(e => (
                  <tr key={e.id} className={e.id === ev.id ? 'bg-orange-50' : ''}>
                    <td className="py-2 pr-4 font-medium text-gray-700">{e.label}</td>
                    <td className="py-2 pr-4 text-right" style={{ color: TERRACOTTA }}>−{e.missing_pp.toFixed(1)}%</td>
                    <td className="py-2 pr-4 text-right" style={{ color: TEAL }}>+{e.excess_pp.toFixed(1)}%</td>
                    <td className="py-2 pr-4 text-right font-bold text-gray-800">{Math.round(e.ratio * 100)} de cada 100</td>
                    <td className="py-2 text-right text-gray-500">+{e.emp_chg.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">
            "¿Cuántos regresan?" indica cuántos de los empleos que desaparecieron por debajo del nuevo
            mínimo volvieron a aparecer por encima de él. Un valor de 100 de cada 100 sería redistribución perfecta.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 border-l-4 text-xs text-gray-500 leading-relaxed" style={{ borderColor: '#9ca3af' }}>
            <strong>Test de falsificación:</strong> el mismo método aplicado a umbrales ficticios (S/1,200, S/1,500)
            produce ratios de 0.01–0.11, confirmando que el patrón es específico al salario mínimo.
            Ratio real (2018): 0.83. Ratio placebo: 0.11 y 0.01.
          </div>
        </section>

        {/* ── SECTION 4: MAP ────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¿Dónde afecta más?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Exposición departamental al aumento de 2022 · SM/salario mediano formal (pre-2022)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="md:col-span-2">
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 1600, center: [-75.5, -9.5] }}
                style={{ width: '100%', height: 420 }}
              >
                <Geographies geography={GEO_URL}>
                  {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, string> }> }) =>
                    geographies.map(geo => {
                      const code = String(geo.properties.FIRST_IDDP || '').padStart(2, '0');
                      const dept = DEPTS_KAITZ.find(d => d.code === code);
                      const cat  = dept ? kaitzCategory(dept.kaitz) : 'baja';
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={CAT_COLOR[cat]}
                          fillOpacity={0.75}
                          stroke="#fff"
                          strokeWidth={0.8}
                          style={{
                            default: { outline: 'none' },
                            hover:   { outline: 'none', fillOpacity: 1 },
                            pressed: { outline: 'none' },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>
            <div className="space-y-4">
              {/* Legend */}
              <div className="space-y-2">
                {(['alta','media','baja'] as const).map(cat => (
                  <div key={cat} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded flex-shrink-0 mt-0.5" style={{ background: CAT_COLOR[cat] }} />
                    <div>
                      <div className="text-xs font-semibold text-gray-700">{CAT_LABEL[cat]}</div>
                      <div className="text-xs text-gray-400">
                        {cat === 'alta' && 'SM > 62% del salario mediano formal'}
                        {cat === 'media' && 'SM: 50–62% del mediano'}
                        {cat === 'baja' && 'SM < 50% del mediano'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Top 5 */}
              <div>
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  5 departamentos más expuestos
                </div>
                <div className="space-y-1">
                  {DEPTS_KAITZ.sort((a,b) => b.kaitz - a.kaitz).slice(0,5).map(d => (
                    <div key={d.code} className="flex justify-between text-xs">
                      <span className="text-gray-700">{d.name}</span>
                      <span className="font-mono text-gray-500">
                        SM = {Math.round(d.kaitz*100)}% del mediano
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Datos pre-2022 (ENAHO 2021). Formalidad: ocupinf == 2.
                Mediana departamental de salario mensual en ocupación principal.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 5: SIMULATOR SLIDER ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8">
          <h2 className="text-2xl font-bold text-gray-900">Simula un nuevo aumento</h2>

          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>S/1,025 (pre-2025)</span>
              <span className="font-bold text-lg" style={{ color: TERRACOTTA }}>S/{fmt(proposedMW)}</span>
              <span>S/1,500</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={1025} max={1500} step={25}
                value={proposedMW}
                onChange={e => setProposedMW(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${TERRACOTTA} ${((proposedMW-1025)/(1500-1025))*100}%, #e5e7eb ${((proposedMW-1025)/(1500-1025))*100}%)`,
                  accentColor: TERRACOTTA,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              {[1025,1130,1200,1300,1500].map(v => (
                <button key={v} onClick={() => setProposedMW(v)}
                  className={`px-2 py-0.5 rounded transition-colors ${proposedMW===v ? 'text-white rounded-full' : 'hover:text-gray-600'}`}
                  style={proposedMW===v ? { background: TERRACOTTA } : {}}>
                  {v===1130 ? 'S/1,130 (vigente)' : `S/${v.toLocaleString('es-PE')}`}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic paragraph */}
          <div className="bg-orange-50 rounded-xl p-5 space-y-3 border border-orange-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              Si el salario mínimo sube a <strong>S/{fmt(proposedMW)}</strong>:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span style={{ color: TEAL }}>•</span>
                Aproximadamente <strong>{fmt(affected)}</strong> trabajadores formales de Lima
                Metropolitana recibirían un aumento directo
                {affected === 0 ? ' (todos están por encima de S/1,025 en esta estimación)' : ''}.
              </li>
              <li className="flex gap-2">
                <span style={{ color: TEAL }}>•</span>
                Basado en la evidencia de tres aumentos (2016–2022), no se esperaría destrucción
                de empleo agregado <em>dentro del rango estudiado</em>.
              </li>
              {topD.length > 0 && (
                <li className="flex gap-2">
                  <span style={{ color: TEAL }}>•</span>
                  Los departamentos donde el impacto sería mayor:{' '}
                  <strong>{topD.join(', ')}</strong>.
                </li>
              )}
            </ul>
            <div className="pt-2 border-t border-orange-200 flex gap-6 text-xs text-gray-500">
              <div>
                <span className="block font-semibold text-gray-700">SM como % del salario mediano</span>
                <span>{Math.round(sliderK * 100)}%</span>
                <span className="ml-1 text-gray-400">(estimado a nivel nacional)</span>
              </div>
              <div>
                <span className="block font-semibold text-gray-700">Rango con evidencia</span>
                <span>54%–62%</span>
                <span className="ml-1 text-gray-400">(aumentos 2016–2022)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Estimación basada en la distribución salarial formal de Lima Metropolitana (EPE 2022, ~1.7 M trabajadores formales).
            La cifra nacional sería significativamente mayor. Proyección válida solo dentro del rango de Kaitz históricamente observado.
          </p>
        </section>

        {/* ── SECTION 6: LIMITS ─────────────────────────────────────────────────── */}
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
                { label: 'Perú 2018 (57%)', k: 0.57 },
                { label: 'Perú 2022 (62%)', k: 0.62 },
                { label: 'Perú 2025 (75%)', k: 0.75 },
                ...(proposedMW !== MW_CURRENT ? [{ label: `S/${fmt(proposedMW)} (${Math.round(sliderK*100)}%)`, k: sliderK }] : []),
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

          {/* Scenario table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="py-2 pr-3 font-medium">Escenario</th>
                  <th className="py-2 pr-3 font-medium text-right">SM</th>
                  <th className="py-2 pr-3 font-medium text-right">SM vs mediana</th>
                  <th className="py-2 pr-3 font-medium text-right">Dptos en zona límite</th>
                  <th className="py-2 font-medium">Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {SCENARIOS.map(s => (
                  <tr key={s.label} className={s.sm === MW_CURRENT ? 'bg-amber-50' : ''}>
                    <td className="py-2 pr-3 text-gray-700 font-medium">{s.label}</td>
                    <td className="py-2 pr-3 text-right text-gray-600 font-mono">S/{s.sm.toLocaleString('es-PE')}</td>
                    <td className="py-2 pr-3 text-right text-gray-600 font-mono">{Math.round(s.kaitz*100)}%</td>
                    <td className="py-2 pr-3 text-right text-gray-500">{s.red_depts}/25</td>
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
          <div className="rounded-xl p-4 border-l-4 text-sm text-gray-600 leading-relaxed bg-orange-50 border-orange-300">
            Nuestros resultados cubren aumentos donde el salario mínimo representaba entre el 54% y el 62%
            del salario mediano formal. En ese rango, no encontramos destrucción de empleo y sí redistribución
            salarial efectiva. El aumento de 2025 llevó la proporción a ~75% — un nivel sin precedente en nuestra
            evidencia. Aumentos adicionales entran en territorio donde no podemos predecir los efectos con confianza.
          </div>
        </section>

        {/* ── SECTION 7: SECONDARY FINDINGS ────────────────────────────────────── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Otros hallazgos</h2>
          <p className="text-sm text-gray-500">Resultados que requieren más investigación antes de ser titulares.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Compression */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#9ca3af' }} />
                <h3 className="font-bold text-gray-800 text-sm">Compresión salarial</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Los trabajadores que ganan justo por encima del mínimo ven un crecimiento
                salarial más lento — unos 3 puntos porcentuales menos — que los que ganan
                significativamente más. El patrón aparece en los tres eventos.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Nota:</strong> Este efecto no se intensifica en los departamentos donde el
                  salario mínimo pesa más sobre el salario mediano, lo que sugiere que es un fenómeno
                  nacional de dinámica salarial, no un efecto causal directo del aumento.
                </p>
              </div>
            </div>

            {/* Formalization */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#9ca3af' }} />
                <h3 className="font-bold text-gray-800 text-sm">Formalización regional</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                En el análisis trimestral, los departamentos más expuestos al aumento muestran
                un leve incremento en la proporción de trabajadores formales (+1.5 puntos
                porcentuales en promedio).
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-200">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Nota:</strong> Este resultado aparece en solo uno de los seis métodos
                  de análisis utilizados. No se confirma en los datos anuales ni en el análisis
                  de redistribución salarial por sector.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 8: METHODOLOGY ACCORDION ─────────────────────────────────── */}
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

        {/* ── SECTION 9: FOOTER ─────────────────────────────────────────────────── */}
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
                  href="/assets/data/mw_sanity_checks.json"
                  download
                  className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors"
                >
                  Verificaciones (JSON)
                </a>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Fuentes y contacto</h3>
              <p className="text-xs text-gray-500">Fuente: ENAHO 2015–2023, EPE Lima, EPEN. INEI.</p>
              <p className="text-xs text-gray-500">Elaboración: Qhawarina.</p>
              <p className="text-xs text-gray-500">Última actualización: Marzo 2026</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Los resultados son proyecciones basadas en evidencia de tres aumentos del salario mínimo entre
              2016 y 2022. No constituyen predicciones del efecto de futuros aumentos. Las proyecciones más
              allá del rango observado (Kaitz &gt; 0.62) deben interpretarse con extrema cautela.
              Los resultados no representan posición oficial del INEI, del BCRP, ni del gobierno del Perú.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
