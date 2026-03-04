import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Riesgo Político | Qhawarina',
  description: 'Índice diario de riesgo político para Perú. Clasificación GPT-4o de 81 feeds RSS de medios peruanos. Actualizado diariamente.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
