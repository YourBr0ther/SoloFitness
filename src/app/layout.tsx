import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ApiProvider } from '@/contexts/ApiContext';

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

// List of public routes that don't need data providers
const publicRoutes = ['/', '/login', '/register', '/forgot-password'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // For server components, we'll use middleware to handle auth
  // Client-side components will handle their own data fetching based on auth state
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white pb-16`}>
        <ApiProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ApiProvider>
        <BottomNav />
      </body>
    </html>
  );
}
