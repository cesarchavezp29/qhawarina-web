import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Calendario de Publicaciones | Qhawarina',
  description: 'Fechas de publicación de estadísticas oficiales (INEI, BCRP) e indicadores Qhawarina para 2026.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
