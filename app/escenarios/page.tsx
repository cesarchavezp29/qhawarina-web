"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import { useLocale } from 'next-intl';

interface ScenarioMetadata {
  scenario_name: string;
  scenario_description: string;
  tags: string[];
  generated_at: string;
  target_period_gdp: string;
  target_period_inflation: string;
}

interface BaselineCounterfactual {
  gdp?: {
    gdp_yoy: number;
    confidence_lower?: number;
    confidence_upper?: number;
  };
  inflation?: {
    ipc_monthly_var: number;
    ipc_3m_ma?: number;
  };
}

interface PropagatedImpacts {
  individual: {
    gdp_shock?: {
      poverty_impact_pp: number;
      employment_impact_pp: number;
      mechanism: string;
    };
    inflation_shock?: {
      poverty_impact_pp: number;
      real_income_loss_pct: number;
      mechanism: string;
    };
  };
  aggregate: {
    gdp_total_pp: number;
    inflation_total_monthly_pp: number;
    poverty_total_pp: number;
  };
  interpretation: string;
}

interface Shock {
  series_id?: string;
  shock_type?: string;
  shock_value?: number;
  description: string;
  target?: string;
  forced_value?: number;
}

interface ScenarioData {
  metadata: ScenarioMetadata;
  baseline: BaselineCounterfactual;
  counterfactual: BaselineCounterfactual;
  direct_impacts: {
    gdp?: number;
    inflation?: number;
  };
  propagated_impacts: PropagatedImpacts;
  shocks: {
    exogenous: Shock[];
    endogenous: Shock[];
  };
}

const SCENARIOS = [
  { id: "mild_recession", name: "Recesión Leve", name_en: "Mild Recession", category: "recession" },
  { id: "severe_recession", name: "Recesión Severa", name_en: "Severe Recession", category: "recession" },
  { id: "inflation_spike", name: "Spike Inflacionario", name_en: "Inflationary Spike", category: "inflation" },
  { id: "deflation", name: "Deflación", name_en: "Deflation", category: "inflation" },
  { id: "political_crisis", name: "Crisis Política", name_en: "Political Crisis", category: "political" },
  {
    id: "institutional_reform",
    name: "Reforma Institucional",
    name_en: "Institutional Reform",
    category: "political",
  },
  { id: "commodity_boom", name: "Boom de Commodities", name_en: "Commodity Boom", category: "external" },
  { id: "global_recession", name: "Recesión Global", name_en: "Global Recession", category: "external" },
  { id: "perfect_storm", name: "Tormenta Perfecta", name_en: "Perfect Storm", category: "stress" },
  { id: "goldilocks", name: "Escenario Ideal", name_en: "Ideal Scenario", category: "positive" },
];

const CATEGORY_COLORS: Record<string, string> = {
  recession: "bg-red-100 text-red-800",
  inflation: "bg-orange-100 text-orange-800",
  political: "bg-purple-100 text-purple-800",
  external: "bg-blue-100 text-blue-800",
  stress: "bg-gray-100 text-gray-800",
  positive: "bg-green-100 text-green-800",
};

