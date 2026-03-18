export default function Watermark() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%',
        transform: 'rotate(-30deg)', display: 'flex', flexWrap: 'wrap', gap: '80px',
        opacity: 0.018, fontSize: '24px', fontWeight: 700, color: '#1a1a1a',
        letterSpacing: '8px', userSelect: 'none', alignContent: 'flex-start',
      }}>
        {Array.from({ length: 200 }, (_, i) => (
          <span key={i} style={{ whiteSpace: 'nowrap' }}>QHAWARINA</span>
        ))}
      </div>
    </div>
  );
}
