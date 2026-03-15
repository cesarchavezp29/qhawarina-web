'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";
import { useLocale } from 'next-intl';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PovertyData {
  metadata: { target_year: number; last_updated: string };
  national: { poverty_nowcast: number };
  departments: Array<{
    dept_code: string;
    department: string;
    poverty_2024_official: number;
    poverty_nowcast: number;
    change_pp: number;
  }>;
  historical_annual?: Array<{
    year: number;
    official: number;
    nowcast: null;
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
    is_nowcast?: boolean;
  }>;
}

export default function PobrezaGraficosPage() {
  const isEn = useLocale() === 'en';
  const [data, setData] = useState<PovertyData | null>(null);
  const [quarterlyData, setQuarterlyData] = useState<QuarterlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [frequency, setFrequency] = useState<'annual' | 'quarterly'>('annual');

  useEffect(() => {
    Promise.all([
      fetch(`/assets/data/poverty_nowcast.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json()),
      fetch(`/assets/data/poverty_quarterly.json?v=${new Date().toISOString().slice(0, 13)}`).then(r => r.json())
    ]).then(([annualData, qData]) => {
      setData(annualData);
      setQuarterlyData(qData);
      setLoading(false);
    });
  }, []);

  if (loading || !data || !quarterlyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">{isEn ? 'Loading data...' : 'Cargando datos...'}</p>
      </div>
    );
  }

  const nationalAvg = data.national.poverty_nowcast;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">{isEn ? 'Statistics' : 'Estadísticas'}</a>
          {' / '}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">{isEn ? 'Poverty' : 'Pobreza'}</a>
          {' / '}
          <span className="text-gray-900 font-medium">{isEn ? 'Charts' : 'Gráficos'}</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {isEn ? 'Poverty — Time Series' : 'Pobreza - Evolución Temporal'}
        </h1>
        <p className="text-lg text-gray-600">
          {isEn
            ? `Annual nowcast — ${data.metadata.target_year}: ${nationalAvg.toFixed(1)}%`
            : `Nowcast anual — ${data.metadata.target_year}: ${nationalAvg.toFixed(1)}%`}
        </p>
        <div className="mt-4">
          <LastUpdate date={new Date(data.metadata.last_updated).toLocaleDateString(isEn ? 'en-US' : 'es-PE', { day: 'numeric', month: 'short', year: 'numeric' })} />
        </div>

        {/* TIMELINE CHART with Annual/Quarterly Toggle */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{isEn ? 'Time Series' : 'Evolución Temporal'}</h2>

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
                📅 {isEn ? 'Annual' : 'Anual'}
              </button>
              <button
                onClick={() => setFrequency('quarterly')}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                  frequency === 'quarterly'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-r-lg transition-colors`}
              >
                📊 {isEn ? 'Quarterly' : 'Trimestral'}
              </button>
            </div>
          </div>

          {/* Annual Chart */}
          {frequency === 'annual' && data.historical_annual && data.historical_annual.length > 0 && (() => {
            const years = [...data.historical_annual.map(h => h.year), data.metadata.target_year];
            const official = [...data.historical_annual.map(h => h.official), null];
            const nowcast = [...data.historical_annual.map(() => null), data.national.poverty_nowcast];
            return (
            <div>
              <Plot
                data={[
                  {
                    x: years,
                    y: official,
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: isEn ? 'Official (INEI)' : 'Oficial (INEI)',
                    line: { color: '#2563eb', width: 2 },
                    marker: { size: 6 }
                  },
                  {
                    x: years,
                    y: nowcast,
                    type: 'scatter',
                    mode: 'markers+text',
                    name: isEn ? `Nowcast ${data.metadata.target_year}` : `Nowcast ${data.metadata.target_year}`,
                    marker: { color: '#dc2626', size: 12, symbol: 'diamond' },
                    text: nowcast.map(v => v != null ? `${v.toFixed(1)}%` : ''),
                    textposition: 'top center',
                    textfont: { color: '#dc2626', size: 11 }
                  }
                ]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 30, t: 30, b: 50 },
                  xaxis: { title: isEn ? 'Year' : 'Año', gridcolor: '#e5e7eb' },
                  yaxis: { title: isEn ? 'Poverty Rate (%)' : 'Tasa de Pobreza (%)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99 }
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-xs text-gray-400 mt-2 italic">
                {isEn ? 'Note: Y axis does not start at 0 — intended for readability.' : 'Nota: El eje Y no empieza en 0, para facilitar la lectura.'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{isEn ? 'COVID Note:' : 'Nota COVID:'}</strong>{' '}
                {isEn
                  ? 'Errors in 2020 (-10.4pp) and 2021 (+4.6pp) show that the model cannot predict unprecedented shocks like the pandemic.'
                  : 'Los errores en 2020 (-10.4pp) y 2021 (+4.6pp) muestran que el modelo no puede predecir choques sin precedentes como la pandemia.'}
              </p>
            </div>
          );
          })()}

          {/* Quarterly Chart */}
          {frequency === 'quarterly' && (() => {
            const official = quarterlyData.national_quarterly.filter(d => !d.is_nowcast);
            const nowcast  = quarterlyData.national_quarterly.filter(d => d.is_nowcast);
            const bridge   = official.length > 0 && nowcast.length > 0
              ? [official[official.length - 1], ...nowcast] : nowcast;
            return (
            <div>
              <Plot
                data={[
                  {
                    x: official.map(d => d.quarter),
                    y: official.map(d => d.poverty_rate),
                    type: 'scatter',
                    mode: 'lines',
                    name: isEn ? 'Quarterly (Chow-Lin)' : 'Trimestral (Chow-Lin)',
                    line: { color: '#059669', width: 2 },
                    fill: 'tozeroy',
                    fillcolor: 'rgba(5, 150, 105, 0.08)'
                  },
                  {
                    x: bridge.map(d => d.quarter),
                    y: bridge.map(d => d.poverty_rate),
                    type: 'scatter',
                    mode: 'lines+markers',
                    name: isEn ? 'Q3\u2013Q4 2025 nowcast' : 'Nowcast Q3\u2013Q4 2025',
                    line: { color: '#D97706', width: 2, dash: 'dot' },
                    marker: { color: '#D97706', size: 8, symbol: 'diamond' }
                  }
                ] as any[]}
                layout={{
                  height: 400,
                  margin: { l: 50, r: 30, t: 30, b: 80 },
                  xaxis: { title: isEn ? 'Quarter' : 'Trimestre', gridcolor: '#e5e7eb', tickangle: -45, nticks: 22 },
                  yaxis: { title: isEn ? 'Poverty Rate (%)' : 'Tasa de Pobreza (%)', gridcolor: '#e5e7eb' },
                  plot_bgcolor: '#ffffff',
                  paper_bgcolor: '#ffffff',
                  legend: { x: 0.01, y: 0.99 }
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
              <p className="text-xs text-gray-400 mt-2 italic">
                {isEn ? 'Note: Y axis does not start at 0 \u2014 intended for readability.' : 'Nota: El eje Y no empieza en 0, para facilitar la lectura.'}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>{isEn ? 'Method:' : 'M\u00e9todo:'}</strong>{' '}
                {isEn
                  ? 'Chow-Lin temporal disaggregation using quarterly GDP and monthly CPI. Amber diamonds = Q3\u2013Q4 2025 nowcast from rolling 3-month average.'
                  : 'Desagregaci\u00f3n temporal Chow-Lin usando PBI trimestral e IPC mensual. Diamantes \u00e1mbar = nowcast Q3\u2013Q4 2025 del promedio m\u00f3vil de 3 meses.'}
              </p>
            </div>
          );
          })()}
        </div>

        {/* Methodology Link */}
        <div className="mt-8 text-center">
          <a href="/estadisticas/pobreza/metodologia" className="text-blue-700 hover:text-blue-900 font-medium">
            📖 {isEn ? 'View full methodology →' : 'Ver metodología completa →'}
          </a>
        </div>
      </div>
    </div>
  );
}
