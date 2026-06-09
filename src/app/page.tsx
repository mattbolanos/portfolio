import { Intro } from "@/app/intro";
import { Experience } from "./experience";
import { Projects } from "./projects";

export default function Home() {
  return (
    <div className="space-y-10">
      <Intro />
      <Projects />
      <Experience />
    </div>
  );
}
