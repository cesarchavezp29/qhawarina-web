'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DepartmentNowcast {
  dept_code: string;
  department: string;
  gdp_yoy: number;
  ntl_share: number;
  gdp_contribution: number;
}

interface RegionalGDPData {
  metadata: {
    method: string;
    target_period: string;
    national_gdp_yoy: number;
    n_departments: number;
    ntl_months: number;
    note: string;
  };
  departmental_nowcasts: DepartmentNowcast[];
}

export default function PBIMapasPage() {
  const [data, setData] = useState<RegionalGDPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/assets/data/gdp_regional_nowcast.json')
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

  if (!data || data.departmental_nowcasts.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mapas Regionales - PBI</h1>
          <p className="text-lg text-gray-600">No hay datos disponibles.</p>
        </div>
      </div>
    );
  }

  const { metadata, departmental_nowcasts } = data;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/pbi" className="hover:text-blue-700">PBI</a>
          {" / "}
          <span className="text-gray-900 font-medium">Mapas</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Mapas Regionales - PBI
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Nowcast de crecimiento del PBI por departamento ({metadata.target_period})
        </p>
        <p className="text-md text-gray-500 mb-4">
          Nacional: <strong>{metadata.national_gdp_yoy.toFixed(2)}%</strong>
        </p>
        <div className="mt-4">
          <LastUpdate date="16-Feb-2026" />
        </div>

        {/* Key Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">PBI Nacional</div>
            <div className="text-3xl font-bold text-gray-900">{metadata.national_gdp_yoy.toFixed(2)}%</div>
            <div className="text-sm text-gray-500 mt-1">{metadata.target_period}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Departamentos</div>
            <div className="text-3xl font-bold text-gray-900">{metadata.n_departments}</div>
            <div className="text-sm text-gray-500 mt-1">Cobertura completa</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-sm font-medium text-gray-600 mb-2">Mayor Contribución</div>
            <div className="text-lg font-bold text-gray-900">
              {departmental_nowcasts[0].department}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {(departmental_nowcasts[0].ntl_share * 100).toFixed(1)}% de actividad económica
            </div>
          </div>
        </div>

        {/* Choropleth Map */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribución Regional del PBI</h2>

          <div className="mb-6">
            <Plot
              data={[
                {
                  type: 'bar',
                  x: departmental_nowcasts.map(d => d.department),
                  y: departmental_nowcasts.map(d => d.ntl_share * 100),
                  marker: {
                    color: departmental_nowcasts.map(d => d.ntl_share * 100),
                    colorscale: 'Viridis',
                    showscale: false,
                  },
                  text: departmental_nowcasts.map(d => `${(d.ntl_share * 100).toFixed(1)}%`),
                  textposition: 'outside',
                  hovertemplate: '<b>%{x}</b><br>' +
                    'Participación: %{y:.1f}%<br>' +
                    'Contribución al crecimiento: +%{customdata:.3f} pp<extra></extra>',
                  customdata: departmental_nowcasts.map(d => d.gdp_contribution),
                },
              ]}
              layout={{
                height: 500,
                margin: { l: 50, r: 30, t: 30, b: 150 },
                xaxis: {
                  title: '',
                  tickangle: -45,
                  tickfont: { size: 10 },
                },
                yaxis: {
                  title: 'Participación en Actividad Económica (%)',
                  gridcolor: '#e5e7eb',
                },
                plot_bgcolor: '#ffffff',
                paper_bgcolor: '#ffffff',
                hovermode: 'x unified',
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>
              <strong>Nota:</strong> Todos los departamentos crecen al {metadata.national_gdp_yoy.toFixed(2)}% (modelo homogéneo).
              La participación regional se estima usando luces nocturnas (NTL) como proxy de actividad económica.
            </p>
          </div>
        </div>

        {/* Regional Table */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nowcasts por Departamento</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Departamento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    PBI YoY (%)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Participación NTL (%)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Contribución (pp)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmental_nowcasts.map((dept, idx) => (
                  <tr key={dept.dept_code} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                      {dept.gdp_yoy.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {(dept.ntl_share * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      +{dept.gdp_contribution.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📊 Metodología</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Método:</strong> {metadata.method}</p>
            <p>
              <strong>Supuesto:</strong> Modelo homogéneo - todos los departamentos crecen al ritmo nacional
              ({metadata.national_gdp_yoy.toFixed(2)}%). La diferencia regional está en la participación económica,
              no en tasas de crecimiento diferenciadas.
            </p>
            <p>
              <strong>Luces Nocturnas (NTL):</strong> Proxy satelital de actividad económica. Correlaciona fuertemente
              con PBI regional. Promedio móvil de {metadata.ntl_months} meses para suavizar variaciones estacionales.
            </p>
            <p>
              <strong>Limitación:</strong> No captura heterogeneidad en tasas de crecimiento departamentales.
              Futuros modelos usarán indicadores regionales específicos para estimar crecimiento diferenciado.
            </p>
          </div>
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
