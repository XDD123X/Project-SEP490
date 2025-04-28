import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";
import { FloatingPaper } from "./floating-paper";
import { RoboAnimation } from "./robo-animation";
import { Link } from "react-router-dom";

const GLOBAL_NAME = import.meta.env.VITE_GLOBAL_NAME;

export default function Hero({ logged = false }) {
  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center">
      {/* Floating papers background */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingPaper count={6} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground dark:text-white mb-6">
              Learn Smarter with
              <span className="text-primary"> {GLOBAL_NAME}</span>
            </h1>
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-black dark:text-gray-400  text-xl mb-8 max-w-2xl mx-auto">
            Empowering students with innovative online learning solutions. From AI-driven insights to seamless virtual classrooms, we're shaping the future of IELTS and SAT preparation.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {!logged && (
              <Link to="/Login">
                <Button size="lg" variant="outline" className="text-primary border-primary hover:bg-primary/20">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Learn
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Animated robot */}
      <div className="absolute bottom-0 right-0 w-96 h-96">
        <RoboAnimation />
      </div>
    </div>
  );
}
