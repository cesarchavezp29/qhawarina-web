export default function Watermark() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          fontSize: 'clamp(60px,12vw,160px)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: '#000',
          opacity: 0.035,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transform: 'rotate(-20deg)',
        }}
      >
        QHAWARINA
      </span>
    </div>
  );
}
