'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

interface MapData {
  code: string;
  name: string;
  value: number;
}

interface PeruMapProps {
  data: MapData[];
  indicator: 'poverty' | 'gdp' | 'inflation';
  level?: 'department' | 'district';
  onDepartmentHover?: (dept: MapData | null) => void;
  height?: number;
}

export default function PeruMap({ data, indicator, level = 'department', onDepartmentHover, height = 600 }: PeruMapProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; value: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Professional color scales (ColorBrewer-inspired)
  const getColor = (value: number) => {
    if (indicator === 'poverty') {
      // YlOrRd - Sequential (lighter to darker = worse)
      if (value < 10) return '#ffffcc';
      if (value < 20) return '#ffeda0';
      if (value < 30) return '#fed976';
      if (value < 40) return '#feb24c';
      if (value < 50) return '#fd8d3c';
      if (value < 60) return '#fc4e2a';
      if (value < 70) return '#e31a1c';
      return '#bd0026';
    } else if (indicator === 'gdp') {
      // RdYlGn - Diverging (red = bad, yellow = neutral, green = good)
      if (value < -3) return '#d73027';
      if (value < -1.5) return '#f46d43';
      if (value < -0.5) return '#fdae61';
      if (value < 0.5) return '#fee08b';
      if (value < 1.5) return '#d9ef8b';
      if (value < 2.5) return '#a6d96a';
      if (value < 4) return '#66bd63';
      return '#1a9850';
    } else {
      // Inflation: RdYlGn inverted (green = low, red = high)
      if (value < -0.3) return '#1a9850';
      if (value < 0) return '#66bd63';
      if (value < 0.2) return '#a6d96a';
      if (value < 0.4) return '#d9ef8b';
      if (value < 0.5) return '#fee08b';
      if (value < 0.7) return '#fdae61';
      if (value < 0.9) return '#f46d43';
      return '#d73027';
    }
  };

  // Format value for display
  const formatValue = (value: number) => {
    if (indicator === 'poverty') return `${value.toFixed(1)}%`;
    if (indicator === 'gdp') return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    return `${value > 0 ? '+' : ''}${value.toFixed(3)}%`;
  };

  // Create lookup map
  const dataMap = new Map(data.map(d => [d.code, d]));

  // Conditional GeoJSON source and property key
  const geoJsonPath = level === 'district'
    ? '/assets/geo/peru_distrital.geojson'
    : '/assets/geo/peru_departamental.geojson';
  const idProperty = level === 'district' ? 'IDDIST' : 'FIRST_IDDP';

  // Adjust scale based on level
  const scale = level === 'district' ? 3500 : 3200;

  return (
    <div className="relative bg-gray-50" style={{ height }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: scale,
          center: [-75.5, -9.5]
        }}
        width={1200}
        height={height}
        className="w-full h-full"
      >
        <ZoomableGroup center={[-75.5, -9.5]} zoom={1}>
          <Geographies geography={geoJsonPath}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const deptCode = geo.properties[idProperty];
                const deptData = dataMap.get(deptCode);
                const isHovered = hoveredDept === deptCode;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={deptData ? getColor(deptData.value) : '#e5e7eb'}
                    stroke={isHovered ? '#1e40af' : '#ffffff'}
                    strokeWidth={isHovered ? 2.5 : 0.75}
                    style={{
                      default: { outline: 'none', transition: 'all 0.2s ease-in-out' },
                      hover: { outline: 'none', cursor: 'pointer', filter: 'brightness(0.9)' },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={(evt) => {
                      setHoveredDept(deptCode);
                      if (deptData) {
                        setTooltipContent({ name: deptData.name, value: deptData.value });
                        setTooltipPos({ x: evt.clientX, y: evt.clientY });
                        if (onDepartmentHover) {
                          onDepartmentHover(deptData);
                        }
                      }
                    }}
                    onMouseMove={(evt) => {
                      setTooltipPos({ x: evt.clientX, y: evt.clientY });
                    }}
                    onMouseLeave={() => {
                      setHoveredDept(null);
                      setTooltipContent(null);
                      if (onDepartmentHover) {
                        onDepartmentHover(null);
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPos.x + 10}px`,
            top: `${tooltipPos.y + 10}px`
          }}
        >
          <div className="bg-gray-900 text-white px-3 py-2 rounded shadow-lg text-sm">
            <div className="font-semibold">{tooltipContent.name}</div>
            <div className="text-xs">{formatValue(tooltipContent.value)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
