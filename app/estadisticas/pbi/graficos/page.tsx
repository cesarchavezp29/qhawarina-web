'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface GDPData {
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  quarterly_series: Array<{ quarter: string; official: number | null; nowcast: number | null; nowcast_full: number | null }>;
  annual_series: Array<{ year: number; official: number | null; nowcast: number | null; nowcast_full: number | null }>;
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
                    marker: { size: 5 },
                    hovertemplate: '<b>%{x}</b><br>Oficial: %{y:.2f}%<extra></extra>',
                  },
                  {
                    x: data.quarterly_series.map(q => q.quarter),
                    y: data.quarterly_series.map(q => q.nowcast),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast sin COVID (quiebre estructural)',
                    line: { color: '#059669', width: 2, dash: 'dot' },
                    marker: { size: 5 },
                    connectgaps: false,
                    hovertemplate: '<b>%{x}</b><br>Nowcast (sin COVID): %{y:.2f}%<extra></extra>',
                  },
                  {
                    x: data.quarterly_series.map(q => q.quarter),
                    y: data.quarterly_series.map(q => q.nowcast_full),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Nowcast con COVID (extrapolación)',
                    line: { color: '#d97706', width: 1.5, dash: 'dashdot' },
                    opacity: 0.6,
                    connectgaps: true,
                    hovertemplate: '<b>%{x}</b><br>Nowcast (con COVID): %{y:.2f}%<extra></extra>',
                  }
                ]}
                layout={{
                  height: 420,
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
                  legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#e5e7eb', borderwidth: 1 },
                  shapes: [
                    {
                      type: 'rect',
                      xref: 'x',
                      yref: 'paper',
                      x0: '2020-Q1',
                      x1: '2021-Q4',
                      y0: 0,
                      y1: 1,
                      fillcolor: 'rgba(220, 38, 38, 0.07)',
                      line: { width: 0 },
                    }
                  ],
                  annotations: [
                    {
                      xref: 'x',
                      yref: 'paper',
                      x: '2020-Q3',
                      y: 0.98,
                      text: 'COVID-19',
                      showarrow: false,
                      font: { size: 11, color: '#dc2626' },
                    }
                  ]
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                <p>
                  <strong>Quiebre estructural COVID-19 (2020-Q1 — 2021-Q4):</strong>{' '}
                  El modelo DFM fue entrenado excluyendo este período para evitar que el shock pandémico distorsione
                  la estructura de factores latentes. La <span className="text-green-700 font-medium">línea verde punteada</span>{' '}
                  omite el período COVID (quiebre limpio). La{' '}
                  <span className="text-amber-700 font-medium">línea naranja</span> muestra la extrapolación
                  del modelo sin reentrenamiento (~2.77% fijo), que debe interpretarse con cautela: el DFM
                  no capturó el colapso de -30% ni la recuperación de +42%.
                </p>
              </div>
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
                    marker: { size: 7 },
                    hovertemplate: '<b>%{x}</b><br>Oficial: %{y:.2f}%<extra></extra>',
                  },
                  {
                    x: data.annual_series.map(a => a.year),
                    y: data.annual_series.map(a => a.nowcast),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast sin COVID (quiebre estructural)',
                    line: { color: '#059669', width: 2, dash: 'dot' },
                    marker: { size: 7 },
                    connectgaps: false,
                    hovertemplate: '<b>%{x}</b><br>Nowcast (sin COVID): %{y:.2f}%<extra></extra>',
                  },
                  {
                    x: data.annual_series.map(a => a.year),
                    y: data.annual_series.map(a => a.nowcast_full),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: 'Nowcast con COVID (extrapolación)',
                    line: { color: '#d97706', width: 1.5, dash: 'dashdot' },
                    marker: { size: 6, symbol: 'diamond' },
                    opacity: 0.6,
                    connectgaps: true,
                    hovertemplate: '<b>%{x}</b><br>Nowcast (con COVID): %{y:.2f}%<extra></extra>',
                  }
                ]}
                layout={{
                  height: 420,
                  margin: { l: 50, r: 30, t: 30, b: 50 },
                  xaxis: { title: 'Año', gridcolor: '#e5e7eb', dtick: 1 },
                  yaxis: { title: 'Crecimiento PBI (% YoY)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99, bgcolor: 'rgba(255,255,255,0.85)', bordercolor: '#e5e7eb', borderwidth: 1 },
                  shapes: [
                    {
                      type: 'rect',
                      xref: 'x',
                      yref: 'paper',
                      x0: 2019.5,
                      x1: 2022.5,
                      y0: 0,
                      y1: 1,
                      fillcolor: 'rgba(220, 38, 38, 0.07)',
                      line: { width: 0 },
                    }
                  ],
                  annotations: [
                    {
                      xref: 'x',
                      yref: 'paper',
                      x: 2021,
                      y: 0.98,
                      text: 'COVID-19',
                      showarrow: false,
                      font: { size: 11, color: '#dc2626' },
                    }
                  ]
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                <p>
                  <strong>Método:</strong> Promedio de 4 trimestres por año. La{' '}
                  <span className="text-green-700 font-medium">línea verde punteada</span> excluye
                  2020-2021 (quiebre estructural). La{' '}
                  <span className="text-amber-700 font-medium">línea naranja</span> muestra
                  la extrapolación sin reentrenamiento — para 2020-2021, el modelo predijo ~2.77%
                  ignorando el choque COVID.
                </p>
              </div>
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
