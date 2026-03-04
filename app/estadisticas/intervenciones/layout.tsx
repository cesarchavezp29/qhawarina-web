import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Mercado Cambiario & Intervenciones BCRP | Qhawarina',
  description: 'Tipo de cambio PEN/USD, compras e intervenciones spot del BCRP, swaps cambiarios, tasa de referencia, BVL y bonos soberanos. Desde 2020.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
