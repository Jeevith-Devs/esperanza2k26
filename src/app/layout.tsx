import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, Manrope, Anton, Poppins } from "next/font/google";
import "./globals.css";

import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { MenuProvider } from "@/context/MenuContext";



const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL('https://esperanza2k26.vercel.app'),
  title: {
    default: "Esperanza 2K26 - VTMT Cultural Festival | Chennai's Premier College Fest",
    template: "%s | Esperanza 2K26"
  },
  description: "Join us at Esperanza 2K26 on March 6th! The ultimate cultural festival at Vel Tech Multi Tech, Chennai featuring dance, music, short films, and more. Register now!",
  keywords: ["Esperanza 2K26", "VTMT cultural festival", "College cultural fest in Chennai", "Vel Tech Multi Tech events", "Chennai college events", "Cultural fest 2026", "Engineering college fest Chennai"],
  authors: [{ name: "Vel Tech Multi Tech" }],
  creator: "Vel Tech Multi Tech",
  publisher: "Vel Tech Multi Tech",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Esperanza 2K26 - One Epic Day of Celebration",
    description: "Experience the energy of VTMT's annual cultural festival on March 6th in Chennai. Dance, Music, Arts & more!",
    url: 'https://esperanza2k26.vercel.app',
    siteName: 'Esperanza 2K26',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Esperanza 2K26 Cultural Festival',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Esperanza 2K26 - VTMT Cultural Festival",
    description: "Join the celebration on March 6th! Chennai's most awaited college cultural fest.",
    images: ['/opengraph-image.png'],
    creator: '@vtmt_chennai', 
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://esperanza2k26.vercel.app',
  },
  category: 'Events',
  other: {
    'geo.region': 'IN-TN',
    'geo.placename': 'Chennai',
    'geo.position': '13.1155;80.1471',
    'ICBM': '13.1155, 80.1471',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bricolage.variable} ${manrope.variable} ${anton.variable} ${poppins.variable} antialiased`}>
        <MenuProvider>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
          />
          <JsonLd />
          {children}

        </MenuProvider>
      </body>
    </html>
  );
}
