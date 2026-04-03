import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono, Manrope } from 'next/font/google';
import './globals.css';
import Providers from '@/providers/Providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Signal — AI Trading Platform',
  description:
    'Signal is an AI-powered trading platform that helps you make smarter trading decisions with intelligent automation and real-time insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className='min-h-full flex flex-col'>
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
