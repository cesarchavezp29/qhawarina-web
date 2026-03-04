import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Poverty Charts — Historical Series | Qhawarina",
  description: "Historical annual monetary poverty rates for Peru, national and departmental.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
