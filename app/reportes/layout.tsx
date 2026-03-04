import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Reportes | Qhawarina',
  description: 'Reportes diarios y mensuales auto-generados con datos en tiempo real: PBI, inflación, pobreza, riesgo político y mercado cambiario.',
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
