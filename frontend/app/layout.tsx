import type { Metadata } from "next";
import "./globals.css";
import React from "react";

import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { PWARegistration } from "@/components/pwa-registration";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClarityDEX",
  description: "Trade any token on Stacks",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ClarityDEX",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col gap-4 w-full pb-16 md:pb-0">
            <Navbar />
            <main className="flex-1 p-4 md:p-8 lg:p-24">
              {children}
            </main>
            <div className="md:hidden">
              <MobileNav />
            </div>
            <PWARegistration />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
