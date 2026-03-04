import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Scenarios — Counterfactual Analysis | Qhawarina",
  description: "10 pre-built economic scenarios with cross-model propagation for Peru: recession, inflation spike, political crisis, and more.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
