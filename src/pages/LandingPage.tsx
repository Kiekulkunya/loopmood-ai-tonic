import { useNavigate } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import loopaiLogo from "@/assets/loopai-logo.png";
import DisplayModeSelector from "@/components/DisplayModeSelector";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <DisplayModeSelector />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(217_91%_60%/0.1),transparent_50%)]" />

      {/* Logo top-right */}
      <div className="absolute top-6 right-8 z-20">
        <div className="bg-card/40 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-lg p-3">
          <img src={loopaiLogo} alt="LoopAI by TuringFin" className="w-24 h-auto object-contain" />
        </div>
      </div>

      <div className="max-w-4xl w-full z-10 text-center space-y-10">
        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
          <RefreshCw size={14} />
          <span>Intelligent Startup Analytics (Beta)</span>
        </div>
        <h1 className="text-7xl lg:text-9xl font-black tracking-tighter leading-none bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          LoopAI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          "Proposal," "Prototype," "Pivot," "Power," and "Premise" create a rhythmic, memorable sound that feels intentional and designed.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/role")}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-primary-foreground transition-all duration-300 bg-primary rounded-2xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <footer className="absolute bottom-8 text-muted-foreground/50 text-[10px] font-bold tracking-[0.2em] uppercase">
        LoopAI for TECH 41 Stanford and educational purpose only. @ 2026
      </footer>
    </div>
  );
}
