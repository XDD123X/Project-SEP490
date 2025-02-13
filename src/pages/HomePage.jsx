import Navbar from "@/components/homepage/NavBar";
import Hero from "@/components/homepage/Hero";
import Footer from "@/components/homepage/Footer";
import { Helmet } from "react-helmet-async";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Home() {
  return (
    <>
      <Helmet>
        <title>{GLOBAL_NAME} - Home</title>
        <meta name="description" content={`${GLOBAL_NAME} - Online Teaching Center.`} />
      </Helmet>
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10">
          <Navbar />
          <Hero />
          <Footer />
        </div>
      </div>
    </>
  );
}
