import type { Metadata } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/providers/SessionProvider';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
});

export const metadata: Metadata = {
  title: 'SoloFitness - Solo Leveling Inspired Fitness App',
  description: 'A Progressive Web App that gamifies daily fitness routines inspired by the Solo Leveling anime',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SoloFitness',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export function generateViewport() {
  return {
    themeColor: '#1976D2',
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
    shrinkToFit: 'no',
    userScalable: 'no',
    viewportFit: 'cover',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <body className="bg-background-dark text-white min-h-screen">
        <SessionProvider>
          {children}
        </SessionProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}