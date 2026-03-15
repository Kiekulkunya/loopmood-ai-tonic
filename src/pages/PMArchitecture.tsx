// ═══════════════════════════════════════════════════════════════
// src/pages/PMArchitecture.tsx — LoopAI System Architecture
// Add as new tab under Product Manager in sidebar
// Paste into Lovable file editor
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import {
  Shield, Database, Globe, Cpu, MessageSquare, Layout,
  Server, Lock, Eye, Zap, GitBranch, Layers, Code2,
  Monitor, Palette, Brain, Bot, Key, Cloud, ArrowRight,
  ChevronDown, ChevronRight, ExternalLink, Workflow, Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { downloadAsImage } from "@/lib/downloadUtils";

// ─── Architecture Layers ─────────────────────────────

interface SystemNode {
  id: string;
  title: string;
  subtitle: string;
  layer: "external" | "frontend" | "logic" | "backend" | "data" | "security" | "infra";
  icon: any;
  color: string;
  tech: string[];
  details: string[];
  status: "live" | "beta" | "planned";
  connections: string[];
}

const NODES: SystemNode[] = [
  // ── External AI Services ──
  {
    id: "gemini", title: "Google Gemini", subtitle: "Primary AI Provider",
    layer: "external", icon: Brain, color: "#3B82F6",
    tech: ["gemini-2.0-flash", "REST API", "Streaming"],
    details: ["Startup classification prompts", "PWMOIC analysis generation", "Chat responses & multi-turn context", "Safety settings configured"],
    status: "live", connections: ["edge-fn", "chatbot"],
  },
  {
    id: "openai", title: "OpenAI GPT", subtitle: "Secondary AI Provider",
    layer: "external", icon: Bot, color: "#10B981",
    tech: ["gpt-4o-mini", "Chat Completions API"],
    details: ["Fallback AI provider", "Function calling support", "System prompt injection"],
    status: "live", connections: ["edge-fn"],
  },
  {
    id: "claude", title: "Anthropic Claude", subtitle: "Tertiary AI Provider",
    layer: "external", icon: Cpu, color: "#8B5CF6",
    tech: ["claude-sonnet-4-20250514", "Messages API"],
    details: ["Deep analysis mode", "Long-context reasoning", "Architecture design assistance"],
    status: "beta", connections: ["edge-fn"],
  },
  {
    id: "lovable", title: "Lovable", subtitle: "Vibe Coding Platform",
    layer: "external", icon: Code2, color: "#EC4899",
    tech: ["React + TypeScript", "Tailwind CSS", "shadcn/ui"],
    details: ["AI-assisted code generation", "Real-time preview", "Git integration", "Supabase connector"],
    status: "live", connections: ["frontend"],
  },
  // ── Frontend Layer ──
  {
    id: "frontend", title: "React SPA", subtitle: "Client-Side Application",
    layer: "frontend", icon: Monitor, color: "#06B6D4",
    tech: ["React 18", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts", "React Router"],
    details: [
      "Single Page Application (SPA)",
      "8 feature pages + Login",
      "Dark professional theme (#0B0F19)",
      "Responsive layout with collapsible sidebar",
      "Client-side state via React Context",
      "Real-time chart rendering (Recharts)",
    ],
    status: "live", connections: ["ui-ux", "auth", "edge-fn", "chatbot"],
  },
  {
    id: "ui-ux", title: "UI/UX Design System", subtitle: "Interface & Experience",
    layer: "frontend", icon: Palette, color: "#F59E0B",
    tech: ["shadcn/ui Components", "Lucide Icons", "CSS Variables", "Sonner Toasts"],
    details: [
      "Card-based layouts (bg-[#111827])",
      "Consistent border system (#1E293B)",
      "Blue accent (#3B82F6) primary",
      "Scenario color scale (Pink→Red)",
      "Feedback survey popup (3-step)",
      "Toolbar: Upload / Download / Refresh",
      "Synthetic ↔ Custom mode toggles",
    ],
    status: "live", connections: ["frontend"],
  },
  // ── Prompt & Logic Layer ──
  {
    id: "classifier", title: "Startup Classifier", subtitle: "AI Classification Engine",
    layer: "logic", icon: Zap, color: "#10B981",
    tech: ["LLM Prompt Engineering", "Keyword Extraction", "Stage Mapping"],
    details: [
      "URL fetching + file upload + text input",
      "Mock mode: keyword → stage mapping",
      "AI mode: structured JSON prompt",
      "Output: objective, probabilities, keywords",
      "Stage: Seed → Pre-Seed → Series A → D+ → IPO",
    ],
    status: "live", connections: ["edge-fn", "frontend"],
  },
  {
    id: "pwmoic", title: "PWMOIC Engine", subtitle: "Risk & Return Computation",
    layer: "logic", icon: Workflow, color: "#F97316",
    tech: ["M×P×T×F Framework", "7-Scenario Model", "TAM Computation"],
    details: [
      "Multiplicative risk: Market × Product × Team × Finance",
      "3-stage cascade: Creation → Early → Mass Market",
      "7 scenarios: S7 (Leader) → S1 (Initial Idea)",
      "TAM: Top-Down, Bottom-Up, Value Theory",
      "PWMOIC = Σ(Probability × MOIC) per scenario",
      "Score: 1 (Poor) → 5 (Excellent)",
    ],
    status: "live", connections: ["frontend", "valuation"],
  },
  {
    id: "valuation", title: "Valuation Simulator", subtitle: "Multi-Firm Scoring",
    layer: "logic", icon: Layers, color: "#A855F7",
    tech: ["23-Parameter Model", "3-Firm Comparison", "Weighted Scoring"],
    details: [
      "A. Risk/Reward (50%) — 8 params",
      "B. Visionary Team (25%) — 7 params",
      "C. Market Opportunity (25%) — 8 params",
      "Score 1–5 per param, editable weights",
      "Standardized to 100-point scale",
      "Shared via ValuationContext → Nova Dashboard",
    ],
    status: "live", connections: ["nova", "frontend", "feedback"],
  },
  {
    id: "nova", title: "Nova Dashboard", subtitle: "Analytics & Visualization",
    layer: "logic", icon: Eye, color: "#3B82F6",
    tech: ["Recharts", "10 Visualization Types", "Real-time Data Binding"],
    details: [
      "Radar, Bar, Area, Pie, Line, Heatmap charts",
      "Gap analysis + firm insights (strengths/weaknesses)",
      "Winner banner with 🏆🥇🥈🥉 ranking",
      "Pulls live data from ValuationContext",
    ],
    status: "live", connections: ["valuation", "frontend"],
  },
  // ── Backend Layer ──
  {
    id: "edge-fn", title: "Supabase Edge Functions", subtitle: "Serverless API Layer",
    layer: "backend", icon: Cloud, color: "#06B6D4",
    tech: ["Deno Runtime", "TypeScript", "CORS Middleware"],
    details: [
      "chat-ai: Routes to Gemini / OpenAI / Claude / Mock",
      "System prompt injection per provider",
      "Conversation history (last 10 messages)",
      "Error handling + rate limiting",
      "API key passed in-memory (never stored)",
    ],
    status: "live", connections: ["gemini", "openai", "claude", "supabase"],
  },
  {
    id: "chatbot", title: "LoopAI Chatbot", subtitle: "Floating AI Assistant",
    layer: "backend", icon: MessageSquare, color: "#EC4899",
    tech: ["useChatAI Hook", "Multi-turn Context", "Markdown Rendering"],
    details: [
      "Floating panel on every page (380×520px)",
      "Mock mode: keyword-based (PWMOIC, risk, stage...)",
      "AI mode: real Gemini/GPT/Claude responses",
      "Quick action chips + typing indicator",
      "Provider badge shows active AI",
      "Message history persists in session",
    ],
    status: "live", connections: ["edge-fn", "frontend"],
  },
  {
    id: "feedback", title: "Feedback System", subtitle: "Survey Collection & Analytics",
    layer: "backend", icon: MessageSquare, color: "#F59E0B",
    tech: ["3-Step Survey Dialog", "Ranking Algorithm", "NPS Computation"],
    details: [
      "Triggers before Valuation Enter button (once)",
      "Step 1: Drag-rank 6 features by importance",
      "Step 2: 5-star satisfaction + most valuable pick",
      "Step 3: 0–10 NPS + open suggestion",
      "Results feed into PM Dashboard analytics",
      "Skip option for low-friction UX",
    ],
    status: "live", connections: ["valuation", "pm-dash"],
  },
  // ── Data Layer ──
  {
    id: "supabase", title: "Supabase", subtitle: "Backend-as-a-Service",
    layer: "data", icon: Database, color: "#10B981",
    tech: ["PostgreSQL", "Auth (Google OAuth)", "Edge Functions", "Row-Level Security"],
    details: [
      "auth.users — Google OAuth profiles",
      "activity_logs — user actions & page views",
      "user_sessions — login/logout tracking",
      "feedback_surveys — ranking, NPS, suggestions",
      "Real-time subscriptions (planned)",
      "Row-Level Security policies",
    ],
    status: "live", connections: ["auth", "edge-fn", "pm-dash"],
  },
  {
    id: "auth", title: "Authentication", subtitle: "Google OAuth + Session",
    layer: "data", icon: Key, color: "#F59E0B",
    tech: ["Supabase Auth", "Google OAuth 2.0", "JWT Tokens", "Session Management"],
    details: [
      "Sign in / Sign up via Google",
      "First-time user → API setup modal",
      "JWT tokens for session persistence",
      "Protected routes via ProtectedRoute component",
      "User metadata: name, email, avatar",
    ],
    status: "live", connections: ["supabase", "frontend"],
  },
  // ── Security Layer ──
  {
    id: "security", title: "Security & Privacy", subtitle: "Data Protection",
    layer: "security", icon: Shield, color: "#EF4444",
    tech: ["HTTPS/TLS", "RLS Policies", "CORS", "In-Memory Keys"],
    details: [
      "API keys stored in-memory only (never persisted)",
      "Supabase RLS: users see only own data",
      "CORS headers on all Edge Functions",
      "HTTPS enforced via Lovable/Supabase",
      "GDPR/PDPA compliant data handling",
      "Admin-only PM dashboard access (email check)",
    ],
    status: "live", connections: ["supabase", "edge-fn", "auth"],
  },
  // ── Infrastructure ──
  {
    id: "pm-dash", title: "PM Command Center", subtitle: "Product Analytics",
    layer: "infra", icon: Layout, color: "#8B5CF6",
    tech: ["8-Tab Dashboard", "Recharts", "Feedback Integration"],
    details: [
      "Overview: KPIs, PRD goal tracking",
      "Feedback: Rankings, NPS, satisfaction, suggestions",
      "Growth: MRR, NPS trend, churn",
      "Funnel: 6-stage conversion analysis",
      "B2B Pipeline: Sales tracking",
      "Roadmap: PRD phase progress",
      "Competitive: Radar vs PitchBook etc.",
      "System: Health, latency, checklist",
    ],
    status: "live", connections: ["supabase", "feedback"],
  },
  {
    id: "github", title: "GitHub", subtitle: "Version Control",
    layer: "infra", icon: GitBranch, color: "#64748B",
    tech: ["Git", "CI/CD", "Lovable Auto-Deploy"],
    details: ["Source code repository", "Auto-deploy on push via Lovable", "Branch-based development"],
    status: "live", connections: ["lovable", "frontend"],
  },
];

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

// ─── Data Flow Connections ───────────────────────────

const DATA_FLOWS = [
  { from: "User", to: "frontend", label: "Browser Request", type: "user" },
  { from: "frontend", to: "auth", label: "Google OAuth", type: "auth" },
  { from: "auth", to: "supabase", label: "JWT + Profile", type: "data" },
  { from: "frontend", to: "classifier", label: "URL / File / Text", type: "data" },
  { from: "classifier", to: "edge-fn", label: "AI Analysis Request", type: "api" },
  { from: "edge-fn", to: "gemini", label: "Prompt + Context", type: "api" },
  { from: "gemini", to: "edge-fn", label: "JSON Response", type: "api" },
  { from: "edge-fn", to: "frontend", label: "Parsed Results", type: "data" },
  { from: "frontend", to: "pwmoic", label: "Risk Inputs (M×P×T×F)", type: "data" },
  { from: "pwmoic", to: "valuation", label: "PWMOIC Scores", type: "data" },
  { from: "valuation", to: "nova", label: "ValuationContext", type: "data" },
  { from: "valuation", to: "feedback", label: "Triggers Survey", type: "interaction" },
  { from: "feedback", to: "pm-dash", label: "Rankings + NPS", type: "data" },
  { from: "frontend", to: "chatbot", label: "User Message", type: "interaction" },
  { from: "chatbot", to: "edge-fn", label: "Chat History", type: "api" },
  { from: "supabase", to: "pm-dash", label: "Logs + Analytics", type: "data" },
  { from: "security", to: "supabase", label: "RLS Policies", type: "security" },
  { from: "security", to: "edge-fn", label: "CORS + Key Mgmt", type: "security" },
  { from: "lovable", to: "frontend", label: "Code Generation", type: "tool" },
  { from: "lovable", to: "github", label: "Auto Deploy", type: "tool" },
];

const FLOW_COLORS: Record<string, string> = {
  user: "#3B82F6", auth: "#F59E0B", data: "#06B6D4", api: "#10B981",
  interaction: "#EC4899", security: "#EF4444", tool: "#8B5CF6",
};

// ─── Node Card Component ─────────────────────────────

function NodeCard({ node, isActive, onClick }: {
  node: SystemNode; isActive: boolean; onClick: () => void;
}) {
  const Icon = node.icon;
  const statusColors = { live: "#10B981", beta: "#F59E0B", planned: "#64748B" };

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
        isActive
          ? "ring-1 ring-offset-1 ring-offset-[#0B0F19] scale-[1.02]"
          : "hover:border-[#334155] hover:bg-white/[0.02]"
      }`}
      style={{
        borderColor: isActive ? node.color + "55" : "#1E293B",
        backgroundColor: isActive ? node.color + "08" : "#111827",
        boxShadow: isActive ? `0 0 0 1px ${node.color}` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: node.color + "15" }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: node.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: node.color }}>{node.title}</span>
            <Badge
              className="text-[7px] px-1 py-0"
              style={{ backgroundColor: statusColors[node.status] + "15", color: statusColors[node.status] }}
            >
              {node.status}
            </Badge>
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">{node.subtitle}</div>
        </div>
        {isActive ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
      </div>

      {/* Expanded details */}
      {isActive && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: node.color + "20" }}>
          {/* Tech stack */}
          <div className="flex flex-wrap gap-1 mb-2.5">
            {node.tech.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded text-[8px] font-medium bg-[#1E293B] text-slate-300 border border-[#334155]">
                {t}
              </span>
            ))}
          </div>
          {/* Details */}
          <div className="space-y-1">
            {node.details.map((d, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[9px] text-slate-400">
                <span style={{ color: node.color }} className="mt-0.5">•</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
          {/* Connections */}
          <div className="mt-2.5 pt-2 border-t border-[#1E293B]">
            <span className="text-[8px] text-slate-600">Connects to: </span>
            {node.connections.map((c) => {
              const target = NODES.find((n) => n.id === c);
              return target ? (
                <span key={c} className="text-[8px] font-medium mr-1.5" style={{ color: target.color }}>
                  {target.title}
                </span>
              ) : null;
            })}
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

  const filteredFlows = flowFilter
    ? DATA_FLOWS.filter((f) => f.type === flowFilter)
    : DATA_FLOWS;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-400" />
            LoopAI System Architecture
          </h1>
          <p className="text-[10px] text-slate-500">
            Full-stack system diagram · {NODES.length} components · {DATA_FLOWS.length} data flows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFlows(!showFlows)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showFlows ? "bg-blue-600/15 border-blue-600/30 text-blue-400" : "bg-transparent border-[#1E293B] text-slate-500"
            }`}
          >
            {showFlows ? "Hide" : "Show"} Data Flows
          </button>
        </div>
      </div>

      {/* Layer Legend */}
      <div className="flex flex-wrap gap-2">
        {LAYER_ORDER.map((layerId) => {
          const meta = LAYER_META[layerId];
          const Icon = meta.icon;
          const active = activeLayer === layerId;
          const count = NODES.filter((n) => n.layer === layerId).length;
          return (
            <button
              key={layerId}
              onClick={() => setActiveLayer(active ? null : layerId)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                active
                  ? "border-opacity-40 scale-105"
                  : "border-[#1E293B] text-slate-500 hover:text-slate-300"
              }`}
              style={{
                borderColor: active ? meta.color + "55" : undefined,
                backgroundColor: active ? meta.color + "10" : "transparent",
                color: active ? meta.color : undefined,
              }}
            >
              <Icon className="w-3 h-3" />
              {meta.label}
              <span className="text-[8px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Architecture Diagram — Layered */}
      <div className="space-y-4">
        {LAYER_ORDER.map((layerId) => {
          const meta = LAYER_META[layerId];
          const Icon = meta.icon;
          const layerNodes = NODES.filter((n) => n.layer === layerId);
          if (activeLayer && activeLayer !== layerId) return null;

          return (
            <Card key={layerId} className="bg-[#111827] border-[#1E293B] overflow-hidden">
              <div
                className="px-5 py-3 border-b flex items-center gap-2"
                style={{ borderColor: meta.color + "22", backgroundColor: meta.color + "05" }}
              >
                <Icon className="w-4 h-4" style={{ color: meta.color }} />
                <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                <Badge className="text-[8px] ml-auto" style={{ backgroundColor: meta.color + "15", color: meta.color }}>
                  {layerNodes.length} components
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className={`grid gap-3 ${layerNodes.length <= 2 ? "grid-cols-2" : layerNodes.length <= 3 ? "grid-cols-3" : "grid-cols-4"}`}>
                  {layerNodes.map((node) => (
                    <NodeCard
                      key={node.id}
                      node={node}
                      isActive={activeNode === node.id}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Flow Table */}
      {showFlows && (
        <Card className="bg-[#111827] border-[#1E293B]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Data Flow Map</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setFlowFilter(null)}
                  className={`px-2 py-1 rounded text-[9px] font-semibold transition-all ${!flowFilter ? "bg-blue-600/15 text-blue-400 border border-blue-600/30" : "text-slate-500 border border-[#1E293B]"}`}
                >
                  All
                </button>
                {Object.entries(FLOW_COLORS).map(([type, color]) => (
                  <button
                    key={type}
                    onClick={() => setFlowFilter(flowFilter === type ? null : type)}
                    className={`px-2 py-1 rounded text-[9px] font-semibold capitalize transition-all ${flowFilter === type ? "border scale-105" : "text-slate-500 border border-[#1E293B]"}`}
                    style={{
                      borderColor: flowFilter === type ? color + "55" : undefined,
                      backgroundColor: flowFilter === type ? color + "10" : undefined,
                      color: flowFilter === type ? color : undefined,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {filteredFlows.map((flow, i) => {
                const fromNode = NODES.find((n) => n.id === flow.from);
                const toNode = NODES.find((n) => n.id === flow.to);
                const color = FLOW_COLORS[flow.type] || "#64748B";

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/40 hover:border-[#334155] transition-colors"
                  >
                    {/* From */}
                    <div className="w-[120px] shrink-0 flex items-center gap-1.5">
                      {fromNode && (
                        <>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fromNode.color }} />
                          <span className="text-[10px] font-semibold" style={{ color: fromNode.color }}>{fromNode.title}</span>
                        </>
                      )}
                      {!fromNode && <span className="text-[10px] font-semibold text-blue-400">👤 {flow.from}</span>}
                    </div>

                    {/* Arrow + Label */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <ArrowRight className="w-3 h-3 shrink-0" style={{ color }} />
                      <span className="text-[9px] text-slate-400 truncate">{flow.label}</span>
                    </div>

                    {/* Type badge */}
                    <Badge className="text-[7px] px-1.5 capitalize shrink-0" style={{ backgroundColor: color + "15", color }}>
                      {flow.type}
                    </Badge>

                    {/* To */}
                    <div className="w-[120px] shrink-0 flex items-center gap-1.5 justify-end">
                      {toNode && (
                        <>
                          <span className="text-[10px] font-semibold" style={{ color: toNode.color }}>{toNode.title}</span>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: toNode.color }} />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-[#1E293B] text-[9px] text-slate-600">
              {filteredFlows.length} flows shown · Click type badges to filter · {NODES.filter((n) => n.status === "live").length}/{NODES.length} components live
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tech Stack Summary */}
      <Card className="bg-[#111827] border-[#1E293B]">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-white mb-3">Technology Stack Summary</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                title: "Frontend", color: "#06B6D4",
                items: ["React 18 + TypeScript", "Tailwind CSS + shadcn/ui", "Recharts (10 chart types)", "React Router + Context API", "Sonner (toast notifications)", "Lucide React (icons)"],
              },
              {
                title: "Backend", color: "#10B981",
                items: ["Supabase (PostgreSQL)", "Edge Functions (Deno)", "Google OAuth 2.0", "Row-Level Security", "Real-time subscriptions", "JWT session management"],
              },
              {
                title: "AI & Integrations", color: "#8B5CF6",
                items: ["Gemini 2.0 Flash (primary)", "OpenAI GPT-4o-mini (secondary)", "Claude Sonnet (tertiary)", "Lovable (code generation)", "GitHub (version control)", "PWMOIC scoring engine"],
              },
            ].map((stack) => (
              <div key={stack.title} className="p-3 rounded-lg border border-[#1E293B] bg-[#0B0F19]">
                <div className="text-xs font-bold mb-2" style={{ color: stack.color }}>{stack.title}</div>
                <div className="space-y-1">
                  {stack.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-400">
                      <div className="w-1 h-1 rounded-full" style={{ backgroundColor: stack.color }} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
