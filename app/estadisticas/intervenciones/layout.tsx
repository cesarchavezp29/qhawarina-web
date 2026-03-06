import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'FX Market & BCRP Interventions | Qhawarina',
  description: 'PEN/USD exchange rate, BCRP spot interventions and FX swaps, reference rate, BVL and sovereign bonds since 2020. / Tipo de cambio e intervenciones del BCRP desde 2020.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
