import { CARD_BORDER } from './macroData';

export default function SourceFooter() {
  return (
    <footer className="text-center space-y-2 pt-8 pb-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
      <p className="text-xs" style={{ color: '#a8a29e' }}>
        Elasticidades auditadas · BCRP datos trimestrales 2004–2025 (T=85) · ENAHO 2005–2024 (N=18)
      </p>
      <p className="text-xs" style={{ color: '#c4c0bc' }}>
        Estimaciones propias · full_audit_output.txt · 2026-03-19
      </p>
    </footer>
  );
}
