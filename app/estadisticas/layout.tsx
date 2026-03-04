import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Estadísticas | Qhawarina',
  description: 'Indicadores económicos de alta frecuencia para Perú: PBI, inflación, pobreza, riesgo político y mercado cambiario.',
  openGraph: {
    title: 'Estadísticas — Qhawarina',
    description: 'Nowcasting económico en tiempo real para Perú.',
  },
};

export default function EstadisticasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
