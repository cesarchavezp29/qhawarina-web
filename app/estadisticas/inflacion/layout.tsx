import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Inflación — Nowcast Mensual | Qhawarina',
  description: 'Nowcast mensual del IPC de Lima Metropolitana. Variación porcentual mensual y acumulada. Incluye índice BPP de supermercados.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
