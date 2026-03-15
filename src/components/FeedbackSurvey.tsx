import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Star,
  Send,
  SkipForward,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

const FEATURES = [
  { id: "classifier", label: "Startup Classifier", desc: "AI-powered stage classification from articles & URLs", emoji: "🔬" },
  { id: "decoded", label: "Decoded X Return", desc: "M×P×T×F risk framework & scenario probabilities", emoji: "📈" },
  { id: "risk", label: "Risk & PWMOIC", desc: "Full PWMOIC computation with TAM & industry analysis", emoji: "⚡" },
  { id: "valuation", label: "Valuation Simulator", desc: "3-firm comparative scoring across 23 parameters", emoji: "🎯" },
  { id: "nova", label: "Nova Dashboard", desc: "Comprehensive visualization & firm battle analytics", emoji: "📊" },
  { id: "chatbot", label: "Ask LoopAI Chatbot", desc: "AI assistant for startup analytics questions", emoji: "💬" },
];

export interface SurveyResult {
  ranking: string[];
  satisfaction: number;
  mostValuable: string;
  suggestion: string;
  wouldRecommend: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (result: SurveyResult) => void;
  onSkip: () => void;
}

export default function FeedbackSurvey({ open, onClose, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [ranking, setRanking] = useState<string[]>(FEATURES.map((f) => f.id));
  const [satisfaction, setSatisfaction] = useState(0);
  const [mostValuable, setMostValuable] = useState("");
  const [nps, setNps] = useState(0);
  const [suggestion, setSuggestion] = useState("");

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const arr = [...ranking];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setRanking(arr);
  };

  const moveDown = (idx: number) => {
    if (idx === ranking.length - 1) return;
    const arr = [...ranking];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setRanking(arr);
  };

  const handleSubmit = () => {
    onComplete({ ranking, satisfaction, mostValuable, suggestion, wouldRecommend: nps });
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return satisfaction > 0;
    if (step === 3) return nps > 0;
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-[#1E293B] text-white max-w-lg p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-600/25 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-white text-base">Quick Feedback</DialogTitle>
                <DialogDescription className="text-slate-400 text-xs mt-0.5">Help us improve LoopAI — takes 30 seconds</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full overflow-hidden bg-[#1E293B]">
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: step >= s ? "100%" : "0%", backgroundColor: step >= s ? "#3B82F6" : "#1E293B" }} />
                </div>
              </div>
            ))}
            <span className="text-[10px] text-slate-500 ml-1">{step}/{totalSteps}</span>
          </div>
        </div>

        <div className="px-6 pb-2" style={{ minHeight: 320 }}>
          {step === 1 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-1">Rank features by importance</h3>
              <p className="text-[10px] text-slate-500 mb-4">Use arrows to reorder. #1 = most important to you.</p>
              <div className="space-y-1.5">
                {ranking.map((id, idx) => {
                  const feature = FEATURES.find((f) => f.id === id)!;
                  const isTop3 = idx < 3;
                  return (
                    <div key={id} className={`flex items-center gap-3 py-2.5 px-3 rounded-lg border transition-all ${isTop3 ? "bg-blue-500/5 border-blue-500/20" : "bg-[#0B0F19] border-[#1E293B]"}`}>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${idx === 0 ? "bg-amber-500/20 text-amber-400" : idx === 1 ? "bg-slate-400/15 text-slate-300" : idx === 2 ? "bg-orange-500/15 text-orange-400" : "bg-[#1E293B] text-slate-500"}`}>{idx + 1}</div>
                      <span className="text-sm mr-1">{feature.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white">{feature.label}</div>
                        <div className="text-[9px] text-slate-500 truncate">{feature.desc}</div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveUp(idx)} disabled={idx === 0} className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors">
                          <ChevronLeft className="w-3 h-3 rotate-90" />
                        </button>
                        <button onClick={() => moveDown(idx)} disabled={idx === ranking.length - 1} className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition-colors">
                          <ChevronRight className="w-3 h-3 rotate-90" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-1">How satisfied are you with LoopAI?</h3>
              <p className="text-[10px] text-slate-500 mb-5">Rate your overall experience</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button key={v} onClick={() => setSatisfaction(v)} className="group flex flex-col items-center gap-1.5 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${satisfaction >= v ? "bg-amber-500/20 border border-amber-500/40 scale-110" : "bg-[#1E293B] border border-[#334155] hover:border-slate-500"}`}>
                      <Star className={`w-6 h-6 transition-colors ${satisfaction >= v ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                    </div>
                    <span className={`text-[9px] font-medium ${satisfaction >= v ? "text-amber-400" : "text-slate-600"}`}>
                      {["Poor", "Fair", "Good", "Great", "Love it"][v - 1]}
                    </span>
                  </button>
                ))}
              </div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Which feature is most valuable to you?</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {FEATURES.map((f) => (
                  <button key={f.id} onClick={() => setMostValuable(f.id)} className={`flex items-center gap-2 py-2 px-3 rounded-lg border text-left transition-all ${mostValuable === f.id ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "bg-[#0B0F19] border-[#1E293B] text-slate-400 hover:border-[#334155]"}`}>
                    <span className="text-sm">{f.emoji}</span>
                    <span className="text-[10px] font-medium">{f.label}</span>
                    {mostValuable === f.id && <Check className="w-3 h-3 ml-auto text-blue-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-sm font-bold text-white mb-1">How likely are you to recommend LoopAI?</h3>
              <p className="text-[10px] text-slate-500 mb-4">0 = Not likely, 10 = Extremely likely</p>
              <div className="flex gap-1 mb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
                  const color = v <= 6 ? "#EF4444" : v <= 8 ? "#F59E0B" : "#10B981";
                  const isSelected = nps === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setNps(v)}
                      className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${isSelected ? "scale-110" : "hover:scale-105"}`}
                      style={{
                        backgroundColor: isSelected ? color + "25" : "#1E293B",
                        color: isSelected ? color : "#64748B",
                        boxShadow: isSelected ? `0 0 0 1px ${color}, 0 0 0 2px #111827` : undefined,
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 mb-5 px-1">
                <span>Not likely</span><span>Neutral</span><span>Very likely</span>
              </div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Any suggestions to improve? (optional)</h4>
              <textarea
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                placeholder="What would make LoopAI even better for you?"
                rows={3}
                className="w-full bg-[#0B0F19] border border-[#1E293B] rounded-lg px-3 py-2.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#1E293B] flex items-center justify-between">
          <button onClick={onSkip} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
            <SkipForward className="w-3 h-3 inline mr-1" />Skip survey
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="text-xs bg-transparent border-[#1E293B] text-slate-400 hover:text-white hover:bg-white/5">
                <ChevronLeft className="w-3 h-3 mr-1" />Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="text-xs bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
                Next<ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSubmit} disabled={!canProceed()} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">
                <Send className="w-3 h-3 mr-1" />Submit Feedback
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
