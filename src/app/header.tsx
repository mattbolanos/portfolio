import { Logo } from "./logo";

export function Header() {
  return (
    <header className="mb-6" style={{ viewTransitionName: "site-header" }}>
      <div className="w-fit">
        <Logo />
        <div className="bg-primary mt-1 h-0.5 w-full" />
      </div>
    </header>
  );
}
