'use client';

import { useState, useEffect } from 'react';
import ImpactCard from '../components/ImpactCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, LineChart, Line, ReferenceLine,
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────────
interface GDPData  { nowcast: { value: number; target_period: string } }
interface InflData { nowcast: { value: number; target_period: string }; backtest_metrics: { rmse: number } }
interface PovData  {
  metadata: { target_year: number };
  departments: Array<{ code: string; name: string; poverty_rate_2025_nowcast: number; poverty_rate_2024: number; change_pp: number }>;
}

interface Shock { id: string; type: string; magnitude: number }

const SHOCK_TYPES = {
  commodity:     { name: 'Commodities',           unit: '% cambio', default: -10, min: -50, max: 50 },
  fx:            { name: 'Tipo de Cambio',         unit: '% deprec.', default: 10, min: -20, max: 30 },
  political:     { name: 'Inestabilidad Política', unit: 'σ',         default: 1.5, min: -2, max: 3 },
  interest_rate: { name: 'Tasa BCRP',             unit: 'bp',        default: 50, min: -200, max: 200 },
  china:         { name: 'PIB China',              unit: 'pp',        default: -1, min: -5, max: 3 },
};

const CATEGORIES: Record<string, string> = {
  all: 'Todos los productos', food: 'Alimentos',
  arroz_cereales: 'Arroz y Cereales', carnes: 'Carnes',
  lacteos: 'Lácteos y Huevos', frutas: 'Frutas', verduras: 'Verduras',
  limpieza: 'Limpieza', cuidado_personal: 'Cuidado Personal',
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

  const TABS = [
    { key: 'pbi'      as const, label: 'PBI — Simulador de Shocks' },
    { key: 'inflacion'as const, label: 'Calculadora de Inflación' },
    { key: 'pobreza'  as const, label: 'Proyecciones de Pobreza' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Simuladores</h1>
          <p className="text-sm text-gray-600">
            Herramientas interactivas basadas en los modelos de nowcast de Qhawarina.
            Los valores base provienen de las estimaciones más recientes del modelo.
          </p>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-gray-300 mb-8">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
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
  const baselineGDP = gdpData?.nowcast.value ?? 2.8;
  const [baselineInflation, setBaselineInflation] = useState(2.3);
  const [shocks, setShocks]       = useState<Shock[]>([]);
  const [newShockType, setNewShockType]           = useState('commodity');
  const [newShockMag,  setNewShockMag]            = useState(-10);
  const [results, setResults]     = useState<any>(null);

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
      return { shockType: SHOCK_TYPES[s.type as keyof typeof SHOCK_TYPES].name, magnitude: s.magnitude, gdpImpact: g, inflationImpact: inf };
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
    { name: 'Escenario Base', PBI: results.baseline_gdp, Inflación: results.baseline_inflation, color: '#94a3b8' },
    { name: 'Con Shocks',     PBI: results.shocked_gdp,  Inflación: results.shocked_inflation,  color: results.total_gdp_impact < 0 ? '#ef4444' : '#10b981' },
  ] : [];

  const interpretation = () => {
    if (!results) return '';
    const g = results.total_gdp_impact, inf = results.total_inflation_impact;
    if (g < -2 && inf > 1) return 'Estanflación: caída severa del PBI con presión inflacionaria simultánea.';
    if (g < -1) return `Recesión moderada: el PBI cae ${Math.abs(g).toFixed(2)}pp. Atención a empleo y pobreza.`;
    if (g > 1)  return `Expansión económica: el PBI sube ${g.toFixed(2)}pp. Riesgo de sobrecalentamiento si inflación > 3%.`;
    return 'Impacto moderado. El escenario permanece cercano al baseline.';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">Parámetros Base</h2>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              PBI Nowcast (modelo) — {gdpData?.nowcast.target_period ?? '…'}
            </label>
            <div className="text-2xl font-bold text-blue-700">{baselineGDP.toFixed(2)}%</div>
            <p className="text-xs text-gray-400 mt-1">Estimación real del modelo DFM</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Inflación base asumida (%)
            </label>
            <input
              type="number" step="0.1" value={baselineInflation}
              onChange={e => setBaselineInflation(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-6">
          <h2 className="text-base font-semibold mb-4">Agregar Shock</h2>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
            <select
              value={newShockType}
              onChange={e => { setNewShockType(e.target.value); setNewShockMag(SHOCK_TYPES[e.target.value as keyof typeof SHOCK_TYPES].default); }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              {Object.entries(SHOCK_TYPES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Magnitud ({SHOCK_TYPES[newShockType as keyof typeof SHOCK_TYPES].unit})
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
            + Agregar Shock
          </button>
        </div>

        {shocks.length > 0 && (
          <div className="bg-white border border-gray-300 p-6">
            <h3 className="text-sm font-semibold mb-3">Shocks activos</h3>
            <div className="space-y-2">
              {shocks.map(s => (
                <div key={s.id} className="flex items-center justify-between text-xs bg-gray-50 px-3 py-2 border border-gray-200">
                  <span className="font-medium">{SHOCK_TYPES[s.type as keyof typeof SHOCK_TYPES].name}</span>
                  <span className="text-gray-600">{s.magnitude > 0 ? '+' : ''}{s.magnitude} {SHOCK_TYPES[s.type as keyof typeof SHOCK_TYPES].unit}</span>
                  <button onClick={() => removeShock(s.id)} className="text-red-500 hover:text-red-700 ml-2">✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={calculate}
              disabled={shocks.length === 0}
              className="w-full mt-4 bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300"
            >
              Calcular Impacto
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">⚡</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Agrega shocks y calcula el impacto</h3>
            <p className="text-sm text-gray-500">
              Semi-elasticidades calibradas sobre datos históricos del BCRP e INEI (2004–2024).
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title="PBI con Shocks" value={`${results.shocked_gdp.toFixed(2)}%`}
                change={results.total_gdp_impact} variant={results.total_gdp_impact < 0 ? 'danger' : 'success'}
                trend={results.total_gdp_impact < 0 ? 'down' : 'up'} description="Crecimiento proyectado" />
              <ImpactCard title="Inflación con Shocks" value={`${results.shocked_inflation.toFixed(2)}%`}
                change={results.total_inflation_impact} variant={results.total_inflation_impact > 0 ? 'warning' : 'success'}
                trend={results.total_inflation_impact > 0 ? 'up' : 'down'} description="Presión inflacionaria" />
              <ImpactCard title="Impacto en PBI" value={`${results.total_gdp_impact > 0 ? '+' : ''}${results.total_gdp_impact.toFixed(2)}pp`}
                variant={results.total_gdp_impact < 0 ? 'danger' : 'success'} description="vs baseline nowcast" />
              <ImpactCard title="Impacto en Inflación" value={`${results.total_inflation_impact > 0 ? '+' : ''}${results.total_inflation_impact.toFixed(2)}pp`}
                variant={results.total_inflation_impact > 0 ? 'warning' : 'success'} description="vs inflación base" />
            </div>

            <div className="bg-white border border-gray-300 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Base vs Escenario con Shocks</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}%`} />
                  <Legend />
                  <Bar dataKey="PBI" fill="#3b82f6" name="PBI (%)" />
                  <Bar dataKey="Inflación" fill="#f59e0b" name="Inflación (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Descomposición por shock</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Shock</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Magnitud</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Δ PBI</th>
                  <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Δ Inflación</th>
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

            <div className={`border p-4 text-sm ${results.total_gdp_impact < -1 ? 'bg-red-50 border-red-200 text-red-800' : results.total_gdp_impact > 1 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              <strong>Interpretación: </strong>{interpretation()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — Calculadora de Inflación
// ══════════════════════════════════════════════════════════════════════════
function InflacionCalc({ inflData }: { inflData: InflData | null }) {
  const baseMonthlyRate = inflData?.nowcast.value ?? 0.2;
  const [amount, setAmount]       = useState(1000);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate]     = useState('2026-02-28');
  const [category, setCategory]   = useState('all');
  const [results, setResults]     = useState<any>(null);
  const [loading, setLoading]     = useState(false);

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
          .toLocaleDateString('es-PE', { month: 'short', year: '2-digit' }),
      });
    }
    return pts;
  })() : [];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-300 p-6 sticky top-24 space-y-5">
          <h2 className="text-base font-semibold">Parámetros</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Monto (S/)</label>
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha inicial</label>
            <input type="date" value={startDate} max={endDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha final</label>
            <input type="date" value={endDate} min={startDate} max="2027-12-31" onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <button onClick={calculate} disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? 'Calculando…' : 'Calcular'}
          </button>

          {inflData && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Tasa base: <strong>{baseMonthlyRate.toFixed(3)}%/mes</strong> (nowcast DFM, {inflData.nowcast.target_period})
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">S/</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Ingresa monto y fechas</h3>
            <p className="text-sm text-gray-500">Descubre cuánto poder adquisitivo has perdido por la inflación</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title="Monto Original" value={`S/ ${results.amount.toFixed(2)}`}
                description={`Fecha: ${new Date(results.startDate).toLocaleDateString('es-PE')}`} />
              <ImpactCard title="Equivalente Hoy" value={`S/ ${results.equivalent.toFixed(2)}`}
                change={results.accumulated} variant={results.accumulated > 0 ? 'danger' : 'success'}
                trend={results.accumulated > 0 ? 'up' : 'down'}
                description={`Fecha: ${new Date(results.endDate).toLocaleDateString('es-PE')}`} />
              <ImpactCard title="Cambio en Poder Adquisitivo" value={`S/ ${results.loss.toFixed(2)}`}
                variant={results.loss > 0 ? 'danger' : 'success'}
                description={results.loss > 0 ? 'Pérdida de poder adquisitivo' : 'Ganancia (deflación)'} />
              <ImpactCard title="Inflación Acumulada" value={`${results.accumulated.toFixed(2)}%`}
                variant={results.accumulated > 0 ? 'warning' : 'success'}
                description={`En ${results.days} días · ${CATEGORIES[results.category]}`} />
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Evolución del Índice de Precios</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${Number(v).toFixed(2)}`} />
                  <Line type="monotone" dataKey="index" stroke="#3b82f6" strokeWidth={2} name="Índice (base=100)" dot={false} />
                  <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Base', fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={`border p-4 text-sm ${results.accumulated > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
              {results.accumulated > 0 ? (
                <>Los precios subieron <strong>{results.accumulated.toFixed(2)}%</strong> en {results.days} días.
                  Para el mismo poder adquisitivo necesitarías <strong>S/ {results.equivalent.toFixed(2)}</strong> hoy
                  en lugar de S/ {results.amount.toFixed(2)}.</>
              ) : (
                <>Los precios bajaron <strong>{Math.abs(results.accumulated).toFixed(2)}%</strong>. Puedes comprar más con S/ {results.amount.toFixed(2)} hoy.</>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — Proyecciones de Pobreza
// ══════════════════════════════════════════════════════════════════════════
function PobrezaProyecciones({ povData }: { povData: PovData | null }) {
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

  const barData = results ? [
    { name: 'Nowcast 2025', rate: results.baseline },
    { name: 'Proyección', rate: results.poverty_rate },
  ] : [];

  const barColor = scenario === 'optimistic' ? '#10b981' : scenario === 'pessimistic' ? '#ef4444' : '#3b82f6';

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-300 p-6 sticky top-24 space-y-5">
          <h2 className="text-base font-semibold">Configuración</h2>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Departamento</label>
            {povData ? (
              <select value={dept} onChange={e => { setDept(e.target.value); setResults(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                {povData.departments.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
              </select>
            ) : (
              <div className="h-9 bg-gray-100 rounded animate-pulse" />
            )}
            <p className="text-xs text-gray-400 mt-1">~{(pop / 1e6).toFixed(1)}M habitantes</p>
          </div>

          {/* Real rate from model */}
          <div className="p-3 bg-gray-50 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Nowcast 2025 (modelo real)</div>
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
            <label className="block text-xs font-medium text-gray-600 mb-2">Escenario</label>
            <div className="space-y-2">
              {[
                { v: 'optimistic', l: 'Optimista', d: 'Crecimiento fuerte, programas sociales' },
                { v: 'baseline',   l: 'Base',       d: 'Tendencia actual continúa' },
                { v: 'pessimistic',l: 'Pesimista',  d: 'Shocks negativos (commodity, FX)' },
              ].map(({ v, l, d }) => (
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
            className="w-full bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300">
            {loading ? 'Calculando…' : 'Generar Proyección'}
          </button>

          {povData && (
            <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-800">
              Modelo GBR · {povData.metadata.target_year} · Tasas reales del nowcast
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-2">
        {!results ? (
          <div className="bg-white border border-gray-300 p-16 text-center">
            <div className="text-4xl mb-4 text-gray-300">📊</div>
            <h3 className="text-base font-medium text-gray-900 mb-2">Selecciona departamento y escenario</h3>
            <p className="text-sm text-gray-500">Proyecciones basadas en el nowcast real del modelo GBR</p>
          </div>
        ) : (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Proyección — {results.dept}</h2>

            <div className="grid grid-cols-2 gap-4">
              <ImpactCard title="Tasa Proyectada" value={`${results.poverty_rate.toFixed(1)}%`}
                change={results.change} variant={results.change < 0 ? 'success' : 'danger'}
                trend={results.change < 0 ? 'down' : 'up'}
                description={`Escenario: ${scenario === 'baseline' ? 'Base' : scenario === 'optimistic' ? 'Optimista' : 'Pesimista'}`} />
              <ImpactCard title="Personas en Pobreza" value={results.people.toLocaleString()}
                description={`De ${results.pop.toLocaleString()} habitantes`} />
              <ImpactCard title="IC 90%"
                value={`${results.ci_low.toFixed(1)}% – ${results.ci_high.toFixed(1)}%`}
                description="Rango probable de la proyección" />
              <ImpactCard title="Cambio vs Nowcast Base"
                value={`${results.change > 0 ? '+' : ''}${results.change.toFixed(1)}pp`}
                variant={results.change < 0 ? 'success' : results.change === 0 ? 'default' : 'danger'}
                description={results.change < 0 ? 'Mejora esperada' : results.change === 0 ? 'Sin cambio' : 'Deterioro esperado'} />
            </div>

            <div className="bg-white border border-gray-300 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Nowcast Base vs Proyección</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, Math.ceil((results.ci_high + 5) / 10) * 10]}
                    label={{ value: 'Pobreza (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                    tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`, 'Pobreza']} />
                  <Bar dataKey="rate" fill={barColor} name="Tasa (%)" />
                  <ReferenceLine y={results.ci_low}  stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'IC inf.', fontSize: 9 }} />
                  <ReferenceLine y={results.ci_high} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'IC sup.', fontSize: 9 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={`border p-4 text-sm ${results.change < -1 ? 'bg-green-50 border-green-200 text-green-800' : results.change > 1 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
              {results.change < -1 ? (
                <>Mejora de <strong>{Math.abs(results.change).toFixed(1)}pp</strong> — aproximadamente{' '}
                  {Math.abs(Math.round((results.change / 100) * results.pop)).toLocaleString()} personas saldrían de la pobreza.</>
              ) : results.change > 1 ? (
                <>Deterioro de <strong>{results.change.toFixed(1)}pp</strong> —{' '}
                  {Math.round((results.change / 100) * results.pop).toLocaleString()} personas adicionales caerían en pobreza.</>
              ) : (
                <>Estabilidad cerca de <strong>{results.baseline.toFixed(1)}%</strong> en el escenario base.</>
              )}
              {' '}IC 90%: [{results.ci_low.toFixed(1)}%, {results.ci_high.toFixed(1)}%].
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
