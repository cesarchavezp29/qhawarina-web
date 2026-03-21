import type { Metadata } from "next";
import Watermark from '../simuladores/impacto-macro/components/Watermark';

export const metadata: Metadata = {
  title: "Scenarios — Counterfactual Analysis | Qhawarina",
  description: "10 pre-built economic scenarios with cross-model propagation for Peru: recession, inflation spike, political crisis, and more.",
};

export default function EscenariosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: '#FAF8F4',
      minHeight: '100vh',
      fontFamily: "'Inter',system-ui,sans-serif",
      position: 'relative',
    }}>
      <Watermark />
      {children}
    </div>
  );
}
