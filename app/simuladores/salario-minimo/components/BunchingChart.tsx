'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Cell,
} from 'recharts';
import { type MWEvent, TERRACOTTA, TEAL, CARD_BG, CARD_BORDER } from './mwData';

export default function BunchingChart({ ev }: { ev: MWEvent }) {
  const affLo = Math.round(0.85 * ev.mw_old);
  const exHi  = ev.mw_new + 220;
  const data   = ev.bins.map(b => ({
    bc:    b.bc,
    neg:   b.delta < 0 ? b.delta : 0,
    pos:   b.delta >= 0 ? b.delta : 0,
    inAff: b.bc >= affLo && b.bc < ev.mw_new,
    inExc: b.bc >= ev.mw_new && b.bc < exHi,
  }));

  const domain: [number, number] = [affLo - 75, ev.mw_new + 320];
  const ticks = [affLo, ev.mw_old, ev.mw_new, ev.mw_new + 100, ev.mw_new + 200, ev.mw_new + 300]
    .filter(t => t >= domain[0] && t <= domain[1]);

  return (
    <ResponsiveContainer width="100%" height={420}>
      <BarChart data={data} margin={{ top: 28, right: 12, bottom: 32, left: 8 }} barCategoryGap="8%">
        <ReferenceArea x1={affLo}     x2={ev.mw_new} fill={TERRACOTTA} fillOpacity={0.07} />
        <ReferenceArea x1={ev.mw_new} x2={exHi}      fill={TEAL}       fillOpacity={0.06} />
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e4e0" vertical={false} />
        <XAxis
          dataKey="bc" type="number" domain={domain} ticks={ticks}
          tickFormatter={v => `S/${v}`}
          tick={{ fontSize: 10, fill: '#78716c' }} tickLine={false}
          label={{ value: 'Salario mensual (S/.)', position: 'insideBottom', offset: -18, fontSize: 11, fill: '#a8a29e' }}
        />
        <YAxis
          tickFormatter={v => `${(v as number) > 0 ? '+' : ''}${(v as number).toFixed(1)}pp`}
          tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} width={50}
        />
        <Tooltip
          formatter={(val: unknown) => {
            const v = typeof val === 'number' ? val : 0;
            return [`${v > 0 ? '+' : ''}${v.toFixed(2)} pp`, v < 0 ? 'Desaparecen' : 'Reaparecen'] as [string, string];
          }}
          labelFormatter={(v: unknown) => `S/${v}–${Number(v) + 25}`}
          contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${CARD_BORDER}`, background: CARD_BG, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        />
        <ReferenceLine y={0} stroke="#d6d3d1" strokeWidth={1.5} />
        <ReferenceLine
          x={ev.mw_new} stroke={TERRACOTTA} strokeWidth={3} strokeDasharray="5 3"
          label={{ value: `SM nuevo: S/${ev.mw_new}`, position: 'top', fill: TERRACOTTA, fontSize: 12, fontWeight: 700 }}
        />
        {ev.mw_old !== ev.mw_new && (
          <ReferenceLine
            x={ev.mw_old} stroke="#c4b5a0" strokeWidth={1.5} strokeDasharray="3 2"
            label={{ value: `S/${ev.mw_old}`, position: 'insideTopRight', fill: '#c4b5a0', fontSize: 10 }}
          />
        )}
        <Bar dataKey="neg" isAnimationActive={false}>
          {data.map(b => <Cell key={b.bc} fill={TERRACOTTA} fillOpacity={b.inAff ? 0.88 : 0.18} />)}
        </Bar>
        <Bar dataKey="pos" isAnimationActive={false}>
          {data.map(b => <Cell key={b.bc} fill={TEAL} fillOpacity={b.inExc ? 0.88 : 0.18} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
