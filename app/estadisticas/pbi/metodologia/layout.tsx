import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GDP Nowcast Methodology | Qhawarina",
  description: "Technical description of the Dynamic Factor Model (DFM) used to nowcast Peru GDP.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
