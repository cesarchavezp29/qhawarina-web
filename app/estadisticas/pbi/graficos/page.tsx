'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface GDPData {
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  quarterly_series: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  annual_series: Array<{ year: number; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function PBIGraficosPage() {
  const [data, setData] = useState<GDPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [frequency, setFrequency] = useState<'annual' | 'quarterly'>('quarterly');

  useEffect(() => {
    fetch('/assets/data/gdp_nowcast.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Cargando datos...</p></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/pbi" className="hover:text-blue-700">PBI</a>
          {" / "}
          <span className="text-gray-900 font-medium">Gráficos</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">PBI - Evolución Temporal</h1>
        <p className="text-lg text-gray-600">Nowcast trimestral - {data.nowcast.target_period}: {data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(2)}%</p>
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

          {/* Quarterly Chart */}
          {frequency === 'quarterly' && data.quarterly_series && (
            <div>
              <Plot
                data={[
                  {
                    x: data.quarterly_series.map(q => q.quarter),
                    y: data.quarterly_series.map(q => q.official),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Oficial (INEI)',
                    line: { color: '#2563eb', width: 2 },
                    marker: { size: 5 }
                  },
                  {
                    x: data.quarterly_series.map(q => q.quarter),
                    y: data.quarterly_series.map(q => q.nowcast),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast (DFM)',
                    line: { color: '#059669', width: 2, dash: 'dot' },
                    marker: { size: 5 }
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
                  yaxis: { title: 'Crecimiento PBI (% YoY)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99 }
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-sm text-gray-600 mt-4">
                <strong>Cobertura:</strong> 87 trimestres desde 2004-Q1 hasta 2025-Q3. Nowcast disponible desde 2010-Q1 (15 años).
              </p>
            </div>
          )}

          {/* Annual Chart */}
          {frequency === 'annual' && data.annual_series && (
            <div>
              <Plot
                data={[
                  {
                    x: data.annual_series.map(a => a.year),
                    y: data.annual_series.map(a => a.official),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Oficial (INEI)',
                    line: { color: '#2563eb', width: 2 },
                    marker: { size: 7 }
                  },
                  {
                    x: data.annual_series.map(a => a.year),
                    y: data.annual_series.map(a => a.nowcast),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast (DFM)',
                    line: { color: '#059669', width: 2, dash: 'dot' },
                    marker: { size: 7 }
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 30, t: 30, b: 50 },
                  xaxis: { title: 'Año', gridcolor: '#e5e7eb' },
                  yaxis: { title: 'Crecimiento PBI (% YoY)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99 }
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-sm text-gray-600 mt-4">
                <strong>Método:</strong> Promedio de 4 trimestres por año. Muestra tendencia anual suavizando volatilidad trimestral.
              </p>
            </div>
          )}
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/pbi/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
