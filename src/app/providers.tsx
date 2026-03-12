"use client";

import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme/provider";
import { TooltipProvider } from "@/components/ui/tooltip";

function HydrationMarker() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HydrationMarker />
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
