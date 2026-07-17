import { ThemeToggle } from "@/app/theme-toggle";
import { Logo } from "./logo";

export function Header() {
  return (
    <header
      className="mb-6 flex items-center justify-between"
      style={{ viewTransitionName: "site-header" }}
    >
      <div className="w-fit">
        <Logo />
        <div className="bg-primary mt-1 h-0.5 w-full" />
      </div>
      <ThemeToggle />
    </header>
  );
}
