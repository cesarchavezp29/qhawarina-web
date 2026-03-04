import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Poverty Nowcast Methodology | Qhawarina",
  description: "GBR model with NTL satellite data for nowcasting monetary poverty by department.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
