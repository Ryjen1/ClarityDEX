"use client";

import { useEffect, useState } from "react";

export function MobileLoading() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 mobile-card max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading{".".repeat(dots)}</p>
          <p className="text-sm text-gray-400 text-center">
            Please wait while we prepare your decentralized exchange experience
          </p>
        </div>
      </div>
    </div>
  );
}