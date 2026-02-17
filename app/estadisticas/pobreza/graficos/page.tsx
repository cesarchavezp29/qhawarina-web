'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PovertyData {
  metadata: { target_year: number };
  departments: Array<{
    code: string;
    name: string;
    poverty_rate_2024: number;
    poverty_rate_2025_nowcast: number;
    change_pp: number;
  }>;
  historical_series?: Array<{
    year: number;
    official: number | null;
    nowcast: number | null;
  }>;
}

interface QuarterlyData {
  metadata: {
    method: string;
    frequency: string;
  };
  national_quarterly: Array<{
    quarter: string;
    poverty_rate: number;
  }>;
}

export default function PobrezaGraficosPage() {
  const [data, setData] = useState<PovertyData | null>(null);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [frequency, setFrequency] = useState<'annual' | 'quarterly'>('annual');

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/poverty_nowcast.json').then(r => r.json()),
      fetch('/assets/data/poverty_quarterly.json').then(r => r.json())
    ]).then(([annualData, qData]) => {
      setData(annualData);
      setQuarterlyData(qData);
      setLoading(false);
    });
  }, []);

  if (loading || !data || !quarterlyData) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando datos...</p></div>;
  }

  const nationalAvg = data.departments.reduce((sum, d) => sum + d.poverty_rate_2025_nowcast, 0) / data.departments.length;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">Pobreza</a>
          {" / "}
          <span className="text-gray-900 font-medium">Gráficos</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pobreza - Evolución Temporal</h1>
        <p className="text-lg text-gray-600">Nowcast anual - {data.metadata.target_year}: {nationalAvg.toFixed(1)}%</p>
        <div className="mt-4"><LastUpdate date="15-Feb-2026" /></div>

        {/* TIMELINE CHART with Annual/Quarterly Toggle */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Evolución Temporal</h2>

            {/* Frequency Toggle */}
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => setFrequency('annual')}
                className={`px-4 py-2 text-sm font-medium border ${
                  frequency === 'annual'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-l-lg transition-colors`}
              >
                📅 Anual
              </button>
              <button
                onClick={() => setFrequency('quarterly')}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                  frequency === 'quarterly'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-r-lg transition-colors`}
              >
                📊 Trimestral
              </button>
            </div>
          </div>

          {/* Annual Chart */}
          {frequency === 'annual' && data.historical_series && data.historical_series.length > 0 && (
            <div>
              <Plot
                data={[
                  {
                    x: data.historical_series.map(d => d.year),
                    y: data.historical_series.map(d => d.official),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Oficial (INEI)',
                    line: { color: '#2563eb', width: 2 },
                    marker: { size: 6 }
                  },
                  {
                    x: data.historical_series.map(d => d.year),
                    y: data.historical_series.map(d => d.nowcast),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast (Panel)',
                    line: { color: '#dc2626', width: 2, dash: 'dot' },
                    marker: { size: 6 }
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 30, t: 30, b: 50 },
                  xaxis: { title: 'Año', gridcolor: '#e5e7eb' },
                  yaxis: { title: 'Tasa de Pobreza (%)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99 }
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-sm text-gray-600 mt-4">
                <strong>Nota COVID:</strong> Los errores en 2020 (-10.4pp) y 2021 (+4.6pp) muestran que el modelo no puede predecir choques sin precedentes como la pandemia.
              </p>
            </div>
          )}

          {/* Quarterly Chart */}
          {frequency === 'quarterly' && (
            <div>
              <Plot
                data={[
                  {
                    x: quarterlyData.national_quarterly.map(d => d.quarter),
                    y: quarterlyData.national_quarterly.map(d => d.poverty_rate),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Pobreza Trimestral',
                    line: { color: '#059669', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(5, 150, 105, 0.1)'
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 30, t: 30, b: 80 },
                  xaxis: {
                    title: 'Trimestre',
                    gridcolor: '#e5e7eb',
                    tickangle: -45,
                    nticks: 20
                  },
                  yaxis: { title: 'Tasa de Pobreza (%)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  showlegend: false
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-sm text-gray-600 mt-4">
                <strong>Método:</strong> Desagregación temporal Chow-Lin usando GDP trimestral e IPC mensual como indicadores.
                Muestra variación intra-anual no visible en datos anuales.
              </p>
            </div>
          )}
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/pobreza/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
