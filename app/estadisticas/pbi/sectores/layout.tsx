import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "GDP by Sector | Qhawarina",
  description: "GDP breakdown by economic sector for Peru: mining, manufacturing, commerce, services.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
