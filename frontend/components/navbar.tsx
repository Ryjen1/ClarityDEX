"use client";
import { useStacks } from "@/hooks/use-stacks";
import { abbreviateAddress } from "@/lib/stx-utils";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const { userData, connectWallet, disconnectWallet } = useStacks();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="flex w-full items-center justify-between gap-4 p-4 h-16 border-b border-gray-500 relative">
      <Link href="/" className="text-xl md:text-2xl font-bold">
        ClarityDEX
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4 md:gap-8">
        <Link href="/" className="text-gray-300 hover:text-gray-50 px-2 py-1">
          Swap
        </Link>
        <Link href="/pools" className="text-gray-300 hover:text-gray-50 px-2 py-1">
          Pools
        </Link>
        <Link href="/analytics" className="text-gray-300 hover:text-gray-50 px-2 py-1">
          Analytics
        </Link>
      </div>

      {/* Desktop Wallet Controls */}
      <div className="hidden md:flex items-center gap-2">
        {userData ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {abbreviateAddress(userData.profile.stxAddress.testnet)}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect Wallet
          </button>
        )}
      </div>

      {/* Mobile Wallet Controls */}
      <div className="md:hidden flex items-center gap-2">
        {userData ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {abbreviateAddress(userData.profile.stxAddress.testnet)}
            </button>
            <button
              type="button"
              onClick={disconnectWallet}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connectWallet}
            className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Connect
          </button>
        )}
      </div>

      {/* Mobile Hamburger Menu Button */}
      <button
        className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-t border-gray-500 z-50">
          <div className="flex flex-col items-center gap-4 p-4">
            <Link
              href="/"
              className="text-gray-300 hover:text-gray-50 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Swap
            </Link>
            <Link
              href="/pools"
              className="text-gray-300 hover:text-gray-50 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pools
            </Link>
            <Link
              href="/analytics"
              className="text-gray-300 hover:text-gray-50 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Analytics
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
