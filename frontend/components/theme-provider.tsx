"use client";

import { useTheme } from "@/hooks/use-theme";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useTheme(); // This will apply the theme classes

  return <>{children}</>;
}