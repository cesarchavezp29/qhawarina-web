import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GDP Charts — Historical Series | Qhawarina",
  description: "Quarterly and annual historical GDP growth series for Peru with DFM nowcast comparison.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
