"use client";

export function MobileError({ message }: { message: string }) {
  return (
    <div className="bg-red-900 bg-opacity-90 rounded-lg p-4 mobile-card border border-red-700">
      <div className="flex items-center gap-3">
        <div className="text-red-400 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-300">Error</h3>
          <p className="text-sm text-red-200">{message}</p>
        </div>
      </div>
    </div>
  );
}