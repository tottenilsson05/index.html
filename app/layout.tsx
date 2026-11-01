import type { Metadata, Viewport } from 'next';
import { Poppins, Nunito } from 'next/font/google';
import { SITE_URL } from '@/lib/config';
import './globals.css';

const display = Poppins({ subsets: ['latin'], weight: ['700', '800', '900'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const body = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800', '900'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Post Your Mo ($MO) — Grow it. Post it. Win it.',
  description: 'Post your mustache, get the votes, win the fees. Every 5 minutes the most-voted mo wins 100% of the round’s creator fees. $MO on Pump.fun — CA: HAB42JadC7ETDGEWCuLBGVkSBgBaREE25THCo5tspump',
  other: { 'token:chain': 'solana', 'token:address': 'HAB42JadC7ETDGEWCuLBGVkSBgBaREE25THCo5tspump', 'token:launchpad': 'pump.fun' },
  openGraph: {
    title: 'Post Your Mo ($MO)',
    description: 'Grow it. Post it. Win it. Every 5 minutes the most-voted mustache wins the creator fees.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Post Your Mo ($MO)', description: 'Grow it. Post it. Win it.' },
};

export const viewport: Viewport = { themeColor: '#e6f7ee', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
