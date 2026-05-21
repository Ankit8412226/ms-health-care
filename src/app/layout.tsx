import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AddedToCartModal from "@/components/ui/AddedToCartModal";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MS Care – India's Most Trusted Online Pharmacy | Buy Medicines Online",
    template: "%s | MS Care Pharmacy",
  },
  description:
    "Order 100% genuine medicines, vitamins, health devices & upload prescriptions online. CDSCO licensed pharmacy with express 4-hour delivery, 24/7 support & secure payments. Trusted by 50 Lakh+ customers.",
  keywords: [
    "online pharmacy India",
    "buy medicines online",
    "order medicines online",
    "genuine medicines",
    "prescription upload",
    "healthcare products",
    "vitamins online",
    "diabetes care",
    "heart health medicines",
    "ayurvedic medicines online",
    "MS Care pharmacy",
    "online medical store",
    "health devices",
    "baby care products",
    "skin care online",
  ],
  authors: [{ name: "MS Care Pharmacy Pvt. Ltd." }],
  creator: "MS Care",
  publisher: "MS Care Pharmacy Pvt. Ltd.",
  metadataBase: new URL("https://mscare.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mscare.com",
    siteName: "MS Care Online Pharmacy",
    title: "MS Care – India's #1 Licensed Online Pharmacy | Genuine Medicines",
    description:
      "Order genuine medicines with express delivery. CDSCO licensed, 50L+ customers, AI prescription uploads & 24/7 pharmacist support.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80",
        width: 1200,
        height: 630,
        alt: "MS Care Online Pharmacy – Trusted Healthcare Delivered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MS Care – India's Most Trusted Online Pharmacy",
    description:
      "Order 100% genuine medicines online. Express delivery, AI prescription uploads, licensed pharmacists. Trusted by 50L+ customers.",
    images: [
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80",
    ],
    creator: "@mscare",
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
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 font-sans">
            <Header />
            <main className="flex-grow pb-16 md:pb-8">
              {children}
            </main>
            <Footer />
            <AddedToCartModal />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
