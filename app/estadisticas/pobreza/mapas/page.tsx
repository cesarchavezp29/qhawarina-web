'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import LastUpdate from "../../../components/stats/LastUpdate";

const PeruMap = dynamic(() => import('../../../components/PeruMap'), { ssr: false });

interface PovertyData {
  metadata: { target_year: number };
  departments: Array<{
    code: string;
    name: string;
    poverty_rate_2024: number;
    poverty_rate_2025_nowcast: number;
    change_pp: number;
  }>;
  historical_series?: Array<{
    year: number;
    official: number | null;
    nowcast: number | null;
  }>;
}

interface MapData {
  code: string;
  name: string;
  value: number;
}

export default function PobrezaMapasPage() {
  const [data, setData] = useState<PovertyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [mapLevel, setMapLevel] = useState<'department' | 'district'>('department');
  const [districtData, setDistrictData] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/assets/data/poverty_nowcast.json').then(r => r.json()),
      fetch('/assets/data/poverty_districts_full.csv').then(r => r.text())
    ]).then(([jsonData, csvText]) => {
      setData(jsonData);

      // Parse district CSV
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      const districts = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          code: values[0], // district_ubigeo
          department_code: values[1],
          poverty_rate: parseFloat(values[5]) * 100 // Convert to percentage
        };
      });
      setDistrictData(districts);
      setLoading(false);
    });
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando datos...</p>
      </div>
    );
  }

  const mapData: MapData[] = mapLevel === 'department'
    ? data.departments.map(d => ({
        code: d.code,
        name: d.name,
        value: d.poverty_rate_2025_nowcast
      }))
    : districtData.map(d => ({
        code: d.code,
        name: `Distrito ${d.code}`,
        value: d.poverty_rate
      }));

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/estadisticas" className="hover:text-blue-700">Estadísticas</a>
          {" / "}
          <a href="/estadisticas/pobreza" className="hover:text-blue-700">Pobreza</a>
          {" / "}
          <span className="text-gray-900 font-medium">Mapas</span>
        </nav>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Pobreza - Distribución Regional
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Nowcast departamental - {data.metadata.target_year}
        </p>
        <div className="mt-4">
          <LastUpdate date="15-Feb-2026" />
        </div>

        {/* 1.3.2 MAP */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribución Regional</h2>

          {/* Toggle Department/District */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => setMapLevel('department')}
                className={`px-6 py-3 text-sm font-medium border ${
                  mapLevel === 'department'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-l-lg transition-colors`}
              >
                📍 Departamental (26)
              </button>
              <button
                onClick={() => setMapLevel('district')}
                className={`px-6 py-3 text-sm font-medium border-t border-b border-r ${
                  mapLevel === 'district'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-r-lg transition-colors`}
              >
                🏘️ Distrital (1,891)
              </button>
            </div>
          </div>

          {/* Map Section - Full Width */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Mapa Interactivo - Tasa de Pobreza por {mapLevel === 'department' ? 'Departamento' : 'Distrito'}
            </h3>
            <div className="w-full">
              <PeruMap
                data={mapData}
                indicator="poverty"
                level={mapLevel}
                onDepartmentHover={(dept) => setSelectedDept(dept?.code || null)}
                height={1200}
              />
            </div>
            {mapLevel === 'district' && (
              <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
                <p>💡 <strong>Tip:</strong> Usa zoom y desplazamiento para explorar los 1,891 distritos</p>
                <p className="text-xs">
                  ℹ️ Los distritos en gris no tienen datos disponibles (típicamente zonas remotas de la Amazonía con cobertura limitada de encuestas)
                </p>
              </div>
            )}
            <div className="mt-8 text-sm text-gray-600 max-w-4xl mx-auto">
              <p className="font-semibold mb-4 text-center text-base">Leyenda (Tasa de Pobreza %)</p>
              <div className="grid grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#ffffcc] border border-gray-300"></div>
                      <span>&lt; 10%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#ffeda0] border border-gray-300"></div>
                      <span>10-20%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#fed976] border border-gray-300"></div>
                      <span>20-30%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#feb24c] border border-gray-300"></div>
                      <span>30-40%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#fd8d3c] border border-gray-300"></div>
                      <span>40-50%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#fc4e2a] border border-gray-300"></div>
                      <span>50-60%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#e31a1c] border border-gray-300"></div>
                      <span>60-70%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#bd0026] border border-gray-300"></div>
                      <span>&gt; 70%</span>
                    </div>
                  </div>
                </div>
          </div>
        </div>

        {/* Department Table - Full Width Below */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">
                Ranking Departamental
              </h2>
              <a
                href="/assets/data/poverty_districts_full.csv"
                download
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                📥 Descargar Dataset Completo (CSV)
              </a>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Datos distritales disponibles:</strong> El archivo CSV incluye 1,891 distritos con tasas de pobreza estimadas usando desagregación NTL
            </p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Rank
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Departamento
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          2024 Obs.
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          {data.metadata.target_year} Nowcast
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Cambio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.departments.map((dept, idx) => (
                        <tr
                          key={dept.code}
                          onMouseEnter={() => setSelectedDept(dept.code)}
                          onMouseLeave={() => setSelectedDept(null)}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                            selectedDept === dept.code ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {dept.name}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">
                            {dept.poverty_rate_2024.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-base font-semibold text-gray-900">
                            {dept.poverty_rate_2025_nowcast.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <span className={dept.change_pp < 0 ? 'text-green-700' : 'text-red-700'}>
                              {dept.change_pp > 0 ? '+' : ''}{dept.change_pp.toFixed(1)}pp
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
        </div>
      </div>
    </div>
  );
}
