import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import ConditionalConsumerLayout from "@/components/layout/ConditionalConsumerLayout";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Oncolife India – India's Most Trusted Oncology & Specialized Cancer Care Pharmacy",
    template: "%s | Oncolife India",
  },
  description:
    "Order 100% genuine anti-cancer medicines, oncology drugs, chemotherapy supportive care & upload prescriptions online. CDSCO licensed pharmacy with temperature-controlled cold-chain delivery & 24/7 support.",
  keywords: [
    "online cancer pharmacy India",
    "anti-cancer medicines online",
    "buy cancer drugs online",
    "chemotherapy medicines online",
    "oncology pharmacy",
    "genuine cancer medicines",
    "prescription upload",
    "cold chain drug delivery",
    "Oncolife India",
    "oncolifeindia.com",
    "cancer supportive care",
    "critical care medicines",
  ],
  authors: [{ name: "Oncolife India Pvt. Ltd." }],
  creator: "Oncolife India",
  publisher: "Oncolife India Pvt. Ltd.",
  metadataBase: new URL("https://www.oncolifeindia.com"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.oncolifeindia.com",
    siteName: "Oncolife India",
    title: "Oncolife India – India's #1 Licensed Oncology & Specialized Cancer Care Pharmacy",
    description:
      "Order genuine anti-cancer medicines with temperature-controlled cold chain delivery. CDSCO licensed, AI prescription verification & 24/7 pharmacist support.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "Oncolife India – Trusted Oncology Care Delivered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oncolife India – India's Most Trusted Oncology Pharmacy",
    description:
      "Order 100% genuine chemotherapy & anti-cancer medicines online. Express cold chain delivery, AI prescription validation, CDSCO licensed.",
    images: [
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80",
    ],
    creator: "@oncolifeindia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AppProvider>
          <ConditionalConsumerLayout>
            {children}
          </ConditionalConsumerLayout>
        </AppProvider>
      </body>
    </html>
  );
}
