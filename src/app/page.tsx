import { Intro } from "@/app/intro";
import { Experience } from "./experience";

export default function Home() {
  return (
    <div className="space-y-10">
      <Intro />

      <Experience />
    </div>
  );
}
