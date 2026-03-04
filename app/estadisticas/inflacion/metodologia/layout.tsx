import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inflation Nowcast Methodology | Qhawarina",
  description: "Technical description of the DFM model used to nowcast monthly CPI for Peru.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
