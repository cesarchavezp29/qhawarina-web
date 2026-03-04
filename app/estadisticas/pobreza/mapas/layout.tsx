import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Poverty Regional Map | Qhawarina",
  description: "Departmental poverty rates across Peru's 25 regions with NTL satellite estimates.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
