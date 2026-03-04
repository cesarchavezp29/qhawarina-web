import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GDP Regional Map | Qhawarina",
  description: "Departmental GDP distribution for Peru using nighttime light (NTL) satellite data.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
