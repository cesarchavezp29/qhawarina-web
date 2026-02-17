'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PoliticalData {
  metadata: { generated_at: string; coverage_days: number; rss_feeds: number };
  current: { date: string; score: number; level: string; articles_total: number };
  aggregates: { '7d_avg': number; '30d_avg': number; year_max: number; year_max_date: string };
  major_events: Array<{ date: string; score: number; level: string; summary: string }>;
  daily_series: Array<{ date: string; score: number; score_raw: number; n_articles: number; low_coverage: boolean }>;
}

export default function PoliticalPage() {
  const [data, setData] = useState<PoliticalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/political_index_daily.json')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading || !data) {
    return <LoadingSkeleton />;
  }

  const dates = data.daily_series.map(d => d.date);
  const scores = data.daily_series.map(d => d.score);
  const scoresRaw = data.daily_series.map(d => d.score_raw);
  const nArticles = data.daily_series.map(d => d.n_articles);

  const getLevelText = (level: string) => {
    if (level === 'BAJO') return 'Bajo';
    if (level === 'MEDIO') return 'Medio';
    return 'Alto';
  };

  return (
    <div className="bg-gray-50">
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
            Índice de Inestabilidad Política — {new Date(data.current.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h1>
          <p className="text-sm text-gray-600">
            Clasificación diaria GPT-4o de {data.metadata.rss_feeds} feeds RSS ({data.metadata.coverage_days} días de cobertura) |
            Nivel actual: {getLevelText(data.current.level)}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Índice Actual</div>
            <div className="text-3xl font-semibold text-gray-900">
              {data.current.score.toFixed(3)}
            </div>
            <div className="text-xs text-gray-600 mt-1">{getLevelText(data.current.level)}</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prom. 7d</div>
            <div className="text-2xl font-semibold text-gray-900">{data.aggregates['7d_avg'].toFixed(3)}</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prom. 30d</div>
            <div className="text-2xl font-semibold text-gray-900">{data.aggregates['30d_avg'].toFixed(3)}</div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Máx. 1 año</div>
            <div className="text-2xl font-semibold text-gray-900">{data.aggregates['year_max'].toFixed(3)}</div>
            <div className="text-xs text-gray-600 mt-1">
              {new Date(data.aggregates['year_max_date']).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
            </div>
          </div>
          <div className="border border-gray-300 p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Artículos Hoy</div>
            <div className="text-2xl font-semibold text-gray-900">{data.current.articles_total}</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="border border-gray-300 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Serie Temporal — Último año</h2>
          <Plot
            data={[
              {
                x: dates,
                y: scoresRaw,
                type: 'bar',
                name: 'Score diario (raw)',
                marker: { color: 'rgba(220, 38, 38, 0.25)' },
                hovertemplate: '<b>%{x}</b><br>Raw: %{y:.3f}<extra></extra>',
              },
              {
                x: dates,
                y: scores,
                type: 'scatter',
                mode: 'lines',
                name: 'Tendencia (7d)',
                line: { color: '#DC2626', width: 2.5 },
                hovertemplate: '<b>%{x}</b><br>Tendencia: %{y:.3f}<extra></extra>',
              }
            ]}
            layout={{
              autosize: true,
              height: 420,
              hovermode: 'x unified',
              barmode: 'overlay',
              legend: { orientation: 'h', y: 1.08, x: 0 },
              xaxis: { title: 'Fecha', gridcolor: '#E5E7EB' },
              yaxis: {
                title: 'Índice de Inestabilidad (0-1)',
                range: [0, 1],
                gridcolor: '#E5E7EB'
              },
              shapes: [
                {
                  type: 'rect',
                  xref: 'paper',
                  x0: 0,
                  x1: 1,
                  y0: 0,
                  y1: 0.33,
                  fillcolor: 'rgba(5, 150, 105, 0.08)',
                  line: { width: 0 }
                },
                {
                  type: 'rect',
                  xref: 'paper',
                  x0: 0,
                  x1: 1,
                  y0: 0.33,
                  y1: 0.66,
                  fillcolor: 'rgba(245, 158, 11, 0.08)',
                  line: { width: 0 }
                },
                {
                  type: 'rect',
                  xref: 'paper',
                  x0: 0,
                  x1: 1,
                  y0: 0.66,
                  y1: 1,
                  fillcolor: 'rgba(220, 38, 38, 0.08)',
                  line: { width: 0 }
                }
              ],
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
          <div className="mt-4 text-xs text-gray-600 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-3 bg-red-200 rounded"></div>
              <span>Score diario raw (barras)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-600"></div>
              <span>Tendencia 7d suavizada (línea)</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-4 h-4 bg-green-100 border border-gray-300"></div>
              <span>Bajo (0.00–0.33)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border border-gray-300"></div>
              <span>Medio (0.33–0.66)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-gray-300"></div>
              <span>Alto (0.66–1.00)</span>
            </div>
          </div>
        </div>

        {/* Eventos Principales */}
        <div className="border border-gray-300 mb-8">
          <div className="bg-gray-50 border-b border-gray-300 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Períodos de Alta Inestabilidad
            </h3>
          </div>
          {data.major_events.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-600">
              No hay períodos de alta inestabilidad en el último año
            </div>
          ) : (
            <div className="divide-y divide-gray-200 bg-white">
              {data.major_events.slice(0, 10).map((event, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(event.date).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{event.summary}</p>
                    </div>
                    <div className="ml-6 text-right flex-shrink-0">
                      <p className="text-2xl font-semibold text-gray-900">{event.score.toFixed(3)}</p>
                      <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider">
                        {getLevelText(event.level)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Metodología */}
        <div className="border border-gray-300 p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
            Metodología
          </h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Clasificación:</strong> GPT-4o analiza diariamente {data.metadata.rss_feeds} feeds RSS de medios peruanos,
              clasificando cada artículo como "estable" (0) o "inestable" (1) según criterios políticos,
              sociales, financieros y normativos.
            </p>
            <p>
              <strong>Cálculo del índice:</strong> Promedio ponderado de 3 componentes — clasificación de noticias (50%),
              componente financiero de volatilidad FX + spread crediticio + caída de reservas (30%),
              e indicador de confianza empresarial invertido (20%).
            </p>
            <p>
              <strong>Umbrales:</strong> Bajo (0.00-0.33), Medio (0.33-0.66), Alto (0.66-1.00).
              Actualización diaria a las 08:00 PET.
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
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-100 border border-gray-300"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 border border-gray-300"></div>
      </div>
    </div>
  );
}
