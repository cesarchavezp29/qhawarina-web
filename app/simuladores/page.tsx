'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import ImpactCard from '../components/ImpactCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine,
} from 'recharts';
import {
  CHART_COLORS,
  CHART_DEFAULTS,
  tooltipContentStyle,
  axisTickStyle,
} from '../lib/chartTheme';

// ── Types ──────────────────────────────────────────────────────────────────
interface GDPData  { nowcast: { value: number; target_period: string } }
interface InflData { nowcast: { value: number; target_period: string }; backtest_metrics: { rmse: number } }
interface PovData  {
  metadata: { target_year: number };
  departments: Array<{ code: string; name: string; poverty_rate_2025_nowcast: number; poverty_rate_2024: number; change_pp: number }>;
}

interface Shock { id: string; type: string; magnitude: number }

const SHOCK_TYPES = {
  commodity:     { name: 'Commodities',           name_en: 'Commodities',           unit: '% cambio', default: -10, min: -50, max: 50 },
  fx:            { name: 'Tipo de Cambio',         name_en: 'Exchange Rate',         unit: '% deprec.', default: 10, min: -20, max: 30 },
  political:     { name: 'Inestabilidad Política', name_en: 'Political Instability', unit: 'σ',         default: 1.5, min: -2, max: 3 },
  interest_rate: { name: 'Tasa BCRP',             name_en: 'BCRP Rate',             unit: 'bp',        default: 50, min: -200, max: 200 },
  china:         { name: 'PIB China',              name_en: 'China GDP',             unit: 'pp',        default: -1, min: -5, max: 3 },
};

const CATEGORIES: Record<string, string> = {
  all: 'Todos los productos', food: 'Alimentos',
  arroz_cereales: 'Arroz y Cereales', carnes: 'Carnes',
  lacteos: 'Lácteos y Huevos', frutas: 'Frutas', verduras: 'Verduras',
  limpieza: 'Limpieza', cuidado_personal: 'Cuidado Personal',
};

const CATEGORIES_EN: Record<string, string> = {
  all: 'All products', food: 'Food',
  arroz_cereales: 'Rice & Cereals', carnes: 'Meat',
  lacteos: 'Dairy & Eggs', frutas: 'Fruits', verduras: 'Vegetables',
  limpieza: 'Cleaning', cuidado_personal: 'Personal Care',
};

const CATEGORY_MULT: Record<string, number> = {
  all: 1.0, food: 1.15, arroz_cereales: 0.9, carnes: 1.2,
  lacteos: 0.95, frutas: 1.3, verduras: 1.4, limpieza: 0.8, cuidado_personal: 0.75,
};

const DEPT_POP: Record<string, number> = {
  Lima: 10500000, Ayacucho: 700000, Cusco: 1300000, Arequipa: 1400000,
  Piura: 2000000, Huancavelica: 500000, Cajamarca: 1500000,
  'La Libertad': 1900000, Puno: 1400000, Junín: 1400000, Ancash: 1200000,
  Lambayeque: 1300000, Loreto: 1000000, 'San Martín': 900000, Ica: 900000,
  Huánuco: 900000, Ucayali: 600000, Apurímac: 500000, Pasco: 300000,
  Amazonas: 400000, Tumbes: 250000, Tacna: 350000, Moquegua: 200000,
  'Madre de Dios': 150000, Callao: 1100000,
};

