import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Pobreza — Nowcast Anual | Qhawarina',
  description: 'Nowcast anual de pobreza monetaria para Perú y sus 25 departamentos. Modelo GBR con NTL satelital. Actualizado diariamente.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
