import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_URL = "https://www.deployb20.xyz";
const SITE_TITLE = "B20 Token Launcher — Deploy & Mint B20 Tokens on Base";
const SITE_DESCRIPTION =
  "Deploy and mint B20 tokens on Base in one click — Base's native ERC-20 superset precompile with built-in roles, supply caps, and pausing. No code, no backend, wallet-based signing only.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | B20 Token Launcher",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "B20 token",
    "Base blockchain",
    "deploy ERC-20",
    "mint token",
    "Base Sepolia",
    "token launcher",
    "Base precompile",
    "ERC-20 superset",
  ],
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "B20 Token Launcher",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/B20-logo.png", width: 640, height: 310, alt: "B20 Token Launcher" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/B20-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "base:app_id": "6a3b7c55664da9c3731e1c96",
    "google-site-verification": "YwUN___HBLT-UAxQnNtPCLegEn2fxcVqfKonhg06WjQ",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "B20 Token Launcher",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