// ── Main component ─────────────────────────────────────────────────────────
export default function SimuladoresPage() {
  const isEn = useLocale() === 'en';
  const [tab, setTab] = useState<'pbi' | 'inflacion' | 'pobreza'>('pbi');
  const [gdpData,  setGdpData]  = useState<GDPData | null>(null);
  const [inflData, setInflData] = useState<InflData | null>(null);
  const [povData,  setPovData]  = useState<PovData  | null>(null);

  useEffect(() => {
    const base = '/assets/data';
    fetch(`${base}/gdp_nowcast.json`).then(r => r.json()).then(setGdpData).catch(() => {});
    fetch(`${base}/inflation_nowcast.json`).then(r => r.json()).then(setInflData).catch(() => {});
    fetch(`${base}/poverty_nowcast.json`).then(r => r.json()).then(setPovData).catch(() => {});
  }, []);

  const TABS = isEn ? [
    { key: 'pbi'       as const, label: 'GDP — Shock Simulator' },
    { key: 'inflacion' as const, label: 'Inflation Calculator' },
    { key: 'pobreza'   as const, label: 'Poverty Projections' },
  ] : [
    { key: 'pbi'       as const, label: 'PBI — Simulador de Shocks' },
    { key: 'inflacion' as const, label: 'Calculadora de Inflación' },
    { key: 'pobreza'   as const, label: 'Proyecciones de Pobreza' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">
            {isEn ? 'Simulators' : 'Simuladores'}
          </h1>
          <p className="text-sm text-gray-600">
            {isEn
              ? "Interactive tools based on Qhawarina's nowcast models. Base values come from the latest model estimates."
              : "Herramientas interactivas basadas en los modelos de nowcast de Qhawarina. Los valores base provienen de las estimaciones más recientes del modelo."}
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-gray-300 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={tab === key
                ? { borderColor: CHART_COLORS.terra, color: CHART_COLORS.terra }
                : { borderColor: 'transparent', color: CHART_COLORS.ink3 }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'pbi'       && <GDPSimulator       gdpData={gdpData} />}
        {tab === 'inflacion' && <InflacionCalc       inflData={inflData} />}
        {tab === 'pobreza'   && <PobrezaProyecciones povData={povData} />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — GDP Shock Builder
// ══════════════════════════════════════════════════════════════════════════
function GDPSimulator({ gdpData }: { gdpData: GDPData | null }) {
  const isEn = useLocale() === 'en';
  const baselineGDP = gdpData?.nowcast.value ?? 2.8;
  const [baselineInflation, setBaselineInflation] = useState(2.3);
  const [shocks, setShocks]       = useState<Shock[]>([]);
  const [newShockType, setNewShockType]           = useState('commodity');
  const [newShockMag,  setNewShockMag]            = useState(-10);
  const [results, setResults]     = useState<any>(null);

  const shockName = (type: string) => {
    const st = SHOCK_TYPES[type as keyof typeof SHOCK_TYPES];
    return isEn ? st.name_en : st.name;
  };

  const addShock = () => {
    setShocks(prev => [...prev, { id: Date.now().toString(), type: newShockType, magnitude: newShockMag }]);
    setResults(null);
  };
  const removeShock = (id: string) => { setShocks(prev => prev.filter(s => s.id !== id)); setResults(null); };

  const calculate = () => {
    const impacts = shocks.map(s => {
      let g = 0, inf = 0;
      switch (s.type) {
        case 'commodity':     g =  0.15 * (s.magnitude / 10); inf =  0.08 * (s.magnitude / 10); break;
        case 'fx':            g = -0.12 * (s.magnitude / 10); inf =  0.25 * (s.magnitude / 10); break;
        case 'political':     g = -0.10 *  s.magnitude;       inf =  0.05 *  s.magnitude;       break;
        case 'interest_rate': g = -0.20 * (s.magnitude / 100);inf = -0.15 * (s.magnitude / 100);break;
        case 'china':         g = -1.50 *  s.magnitude;       inf = -0.80 *  s.magnitude;       break;
      }
      return { shockType: shockName(s.type), magnitude: s.magnitude, gdpImpact: g, inflationImpact: inf };
    });
    const tg = impacts.reduce((a, i) => a + i.gdpImpact, 0);
    const ti = impacts.reduce((a, i) => a + i.inflationImpact, 0);
    setResults({
      baseline_gdp: baselineGDP, baseline_inflation: baselineInflation,
      shocked_gdp: baselineGDP + tg, shocked_inflation: baselineInflation + ti,
      total_gdp_impact: tg, total_inflation_impact: ti, shocks: impacts,
    });
  };

  const chartData = results ? [
    { name: isEn ? 'Baseline' : 'Escenario Base', GDP: results.baseline_gdp, Inflation: results.baseline_inflation },
    { name: isEn ? 'With Shocks' : 'Con Shocks',  GDP: results.shocked_gdp,  Inflation: results.shocked_inflation },
  ] : [];

  const interpretation = () => {
    if (!results) return '';
    const g = results.total_gdp_impact, inf = results.total_inflation_impact;
    if (isEn) {
      if (g < -2 && inf > 1) return 'Stagflation: severe GDP drop with simultaneous inflationary pressure.';
      if (g < -1) return `Moderate recession: GDP falls ${Math.abs(g).toFixed(2)}pp. Watch employment and poverty.`;
      if (g > 1)  return `Economic expansion: GDP rises ${g.toFixed(2)}pp. Overheating risk if inflation > 3%.`;
      return 'Moderate impact. The scenario remains close to baseline.';
    } else {
      if (g < -2 && inf > 1) return 'Estanflación: caída severa del PBI con presión inflacionaria simultánea.';
      if (g < -1) return `Recesión moderada: el PBI cae ${Math.abs(g).toFixed(2)}pp. Atención a empleo y pobreza.`;
      if (g > 1)  return `Expansión económica: el PBI sube ${g.toFixed(2)}pp. Riesgo de sobrecalentamiento si inflación > 3%.`;
      return 'Impacto moderado. El escenario permanece cercano al baseline.';
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">{isEn ? 'Base Parameters' : 'Parámetros Base'}</h2>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'GDP Nowcast (model)' : 'PBI Nowcast (modelo)'} — {gdpData?.nowcast.target_period ?? '…'}
            </label>
            <div className="text-2xl font-bold" style={{ color: CHART_COLORS.teal }}>{baselineGDP.toFixed(2)}%</div>
            <p className="text-xs text-gray-400 mt-1">
              {isEn ? 'Real DFM model estimate' : 'Estimación real del modelo DFM'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'Assumed baseline inflation (%)' : 'Inflación base asumida (%)'}
            </label>
            <input
              type="number" step="0.1" value={baselineInflation}
              onChange={e => setBaselineInflation(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">{isEn ? 'Add Shock' : 'Agregar Shock'}</h2>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">{isEn ? 'Type' : 'Tipo'}</label>
            <select
              value={newShockType}
              onChange={e => { setNewShockType(e.target.value); setNewShockMag(SHOCK_TYPES[e.target.value as keyof typeof SHOCK_TYPES].default); }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {Object.entries(SHOCK_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{isEn ? v.name_en : v.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'Magnitude' : 'Magnitud'} ({SHOCK_TYPES[newShockType as keyof typeof SHOCK_TYPES].unit})
            </label>
            <input
              type="number" step="0.5" value={newShockMag}
              min={SHOCK_TYPES[newShockType as keyof typeof SHOCK_TYPES].min}
              max={SHOCK_TYPES[newShockType as keyof typeof SHOCK_TYPES].max}
              onChange={e => setNewShockMag(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <button onClick={addShock} className="w-full bg-gray-800 text-white py-2 text-sm font-medium hover:bg-gray-700">
            {isEn ? '+ Add Shock' : '+ Agregar Shock'}
          </button>
        </div>

        {shocks.length > 0 && (
          <div className="bg-white border border-gray-300 p-6">
            <h3 className="text-sm font-semibold mb-3">{isEn ? 'Active shocks' : 'Shocks activos'}</h3>
            <div className="space-y-2">
              {shocks.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 border border-gray-200">
                  <span className="font-medium">{shockName(s.type)}</span>
                  <span className="text-gray-600">{s.magnitude > 0 ? '+' : ''}{s.magnitude} {SHOCK_TYPES[s.type as keyof typeof SHOCK_TYPES].unit}</span>
                  <button onClick={() => removeShock(s.id)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={calculate}
              disabled={shocks.length === 0}
              className="w-full mt-4 text-white py-2.5 text-sm font-medium disabled:opacity-40"
              style={{ backgroundColor: CHART_COLORS.terra }}
            >
              {isEn ? 'Calculate Impact' : 'Calcular Impacto'}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">⚡</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {isEn ? 'Add shocks and calculate impact' : 'Agrega shocks y calcula el impacto'}
            </h3>
            <p className="text-sm text-gray-500">
              {isEn
                ? 'Semi-elasticities calibrated on BCRP and INEI historical data (2004–2024).'
                : 'Semi-elasticidades calibradas sobre datos históricos del BCRP e INEI (2004–2024).'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title={isEn ? "GDP with Shocks" : "PBI con Shocks"} value={`${results.shocked_gdp.toFixed(2)}%`}
                change={results.total_gdp_impact} variant={results.total_gdp_impact < 0 ? 'danger' : 'success'}
                trend={results.total_gdp_impact < 0 ? 'down' : 'up'} description={isEn ? "Projected growth" : "Crecimiento proyectado"} />
              <ImpactCard title={isEn ? "Inflation with Shocks" : "Inflación con Shocks"} value={`${results.shocked_inflation.toFixed(2)}%`}
                change={results.total_inflation_impact} variant={results.total_inflation_impact > 0 ? 'warning' : 'success'}
                trend={results.total_inflation_impact > 0 ? 'up' : 'down'} description={isEn ? "Inflationary pressure" : "Presión inflacionaria"} />
              <ImpactCard title={isEn ? "GDP Impact" : "Impacto en PBI"} value={`${results.total_gdp_impact > 0 ? '+' : ''}${results.total_gdp_impact.toFixed(2)}pp`}
                variant={results.total_gdp_impact < 0 ? 'danger' : 'success'} description={isEn ? "vs baseline nowcast" : "vs baseline nowcast"} />
              <ImpactCard title={isEn ? "Inflation Impact" : "Impacto en Inflación"} value={`${results.total_inflation_impact > 0 ? '+' : ''}${results.total_inflation_impact.toFixed(2)}pp`}
                variant={results.total_inflation_impact > 0 ? 'warning' : 'success'} description={isEn ? "vs baseline inflation" : "vs inflación base"} />
            </div>

            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                {isEn ? 'Baseline vs Shocked Scenario' : 'Base vs Escenario con Shocks'}
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                  <XAxis dataKey="name" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                  <YAxis tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v: any) => `${Number(v).toFixed(2)}%`} />
                  <Legend wrapperStyle={{ fontSize: CHART_DEFAULTS.axisFontSize, fontFamily: CHART_DEFAULTS.axisFontFamily }} />
                  <Bar dataKey="GDP" fill={CHART_COLORS.teal} name={isEn ? "GDP (%)" : "PBI (%)"} />
                  <Bar dataKey="Inflation" fill={CHART_COLORS.terra} name={isEn ? "Inflation (%)" : "Inflación (%)"} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isEn ? 'Breakdown by shock' : 'Descomposición por shock'}
              </h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Shock</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">{isEn ? 'Magnitude' : 'Magnitud'}</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Δ {isEn ? 'GDP' : 'PBI'}</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Δ {isEn ? 'Inflation' : 'Inflación'}</th>
                </tr></thead>
                <tbody>
                  {results.shocks.map((s: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{s.shockType}</td>
                      <td className="py-2 text-right text-gray-600">{s.magnitude}</td>
                      <td className={`py-2 text-right font-medium ${s.gdpImpact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {s.gdpImpact > 0 ? '+' : ''}{s.gdpImpact.toFixed(2)}pp
                      </td>
                      <td className={`py-2 text-right font-medium ${s.inflationImpact > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {s.inflationImpact > 0 ? '+' : ''}{s.inflationImpact.toFixed(2)}pp
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border p-4 text-sm" style={results.total_gdp_impact < -1 ? { background: '#fdf2f2', borderColor: CHART_COLORS.red, color: CHART_COLORS.red } : results.total_gdp_impact > 1 ? { background: '#f0faf8', borderColor: CHART_COLORS.teal, color: CHART_COLORS.teal } : { background: CHART_COLORS.surface, borderColor: CHART_DEFAULTS.gridStroke, color: CHART_COLORS.ink }}>
              <strong>{isEn ? 'Interpretation: ' : 'Interpretación: '}</strong>{interpretation()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — Inflation Calculator
// ══════════════════════════════════════════════════════════════════════════
function InflacionCalc({ inflData }: { inflData: InflData | null }) {
  const isEn = useLocale() === 'en';
  const baseMonthlyRate = inflData?.nowcast.value ?? 0.2;
  const [amount, setAmount]       = useState(1000);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate]     = useState(() => new Date().toISOString().slice(0, 10));
  const [category, setCategory]   = useState('all');
  const [results, setResults]     = useState<any>(null);
  const [loading, setLoading]     = useState(false);

  const cats = isEn ? CATEGORIES_EN : CATEGORIES;

  const calculate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const days = Math.max(1, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000));
    const months = days / 30.44;
    const mult = CATEGORY_MULT[category] ?? 1.0;
    const accumulated = baseMonthlyRate * months * mult;
    const equivalent = amount * (1 + accumulated / 100);
    setResults({ amount, startDate, endDate, days, accumulated, equivalent, loss: equivalent - amount, category });
    setLoading(false);
  };

  const chartData = results ? (() => {
    const pts = [];
    const steps = Math.min(results.days, 36);
    for (let i = 0; i <= steps; i++) {
      pts.push({
        day: i,
        index: 100 + (results.accumulated * (i / results.days)),
        date: new Date(new Date(startDate).getTime() + (i / steps) * results.days * 86400000)
          .toLocaleDateString(isEn ? 'en-US' : 'es-PE', { month: 'short', year: '2-digit' }),
      });
    }
    return pts;
  })() : [];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-300 p-6 sticky top-24 space-y-5">
          <h2 className="text-base font-semibold">{isEn ? 'Parameters' : 'Parámetros'}</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'Amount (PEN)' : 'Monto (S/)'}
            </label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'Start date' : 'Fecha inicial'}
            </label>
            <input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'End date' : 'Fecha final'}
            </label>
            <input type="date" value={endDate} min={startDate} max="2027-12-31" onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{isEn ? 'Category' : 'Categoría'}</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              {Object.entries(cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <button onClick={calculate} disabled={loading}
            className="w-full text-white py-2.5 text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: CHART_COLORS.terra }}>
            {loading ? (isEn ? 'Calculating…' : 'Calculando…') : (isEn ? 'Calculate' : 'Calcular')}
          </button>

          {inflData && (
            <div className="p-3 text-xs rounded" style={{ background: CHART_COLORS.surface, borderLeft: `3px solid ${CHART_COLORS.terra}`, color: CHART_COLORS.ink }}>
              {isEn ? 'Base rate:' : 'Tasa base:'} <strong>{baseMonthlyRate.toFixed(3)}%/{isEn ? 'mo' : 'mes'}</strong> (DFM nowcast, {inflData.nowcast.target_period})
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">S/</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {isEn ? 'Enter amount and dates' : 'Ingresa monto y fechas'}
            </h3>
            <p className="text-sm text-gray-500">
              {isEn
                ? 'Find out how much purchasing power you have lost to inflation'
                : 'Descubre cuánto poder adquisitivo has perdido por la inflación'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title={isEn ? "Original Amount" : "Monto Original"}
                value={`S/ ${results.amount.toFixed(2)}`}
                description={`${isEn ? 'Date' : 'Fecha'}: ${new Date(results.startDate).toLocaleDateString(isEn ? 'en-US' : 'es-PE')}`} />
              <ImpactCard title={isEn ? "Equivalent Today" : "Equivalente Hoy"}
                value={`S/ ${results.equivalent.toFixed(2)}`}
                change={results.accumulated} variant={results.accumulated > 0 ? 'danger' : 'success'}
                trend={results.accumulated > 0 ? 'up' : 'down'}
                description={`${isEn ? 'Date' : 'Fecha'}: ${new Date(results.endDate).toLocaleDateString(isEn ? 'en-US' : 'es-PE')}`} />
              <ImpactCard title={isEn ? "Purchasing Power Change" : "Cambio en Poder Adquisitivo"}
                value={`S/ ${results.loss.toFixed(2)}`}
                variant={results.loss > 0 ? 'danger' : 'success'}
                description={results.loss > 0
                  ? (isEn ? 'Loss of purchasing power' : 'Pérdida de poder adquisitivo')
                  : (isEn ? 'Gain (deflation)' : 'Ganancia (deflación)')} />
              <ImpactCard title={isEn ? "Cumulative Inflation" : "Inflación Acumulada"}
                value={`${results.accumulated.toFixed(2)}%`}
                variant={results.accumulated > 0 ? 'warning' : 'success'}
                description={`${isEn ? 'In' : 'En'} ${results.days} ${isEn ? 'days' : 'días'} · ${cats[results.category]}`} />
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isEn ? 'Price Index Evolution' : 'Evolución del Índice de Precios'}
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                  <XAxis dataKey="date" tick={axisTickStyle} interval="preserveStartEnd" stroke={CHART_DEFAULTS.axisStroke} />
                  <YAxis domain={['auto', 'auto']} tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v: any) => `${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="index" stroke={CHART_COLORS.terra} strokeWidth={2} name={isEn ? "Index (base=100)" : "Índice (base=100)"} dot={false} />
                  <ReferenceLine y={100} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 4" label={{ value: isEn ? 'Base' : 'Base', fontSize: CHART_DEFAULTS.axisFontSize }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`border p-4 text-sm ${results.accumulated > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
              {results.accumulated > 0 ? (
                isEn
                  ? <>Prices rose <strong>{results.accumulated.toFixed(2)}%</strong> in {results.days} days. For the same purchasing power you would need <strong>S/ {results.equivalent.toFixed(2)}</strong> today instead of S/ {results.amount.toFixed(2)}.</>
                  : <>Los precios subieron <strong>{results.accumulated.toFixed(2)}%</strong> en {results.days} días. Para el mismo poder adquisitivo necesitarías <strong>S/ {results.equivalent.toFixed(2)}</strong> hoy en lugar de S/ {results.amount.toFixed(2)}.</>
              ) : (
                isEn
                  ? <>Prices fell <strong>{Math.abs(results.accumulated).toFixed(2)}%</strong>. You can buy more with S/ {results.amount.toFixed(2)} today.</>
                  : <>Los precios bajaron <strong>{Math.abs(results.accumulated).toFixed(2)}%</strong>. Puedes comprar más con S/ {results.amount.toFixed(2)} hoy.</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — Poverty Projections
// ══════════════════════════════════════════════════════════════════════════
function PobrezaProyecciones({ povData }: { povData: PovData | null }) {
  const isEn = useLocale() === 'en';
  const [dept, setDept]         = useState('Ayacucho');
  const [scenario, setScenario] = useState<'baseline' | 'optimistic' | 'pessimistic'>('baseline');
  const [results, setResults]   = useState<any>(null);
  const [loading, setLoading]   = useState(false);

  const deptData    = povData?.departments.find(d => d.name === dept);
  const baseRate    = deptData?.poverty_rate_2025_nowcast ?? 24.5;
  const pop         = DEPT_POP[dept] ?? 1000000;

  const forecast = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    let rate = baseRate, ciLow = baseRate - 1.8, ciHigh = baseRate + 1.8;
    if (scenario === 'optimistic')  { rate = baseRate - 2.0; ciLow = rate - 1.5; ciHigh = rate + 1.5; }
    if (scenario === 'pessimistic') { rate = baseRate + 2.5; ciLow = rate - 2.0; ciHigh = rate + 2.0; }
    setResults({
      dept, scenario, poverty_rate: rate, baseline: baseRate,
      change: rate - baseRate, pop,
      people: Math.round((rate / 100) * pop),
      ci_low: Math.max(0, ciLow), ci_high: Math.min(100, ciHigh),
    });
    setLoading(false);
  };

  const scenarioLabel = (s: string) => {
    if (isEn) return s === 'optimistic' ? 'Optimistic' : s === 'pessimistic' ? 'Pessimistic' : 'Baseline';
    return s === 'optimistic' ? 'Optimista' : s === 'pessimistic' ? 'Pesimista' : 'Base';
  };

  const barData = results ? [
    { name: isEn ? 'Nowcast 2025' : 'Nowcast 2025', rate: results.baseline },
    { name: isEn ? 'Projection' : 'Proyección', rate: results.poverty_rate },
  ] : [];

  const barColor = scenario === 'optimistic' ? CHART_COLORS.teal : scenario === 'pessimistic' ? CHART_COLORS.red : CHART_COLORS.amber;

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-300 p-6 sticky top-24 space-y-5">
          <h2 className="text-base font-semibold">{isEn ? 'Configuration' : 'Configuración'}</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {isEn ? 'Department' : 'Departamento'}
            </label>
            {povData ? (
              <select value={dept} onChange={e => { setDept(e.target.value); setResults(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                {povData.departments.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
              </select>
            ) : (
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            )}
            <p className="text-xs text-gray-400 mt-1">~{(pop / 1e6).toFixed(1)}M {isEn ? 'inhabitants' : 'habitantes'}</p>
          </div>

          {/* Real rate from model */}
          <div className="p-3 bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">
              {isEn ? 'Nowcast 2025 (real model)' : 'Nowcast 2025 (modelo real)'}
            </div>
            <div className="text-2xl font-bold text-gray-900">{baseRate.toFixed(1)}%</div>
            {deptData && (
              <div className="text-xs text-gray-400 mt-1">
                2024: {deptData.poverty_rate_2024.toFixed(1)}% →{' '}
                <span className={deptData.change_pp < 0 ? 'text-green-600' : 'text-red-600'}>
                  {deptData.change_pp > 0 ? '+' : ''}{deptData.change_pp.toFixed(1)}pp
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">{isEn ? 'Scenario' : 'Escenario'}</label>
            <div className="space-y-2">
              {(isEn ? [
                { v: 'optimistic',  l: 'Optimistic', d: 'Strong growth, social programs' },
                { v: 'baseline',    l: 'Baseline',    d: 'Current trend continues' },
                { v: 'pessimistic', l: 'Pessimistic', d: 'Negative shocks (commodity, FX)' },
              ] : [
                { v: 'optimistic',  l: 'Optimista',  d: 'Crecimiento fuerte, programas sociales' },
                { v: 'baseline',    l: 'Base',        d: 'Tendencia actual continúa' },
                { v: 'pessimistic', l: 'Pesimista',   d: 'Shocks negativos (commodity, FX)' },
              ]).map(({ v, l, d }) => (
                <label key={v} className="flex items-start cursor-pointer">
                  <input type="radio" name="sc" value={v} checked={scenario === v}
                    onChange={e => { setScenario(e.target.value as any); setResults(null); }}
                    className="mt-1 mr-2" />
                  <div><div className="text-sm font-medium text-gray-900">{l}</div><div className="text-xs text-gray-500">{d}</div></div>
                </label>
              ))}
            </div>
          </div>

          <button onClick={forecast} disabled={loading || !povData}
            className="w-full text-white py-2.5 text-sm font-medium disabled:opacity-40"
            style={{ backgroundColor: CHART_COLORS.terra }}>
            {loading ? (isEn ? 'Calculating…' : 'Calculando…') : (isEn ? 'Generate Projection' : 'Generar Proyección')}
          </button>

          {povData && (
            <div className="p-3 text-xs rounded" style={{ background: CHART_COLORS.surface, borderLeft: `3px solid ${CHART_COLORS.terra}`, color: CHART_COLORS.ink }}>
              GBR · {povData.metadata.target_year} · {isEn ? 'Real nowcast rates' : 'Tasas reales del nowcast'}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">📊</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">
              {isEn ? 'Select department and scenario' : 'Selecciona departamento y escenario'}
            </h3>
            <p className="text-sm text-gray-500">
              {isEn ? 'Projections based on the real GBR model nowcast' : 'Proyecciones basadas en el nowcast real del modelo GBR'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {isEn ? 'Projection —' : 'Proyección —'} {results.dept}
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title={isEn ? "Projected Rate" : "Tasa Proyectada"} value={`${results.poverty_rate.toFixed(1)}%`}
                change={results.change} variant={results.change < 0 ? 'success' : 'danger'}
                trend={results.change < 0 ? 'down' : 'up'}
                description={`${isEn ? 'Scenario' : 'Escenario'}: ${scenarioLabel(scenario)}`} />
              <ImpactCard title={isEn ? "People in Poverty" : "Personas en Pobreza"} value={results.people.toLocaleString()}
                description={`${isEn ? 'Of' : 'De'} ${results.pop.toLocaleString()} ${isEn ? 'inhabitants' : 'habitantes'}`} />
              <ImpactCard title={isEn ? "90% CI" : "IC 90%"}
                value={`${results.ci_low.toFixed(1)}% – ${results.ci_high.toFixed(1)}%`}
                description={isEn ? "Probable projection range" : "Rango probable de la proyección"} />
              <ImpactCard title={isEn ? "Change vs Base Nowcast" : "Cambio vs Nowcast Base"}
                value={`${results.change > 0 ? '+' : ''}${results.change.toFixed(1)}pp`}
                variant={results.change < 0 ? 'success' : results.change === 0 ? 'default' : 'danger'}
                description={results.change < 0
                  ? (isEn ? 'Expected improvement' : 'Mejora esperada')
                  : results.change === 0
                  ? (isEn ? 'No change' : 'Sin cambio')
                  : (isEn ? 'Expected deterioration' : 'Deterioro esperado')} />
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {isEn ? 'Base Nowcast vs Projection' : 'Nowcast Base vs Proyección'}
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_DEFAULTS.gridStroke} strokeWidth={CHART_DEFAULTS.gridStrokeWidth} />
                  <XAxis dataKey="name" tick={axisTickStyle} stroke={CHART_DEFAULTS.axisStroke} />
                  <YAxis
                    domain={[0, Math.ceil((results.ci_high + 5) / 10) * 10]}
                    label={{ value: isEn ? 'Poverty (%)' : 'Pobreza (%)', angle: -90, position: 'insideLeft', style: { fontSize: CHART_DEFAULTS.axisFontSize, fill: CHART_DEFAULTS.axisStroke } }}
                    tick={axisTickStyle}
                    stroke={CHART_DEFAULTS.axisStroke}
                  />
                  <Tooltip contentStyle={tooltipContentStyle} formatter={(v: any) => [`${Number(v).toFixed(1)}%`, isEn ? 'Poverty' : 'Pobreza']} />
                  <Bar dataKey="rate" fill={barColor} name={isEn ? "Rate (%)" : "Tasa (%)"} />
                  <ReferenceLine y={results.ci_low}  stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 4" label={{ value: isEn ? 'CI low' : 'IC inf.', fontSize: CHART_DEFAULTS.axisFontSize }} />
                  <ReferenceLine y={results.ci_high} stroke={CHART_DEFAULTS.axisStroke} strokeDasharray="4 4" label={{ value: isEn ? 'CI high' : 'IC sup.', fontSize: CHART_DEFAULTS.axisFontSize }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border p-4 text-sm" style={results.change < -1 ? { background: '#f0faf8', borderColor: CHART_COLORS.teal, color: CHART_COLORS.teal } : results.change > 1 ? { background: '#fdf2f2', borderColor: CHART_COLORS.red, color: CHART_COLORS.red } : { background: CHART_COLORS.surface, borderColor: CHART_DEFAULTS.gridStroke, color: CHART_COLORS.ink }}>
              {results.change < -1 ? (
                isEn
                  ? <>Improvement of <strong>{Math.abs(results.change).toFixed(1)}pp</strong> — approximately {Math.abs(Math.round((results.change / 100) * results.pop)).toLocaleString()} people would exit poverty.</>
                  : <>Mejora de <strong>{Math.abs(results.change).toFixed(1)}pp</strong> — aproximadamente {Math.abs(Math.round((results.change / 100) * results.pop)).toLocaleString()} personas saldrían de la pobreza.</>
              ) : results.change > 1 ? (
                isEn
                  ? <>Deterioration of <strong>{results.change.toFixed(1)}pp</strong> — {Math.round((results.change / 100) * results.pop).toLocaleString()} additional people would fall into poverty.</>
                  : <>Deterioro de <strong>{results.change.toFixed(1)}pp</strong> — {Math.round((results.change / 100) * results.pop).toLocaleString()} personas adicionales caerían en pobreza.</>
              ) : (
                isEn
                  ? <>Stability near <strong>{results.baseline.toFixed(1)}%</strong> in the baseline scenario.</>
                  : <>Estabilidad cerca de <strong>{results.baseline.toFixed(1)}%</strong> en el escenario base.</>
              )}
              {' '}IC 90%: [{results.ci_low.toFixed(1)}%, {results.ci_high.toFixed(1)}%].
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
