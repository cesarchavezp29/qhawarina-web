import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Inflation Charts — CPI History | Qhawarina",
  description: "Historical CPI series for Peru with monthly and 12-month variations.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
