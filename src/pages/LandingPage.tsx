import { useNavigate } from "react-router-dom";
import { ArrowRight, Database } from "lucide-react";
import loopaiLogo from "@/assets/loopai-logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_60%/0.1),transparent_50%)]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
        <div className="space-y-10 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
            <Database size={14} />
            <span>Intelligent Venture Capital Analytics</span>
          </div>
          <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-none bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
            LoopAI
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed font-light">
            Harnessing neural intelligence to classify, value, and predict the trajectory of the next generation of startups.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate("/role")}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-primary-foreground transition-all duration-300 bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-4 bg-primary/20 blur-[100px] rounded-full" />
          <div className="relative bg-card/40 backdrop-blur-3xl border border-border/30 rounded-3xl overflow-hidden shadow-2xl p-8">
            <img src={loopaiLogo} alt="LoopAI by TuringFin" className="w-full h-auto object-contain max-w-[400px]" />
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 text-muted-foreground/50 text-[10px] font-bold tracking-[0.2em] uppercase">
        LoopAI for TECH 41 Stanford and educational purpose only. © 2025
      </footer>
    </div>
  );
}