export default function EscenariosPage() {
  const isEn = useLocale() === 'en';
  const [selectedScenario, setSelectedScenario] = useState<string>("mild_recession");
  const [scenarioData, setScenarioData] = useState<ScenarioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const loadScenario = useCallback(async (scenarioId: string) => {
    setLoading(true);
    setError(null);

    try {
      const v = new Date().toISOString().slice(0, 10);
      const response = await fetch(`/assets/data/scenarios/scenario_${scenarioId}.json?v=${v}`);
      if (!response.ok) {
        throw new Error("Escenario no disponible");
      }
      const data = await response.json();
      setScenarioData(data);
      setIsMock(false);
    } catch (err) {
      setScenarioData(getMockData(scenarioId));
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScenario(selectedScenario);
  }, [selectedScenario, loadScenario]);

  const getMockData = (scenarioId: string): ScenarioData => {
    // Mock data for demo
    return {
      metadata: {
        scenario_name: SCENARIOS.find((s) => s.id === scenarioId)?.[isEn ? 'name_en' : 'name'] || "",
        scenario_description:
          isEn ? "Simulation scenario for counterfactual analysis" : "Escenario de simulación para análisis contrafactual",
        tags: ["demo"],
        generated_at: new Date().toISOString(),
        target_period_gdp: "2026-Q2",
        target_period_inflation: "2026-03",
      },
      baseline: {
        gdp: { gdp_yoy: 2.5 },
        inflation: { ipc_monthly_var: 0.25 },
      },
      counterfactual: {
        gdp: { gdp_yoy: scenarioId.includes("recession") ? 0.0 : 3.5 },
        inflation: {
          ipc_monthly_var: scenarioId.includes("inflation") ? 0.6 : 0.2,
        },
      },
      direct_impacts: {
        gdp: scenarioId.includes("recession") ? -2.5 : 1.0,
        inflation: scenarioId.includes("inflation") ? 0.35 : -0.05,
      },
      propagated_impacts: {
        individual: {
          gdp_shock: {
            poverty_impact_pp: 1.25,
            employment_impact_pp: -1.5,
            mechanism: "GDP shock → Poverty → Employment",
          },
        },
        aggregate: {
          gdp_total_pp: -2.5,
          inflation_total_monthly_pp: 0.0,
          poverty_total_pp: 1.25,
        },
        interpretation:
          "El escenario generaría un impacto significativo en la economía.",
      },
      shocks: {
        exogenous: [
          {
            series_id: "FINANCIAL_STRESS_INDEX",
            shock_type: "sigma",
            shock_value: 1.5,
            description: "Estrés financiero aumenta +1.5 sigma",
          },
        ],
        endogenous: [
          {
            target: "gdp",
            forced_value: 0.0,
            description: "Crecimiento del PBI = 0%",
          },
        ],
      },
    };
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatPP = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}pp`;
  };

  const getImpactColor = (value: number) => {
    if (Math.abs(value) < 0.1) return "text-gray-700";
    return value > 0 ? "text-green-700" : "text-red-700";
  };

  const getImpactIcon = (value: number) => {
    if (Math.abs(value) < 0.1) return null;
    return value > 0 ? (
      <TrendingUp className="w-5 h-5" />
    ) : (
      <TrendingDown className="w-5 h-5" />
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isEn ? "Counterfactual Analysis" : "Análisis Contrafactual"}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            {isEn
              ? "Explore hypothetical scenarios and their impact on the Peruvian economy. What would happen if...?"
              : "Explora escenarios hipotéticos y su impacto en la economía peruana. ¿Qué pasaría si...?"}
          </p>
        </div>

        {/* Intro */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-blue-900 text-sm leading-relaxed">
            {isEn
              ? "Explore the quantified impact of each scenario on GDP, inflation, and poverty, calculated using dynamic factor models trained on Peruvian historical data. Select a scenario to see the full analysis."
              : "Explora el impacto cuantificado de cada escenario en PBI, inflación y pobreza, calculado con modelos de factores dinámicos entrenados sobre datos históricos peruanos. Selecciona un escenario para ver el análisis completo."}
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {isEn ? "Select a Scenario" : "Selecciona un Escenario"}
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          >
            {SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {isEn ? scenario.name_en : scenario.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
            <p className="text-gray-600">{isEn ? "Loading scenario..." : "Cargando escenario..."}</p>
          </div>
        )}

        {!loading && scenarioData && (
          <>
            {/* Scenario Description */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {scenarioData.metadata.scenario_name}
                    </h2>
                    {isMock && (
                      <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
                        {isEn ? 'ILLUSTRATIVE DATA' : 'DATOS ILUSTRATIVOS'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600">
                    {scenarioData.metadata.scenario_description}
                  </p>
                </div>
                <div className="flex gap-2">
                  {scenarioData.metadata.tags.map((tag) => {
                    const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
                    const colorClass = scenario
                      ? CATEGORY_COLORS[scenario.category]
                      : "bg-gray-100 text-gray-800";
                    return (
                      <span
                        key={tag}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Shocks */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {isEn ? "Simulated Shocks:" : "Shocks Simulados:"}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {scenarioData.shocks.endogenous.map((shock, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-red-50 rounded-lg border border-red-200"
                    >
                      <span className="text-2xl mr-3">🎯</span>
                      <div>
                        <div className="text-sm font-semibold text-red-900">
                          {isEn ? "Endogenous Shock" : "Shock Endógeno"}
                        </div>
                        <div className="text-sm text-red-700">
                          {shock.description}
                        </div>
                      </div>
                    </div>
                  ))}
                  {scenarioData.shocks.exogenous.map((shock, idx) => (
                    <div
                      key={idx}
                      className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <span className="text-2xl mr-3">⚡</span>
                      <div>
                        <div className="text-sm font-semibold text-blue-900">
                          {isEn ? "Exogenous Shock" : "Shock Exógeno"}
                        </div>
                        <div className="text-sm text-blue-700">
                          {shock.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Baseline vs Contrafactual
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        {isEn ? "Indicator" : "Indicador"}
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Baseline
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">

                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        Contrafactual
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                        {isEn ? "Impact" : "Impacto"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* GDP Row */}
                    {scenarioData.baseline.gdp && scenarioData.counterfactual.gdp && (
                      <tr>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {isEn ? "GDP (YoY)" : "PBI (YoY)"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {isEn ? "Annual growth" : "Crecimiento anual"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-semibold text-gray-900">
                          {formatPercent(scenarioData.baseline.gdp.gdp_yoy)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-right text-lg font-semibold text-gray-900">
                          {formatPercent(scenarioData.counterfactual.gdp.gdp_yoy)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={`flex items-center justify-end gap-2 text-lg font-bold ${getImpactColor(
                              scenarioData.direct_impacts.gdp || 0
                            )}`}
                          >
                            {getImpactIcon(scenarioData.direct_impacts.gdp || 0)}
                            {formatPP(scenarioData.direct_impacts.gdp || 0)}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Inflation Row */}
                    {scenarioData.baseline.inflation &&
                      scenarioData.counterfactual.inflation && (
                        <tr>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {isEn ? "Inflation (Monthly)" : "Inflación (Mensual)"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {isEn ? "Monthly CPI change" : "Variación IPC mensual"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-lg font-semibold text-gray-900">
                            {formatPercent(
                              scenarioData.baseline.inflation.ipc_monthly_var
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <ArrowRight className="w-5 h-5 text-gray-400 mx-auto" />
                          </td>
                          <td className="px-6 py-4 text-right text-lg font-semibold text-gray-900">
                            {formatPercent(
                              scenarioData.counterfactual.inflation.ipc_monthly_var
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div
                              className={`flex items-center justify-end gap-2 text-lg font-bold ${getImpactColor(
                                scenarioData.direct_impacts.inflation || 0
                              )}`}
                            >
                              {getImpactIcon(
                                scenarioData.direct_impacts.inflation || 0
                              )}
                              {formatPP(scenarioData.direct_impacts.inflation || 0)}
                            </div>
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Propagated Impacts */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {isEn ? "Propagated Impacts (Cross-Model)" : "Impactos Propagados (Cross-Model)"}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900 leading-relaxed">
                  <strong>{isEn ? "Interpretation:" : "Interpretación:"}</strong>{" "}
                  {scenarioData.propagated_impacts.interpretation}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* GDP Impact */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {isEn ? "Total GDP Impact" : "Impacto Total PBI"}
                  </div>
                  <div
                    className={`text-3xl font-bold ${getImpactColor(
                      scenarioData.propagated_impacts.aggregate.gdp_total_pp
                    )}`}
                  >
                    {formatPP(
                      scenarioData.propagated_impacts.aggregate.gdp_total_pp
                    )}
                  </div>
                </div>

                {/* Inflation Impact */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {isEn ? "Inflation Impact" : "Impacto Inflación"}
                  </div>
                  <div
                    className={`text-3xl font-bold ${getImpactColor(
                      scenarioData.propagated_impacts.aggregate
                        .inflation_total_monthly_pp
                    )}`}
                  >
                    {formatPP(
                      scenarioData.propagated_impacts.aggregate
                        .inflation_total_monthly_pp
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{isEn ? "monthly" : "mensual"}</div>
                </div>

                {/* Poverty Impact */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-600 mb-1">
                    {isEn ? "Poverty Impact" : "Impacto Pobreza"}
                  </div>
                  <div
                    className={`text-3xl font-bold ${getImpactColor(
                      -scenarioData.propagated_impacts.aggregate.poverty_total_pp
                    )}`}
                  >
                    {formatPP(
                      scenarioData.propagated_impacts.aggregate.poverty_total_pp
                    )}
                  </div>
                </div>
              </div>

              {/* Mechanism Details */}
              {scenarioData.propagated_impacts.individual.gdp_shock && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    {isEn ? "📊 Transmission Mechanism" : "📊 Mecanismo de Transmisión"}
                  </div>
                  <p className="text-sm text-gray-600">
                    {scenarioData.propagated_impacts.individual.gdp_shock.mechanism}
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-xs text-gray-500">
                        {isEn ? "Poverty Impact:" : "Impacto en Pobreza:"}
                      </span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {formatPP(
                          scenarioData.propagated_impacts.individual.gdp_shock
                            .poverty_impact_pp
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">
                        {isEn ? "Employment Impact:" : "Impacto en Empleo:"}
                      </span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {formatPP(
                          scenarioData.propagated_impacts.individual.gdp_shock
                            .employment_impact_pp
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Methodology note */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600">
                {isEn ? (
                  <>Scenarios calculated using DFM + Ridge models trained on 2004–2024 data. See <a href="/metodologia" className="text-blue-700 hover:underline">full methodology</a> or <a href="/simuladores" className="text-blue-700 hover:underline">create custom simulations</a>.</>
                ) : (
                  <>Escenarios calculados con modelos DFM + Ridge entrenados sobre datos 2004–2024.
                  Ver <a href="/metodologia" className="text-blue-700 hover:underline">metodología completa</a> o{' '}
                  <a href="/simuladores" className="text-blue-700 hover:underline">crear simulaciones personalizadas</a>.</>
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
