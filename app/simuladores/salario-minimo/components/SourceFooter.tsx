import { CARD_BORDER } from './mwData';

export default function SourceFooter() {
  return (
    <footer className="text-center space-y-2 pt-8" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
      <p className="text-xs text-stone-400">
        «Missing Mass and Minimum Wages: Distributional Effects of Three Minimum Wage Increases in Peru»
        · Carlos César Chávez Padilla, University of Chicago, 2026
      </p>
      <p className="text-xs text-stone-300">
        ENAHO 2015–2023 · EPE Lima · Estimador distribucional pre-post (Harasztosi &amp; Lindner 2016)
      </p>
    </footer>
  );
}
