import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Quarterly Poverty | Qhawarina",
  description: "Quarterly departmental poverty series for Peru using monthly nowcast interpolation.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
