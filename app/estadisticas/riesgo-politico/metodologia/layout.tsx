import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Political Risk Methodology | Qhawarina",
  description: "GPT-4o binary classification of 81 RSS news feeds to build daily political risk index.",
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
