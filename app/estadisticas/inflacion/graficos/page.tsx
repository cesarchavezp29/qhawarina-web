'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface InflationData {
  metadata: { generated_at: string };
  monthly_series: Array<{ month: string; official: number | null; nowcast: number | null }>;
  recent_months: Array<{ month: string; official: number | null; nowcast: number | null }>;
  nowcast: { target_period: string; value: number };
}

export default function InflacionGraficosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<InflationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/assets/data/inflation_nowcast.json?v=${new Date().toISOString().split('T')[0]}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">{isEn ? "Loading data..." : "Cargando datos..."}</p></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{isEn ? "Statistics" : "Estadísticas"}</a>
          {" / "}
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">{isEn ? "Inflation" : "Inflación"}</a>
          {" / "}
          <span className="text-gray-900 font-medium">{isEn ? "Charts" : "Gráficos"}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">{isEn ? "Inflation - Time Series" : "Inflación - Evolución Temporal"}</h1>
        <p className="text-lg text-gray-600">
          {isEn
            ? `Monthly nowcast - ${data.nowcast.target_period}: ${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(3)}%`
            : `Nowcast mensual - ${data.nowcast.target_period}: ${data.nowcast.value > 0 ? '+' : ''}${data.nowcast.value.toFixed(3)}%`}
        </p>
        <div className="mt-4"><LastUpdate date={new Date(data.metadata.generated_at).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} /></div>

        {/* TIMELINE CHART - Full Historical Monthly Data */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{isEn ? "Time Series" : "Evolución Temporal"}</h2>
          <Plot
            data={[
              {
                x: data.monthly_series.map(m => m.month),
                y: data.monthly_series.map(m => m.official),
                type: 'scatter',
                mode: 'lines+markers',
                name: isEn ? 'Official (INEI)' : 'Oficial (INEI)',
                line: { color: '#2563eb', width: 2 },
                marker: { size: 3 }
              },
              {
                x: data.monthly_series.map(m => m.month),
                y: data.monthly_series.map(m => m.nowcast),
                type: 'scatter',
                mode: 'lines+markers',
                name: isEn ? 'Nowcast (DFM)' : 'Nowcast (DFM)',
                line: { color: '#f59e0b', width: 2, dash: 'dot' },
                marker: { size: 3 }
              }
            ]}
            layout={{
              height: 400,
              margin: { l: 50, r: 30, t: 30, b: 80 },
              xaxis: {
                title: isEn ? 'Month' : 'Mes',
                gridcolor: '#e5e7eb',
                tickangle: -45,
                nticks: 30
              },
              yaxis: { title: isEn ? 'Monthly Inflation (% 3M-MA)' : 'Inflación Mensual (% 3M-MA)', gridcolor: '#e5e7eb' },
              plot_bgcolor: '#ffffff',
              paper_bgcolor: '#ffffff',
              legend: { x: 0.01, y: 0.99 }
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
          <p className="text-sm text-gray-600 mt-4">
            {isEn ? (
              <><strong>Coverage:</strong> {data.monthly_series.length} months from {data.monthly_series[0]?.month ?? '—'} to {data.monthly_series[data.monthly_series.length - 1]?.month ?? '—'}. Nowcast available since {data.monthly_series.find(m => m.nowcast !== null)?.month ?? '—'}.</>
            ) : (
              <><strong>Cobertura:</strong> {data.monthly_series.length} meses desde {data.monthly_series[0]?.month ?? '—'} hasta {data.monthly_series[data.monthly_series.length - 1]?.month ?? '—'}. Nowcast disponible desde {data.monthly_series.find(m => m.nowcast !== null)?.month ?? '—'}.</>
            )}
          </p>
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/inflacion/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            {isEn ? "📖 View full methodology →" : "📖 Ver metodología completa →"}
          </a>
        </div>
      </div>
    </div>
  );
}
