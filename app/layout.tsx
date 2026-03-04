import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/BackToTop";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qhawarina - Nowcasting Económico para Perú",
  description: "Predicciones diarias de PBI, inflación y pobreza para Perú usando modelos de factores dinámicos. Datos abiertos y metodología transparente.",
  keywords: "Peru GDP, nowcasting, inflation, poverty, economic indicators, BCRP, INEI",
  manifest: "/manifest.json",
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  themeColor: "#1e40af",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Qhawarina" },
  openGraph: {
    title: "Qhawarina - Economic Nowcasting for Peru",
    description: "Daily GDP, inflation, and poverty predictions for Peru",
    url: "https://qhawarina.pe",
    siteName: "Qhawarina",
    locale: "es_PE",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Qhawarina - Nowcasting Económico para Perú" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qhawarina - Economic Nowcasting for Peru",
    description: "Daily GDP, inflation, and poverty predictions for Peru",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <BackToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
