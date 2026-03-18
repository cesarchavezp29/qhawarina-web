import { CARD_BORDER } from './ntlData';

export default function SourceFooter() {
  return (
    <div
      className="text-xs text-stone-400 pt-6"
      style={{ borderTop: `1px solid ${CARD_BORDER}` }}
    >
      <p>
        Fuentes: Chen et al. (2024) NTL armonizado DMSP+VIIRS · BCRP Series Regionales ·
        INEI Censo Distrital · Procesamiento: Qhawarina
      </p>
      <p className="mt-1">
        Nota: Valores pre-2014 basados en sensor DMSP (resolución ~1 km, saturación en Lima).
        Valores 2014+ basados en VIIRS-DNB (resolución ~500 m). Comparar entre eras con cautela.
      </p>
    </div>
  );
}
