import { TERRACOTTA, TEAL } from './mwData';

export default function HStackBar({
  formal,
  informal,
  selfemp,
  label,
}: {
  formal: number;
  informal: number;
  selfemp: number;
  label: string;
}) {
  const total = formal + informal + selfemp;
  const fw = (formal  / total) * 100;
  const iw = (informal / total) * 100;
  const sw = (selfemp / total) * 100;

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-stone-600">{label}</div>
      <div className="relative h-10 rounded-lg overflow-hidden flex">
        <div
          style={{ width: `${fw}%`, background: TERRACOTTA, opacity: 0.88 }}
          className="flex items-center justify-center transition-all duration-500"
        >
          {fw > 8 && <span className="text-white text-[10px] font-bold">{fw.toFixed(0)}%</span>}
        </div>
        <div
          style={{ width: `${iw}%`, background: '#94a3b8', opacity: 0.80 }}
          className="flex items-center justify-center transition-all duration-500"
        >
          {iw > 8 && <span className="text-white text-[10px] font-bold">{iw.toFixed(0)}%</span>}
        </div>
        <div
          style={{ width: `${sw}%`, background: TEAL, opacity: 0.88 }}
          className="flex items-center justify-center transition-all duration-500"
        >
          {sw > 8 && <span className="text-white text-[10px] font-bold">{sw.toFixed(0)}%</span>}
        </div>
      </div>
    </div>
  );
}
