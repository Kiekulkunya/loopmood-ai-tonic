// ═══════════════════════════════════════════════════════════════
// src/pages/PMArchitecture.tsx — LoopAI Core Architecture
// REPLACES existing PMArchitecture.tsx
// Sidebar label: "LoopAI Core Architecture" (Fix #1)
// Paste into Lovable file editor
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import {
  Shield, Database, Globe, Cpu, MessageSquare, Layout,
  Server, Lock, Eye, Zap, GitBranch, Layers, Code2,
  Monitor, Palette, Brain, Bot, Key, Cloud, ArrowRight,
  ChevronDown, ChevronRight, Workflow, Heart, Star, Mail,
  BarChart3, Target, ShieldCheck, Leaf, FileText, Sparkles,
  Send, Clock, Users, TrendingUp, Settings, Smartphone,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── System Node Type ────────────────────────────────

interface SystemNode {
  id: string;
  title: string;
  subtitle: string;
  layer: string;
  icon: any;
  color: string;
  tech: string[];
  details: string[];
  status: "live" | "beta" | "planned";
  connections: string[];
  isNew?: boolean;
}

// ─── Fix #2: Reordered External Services — Lovable first, Gemini last ───
// ─── Fix #3-7: Added all new components ───

const NODES: SystemNode[] = [
  // ══ External AI Services (Fix #2: Lovable → Claude → ChatPRD → ChatGPT → Gemini)
  { id: "lovable", title: "Lovable", subtitle: "Vibe Coding Platform", layer: "external", icon: Heart, color: "#EC4899",
    tech: ["React + TypeScript", "Tailwind CSS", "shadcn/ui", "Auto-Deploy"],
    details: ["AI-assisted code generation & iteration", "Real-time preview environment", "Git integration with auto-deploy", "Supabase connector built-in", "Component library (shadcn/ui)"],
    status: "live", connections: ["frontend", "github"] },
  { id: "claude", title: "Anthropic Claude", subtitle: "Architecture & Deep Analysis", layer: "external", icon: Brain, color: "#8B5CF6",
    tech: ["claude-sonnet-4-20250514", "Messages API", "200K context"],
    details: ["Architecture design assistance", "Deep analytical reasoning", "Long-context document analysis", "PRD generation support", "Code review & optimization"],
    status: "live", connections: ["edge-fn", "ai-enhance"] },
  { id: "chatprd", title: "ChatPRD", subtitle: "Product Requirement Design", layer: "external", icon: FileText, color: "#F59E0B",
    tech: ["PRD Generation", "User Stories", "Success Metrics"],
    details: ["Automated PRD document creation", "User story generation from requirements", "Success metric framework (ChatPRD methodology)", "Milestone & sequencing planning", "TRUST framework evaluation"],
    status: "live", connections: ["pm-dash", "success-metrics"], isNew: true },
  { id: "openai", title: "ChatGPT / OpenAI", subtitle: "General AI & Classification", layer: "external", icon: Bot, color: "#10B981",
    tech: ["gpt-4o-mini", "Chat Completions", "Function Calling"],
    details: ["Startup classification prompts", "Function calling for structured output", "Fallback AI provider", "System prompt injection"],
    status: "live", connections: ["edge-fn"] },
  { id: "gemini", title: "Google Gemini", subtitle: "Primary AI Provider", layer: "external", icon: Sparkles, color: "#3B82F6",
    tech: ["gemini-2.0-flash", "REST API", "Streaming", "Safety Settings"],
    details: ["Primary AI for chat & classification", "PWMOIC analysis generation", "Multi-turn conversation context", "Configurable safety settings", "Low-latency streaming responses"],
    status: "live", connections: ["edge-fn", "chatbot"] },

  // ══ Frontend Layer
  { id: "frontend", title: "React SPA", subtitle: "Client-Side Application", layer: "frontend", icon: Monitor, color: "#06B6D4",
    tech: ["React 18", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts", "React Router"],
    details: ["Single Page Application (SPA)", "12+ feature pages + Login", "Dark professional theme (#0B0F19)", "Responsive layout with collapsible sidebar", "Client-side state via React Context", "Display mode selector (Desktop/Tablet/Mobile)"],
    status: "live", connections: ["ui-ux", "auth", "edge-fn", "chatbot"] },
  { id: "ui-ux", title: "UI/UX Design System", subtitle: "Interface & Experience", layer: "frontend", icon: Palette, color: "#F59E0B",
    tech: ["shadcn/ui", "Lucide Icons", "Sonner Toasts", "CSS Variables"],
    details: ["Card-based dark layouts (bg-[#111827])", "Synthetic ↔ Custom mode toggles", "Enter button with loading states", "Feedback survey popup (3-step)", "Upload/Download/Refresh toolbar", "Star ratings & review system"],
    status: "live", connections: ["frontend"] },
  // Fix #5: Interactive Dashboard
  { id: "display-mode", title: "Display Mode Selector", subtitle: "Responsive Layout Control", layer: "frontend", icon: Smartphone, color: "#A855F7",
    tech: ["DisplayContext", "sessionStorage", "MobileNav", "Bottom Tab Bar"],
    details: ["🖥️ Wide Screen (100%)", "💻 Desktop (1280px) — default", "📱 Tablet (768px) — sidebar hidden", "📲 Mobile (390px) — compact mode", "Emoticon selector top-left corner", "Persists selection in sessionStorage"],
    status: "live", connections: ["frontend"], isNew: true },

  // ══ Prompts & Logic Engine
  { id: "classifier", title: "Startup Classifier", subtitle: "AI Classification Engine", layer: "logic", icon: Zap, color: "#10B981",
    tech: ["LLM Prompts", "Keyword Extraction", "Stage Mapping", "File Upload"],
    details: ["URL fetching + file upload + text paste", "Mock mode: keyword → stage mapping", "AI mode: structured JSON prompt to Gemini/GPT/Claude", "Output: objective, probabilities, keywords, explanation", "Supports PDF, images, CSV, DOCX"],
    status: "live", connections: ["edge-fn", "frontend"] },
  { id: "pwmoic", title: "PWMOIC Engine", subtitle: "Risk & Return Computation", layer: "logic", icon: Workflow, color: "#F97316",
    tech: ["M×P×T×F Framework", "7-Scenario Model", "TAM (3 approaches)", "Score 1-5"],
    details: ["Multiplicative risk: Market × Product × Team × Finance", "3-stage cascade: Creation → Early → Mass Market", "7 scenarios: S7 (Leader) → S1 (Initial Idea)", "TAM: Top-Down, Bottom-Up, Value Theory", "PWMOIC = Σ(Probability × MOIC)", "Score reference: Poor(1) → Excellent(5)"],
    status: "live", connections: ["frontend", "valuation"] },
  { id: "valuation", title: "Valuation Simulator", subtitle: "Multi-Firm Scoring", layer: "logic", icon: Target, color: "#A855F7",
    tech: ["23 Parameters", "3-Firm Compare", "Weighted Scoring", "Grade System"],
    details: ["A. Risk/Reward (50%) — 8 params", "B. Team (25%) — 7 params", "C. Market (25%) — 8 params", "Score 1–5, editable weights (must = 100%)", "Winner 🏆🥇🥈🥉 emoticons", "Triggers feedback survey before Enter"],
    status: "live", connections: ["nova", "frontend", "feedback-survey"] },
  { id: "nova", title: "Nova Dashboard", subtitle: "Analytics & Visualization", layer: "logic", icon: BarChart3, color: "#3B82F6",
    tech: ["Recharts", "10 Chart Types", "ValuationContext", "Gap Analysis"],
    details: ["Radar, Bar, Area, Pie, Line, Heatmap", "Gap analysis with competitive insights", "Firm strengths/weaknesses auto-detection", "Winner banner with medal ranking", "Pulls live data from ValuationContext"],
    status: "live", connections: ["valuation", "frontend"] },
  // Fix #6: AI Enhancement
  { id: "ai-enhance", title: "Enhance with AI", subtitle: "AI-Powered Content Generation", layer: "logic", icon: Sparkles, color: "#EC4899",
    tech: ["Claude/Gemini API", "Sentiment-Aware", "Context Injection"],
    details: ["Expands short comments → professional reviews", "Sentiment-matched tone (positive/balanced/constructive)", "Feature-aware context injection", "Used in Customer Feedback review writing", "Generates comprehensive analysis reports", "Reduces friction for lazy-to-type users"],
    status: "live", connections: ["edge-fn", "claude", "feedback-survey"], isNew: true },

  // ══ Backend Services
  { id: "edge-fn", title: "Supabase Edge Functions", subtitle: "Serverless API Layer", layer: "backend", icon: Cloud, color: "#06B6D4",
    tech: ["Deno Runtime", "TypeScript", "CORS", "Multi-Provider Router"],
    details: ["chat-ai: Routes to Gemini / OpenAI / Claude / Mock", "send-pm-report: Automated email reports", "System prompt injection per provider", "Conversation history (last 10 messages)", "Error handling + rate limiting", "API key passed in-memory only"],
    status: "live", connections: ["gemini", "openai", "claude", "supabase", "email-auto"] },
  { id: "chatbot", title: "LoopAI Chatbot", subtitle: "Floating AI Assistant", layer: "backend", icon: MessageSquare, color: "#EC4899",
    tech: ["useChatAI Hook", "Multi-turn", "Markdown Render", "Quick Chips"],
    details: ["Floating panel on every page (380×520px)", "Mock mode: keyword-based responses", "AI mode: real Gemini/GPT/Claude", "Typing indicator with provider name", "Bold, bullet, code rendering", "Quick action chips above input"],
    status: "live", connections: ["edge-fn", "frontend"] },
  { id: "feedback-survey", title: "Feedback System", subtitle: "Survey + Reviews + AI Enhance", layer: "backend", icon: Star, color: "#F59E0B",
    tech: ["3-Step Survey", "Star Ratings", "AI Comment Enhancement", "NPS"],
    details: ["Pre-valuation survey popup (ranking + NPS)", "Customer Feedback page with full reviews", "Star ratings per feature (Classifier, Decoded X, Risk, Valuation)", "Enhance with AI button for lazy writers", "Sentiment tagging (positive/neutral/negative)", "Helpful/Not Helpful voting"],
    status: "live", connections: ["valuation", "pm-dash", "ai-enhance"] },
  // Fix #3: Email Automation
  { id: "email-auto", title: "Email Automation", subtitle: "Nightly PM Reports via Resend", layer: "backend", icon: Mail, color: "#EF4444",
    tech: ["Resend API", "Supabase Cron", "HTML Templates", "Send Logging"],
    details: ["Midnight daily automated PM report email", "Resend.com API integration (free 100/day)", "Dark-themed HTML email with 7 sections", "Manual trigger + scheduled cron (pg_cron)", "Send history with success/failure tracking", "Configurable recipient, time, timezone, sections"],
    status: "live", connections: ["edge-fn", "pm-dash", "supabase"], isNew: true },

  // ══ Data & Auth Layer
  { id: "supabase", title: "Supabase", subtitle: "Backend-as-a-Service", layer: "data", icon: Database, color: "#10B981",
    tech: ["PostgreSQL", "Auth", "Edge Functions", "RLS", "Cron"],
    details: ["auth.users — Google OAuth profiles", "activity_logs — user actions & page views", "user_sessions — login/logout tracking", "feedback_surveys — ranking, NPS, suggestions", "email_logs — send history tracking", "Row-Level Security on all tables"],
    status: "live", connections: ["auth", "edge-fn", "pm-dash", "email-auto"] },
  { id: "auth", title: "Authentication", subtitle: "Google OAuth + Session", layer: "data", icon: Key, color: "#F59E0B",
    tech: ["Supabase Auth", "Google OAuth 2.0", "JWT", "ProtectedRoute"],
    details: ["Sign in / Sign up via Google Gmail", "First-time user → API setup modal", "JWT tokens for session persistence", "ProtectedRoute component for auth gating", "Admin email check for PM tab access"],
    status: "live", connections: ["supabase", "frontend"] },

  // ══ Security & Privacy
  { id: "security", title: "Security & Privacy", subtitle: "Data Protection & Compliance", layer: "security", icon: Shield, color: "#EF4444",
    tech: ["HTTPS/TLS", "RLS", "CORS", "In-Memory Keys", "GDPR/PDPA"],
    details: ["API keys in-memory only (never persisted)", "Supabase RLS: users see only own data", "CORS headers on all Edge Functions", "HTTPS enforced via Lovable/Supabase", "GDPR/PDPA compliant data handling", "Admin-only PM dashboard access"],
    status: "live", connections: ["supabase", "edge-fn", "auth"] },

  // ══ Infrastructure & PM
  // Fix #4: Success Metrics + TRUST
  { id: "pm-dash", title: "PM Command Center", subtitle: "9-Tab Strategic Dashboard", layer: "infra", icon: Layout, color: "#8B5CF6",
    tech: ["Overview", "Feedback", "Growth", "Funnel", "Success Metrics", "B2B", "Roadmap", "Competitive", "System"],
    details: ["PRD goal tracking with progress bars", "Feedback analytics (rankings, NPS, sentiment)", "MRR growth, churn, NPS trends", "6-stage conversion funnel", "AI Product Improvement recommendations", "B2B pipeline with deal tracking", "Development roadmap (4 phases)", "Competitive radar vs PitchBook etc.", "System health monitor"],
    status: "live", connections: ["supabase", "feedback-survey", "success-metrics", "email-auto"] },
  { id: "success-metrics", title: "Success Metrics & TRUST", subtitle: "PRD Gap Analysis + Ethical AI", layer: "infra", icon: ShieldCheck, color: "#06B6D4",
    tech: ["9 PRD Metrics", "TRUST Framework", "5 Pillars", "20 Sub-metrics"],
    details: ["User-Centric: Completion, NPS, Return rate", "Business: MRR growth, B2B contracts, LTV:CAC", "Technical: Report time, uptime, AI accuracy", "TRUST Radar: Current vs Target visualization", "T-Tried, R-Reinforced, U-User, S-Sustainable, T-Transparent", "AI Governance summary with priority actions"],
    status: "live", connections: ["pm-dash", "chatprd"], isNew: true },
  { id: "github", title: "GitHub", subtitle: "Version Control & CI/CD", layer: "infra", icon: GitBranch, color: "#64748B",
    tech: ["Git", "Auto-Deploy", "Lovable Integration"],
    details: ["Source code repository", "Auto-deploy on push via Lovable", "Branch-based development"],
    status: "live", connections: ["lovable", "frontend"] },
];

// ─── Layer metadata ──────────────────────────────────

const LAYER_META: Record<string, { label: string; color: string; icon: any }> = {
  external: { label: "External AI Services", color: "#3B82F6", icon: Globe },
  frontend: { label: "Frontend Layer", color: "#06B6D4", icon: Monitor },
  logic: { label: "Prompts & Logic Engine", color: "#F97316", icon: Cpu },
  backend: { label: "Backend Services", color: "#10B981", icon: Server },
  data: { label: "Data & Auth Layer", color: "#F59E0B", icon: Database },
  security: { label: "Security & Privacy", color: "#EF4444", icon: Shield },
  infra: { label: "Infrastructure & PM", color: "#8B5CF6", icon: Layout },
};
const LAYER_ORDER = ["external", "frontend", "logic", "backend", "data", "security", "infra"];

// ─── Data Flows (expanded) ───────────────────────────

const DATA_FLOWS = [
  { from: "User", to: "frontend", label: "Browser Request", type: "user" },
  { from: "frontend", to: "auth", label: "Google OAuth Sign-In", type: "auth" },
  { from: "auth", to: "supabase", label: "JWT + User Profile", type: "data" },
  { from: "frontend", to: "classifier", label: "URL / File / Text Input", type: "data" },
  { from: "classifier", to: "edge-fn", label: "AI Classification Request", type: "api" },
  { from: "edge-fn", to: "gemini", label: "Prompt + Context", type: "api" },
  { from: "edge-fn", to: "claude", label: "Deep Analysis Request", type: "api" },
  { from: "edge-fn", to: "openai", label: "Fallback AI Request", type: "api" },
  { from: "gemini", to: "edge-fn", label: "JSON Response", type: "api" },
  { from: "edge-fn", to: "frontend", label: "Parsed AI Results", type: "data" },
  { from: "frontend", to: "pwmoic", label: "Risk Inputs (M×P×T×F)", type: "data" },
  { from: "pwmoic", to: "valuation", label: "PWMOIC Scores", type: "data" },
  { from: "valuation", to: "nova", label: "ValuationContext (shared state)", type: "data" },
  { from: "valuation", to: "feedback-survey", label: "Triggers Survey Popup", type: "interaction" },
  { from: "feedback-survey", to: "pm-dash", label: "Rankings + NPS + Reviews", type: "data" },
  { from: "feedback-survey", to: "ai-enhance", label: "Short Comment → AI Expansion", type: "api" },
  { from: "ai-enhance", to: "claude", label: "Enhancement Prompt", type: "api" },
  { from: "frontend", to: "chatbot", label: "User Chat Message", type: "interaction" },
  { from: "chatbot", to: "edge-fn", label: "Chat History (10 msgs)", type: "api" },
  { from: "supabase", to: "pm-dash", label: "Logs + Analytics + Feedback", type: "data" },
  { from: "pm-dash", to: "success-metrics", label: "PRD Targets + TRUST Scores", type: "data" },
  { from: "chatprd", to: "success-metrics", label: "PRD Framework + Metrics", type: "tool" },
  { from: "email-auto", to: "edge-fn", label: "send-pm-report Edge Fn", type: "api" },
  { from: "edge-fn", to: "email-auto", label: "Resend API → HTML Email", type: "api" },
  { from: "supabase", to: "email-auto", label: "pg_cron Midnight Trigger", type: "data" },
  { from: "security", to: "supabase", label: "RLS Policies", type: "security" },
  { from: "security", to: "edge-fn", label: "CORS + In-Memory Keys", type: "security" },
  { from: "lovable", to: "frontend", label: "AI Code Generation", type: "tool" },
  { from: "lovable", to: "github", label: "Auto-Deploy on Push", type: "tool" },
  { from: "display-mode", to: "frontend", label: "Layout Mode (Desktop/Mobile)", type: "interaction" },
];

const FLOW_COLORS: Record<string, string> = {
  user: "#3B82F6", auth: "#F59E0B", data: "#06B6D4", api: "#10B981",
  interaction: "#EC4899", security: "#EF4444", tool: "#8B5CF6",
};

// ─── Node Card ───────────────────────────────────────

function NodeCard({ node, isActive, onClick }: { node: SystemNode; isActive: boolean; onClick: () => void }) {
  const Icon = node.icon;
  return (
    <div onClick={onClick} className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${isActive ? "ring-1 ring-offset-1 ring-offset-[#0B0F19] scale-[1.02]" : "hover:border-[#334155] hover:bg-white/[0.02]"}`}
      style={{ borderColor: isActive ? node.color + "55" : "#1E293B", backgroundColor: isActive ? node.color + "08" : "#111827", ringColor: isActive ? node.color : undefined }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: node.color + "15" }}>
          <Icon className="w-4.5 h-4.5" style={{ color: node.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: node.color }}>{node.title}</span>
            <Badge className="text-[7px] px-1 py-0" style={{ backgroundColor: (node.status === "live" ? "#10B981" : node.status === "beta" ? "#F59E0B" : "#64748B") + "15", color: node.status === "live" ? "#10B981" : node.status === "beta" ? "#F59E0B" : "#64748B" }}>{node.status}</Badge>
            {node.isNew && <Badge className="text-[6px] px-1 py-0 bg-pink-500/15 text-pink-400 border-pink-500/20">NEW</Badge>}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">{node.subtitle}</div>
        </div>
        {isActive ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
      </div>
      {isActive && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: node.color + "20" }}>
          <div className="flex flex-wrap gap-1 mb-2.5">
            {node.tech.map((t) => <span key={t} className="px-2 py-0.5 rounded text-[8px] font-medium bg-[#1E293B] text-slate-300 border border-[#334155]">{t}</span>)}
          </div>
          <div className="space-y-1">
            {node.details.map((d, i) => <div key={i} className="flex items-start gap-1.5 text-[9px] text-slate-400"><span style={{ color: node.color }} className="mt-0.5">•</span><span>{d}</span></div>)}
          </div>
          <div className="mt-2.5 pt-2 border-t border-[#1E293B]">
            <span className="text-[8px] text-slate-600">Connects to: </span>
            {node.connections.map((c) => { const t = NODES.find((n) => n.id === c); return t ? <span key={c} className="text-[8px] font-medium mr-1.5" style={{ color: t.color }}>{t.title}</span> : null; })}
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════

export default function PMArchitecture() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [showFlows, setShowFlows] = useState(true);
  const [flowFilter, setFlowFilter] = useState<string | null>(null);

  const filteredFlows = flowFilter ? DATA_FLOWS.filter((f) => f.type === flowFilter) : DATA_FLOWS;
  const totalComponents = NODES.length;
  const newComponents = NODES.filter((n) => n.isNew).length;
  const liveComponents = NODES.filter((n) => n.status === "live").length;

  return (
    <div className="space-y-4">
      {/* Header — Fix #1: renamed */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-400" />
            LoopAI Core Architecture
          </h1>
          <p className="text-[10px] text-slate-500">{totalComponents} components · {DATA_FLOWS.length} data flows · {newComponents} new · {liveComponents} live</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.success("Architecture exported")} className="text-xs bg-transparent border-[#1E293B] text-slate-400 hover:text-white">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
          <Button variant="outline" onClick={() => setShowFlows(!showFlows)} className={`text-xs bg-transparent border-[#1E293B] ${showFlows ? "text-blue-400 border-blue-500/30" : "text-slate-400"}`}>
            {showFlows ? "Hide" : "Show"} Data Flows
          </Button>
        </div>
      </div>

      {/* Layer Filters */}
      <div className="flex flex-wrap gap-1.5">
        {LAYER_ORDER.map((lid) => {
          const m = LAYER_META[lid]; const Icon = m.icon;
          const active = activeLayer === lid;
          const count = NODES.filter((n) => n.layer === lid).length;
          const hasNew = NODES.some((n) => n.layer === lid && n.isNew);
          return (
            <button key={lid} onClick={() => setActiveLayer(active ? null : lid)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${active ? "scale-105" : "border-[#1E293B] text-slate-500 hover:text-slate-300 hover:border-[#334155]"}`}
              style={{ borderColor: active ? m.color + "55" : undefined, backgroundColor: active ? m.color + "10" : "transparent", color: active ? m.color : undefined }}>
              <Icon className="w-3 h-3" />{m.label}<span className="text-[8px] opacity-60">({count})</span>
              {hasNew && <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />}
            </button>
          );
        })}
      </div>

      {/* Architecture Layers */}
      <div className="space-y-4">
        {LAYER_ORDER.map((lid) => {
          const m = LAYER_META[lid]; const Icon = m.icon;
          const layerNodes = NODES.filter((n) => n.layer === lid);
          if (activeLayer && activeLayer !== lid) return null;
          return (
            <Card key={lid} className="bg-[#111827] border-[#1E293B] overflow-hidden">
              <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: m.color + "22", backgroundColor: m.color + "05" }}>
                <Icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-xs font-bold" style={{ color: m.color }}>{m.label}</span>
                <Badge className="text-[8px] ml-auto" style={{ backgroundColor: m.color + "15", color: m.color }}>{layerNodes.length} components</Badge>
              </div>
              <CardContent className="p-4">
                <div className={`grid gap-3 ${layerNodes.length <= 2 ? "grid-cols-2" : layerNodes.length <= 3 ? "grid-cols-3" : layerNodes.length >= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
                  {layerNodes.map((node) => <NodeCard key={node.id} node={node} isActive={activeNode === node.id} onClick={() => setActiveNode(activeNode === node.id ? null : node.id)} />)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Flow Map */}
      {showFlows && (
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Data Flow Map</h3>
              <div className="flex gap-1">
                <button onClick={() => setFlowFilter(null)} className={`px-2 py-1 rounded text-[9px] font-semibold transition-all ${!flowFilter ? "bg-blue-600/15 text-blue-400 border border-blue-600/30" : "text-slate-500 border border-[#1E293B]"}`}>All</button>
                {Object.entries(FLOW_COLORS).map(([type, color]) => (
                  <button key={type} onClick={() => setFlowFilter(flowFilter === type ? null : type)}
                    className={`px-2 py-1 rounded text-[9px] font-semibold capitalize transition-all ${flowFilter === type ? "border scale-105" : "text-slate-500 border border-[#1E293B]"}`}
                    style={{ borderColor: flowFilter === type ? color + "55" : undefined, backgroundColor: flowFilter === type ? color + "10" : undefined, color: flowFilter === type ? color : undefined }}>
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {filteredFlows.map((flow, i) => {
                const fromN = NODES.find((n) => n.id === flow.from);
                const toN = NODES.find((n) => n.id === flow.to);
                const color = FLOW_COLORS[flow.type] || "#64748B";
                return (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/40 hover:border-[#334155] transition-colors">
                    <div className="w-[130px] shrink-0 flex items-center gap-1.5">
                      {fromN ? <><div className="w-2 h-2 rounded-full" style={{ backgroundColor: fromN.color }} /><span className="text-[10px] font-semibold" style={{ color: fromN.color }}>{fromN.title}</span></> : <span className="text-[10px] font-semibold text-blue-400">👤 {flow.from}</span>}
                    </div>
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <ArrowRight className="w-3 h-3 shrink-0" style={{ color }} />
                      <span className="text-[9px] text-slate-400 truncate">{flow.label}</span>
                    </div>
                    <Badge className="text-[7px] px-1.5 capitalize shrink-0" style={{ backgroundColor: color + "15", color }}>{flow.type}</Badge>
                    <div className="w-[130px] shrink-0 flex items-center gap-1.5 justify-end">
                      {toN ? <><span className="text-[10px] font-semibold" style={{ color: toN.color }}>{toN.title}</span><div className="w-2 h-2 rounded-full" style={{ backgroundColor: toN.color }} /></> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#1E293B] text-[9px] text-slate-600">
              {filteredFlows.length} flows shown · {liveComponents}/{totalComponents} components live · {newComponents} newly added
            </div>
          </CardContent>
        </Card>
      )}

      {/* What's New */}
      <Card className="bg-[#111827] border-pink-500/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-pink-400">What's New in This Architecture</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {NODES.filter((n) => n.isNew).map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="p-3 rounded-lg border border-[#1E293B] bg-[#0B0F19]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: n.color }} />
                    <span className="text-[10px] font-bold" style={{ color: n.color }}>{n.title}</span>
                  </div>
                  <p className="text-[8px] text-slate-500 leading-relaxed">{n.details[0]}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack Summary */}
      <Card className="bg-[#111827] border-[#1E293B]">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-white mb-3">Technology Stack Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Frontend", color: "#06B6D4", items: ["React 18 + TypeScript", "Tailwind CSS + shadcn/ui", "Recharts (10+ chart types)", "React Router + Context API", "Sonner (toasts) + Lucide (icons)", "Display Mode Selector (4 modes)"] },
              { title: "Backend", color: "#10B981", items: ["Supabase (PostgreSQL + Auth)", "Edge Functions (Deno runtime)", "Google OAuth 2.0 + JWT", "Row-Level Security policies", "pg_cron (scheduled tasks)", "Resend API (email automation)"] },
              { title: "AI & Integrations", color: "#8B5CF6", items: ["Gemini 2.0 Flash (primary AI)", "OpenAI GPT-4o-mini (fallback)", "Claude Sonnet (deep analysis)", "ChatPRD (PRD methodology)", "Lovable (vibe coding platform)", "GitHub (version control + CI/CD)"] },
            ].map((s) => (
              <div key={s.title} className="p-3 rounded-lg border border-[#1E293B] bg-[#0B0F19]">
                <div className="text-xs font-bold mb-2" style={{ color: s.color }}>{s.title}</div>
                <div className="space-y-1">{s.items.map((item, i) => <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-400"><div className="w-1 h-1 rounded-full" style={{ backgroundColor: s.color }} />{item}</div>)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
