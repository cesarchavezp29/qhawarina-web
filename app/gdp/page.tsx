'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface GDPData {
  metadata: { generated_at: string; model: string; data_vintage: string };
  nowcast: { target_period: string; value: number; bridge_r2: number };
  recent_quarters: Array<{ quarter: string; official: number | null; nowcast: number | null }>;
  forecasts: Array<{ quarter: string; value: number; lower: number; upper: number }>;
  backtest_metrics: { rmse: number; r2: number };
}


export default function GDPPage() {
  const [data, setData] = useState<GDPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNowcast, setShowNowcast] = useState(true);
  const [showProjection, setShowProjection] = useState(true);
  const [timeRange, setTimeRange] = useState<'3y' | '5y' | '10y' | 'all'>('5y');

  useEffect(() => {
    fetch('/assets/data/gdp_nowcast.json')
      .then(r => r.json())
      .then(gdpData => {
        setData(gdpData);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  const quarters = data.recent_quarters.map(q => q.quarter);
  const official = data.recent_quarters.map(q => q.official);
  const nowcast = data.recent_quarters.map(q => q.nowcast);

  // Find last index with official data (observed period ends here)
  const lastOfficialIdx = official.map((v, i) => v !== null ? i : -1).filter(i => i >= 0).pop() || 0;

  // Calculate 95% confidence intervals for historical nowcasts (±1.96 * RMSE)
  const rmse = data.backtest_metrics.rmse;
  const ci_multiplier = 1.96;
  const nowcast_upper = nowcast.map(val => val !== null ? val + ci_multiplier * rmse : null);
  const nowcast_lower = nowcast.map(val => val !== null ? val - ci_multiplier * rmse : null);

  // Extract forecasts data (separate from nowcasts)
  const forecast_quarters = data.forecasts?.map(f => f.quarter) || [];
  const forecast_values = data.forecasts?.map(f => f.value) || [];
  const forecast_upper = data.forecasts?.map(f => f.upper) || [];
  const forecast_lower = data.forecasts?.map(f => f.lower) || [];

  // Create connection point between nowcast and forecast
  const lastNowcastQuarter = quarters[quarters.length - 1];
  const lastNowcastValue = nowcast[nowcast.length - 1];

  // Prepend connection point to forecast arrays for smooth line
  const forecast_quarters_with_link = [lastNowcastQuarter, ...forecast_quarters];
  const forecast_values_with_link = [lastNowcastValue, ...forecast_values];
  const forecast_upper_with_link = [lastNowcastValue !== null ? lastNowcastValue + ci_multiplier * rmse : null, ...forecast_upper];
  const forecast_lower_with_link = [lastNowcastValue !== null ? lastNowcastValue - ci_multiplier * rmse : null, ...forecast_lower];

  // Filter data by time range
  const filterByTimeRange = (arr: any[], dateArr: string[]) => {
    const now = new Date();
    let cutoffYear = now.getFullYear();

    switch (timeRange) {
      case '3y':
        cutoffYear -= 3;
        break;
      case '5y':
        cutoffYear -= 5;
        break;
      case '10y':
        cutoffYear -= 10;
        break;
      case 'all':
        return arr;
    }

    const startIdx = dateArr.findIndex(d => parseInt(d.split('-')[0]) >= cutoffYear);
    return startIdx >= 0 ? arr.slice(startIdx) : arr;
  };

  const filteredQuarters = filterByTimeRange(quarters, quarters);
  const filteredOfficial = filterByTimeRange(official, quarters);
  const filteredNowcast = filterByTimeRange(nowcast, quarters);
  const filteredNowcastUpper = filterByTimeRange(nowcast_upper, quarters);
  const filteredNowcastLower = filterByTimeRange(nowcast_lower, quarters);

  // Forecast data (always show all forecasts regardless of time range filter)
  const filteredForecastQuarters = forecast_quarters_with_link;
  const filteredForecastValues = forecast_values_with_link;
  const filteredForecastUpper = forecast_upper_with_link;
  const filteredForecastLower = forecast_lower_with_link;

  return (
    <div className="bg-gray-50">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Nowcast de Crecimiento del PBI — {data.nowcast.target_period}
          </h1>
          <p className="text-sm text-gray-600">
            Modelo de Factores Dinámicos con Puente Ridge | Datos hasta: {data.metadata.data_vintage} |
            R² Puente: {data.nowcast.bridge_r2.toFixed(3)} | RMSE: {data.backtest_metrics.rmse.toFixed(2)}pp
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nowcast Actual</div>
            <div className="text-3xl font-semibold text-gray-900">
              {data.nowcast.value > 0 ? '+' : ''}{data.nowcast.value.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-600 mt-1">{data.nowcast.target_period}</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">RMSE</div>
            <div className="text-2xl font-semibold text-gray-900">{data.backtest_metrics.rmse.toFixed(2)}pp</div>
            <div className="text-xs text-gray-600 mt-1">Fuera de muestra</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">R²</div>
            <div className="text-2xl font-semibold text-gray-900">{data.backtest_metrics.r2.toFixed(3)}</div>
            <div className="text-xs text-gray-600 mt-1">In-sample</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Modelo</div>
            <div className="text-xl font-semibold text-gray-900">DFM-Ridge</div>
            <div className="text-xs text-gray-600 mt-1">2 factores, α=1.0</div>
          </div>
        </div>


        {/* Gráfico */}
        <div className="border border-gray-300 p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Tendencia Trimestral</h2>
              <div className="flex gap-4 items-center">
                {/* Time range selector */}
                <div className="flex gap-2">
                  <span className="text-xs text-gray-600">Período:</span>
                  {(['3y', '5y', '10y', 'all'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-2 py-1 text-xs font-medium ${
                        timeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {range === 'all' ? 'Todo' : range.toUpperCase()}
                    </button>
                  ))}
                </div>
                {/* Series toggles */}
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={showNowcast}
                      onChange={(e) => setShowNowcast(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span className="text-gray-700">Nowcast</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={showProjection}
                      onChange={(e) => setShowProjection(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span className="text-gray-700">Proyección</span>
                  </label>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                const csv = 'Trimestre,Oficial,Nowcast\n' + data.recent_quarters.map(q =>
                  `${q.quarter},${q.official || ''},${q.nowcast || ''}`
                ).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'qhawarina_pbi.csv';
                a.click();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Descargar CSV
            </button>
          </div>
          <Plot
            data={[
              // Nowcast confidence interval upper bound
              showNowcast && {
                x: filteredQuarters,
                y: filteredNowcastUpper,
                name: 'IC 95% Superior (Nowcast)',
                type: 'scatter',
                mode: 'lines',
                line: { width: 0 },
                showlegend: false,
                hoverinfo: 'skip'
              },
              // Nowcast confidence interval lower bound (fill to upper)
              showNowcast && {
                x: filteredQuarters,
                y: filteredNowcastLower,
                name: 'IC 95% Nowcast',
                type: 'scatter',
                mode: 'lines',
                fill: 'tonexty',
                fillcolor: 'rgba(5, 150, 105, 0.15)',
                line: { width: 0 },
                showlegend: true
              },
              // Forecast confidence interval upper bound
              showProjection && forecast_quarters.length > 0 && {
                x: filteredForecastQuarters,
                y: filteredForecastUpper,
                name: 'IC 95% Superior (Proyección)',
                type: 'scatter',
                mode: 'lines',
                line: { width: 0 },
                showlegend: false,
                hoverinfo: 'skip'
              },
              // Forecast confidence interval lower bound (fill to upper)
              showProjection && forecast_quarters.length > 0 && {
                x: filteredForecastQuarters,
                y: filteredForecastLower,
                name: 'IC 95% Proyección',
                type: 'scatter',
                mode: 'lines',
                fill: 'tonexty',
                fillcolor: 'rgba(245, 158, 11, 0.15)',
                line: { width: 0 },
                showlegend: true
              },
              // Official data
              {
                x: filteredQuarters,
                y: filteredOfficial,
                name: 'Oficial (BCRP)',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#1E40AF', width: 3 },
                marker: { size: 8 }
              },
              // Nowcast (green dashed)
              showNowcast && {
                x: filteredQuarters,
                y: filteredNowcast,
                name: 'Nowcast',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#059669', width: 3, dash: 'dash' },
                marker: { size: 8, symbol: 'diamond' },
                showlegend: true
              },
              // Forecast / Projection (orange dotted)
              showProjection && forecast_quarters.length > 0 && {
                x: filteredForecastQuarters,
                y: filteredForecastValues,
                name: 'Proyección (6 trimestres)',
                type: 'scatter',
                mode: 'lines+markers',
                line: { color: '#F59E0B', width: 3, dash: 'dot' },
                marker: { size: 8, symbol: 'square' },
                showlegend: true
              }
            ].filter(Boolean)}
            layout={{
              autosize: true,
              height: 500,
              hovermode: 'x unified',
              xaxis: { title: 'Trimestre', gridcolor: '#E5E7EB' },
              yaxis: { title: 'Crecimiento Interanual (%)', gridcolor: '#E5E7EB', zeroline: true },
              legend: { orientation: 'h', y: -0.15 },
              font: { family: 'Inter, sans-serif' },
              plot_bgcolor: '#FFFFFF',
              paper_bgcolor: '#FFFFFF'
            }}
            config={{
              responsive: true,
              displaylogo: false,
              modeBarButtonsToRemove: ['lasso2d', 'select2d']
            }}
            className="w-full"
            useResizeHandler
          />
        </div>

        {/* Tabla */}
        <div className="border border-gray-300 mb-8">
          <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Desglose Trimestral
            </h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Trimestre
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Oficial
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nowcast
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {/* Historical nowcasts */}
              {data.recent_quarters.slice(-12).map((row, idx) => (
                <tr key={`hist-${idx}`} className={idx === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.quarter}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {row.official !== null ? `${row.official > 0 ? '+' : ''}${row.official.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {row.nowcast !== null ? `${row.nowcast > 0 ? '+' : ''}${row.nowcast.toFixed(2)}%` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {row.official !== null && row.nowcast !== null
                      ? `${(row.nowcast - row.official) > 0 ? '+' : ''}${(row.nowcast - row.official).toFixed(2)}pp`
                      : '—'}
                  </td>
                </tr>
              ))}
              {/* Forecasts separator */}
              {data.forecasts && data.forecasts.length > 0 && (
                <tr className="bg-orange-50">
                  <td colSpan={4} className="px-6 py-2 text-xs font-semibold text-orange-800 uppercase tracking-wider">
                    Proyecciones
                  </td>
                </tr>
              )}
              {/* Forecasts */}
              {data.forecasts?.map((fc, idx) => (
                <tr key={`fc-${idx}`} className="bg-orange-50/30 hover:bg-orange-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {fc.quarter} <span className="text-xs text-orange-600">(proyección)</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    —
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-orange-700">
                    {fc.value > 0 ? '+' : ''}{fc.value.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-500">
                    IC: [{fc.lower.toFixed(1)}%, {fc.upper.toFixed(1)}%]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Metodología */}
        <div className="border border-gray-300 p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Metodología
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Modelo:</strong> Modelo de Factores Dinámicos (DFM) de 2 factores con ecuación puente Ridge (α=1.0),
              ventana móvil de 7 años para evitar quiebre estructural COVID-19.
            </p>
            <p>
              <strong>Rendimiento:</strong> RMSE fuera de muestra = {data.backtest_metrics.rmse.toFixed(2)}pp,
              R² = {data.backtest_metrics.r2.toFixed(3)}.
              El benchmark AR(1) tiene RMSE = 0.76pp en períodos estables.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 border border-gray-300"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 border border-gray-300"></div>
      </div>
    </div>
  );
}
