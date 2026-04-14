import { ThemeProvider } from "@/components/theme/provider";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      key="theme-provider"
      storageKey="theme"
    >
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
