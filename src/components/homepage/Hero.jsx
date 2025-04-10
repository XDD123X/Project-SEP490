import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Spinner } from "../ui/spinner";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Hero() {
  return (
    <section className="container flex min-h-[calc(100vh-3.5rem)] max-w-screen-2xl flex-col items-center justify-center space-y-8 py-24 text-center md:py-32">
      <div className="space-y-4">
        <h1 className="bg-gradient-to-br from-foreground from-30% via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
          Learn Smarter with
          <p className="text-primary">{GLOBAL_NAME}</p>
        </h1>
        <p className="mx-auto max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Empowering students with innovative online learning solutions. From AI-driven insights to seamless virtual classrooms, we're shaping the future of IELTS and SAT preparation.
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/Login">
          <Button variant="outline" size="lg">
            Learn
          </Button>
        </Link>
      </div>
    </section>
  );
}
