import Navbar from "@/components/homepage/NavBar";
import Hero from "@/components/homepage/Hero";
import Footer from "@/components/homepage/Footer";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { useStore } from "@/services/StoreContext";
import { Spinner } from "@/components/ui/spinner";
import { SparklesCore } from "@/components/homepage/sparkles";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Home() {
  const { state } = useStore();
  const { user } = state;
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (user) {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{GLOBAL_NAME} - Home</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>
      <main className="min-h-screen bg-secondary dark:bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
        {/* <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div> */}

        <div className="h-full w-full absolute inset-0 z-0">
          <SparklesCore id="tsparticlesfullpage" background="transparent" minSize={0.6} maxSize={1.4} particleDensity={200} className="w-full h-full" particleColor="#FFFFFF" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <Footer />
        </div>
      </main>
    </>
  );
}
