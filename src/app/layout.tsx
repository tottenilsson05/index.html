import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const title = "Together";
const description =
  "Together, we make the trenches better. A Christmas reminder on Solana: be kind, build together, and enjoy the holidays.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: "Together",
  keywords: ["Together", "$Together", "Solana", "memecoin", "Christmas", "pump.fun"],
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Together",
    type: "website",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Together — two friends in Christmas hats in the snow" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og-image.jpg"] },
};

export const viewport: Viewport = { themeColor: "#0d1a3a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
