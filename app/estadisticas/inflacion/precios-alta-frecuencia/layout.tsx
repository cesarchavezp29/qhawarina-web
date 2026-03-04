import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "High-Frequency Prices | Qhawarina",
  description: "Daily BPP price index from Plaza Vea, Metro and Wong supermarkets using Jevons methodology.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
