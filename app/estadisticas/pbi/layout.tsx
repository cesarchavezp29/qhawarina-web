import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'PBI — Nowcast Trimestral | Qhawarina',
  description: 'Nowcast trimestral del Producto Bruto Interno de Perú con modelo DFM. Datos históricos desde 2003, predicciones actualizadas diariamente.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
