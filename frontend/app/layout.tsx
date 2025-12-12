import type { Metadata } from "next";
import "./globals.css";
import React from "react";

import { Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClarityDEX",
  description: "Trade any token on Stacks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col gap-4 w-full pb-16 md:pb-0">
          <Navbar />
          <main className="flex-1 p-4 md:p-8 lg:p-24">
            {children}
          </main>
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </body>
    </html>
  );
}
