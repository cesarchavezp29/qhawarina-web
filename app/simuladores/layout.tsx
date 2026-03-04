import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Simuladores Económicos | Qhawarina',
  description: 'Calculadoras interactivas: simulador de shocks al PBI, calculadora de inflación acumulada y proyecciones de pobreza departamental.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
