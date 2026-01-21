"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Swap", icon: "🔄" },
    { href: "/pools", label: "Pools", icon: "🏊" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
  ];

  return (
    <nav className="mobile-nav bg-gray-900 border-t border-gray-700">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full touch-target ${
              pathname === item.href
                ? "text-blue-400 bg-gray-800"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}