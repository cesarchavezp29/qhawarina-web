'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Parse YYYY-MM-DD as local date (avoids UTC-to-local day-shift bug)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/gdp_nowcast.json').then(r => r.json()),
      fetch('/assets/data/inflation_nowcast.json').then(r => r.json()),
      fetch('/assets/data/poverty_nowcast.json').then(r => r.json()),
      fetch('/assets/data/political_index_daily.json').then(r => r.json())
    ]).then(([gdp, inflation, poverty, political]) => {
      setData({ gdp, inflation, poverty, political });
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="bg-gray-50">
      {/* Contenido Principal */}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Indicadores Clave */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Indicadores Económicos Clave
          </h2>
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Indicador
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Último
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Crecimiento PBI (interanual)
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.gdp.nowcast.value > 0 ? '+' : ''}{data.gdp.nowcast.value.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.gdp.nowcast.target_period}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-Ridge
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/pbi" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Inflación (mensual)
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.inflation.nowcast.value > 0 ? '+' : ''}{data.inflation.nowcast.value.toFixed(3)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.inflation.nowcast.target_period}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    DFM-AR(1)
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/inflacion" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Tasa de Pobreza
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.poverty.national.poverty_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {data.poverty.metadata.target_year}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GBR
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/estadisticas/pobreza" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Índice de Riesgo Político
                  </td>
                  <td className="px-6 py-4 text-right text-base font-semibold text-gray-900">
                    {data.political.current.score.toFixed(3)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {parseLocalDate(data.political.current.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    GPT-4o
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/political" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver →
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* NEW: Counterfactual Analysis Feature */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mr-3">
                    NUEVO
                  </span>
                  <span className="bg-yellow-400 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                    PRO
                  </span>
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  Análisis Contrafactual
                </h2>
                <p className="text-blue-100 text-lg mb-4 max-w-2xl">
                  Simula escenarios económicos y evalúa su impacto antes de que ocurran.
                  ¿Qué pasaría si el PBI cae a 0%? ¿Y si hay una crisis política?
                </p>
                <div className="flex items-center gap-6 text-sm text-blue-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span>10 escenarios pre-construidos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    <span>Propagación cross-model</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span>Resultados instantáneos</span>
                  </div>
                </div>
                <Link
                  href="/escenarios"
                  className="inline-block bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Explorar Escenarios →
                </Link>
              </div>
              <div className="hidden lg:block pl-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border-2 border-white/20">
                  <div className="text-sm font-semibold mb-3 text-blue-100">
                    Ejemplo: Recesión Leve
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-200">PBI Baseline:</span>
                      <span className="font-bold">+2.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">PBI Counterfactual:</span>
                      <span className="font-bold">0.0%</span>
                    </div>
                    <div className="h-px bg-white/20 my-2"></div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Impacto:</span>
                      <span className="font-bold text-red-300">-2.5pp</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Pobreza:</span>
                      <span className="font-bold text-red-300">+1.25pp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Informativa */}
        <section className="grid grid-cols-2 gap-8 mb-12">
          <div className="border border-gray-300 p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Sobre Qhawarina
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Plataforma de nowcasting económico en tiempo real para Perú utilizando Modelos de Factores Dinámicos,
              Gradient Boosting y clasificación GPT-4o sobre 490+ indicadores.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Actualización diaria a las 08:00 PET. Todos los datos y modelos son código abierto bajo licencia CC BY 4.0.
            </p>
          </div>
          <div className="border border-gray-300 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
              Metodología
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li><strong>PBI:</strong> DFM 2 factores, puente Ridge (α=1.0), ventana móvil 7 años</li>
              <li><strong>Inflación:</strong> DFM 2 factores con rezagos + componente AR(1)</li>
              <li><strong>Pobreza:</strong> GBR en panel departamental + desagregación NTL</li>
              <li><strong>Político:</strong> 81 feeds RSS, clasificación binaria GPT-4o</li>
            </ul>
          </div>
        </section>

        {/* Métricas de Rendimiento */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 tracking-tight">
            Rendimiento de Modelos (Fuera de Muestra)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">RMSE PBI</div>
              <div className="text-2xl font-semibold text-gray-900">{data.gdp.backtest_metrics.rmse.toFixed(2)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.gdp.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">RMSE Inflación</div>
              <div className="text-2xl font-semibold text-gray-900">{data.inflation.backtest_metrics.rmse.toFixed(3)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.inflation.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">RMSE Pobreza</div>
              <div className="text-2xl font-semibold text-gray-900">{data.poverty.backtest_metrics.rmse.toFixed(2)}pp</div>
              <div className="text-xs text-gray-600 mt-1">R² = {data.poverty.backtest_metrics.r2.toFixed(3)}</div>
            </div>
            <div className="border border-gray-300 p-4 bg-white">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cobertura</div>
              <div className="text-2xl font-semibold text-gray-900">490+</div>
              <div className="text-xs text-gray-600 mt-1">Indicadores económicos</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="border border-gray-300">
          <div className="h-12 bg-gray-100 mb-2"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-white border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
