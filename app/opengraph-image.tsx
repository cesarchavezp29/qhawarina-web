import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Qhawarina — Nowcasting Económico para Perú';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #3b82f6 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            QHAWARINA.PE
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            Nowcasting
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#93c5fd',
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            Económico
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-2px',
            }}
          >
            para Perú
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'rgba(255,255,255,0.75)',
              marginTop: '8px',
              maxWidth: '700px',
            }}
          >
            PBI · Inflación · Pobreza · Riesgo Político — actualizado diariamente
          </div>
        </div>

        {/* Bottom row — KPI pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'PBI', value: 'Nowcast', color: '#60a5fa' },
            { label: 'Inflación', value: 'Mensual', color: '#34d399' },
            { label: 'Pobreza', value: 'Anual', color: '#fbbf24' },
            { label: 'Riesgo Político', value: 'Diario', color: '#f87171' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.12)',
                borderRadius: '12px',
                padding: '12px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                border: `2px solid ${color}40`,
              }}
            >
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {label}
              </span>
              <span style={{ fontSize: '18px', color, fontWeight: 700 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
