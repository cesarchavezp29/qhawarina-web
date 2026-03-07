import type { Metadata } from "next";
import { DM_Serif_Display, Outfit, Source_Sans_3, DM_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/BackToTop";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});
const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const dmMono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Qhawarina - Nowcasting Económico para Perú",
  description: "Predicciones diarias de PBI, inflación y pobreza para Perú usando modelos de factores dinámicos. Datos abiertos y metodología transparente.",
  keywords: "Peru GDP, nowcasting, inflation, poverty, economic indicators, BCRP, INEI",
  manifest: "/manifest.json",
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    languages: { 'es-PE': 'https://qhawarina.pe', 'en': 'https://qhawarina.pe' },
  },
  themeColor: "#C65D3E",
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
      <body className={`${dmSerif.variable} ${outfit.variable} ${sourceSans.variable} ${dmMono.variable} font-sans`}>
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
