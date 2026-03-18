'use client';

import { EVENTS, TERRACOTTA } from './mwData';

export default function EventTabs({
  active,
  onChange,
  color = TERRACOTTA,
}: {
  active: number;
  onChange: (i: number) => void;
  color?: string;
}) {
  return (
    <div className="flex gap-2">
      {EVENTS.map((e, i) => (
        <button
          key={e.id}
          onClick={() => onChange(i)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
          style={{
            background: active === i ? color : 'transparent',
            color: active === i ? 'white' : '#6b7280',
            border: `2px solid ${active === i ? color : '#d6d3d1'}`,
          }}
        >
          {e.label}
        </button>
      ))}
    </div>
  );
}
