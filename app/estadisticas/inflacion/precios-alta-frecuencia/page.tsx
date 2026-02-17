'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SupermarketData {
  metadata: {
    method: string;
    base_date: string;
    stores: string[];
    total_skus: number;
  };
  daily_series: Array<{
    date: string;
    index_all: number;
    n_products: number;
  }>;
}

export default function PreciosAltaFrecuenciaPage() {
  const [data, setData] = useState<SupermarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/supermarket_daily_index.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error('Error loading data:', e); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  if (!data || data.daily_series.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
            {" / "}
            <a href="/estadisticas/inflacion" className="hover:text-blue-700">Inflación</a>
            {" / "}
            <span className="text-gray-900 font-medium">Precios Alta Frecuencia</span>
          </nav>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Precios de Alta Frecuencia</h1>
          <p className="text-lg text-gray-600">No hay datos disponibles aún.</p>
        </div>
      </div>
    );
  }

  const latestIndex = data.daily_series[data.daily_series.length - 1];
  const change = latestIndex.index_all - 100;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/inflacion" className="hover:text-blue-700">Inflación</a>
          {" / "}
          <span className="text-gray-900 font-medium">Precios Alta Frecuencia</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Precios de Alta Frecuencia</h1>
        <p className="text-lg text-gray-600">
          Índice diario de precios - {latestIndex.date}: {latestIndex.index_all.toFixed(2)} (
          {change > 0 ? '+' : ''}{change.toFixed(2)}% vs base)
        </p>
        <div className="mt-4"><LastUpdate date="16-Feb-2026" /></div>

        {/* Key Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Índice Actual</div>
            <div className="text-3xl font-bold text-gray-900">{latestIndex.index_all.toFixed(2)}</div>
            <div className={`text-sm mt-1 ${change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}% desde {data.metadata.base_date}
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Productos Monitoreados</div>
            <div className="text-3xl font-bold text-gray-900">{data.metadata.total_skus.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-1">SKUs únicos</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Supermercados</div>
            <div className="text-lg font-semibold text-gray-900 mt-2">
              {data.metadata.stores.join(', ')}
            </div>
          </div>
        </div>

        {/* Daily Index Chart */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Evolución Diaria del Índice</h2>
          <Plot
            data={[
              {
                x: data.daily_series.map(d => d.date),
                y: data.daily_series.map(d => d.index_all),
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Índice de Precios',
                line: { color: '#059669', width: 3 },
                marker: { size: 8 },
                fill: 'tozeroy',
                fillcolor: 'rgba(5, 150, 105, 0.1)'
              },
              {
                x: data.daily_series.map(d => d.date),
                y: data.daily_series.map(() => 100),
                type: 'scatter',
                mode: 'lines',
                name: 'Base (100)',
                line: { color: '#9ca3af', width: 1, dash: 'dash' },
                showlegend: false
              }
            ]}
            layout={{
              height: 400,
              margin: { l: 50, r: 30, t: 30, b: 80 },
              xaxis: {
                title: 'Fecha',
                gridcolor: '#e5e7eb',
                tickangle: -45
              },
              yaxis: {
                title: 'Índice (Base = 100)',
                gridcolor: '#e5e7eb',
                range: [98, 101]
              },
              plot_bgcolor: '#ffffff',
              paper_bgcolor: '#ffffff',
              hovermode: 'x unified'
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Método:</strong> {data.metadata.method}</p>
            <p className="mt-2"><strong>Cobertura:</strong> {data.daily_series.length} días desde {data.daily_series[0].date}</p>
            <p className="mt-2">
              <strong>Nota:</strong> Este es un índice experimental que monitorea precios en tiempo casi real.
              Muestra variaciones diarias antes de la publicación del IPC oficial mensual de INEI.
            </p>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Metodología</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>BPP para Perú:</strong> Similar al Billion Prices Project del MIT, este índice monitorea precios de supermercados en línea diariamente.</p>
            <p><strong>Índice Jevons:</strong> Media geométrica de cambios de precios para productos comparables entre fechas.</p>
            <p><strong>Ventajas:</strong> Disponible diariamente (vs IPC mensual), sin rezago de publicación, cubre {data.metadata.total_skus.toLocaleString()} productos.</p>
            <p><strong>Limitaciones:</strong> Solo supermercados (no mercados tradicionales), sesgado hacia Lima, no incluye servicios.</p>
          </div>
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
