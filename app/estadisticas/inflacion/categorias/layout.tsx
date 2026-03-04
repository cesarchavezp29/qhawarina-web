import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inflation by Category | Qhawarina",
  description: "CPI breakdown by analytical category for Peru: food, core, non-core, services.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
