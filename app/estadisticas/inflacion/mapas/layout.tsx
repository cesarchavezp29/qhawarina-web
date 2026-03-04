import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Regional Inflation Map | Qhawarina",
  description: "Departmental inflation rates across Peru's 25 regions.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
