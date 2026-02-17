'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface InflationData {
  monthly_series: Array<{ month: string; official: number | null; nowcast: number | null }>;
  recent_months: Array<{ month: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function InflacionGraficosPage() {
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/inflation_nowcast.json')
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
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">Inflación</a>
          {" / "}
          <span className="text-gray-900 font-medium">Gráficos</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Inflación - Evolución Temporal</h1>
        <p className="text-lg text-gray-600">Nowcast mensual - {data.nowcast.target_period}: {data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(3)}%</p>
        <div className="mt-4"><LastUpdate date="15-Feb-2026" /></div>

        {/* TIMELINE CHART - Full Historical Monthly Data */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evolución Temporal</h2>
          <Plot
            data={[
              {
                x: data.monthly_series.map(m => m.month),
                y: data.monthly_series.map(m => m.official),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Oficial (INEI)',
                line: { color: '#2563eb', width: 2 },
                marker: { size: 3 }
              },
              {
                x: data.monthly_series.map(m => m.month),
                y: data.monthly_series.map(m => m.nowcast),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Nowcast (DFM)',
                line: { color: '#f59e0b', width: 2, dash: 'dot' },
                marker: { size: 3 }
              }
            ]}
            layout={{
              height: 400,
              margin: { l: 50, r: 30, t: 30, b: 80 },
              xaxis: {
                title: 'Mes',
                gridcolor: '#e5e7eb',
                tickangle: -45,
                nticks: 30
              },
              yaxis: { title: 'Inflación Mensual (% 3M-MA)', gridcolor: '#e5e7eb' },
              plot_bgcolor: '#ffffff',
              paper_bgcolor: '#ffffff',
              legend: { x: 0.01, y: 0.99 }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
          <p className="text-sm text-gray-600 mt-4">
            <strong>Cobertura:</strong> 265 meses desde 2004-01 hasta 2026-01 (22 años). Nowcast disponible desde 2010-02 (16 años).
          </p>
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/inflacion/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 Ver metodología completa →
          </a>
        </div>
      </div>
    </div>
  );
}
