import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Poverty by District | Qhawarina",
  description: "Poverty estimates for ~1,800 Peruvian districts using satellite NTL dasymetric proxy.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
