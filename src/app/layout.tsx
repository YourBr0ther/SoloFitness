import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiProvider } from '@/contexts/ApiContext';
import { DataProvider } from '@/contexts/DataContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoloFitness",
  description: "Level up your fitness journey with the power of a hunter",
};

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white pb-16`}>
        <ApiProvider>
          <DataProvider>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </DataProvider>
        </ApiProvider>
        <BottomNav />
      </body>
    </html>
  );
}
