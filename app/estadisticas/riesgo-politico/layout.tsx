import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Political Risk / Riesgo Político | Qhawarina',
  description: 'Daily political instability index for Peru. GPT-4o classification of 81 Peruvian RSS feeds, updated daily. / Índice diario de riesgo político para Perú clasificado con GPT-4o.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
