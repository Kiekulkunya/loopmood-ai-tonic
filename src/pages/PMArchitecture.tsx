// ═══════════════════════════════════════════════════════════════
// src/pages/PMArchitecture.tsx — LoopAI Core Architecture
// Tab 1: LoopAI Interactive (embedded HTML with animated arrows)
// Tab 2: Overview (static summary)
// Tab 3-9: Per-layer detail tabs
// REPLACES existing PMArchitecture.tsx — Paste into Lovable
// ═══════════════════════════════════════════════════════════════

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Workflow, Globe, Monitor, Cpu, Server, Database, Shield, Layout,
  ChevronDown, ChevronRight, ExternalLink, Sparkles, Zap, Download,
  Play, Eye, Layers, ArrowRight, Info, GitBranch, Code2,
  Brain, Bot, Key, Cloud, MessageSquare, Mail, Star,
  Heart, Palette, Smartphone, Target, BarChart3, FileText,
  ShieldCheck, Leaf,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Architecture Data (shared across tabs) ──────────

interface SysNode {
  id: string; title: string; subtitle: string; layer: string;
  icon: string; color: string; tech: string[]; details: string[];
  status: "live"|"beta"|"planned"; connections: string[]; isNew?: boolean;
}

const NODES: SysNode[] = [
  // External
  { id:"lovable",title:"Lovable",subtitle:"Vibe Coding Platform",layer:"external",icon:"💖",color:"#EC4899",tech:["React+TS","Tailwind","shadcn/ui","Auto-Deploy"],details:["AI-assisted code generation & iteration","Real-time preview environment","Git integration with auto-deploy","Supabase connector built-in","Component library (shadcn/ui)"],status:"live",connections:["frontend","github"] },
  { id:"claude",title:"Anthropic Claude",subtitle:"Architecture & Deep Analysis",layer:"external",icon:"🧠",color:"#8B5CF6",tech:["claude-sonnet-4-20250514","200K context","Messages API"],details:["Architecture design assistance","Deep analytical reasoning","Long-context document analysis","Code review & optimization","PRD support"],status:"live",connections:["edgefn","aienhance"] },
  { id:"chatprd",title:"ChatPRD",subtitle:"PRD Methodology",layer:"external",icon:"📋",color:"#F59E0B",tech:["PRD Generation","User Stories","Success Metrics"],details:["Automated PRD document creation","Success metric framework (ChatPRD methodology)","TRUST framework evaluation","Milestone & sequencing planning"],status:"live",connections:["pmdash","metrics"],isNew:true },
  { id:"openai",title:"ChatGPT / OpenAI",subtitle:"General AI & Classification",layer:"external",icon:"🤖",color:"#10B981",tech:["gpt-4o-mini","Chat Completions","Function Calling"],details:["Startup classification prompts","Function calling for structured output","Fallback AI provider","System prompt injection"],status:"live",connections:["edgefn"] },
  { id:"gemini",title:"Google Gemini",subtitle:"Primary AI Provider",layer:"external",icon:"✨",color:"#3B82F6",tech:["gemini-2.0-flash","REST API","Streaming","Safety Settings"],details:["Primary AI for chat & classification","PWMOIC analysis generation","Multi-turn conversation context","Low-latency streaming responses"],status:"live",connections:["edgefn","chatbot"] },
  // Frontend
  { id:"frontend",title:"React SPA",subtitle:"Client-Side Application",layer:"frontend",icon:"🖥️",color:"#06B6D4",tech:["React 18","TypeScript","Tailwind CSS","shadcn/ui","Recharts","React Router"],details:["Single Page Application (SPA)","12+ feature pages + Login","Dark professional theme (#0B0F19)","Responsive sidebar layout","Client-side state via React Context","Display mode selector (4 modes)"],status:"live",connections:["uiux","auth","edgefn","chatbot"] },
  { id:"uiux",title:"UI/UX Design System",subtitle:"Interface & Experience",layer:"frontend",icon:"🎨",color:"#F59E0B",tech:["shadcn/ui","Lucide Icons","Sonner Toasts","CSS Variables"],details:["Card-based dark layouts","Synthetic ↔ Custom mode toggles","Enter buttons with loading states","Feedback survey popup (3-step)","Star ratings & review system"],status:"live",connections:["frontend"] },
  { id:"display",title:"Display Mode Selector",subtitle:"Responsive Layout Control",layer:"frontend",icon:"📱",color:"#A855F7",tech:["DisplayContext","sessionStorage","MobileNav","Bottom Tab"],details:["🖥️ Wide Screen (100%)","💻 Desktop (1280px) — default","📱 Tablet (768px) — sidebar hidden","📲 Mobile (390px) — compact mode","Emoticon selector top-left corner"],status:"live",connections:["frontend"],isNew:true },
  // Logic
  { id:"classifier",title:"Startup Classifier",subtitle:"AI Classification Engine",layer:"logic",icon:"🔬",color:"#10B981",tech:["LLM Prompts","File Upload","Stage Mapping"],details:["URL fetching + file upload + text paste","Mock: keyword → stage mapping","AI: structured JSON prompt","Supports PDF, images, CSV, DOCX"],status:"live",connections:["edgefn","frontend"] },
  { id:"pwmoic",title:"PWMOIC Engine",subtitle:"Risk & Return Computation",layer:"logic",icon:"⚡",color:"#F97316",tech:["M×P×T×F","7 Scenarios","TAM (3 approaches)","Score 1-5"],details:["Multiplicative: Market × Product × Team × Finance","3-stage cascade: Creation → Early → Mass Market","7 scenarios: S7 (Leader) → S1 (Initial Idea)","TAM: Top-Down, Bottom-Up, Value Theory","PWMOIC = Σ(Probability × MOIC)"],status:"live",connections:["frontend","valuation"] },
  { id:"valuation",title:"Valuation Simulator",subtitle:"Multi-Firm Scoring",layer:"logic",icon:"🎯",color:"#A855F7",tech:["23 Parameters","3-Firm Compare","Weighted","Grades"],details:["A. Risk/Reward (50%) — 8 params","B. Team (25%) — 7 params","C. Market (25%) — 8 params","Winner 🏆🥇🥈🥉 emoticons","Triggers feedback survey"],status:"live",connections:["nova","frontend","feedback"] },
  { id:"nova",title:"Nova Dashboard",subtitle:"Analytics & Visualization",layer:"logic",icon:"📊",color:"#3B82F6",tech:["Recharts","10 Charts","Gap Analysis","Firm Insights"],details:["Radar, Bar, Area, Pie, Line, Heatmap","Gap analysis + competitive insights","Winner banner with medal ranking","Live data from ValuationContext"],status:"live",connections:["valuation","frontend"] },
  { id:"aienhance",title:"Enhance with AI",subtitle:"AI Content Generation",layer:"logic",icon:"✨",color:"#EC4899",tech:["Claude/Gemini","Sentiment-Aware","Context Injection"],details:["Expands short → professional reviews","Sentiment-matched tone","Feature-aware context injection","Used in Customer Feedback"],status:"live",connections:["edgefn","claude","feedback"],isNew:true },
  // Backend
  { id:"edgefn",title:"Supabase Edge Functions",subtitle:"Serverless API Layer",layer:"backend",icon:"☁️",color:"#06B6D4",tech:["Deno Runtime","TypeScript","CORS","Multi-Provider"],details:["chat-ai: Routes to Gemini/OpenAI/Claude/Mock","send-pm-report: Automated email reports","System prompt injection per provider","Error handling + rate limiting"],status:"live",connections:["gemini","openai","claude","supabase","email"] },
  { id:"chatbot",title:"LoopAI Chatbot",subtitle:"Floating AI Assistant",layer:"backend",icon:"💬",color:"#EC4899",tech:["useChatAI Hook","Multi-turn","Markdown","Quick Chips"],details:["Floating panel 380×520px","Mock + AI mode","Provider badge + typing indicator","Quick action chips"],status:"live",connections:["edgefn","frontend"] },
  { id:"feedback",title:"Feedback System",subtitle:"Survey + Reviews + AI",layer:"backend",icon:"⭐",color:"#F59E0B",tech:["3-Step Survey","Star Ratings","NPS","AI Enhance"],details:["Pre-valuation survey popup","Customer review page","Enhance with AI button","Sentiment tagging","Helpful/Not Helpful voting"],status:"live",connections:["valuation","pmdash","aienhance"] },
  { id:"email",title:"Email Automation",subtitle:"Nightly PM Reports via Resend",layer:"backend",icon:"📧",color:"#EF4444",tech:["Resend API","pg_cron","HTML Templates","Send Log"],details:["Midnight daily automated PM report","7 dashboard sections in dark HTML email","Manual trigger + scheduled cron","Success/failure tracking"],status:"live",connections:["edgefn","pmdash","supabase"],isNew:true },
  // Data
  { id:"supabase",title:"Supabase",subtitle:"Backend-as-a-Service",layer:"data",icon:"🗄️",color:"#10B981",tech:["PostgreSQL","Auth","Edge Functions","RLS","pg_cron"],details:["auth.users — Google OAuth profiles","activity_logs, feedback_surveys, email_logs","Row-Level Security on all tables","Real-time subscriptions (planned)"],status:"live",connections:["auth","edgefn","pmdash","email"] },
  { id:"auth",title:"Authentication",subtitle:"Google OAuth + Session",layer:"data",icon:"🔑",color:"#F59E0B",tech:["Supabase Auth","Google OAuth 2.0","JWT","ProtectedRoute"],details:["Sign in/up via Google Gmail","First-time API setup modal","JWT session persistence","Admin email check for PM access"],status:"live",connections:["supabase","frontend"] },
  // Security
  { id:"security",title:"Security & Privacy",subtitle:"Data Protection & Compliance",layer:"security",icon:"🛡️",color:"#EF4444",tech:["HTTPS/TLS","RLS","CORS","In-Memory Keys","GDPR/PDPA"],details:["API keys in-memory only (never persisted)","RLS: users see only own data","CORS on all Edge Functions","GDPR/PDPA compliant","Admin-only PM dashboard access"],status:"live",connections:["supabase","edgefn","auth"] },
  // Infra
  { id:"pmdash",title:"PM Command Center",subtitle:"9-Tab Strategic Dashboard",layer:"infra",icon:"📋",color:"#8B5CF6",tech:["Overview","Feedback","Growth","Funnel","Metrics","B2B","Roadmap","Competitive","System"],details:["PRD goal tracking with progress bars","AI Product Improvement recommendations","NPS + satisfaction analytics","B2B pipeline tracking","Email automation tab"],status:"live",connections:["supabase","feedback","metrics","email"] },
  { id:"metrics",title:"Success Metrics & TRUST",subtitle:"PRD Gap Analysis + Ethical AI",layer:"infra",icon:"📈",color:"#06B6D4",tech:["9 PRD Metrics","TRUST Radar","5 Pillars","20 Sub-metrics"],details:["User/Business/Technical gap analysis","TRUST: Tried, Reinforced, User, Sustainable, Transparent","AI Governance summary","Priority improvement actions"],status:"live",connections:["pmdash","chatprd"],isNew:true },
  { id:"github",title:"GitHub",subtitle:"Version Control & CI/CD",layer:"infra",icon:"🐙",color:"#94A3B8",tech:["Git","Auto-Deploy","Lovable Integration"],details:["Source code repository","Auto-deploy on push via Lovable","Branch-based development"],status:"live",connections:["lovable","frontend"] },
];

const LAYERS = [
  { id:"external", label:"External AI Services", color:"#3B82F6", icon:Globe },
  { id:"frontend", label:"Frontend Layer", color:"#06B6D4", icon:Monitor },
  { id:"logic", label:"Prompts & Logic Engine", color:"#F97316", icon:Cpu },
  { id:"backend", label:"Backend Services", color:"#10B981", icon:Server },
  { id:"data", label:"Data & Auth Layer", color:"#F59E0B", icon:Database },
  { id:"security", label:"Security & Privacy", color:"#EF4444", icon:Shield },
  { id:"infra", label:"Infrastructure & PM", color:"#8B5CF6", icon:Layout },
];

const CONNECTIONS = [
  {from:"lovable",to:"frontend",label:"Code Gen",type:"tool"},
  {from:"lovable",to:"github",label:"Auto-Deploy",type:"tool"},
  {from:"claude",to:"edgefn",label:"Deep Analysis",type:"api"},
  {from:"claude",to:"aienhance",label:"Enhancement",type:"api"},
  {from:"chatprd",to:"metrics",label:"PRD Framework",type:"tool"},
  {from:"openai",to:"edgefn",label:"Chat API",type:"api"},
  {from:"gemini",to:"edgefn",label:"Primary AI",type:"api"},
  {from:"gemini",to:"chatbot",label:"Chat Responses",type:"api"},
  {from:"frontend",to:"auth",label:"OAuth",type:"auth"},
  {from:"frontend",to:"edgefn",label:"API Calls",type:"data"},
  {from:"frontend",to:"classifier",label:"Input Data",type:"data"},
  {from:"frontend",to:"chatbot",label:"Chat Messages",type:"interaction"},
  {from:"classifier",to:"edgefn",label:"AI Request",type:"api"},
  {from:"pwmoic",to:"valuation",label:"Scores",type:"data"},
  {from:"valuation",to:"nova",label:"ValuationContext",type:"data"},
  {from:"valuation",to:"feedback",label:"Trigger Survey",type:"interaction"},
  {from:"feedback",to:"pmdash",label:"Analytics",type:"data"},
  {from:"feedback",to:"aienhance",label:"Enhance",type:"interaction"},
  {from:"chatbot",to:"edgefn",label:"History",type:"api"},
  {from:"edgefn",to:"supabase",label:"DB Queries",type:"data"},
  {from:"email",to:"edgefn",label:"send-pm-report",type:"api"},
  {from:"supabase",to:"email",label:"pg_cron",type:"data"},
  {from:"supabase",to:"pmdash",label:"Logs",type:"data"},
  {from:"auth",to:"supabase",label:"JWT",type:"auth"},
  {from:"security",to:"supabase",label:"RLS Policies",type:"security"},
  {from:"security",to:"edgefn",label:"CORS + Keys",type:"security"},
  {from:"pmdash",to:"metrics",label:"Targets",type:"data"},
  {from:"display",to:"frontend",label:"Layout Mode",type:"interaction"},
];

const FLOW_COLORS: Record<string,string> = {user:"#3B82F6",auth:"#F59E0B",data:"#06B6D4",api:"#10B981",interaction:"#EC4899",security:"#EF4444",tool:"#8B5CF6"};

// ─── Expandable Node Card ────────────────────────────

function NodeCard({ node }: { node: SysNode }) {
  const [open, setOpen] = useState(false);
  const nodeConns = CONNECTIONS.filter(c => c.from === node.id || c.to === node.id);
  return (
    <div onClick={() => setOpen(!open)} className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${open ? "ring-1 ring-offset-1 ring-offset-[#0B0F19] scale-[1.01]" : "hover:border-[#334155]"}`}
      style={{ borderColor: open ? node.color+"55" : "#1E293B", backgroundColor: open ? node.color+"08" : "#111827", ringColor: open ? node.color : undefined }}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: node.color+"15" }}>{node.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold" style={{ color: node.color }}>{node.title}</span>
            <Badge className="text-[7px] px-1 py-0" style={{ backgroundColor: "#10B98115", color: "#10B981" }}>{node.status}</Badge>
            {node.isNew && <Badge className="text-[6px] px-1 py-0 bg-pink-500/15 text-pink-400 border-pink-500/20">NEW</Badge>}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">{node.subtitle}</div>
        </div>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0"/> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0"/>}
      </div>
      {open && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: node.color+"20" }}>
          <div className="flex flex-wrap gap-1 mb-2.5">
            {node.tech.map(t => <span key={t} className="px-2 py-0.5 rounded text-[8px] font-medium bg-[#1E293B] text-slate-300 border border-[#334155]">{t}</span>)}
          </div>
          <div className="space-y-1 mb-2.5">
            {node.details.map((d,i) => <div key={i} className="flex items-start gap-1.5 text-[9px] text-slate-400"><span style={{color:node.color}} className="mt-0.5">•</span><span>{d}</span></div>)}
          </div>
          {nodeConns.length > 0 && (
            <div className="pt-2 border-t border-[#1E293B]">
              <span className="text-[8px] text-slate-600 block mb-1">Data Flows:</span>
              {nodeConns.map((c,i) => {
                const other = c.from === node.id ? c.to : c.from;
                const otherNode = NODES.find(n => n.id === other);
                return (
                  <div key={i} className="flex items-center gap-2 text-[8px] py-0.5">
                    <span className="text-slate-500">{c.from === node.id ? "→" : "←"}</span>
                    <span style={{ color: otherNode?.color || "#94A3B8" }} className="font-semibold">{otherNode?.title || other}</span>
                    <span className="text-slate-600">({c.label})</span>
                    <Badge className="text-[6px] px-1 capitalize" style={{ backgroundColor: (FLOW_COLORS[c.type]||"#64748B")+"15", color: FLOW_COLORS[c.type]||"#64748B" }}>{c.type}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Interactive HTML (Tab 1) ────────────────────────
// We embed the full HTML architecture via srcdoc iframe

const INTERACTIVE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LoopAI Core Architecture</title>
<style>
/* ═══ Reset & Base ═══ */
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#0B0F19;color:#E2E8F0;min-height:100vh;overflow-x:hidden}
a{color:inherit;text-decoration:none}

/* ═══ Variables ═══ */
:root{
  --bg:#0B0F19;--card:#111827;--border:#1E293B;--border2:#334155;
  --blue:#3B82F6;--cyan:#06B6D4;--green:#10B981;--amber:#F59E0B;
  --pink:#EC4899;--purple:#8B5CF6;--red:#EF4444;--orange:#F97316;
  --slate:#64748B;--text:#E2E8F0;--muted:#94A3B8;
}

/* ═══ Layout ═══ */
.container{max-width:1200px;margin:0 auto;padding:20px}

/* ═══ Header ═══ */
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;flex-wrap:wrap;gap:12px}
.header h1{font-size:24px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px}
.header h1 svg{color:var(--blue)}
.header .sub{font-size:11px;color:var(--slate);margin-top:2px}
.header-actions{display:flex;gap:8px}
.btn{padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .2s}
.btn:hover{border-color:var(--border2);color:#fff;background:rgba(255,255,255,.03)}
.btn.active{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.3);color:var(--blue)}
.btn-dl{background:var(--card);color:var(--muted)}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700}

/* ═══ External Services Bar ═══ */
.services-bar{display:flex;align-items:center;gap:12px;padding:20px 24px;margin-bottom:20px;border-radius:14px;border:1px dashed var(--border);background:rgba(255,255,255,.01);flex-wrap:wrap}
.services-bar .label{font-size:10px;color:var(--slate);letter-spacing:2px;text-transform:uppercase;margin-right:4px}
.service-pill{display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:24px;border:1px solid var(--border);cursor:pointer;transition:all .3s;font-size:12px;font-weight:600;color:var(--muted);white-space:nowrap}
.service-pill:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,.3)}
.service-pill .dot{width:8px;height:8px;border-radius:50%}
.service-pill .count{font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,.05)}
.service-pill.active{transform:translateY(-2px)}

/* ═══ Architecture Canvas ═══ */
.arch-canvas{position:relative;min-height:900px;margin-bottom:32px}

/* ═══ Node Boxes ═══ */
.node{position:absolute;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;transition:all .4s cubic-bezier(.16,1,.3,1);min-width:160px;z-index:2}
.node:hover{transform:scale(1.03);z-index:10}
.node.highlighted{z-index:10;box-shadow:0 0 30px rgba(59,130,246,.15)}
.node.dimmed{opacity:.2;filter:grayscale(.7)}
.node .node-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.node .node-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
.node .node-title{font-size:11px;font-weight:700}
.node .node-sub{font-size:9px;color:var(--slate)}
.node .node-badge{font-size:7px;padding:1px 5px;border-radius:6px;font-weight:700;margin-left:4px}
.node .node-detail{display:none;margin-top:10px;padding-top:10px;font-size:9px;color:var(--muted);line-height:1.6}
.node.expanded .node-detail{display:block}
.node .tech-tag{display:inline-block;padding:2px 6px;border-radius:4px;font-size:8px;font-weight:600;background:var(--border);color:var(--muted);margin:1px 2px}

/* ═══ SVG Arrows ═══ */
.arrows-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1}
.arrow-path{fill:none;stroke-width:1.5;opacity:.4;transition:opacity .3s}
.arrow-path.active{opacity:1;stroke-width:2.5}
.arrow-dot{r:3;opacity:.8}

@keyframes flowDot{
  0%{offset-distance:0%}
  100%{offset-distance:100%}
}
.flow-dot{animation:flowDot 3s linear infinite;offset-rotate:0deg}

/* ═══ Layer Labels ═══ */
.layer-label{position:absolute;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;z-index:3;padding:4px 12px;border-radius:6px;border:1px solid}

/* ═══ Legend ═══ */
.legend{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px;padding:12px 16px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.legend-item{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted);cursor:pointer;padding:4px 8px;border-radius:6px;transition:all .2s}
.legend-item:hover{background:rgba(255,255,255,.03);color:#fff}
.legend-item .leg-dot{width:10px;height:10px;border-radius:50%;border:2px solid}
.legend-item.active .leg-dot{box-shadow:0 0 8px}

/* ═══ Info Panel ═══ */
.info-panel{position:fixed;right:-400px;top:0;width:380px;height:100vh;background:var(--card);border-left:1px solid var(--border);z-index:100;transition:right .4s cubic-bezier(.16,1,.3,1);overflow-y:auto;padding:24px}
.info-panel.open{right:0}
.info-panel .close-btn{position:absolute;top:12px;right:12px;width:28px;height:28px;border-radius:6px;background:var(--border);border:none;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px}
.info-panel h2{font-size:16px;font-weight:800;margin-bottom:4px}
.info-panel .ip-sub{font-size:11px;color:var(--slate);margin-bottom:16px}
.info-panel .ip-section{margin-bottom:16px}
.info-panel .ip-section h3{font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;letter-spacing:1px;text-transform:uppercase}
.info-panel .ip-list{list-style:none}
.info-panel .ip-list li{font-size:11px;color:var(--muted);padding:3px 0;display:flex;align-items:flex-start;gap:6px}
.info-panel .ip-list li::before{content:"•";font-weight:700;margin-top:0}
.info-panel .conn-badge{display:inline-block;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:600;margin:2px;cursor:pointer}

/* ═══ Footer ═══ */
.footer{text-align:center;padding:20px;font-size:9px;color:var(--slate);letter-spacing:1.5px;border-top:1px solid var(--border);margin-top:32px}

/* ═══ Overlay ═══ */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99;display:none}
.overlay.open{display:block}

/* ═══ Responsive ═══ */
@media(max-width:900px){
  .arch-canvas{min-height:auto;position:static}
  .node{position:static!important;width:100%!important;margin-bottom:8px}
  .arrows-svg{display:none}
  .services-bar{flex-direction:column;align-items:flex-start}
}

/* ═══ Animations ═══ */
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade-in{animation:fadeIn .5s ease forwards}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.pulse{animation:pulse 2s ease-in-out infinite}
@keyframes glow{0%,100%{box-shadow:0 0 4px rgba(59,130,246,.2)}50%{box-shadow:0 0 20px rgba(59,130,246,.4)}}
</style>
</head>
<body>

<div class="container">
  <!-- Header -->
  <div class="header fade-in">
    <div>
      <h1>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>
        LoopAI Core Architecture
      </h1>
      <div class="sub">23 components · 30 data flows · Full-stack system diagram · TECH 41 Stanford</div>
    </div>
    <div class="header-actions">
      <button class="btn btn-dl" onclick="downloadSVG()">📥 Save SVG</button>
      <button class="btn" onclick="refreshArchitecture()">🔄 Refresh</button>
      <button class="btn" id="toggleFlows" onclick="toggleFlows()">Hide Arrows</button>
    </div>
  </div>

  <!-- External Services -->
  <div class="services-bar fade-in" style="animation-delay:.1s">
    <span class="label">External Services:</span>
    <div class="service-pill" data-svc="lovable" onclick="highlightService('lovable')" style="--c:#EC4899">
      <span class="dot" style="background:#EC4899"></span> Lovable <span class="count" style="color:#EC4899">3</span>
    </div>
    <div class="service-pill" data-svc="claude" onclick="highlightService('claude')" style="--c:#8B5CF6">
      <span class="dot" style="background:#8B5CF6"></span> Claude AI <span class="count" style="color:#8B5CF6">3</span>
    </div>
    <div class="service-pill" data-svc="chatprd" onclick="highlightService('chatprd')" style="--c:#F59E0B">
      <span class="dot" style="background:#F59E0B"></span> ChatPRD <span class="count" style="color:#F59E0B">2</span>
    </div>
    <div class="service-pill" data-svc="openai" onclick="highlightService('openai')" style="--c:#10B981">
      <span class="dot" style="background:#10B981"></span> ChatGPT <span class="count" style="color:#10B981">2</span>
    </div>
    <div class="service-pill" data-svc="gemini" onclick="highlightService('gemini')" style="--c:#3B82F6">
      <span class="dot" style="background:#3B82F6"></span> Gemini <span class="count" style="color:#3B82F6">3</span>
    </div>
  </div>

  <!-- Architecture Canvas -->
  <div class="arch-canvas" id="canvas">
    <svg class="arrows-svg" id="arrowsSvg">
      <defs>
        <marker id="ah-blue" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3B82F6" opacity=".6"/></marker>
        <marker id="ah-cyan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#06B6D4" opacity=".6"/></marker>
        <marker id="ah-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10B981" opacity=".6"/></marker>
        <marker id="ah-amber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#F59E0B" opacity=".6"/></marker>
        <marker id="ah-pink" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#EC4899" opacity=".6"/></marker>
        <marker id="ah-purple" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#8B5CF6" opacity=".6"/></marker>
        <marker id="ah-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#EF4444" opacity=".6"/></marker>
      </defs>
    </svg>

    <!-- Layer Labels -->
    <div class="layer-label" style="top:0;left:0;color:#3B82F6;border-color:rgba(59,130,246,.2);background:rgba(59,130,246,.05)">External AI Services</div>
    <div class="layer-label" style="top:110px;left:0;color:#06B6D4;border-color:rgba(6,182,212,.2);background:rgba(6,182,212,.05)">Frontend</div>
    <div class="layer-label" style="top:230px;left:0;color:#F97316;border-color:rgba(249,115,22,.2);background:rgba(249,115,22,.05)">Prompts & Logic</div>
    <div class="layer-label" style="top:370px;left:0;color:#10B981;border-color:rgba(16,185,129,.2);background:rgba(16,185,129,.05)">Backend Services</div>
    <div class="layer-label" style="top:500px;left:0;color:#F59E0B;border-color:rgba(245,158,11,.2);background:rgba(245,158,11,.05)">Data & Auth</div>
    <div class="layer-label" style="top:610px;left:0;color:#EF4444;border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.05)">Security</div>
    <div class="layer-label" style="top:710px;left:0;color:#8B5CF6;border-color:rgba(139,92,246,.2);background:rgba(139,92,246,.05)">Infrastructure</div>

    <!-- ═══ NODES ═══ -->
    <!-- External (y:30) -->
    <div class="node" id="n-lovable" data-layer="external" style="left:0;top:30px;width:170px;border-color:rgba(236,72,153,.25)" onclick="openInfo('lovable')">
      <div class="node-header"><div class="node-icon" style="background:rgba(236,72,153,.12)">💖</div><div><div class="node-title" style="color:#EC4899">Lovable</div><div class="node-sub">Vibe Coding Platform</div></div></div>
    </div>
    <div class="node" id="n-claude" data-layer="external" style="left:200px;top:30px;width:170px;border-color:rgba(139,92,246,.25)" onclick="openInfo('claude')">
      <div class="node-header"><div class="node-icon" style="background:rgba(139,92,246,.12)">🧠</div><div><div class="node-title" style="color:#8B5CF6">Claude AI</div><div class="node-sub">Deep Analysis</div></div></div>
    </div>
    <div class="node" id="n-chatprd" data-layer="external" style="left:400px;top:30px;width:170px;border-color:rgba(245,158,11,.25)" onclick="openInfo('chatprd')">
      <div class="node-header"><div class="node-icon" style="background:rgba(245,158,11,.12)">📋</div><div><div class="node-title" style="color:#F59E0B">ChatPRD</div><div class="node-sub">PRD Methodology</div></div></div>
    </div>
    <div class="node" id="n-openai" data-layer="external" style="left:600px;top:30px;width:170px;border-color:rgba(16,185,129,.25)" onclick="openInfo('openai')">
      <div class="node-header"><div class="node-icon" style="background:rgba(16,185,129,.12)">🤖</div><div><div class="node-title" style="color:#10B981">ChatGPT</div><div class="node-sub">General AI</div></div></div>
    </div>
    <div class="node" id="n-gemini" data-layer="external" style="left:800px;top:30px;width:170px;border-color:rgba(59,130,246,.25)" onclick="openInfo('gemini')">
      <div class="node-header"><div class="node-icon" style="background:rgba(59,130,246,.12)">✨</div><div><div class="node-title" style="color:#3B82F6">Gemini</div><div class="node-sub">Primary AI</div></div></div>
    </div>

    <!-- Frontend (y:140) -->
    <div class="node" id="n-frontend" data-layer="frontend" style="left:50px;top:140px;width:260px;border-color:rgba(6,182,212,.25)" onclick="openInfo('frontend')">
      <div class="node-header"><div class="node-icon" style="background:rgba(6,182,212,.12)">🖥️</div><div><div class="node-title" style="color:#06B6D4">React SPA</div><div class="node-sub">12+ pages · React 18 · TypeScript · Tailwind</div></div></div>
    </div>
    <div class="node" id="n-uiux" data-layer="frontend" style="left:370px;top:140px;width:240px;border-color:rgba(245,158,11,.25)" onclick="openInfo('uiux')">
      <div class="node-header"><div class="node-icon" style="background:rgba(245,158,11,.12)">🎨</div><div><div class="node-title" style="color:#F59E0B">UI/UX System</div><div class="node-sub">shadcn/ui · Synthetic/Custom · Dark Theme</div></div></div>
    </div>
    <div class="node" id="n-display" data-layer="frontend" style="left:670px;top:140px;width:220px;border-color:rgba(168,85,247,.25)" onclick="openInfo('display')">
      <div class="node-header"><div class="node-icon" style="background:rgba(168,85,247,.12)">📱</div><div><div class="node-title" style="color:#A855F7">Display Mode <span class="node-badge" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="node-sub">🖥💻📱📲 4 responsive modes</div></div></div>
    </div>

    <!-- Logic (y:260) -->
    <div class="node" id="n-classifier" data-layer="logic" style="left:0;top:260px;width:175px;border-color:rgba(16,185,129,.25)" onclick="openInfo('classifier')">
      <div class="node-header"><div class="node-icon" style="background:rgba(16,185,129,.12)">🔬</div><div><div class="node-title" style="color:#10B981">Classifier</div><div class="node-sub">AI Stage Classification</div></div></div>
    </div>
    <div class="node" id="n-pwmoic" data-layer="logic" style="left:200px;top:260px;width:175px;border-color:rgba(249,115,22,.25)" onclick="openInfo('pwmoic')">
      <div class="node-header"><div class="node-icon" style="background:rgba(249,115,22,.12)">⚡</div><div><div class="node-title" style="color:#F97316">PWMOIC</div><div class="node-sub">Risk & Return M×P×T×F</div></div></div>
    </div>
    <div class="node" id="n-valuation" data-layer="logic" style="left:400px;top:260px;width:175px;border-color:rgba(168,85,247,.25)" onclick="openInfo('valuation')">
      <div class="node-header"><div class="node-icon" style="background:rgba(168,85,247,.12)">🎯</div><div><div class="node-title" style="color:#A855F7">Valuation Sim</div><div class="node-sub">3-Firm · 23 Params</div></div></div>
    </div>
    <div class="node" id="n-nova" data-layer="logic" style="left:600px;top:260px;width:175px;border-color:rgba(59,130,246,.25)" onclick="openInfo('nova')">
      <div class="node-header"><div class="node-icon" style="background:rgba(59,130,246,.12)">📊</div><div><div class="node-title" style="color:#3B82F6">Nova Dashboard</div><div class="node-sub">10 Chart Types</div></div></div>
    </div>
    <div class="node" id="n-aienhance" data-layer="logic" style="left:800px;top:260px;width:175px;border-color:rgba(236,72,153,.25)" onclick="openInfo('aienhance')">
      <div class="node-header"><div class="node-icon" style="background:rgba(236,72,153,.12)">✨</div><div><div class="node-title" style="color:#EC4899">AI Enhance <span class="node-badge" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="node-sub">Content Generation</div></div></div>
    </div>

    <!-- Backend (y:400) -->
    <div class="node" id="n-edgefn" data-layer="backend" style="left:30px;top:400px;width:210px;border-color:rgba(6,182,212,.25)" onclick="openInfo('edgefn')">
      <div class="node-header"><div class="node-icon" style="background:rgba(6,182,212,.12)">☁️</div><div><div class="node-title" style="color:#06B6D4">Edge Functions</div><div class="node-sub">Deno · chat-ai · send-pm-report</div></div></div>
    </div>
    <div class="node" id="n-chatbot" data-layer="backend" style="left:280px;top:400px;width:210px;border-color:rgba(236,72,153,.25)" onclick="openInfo('chatbot')">
      <div class="node-header"><div class="node-icon" style="background:rgba(236,72,153,.12)">💬</div><div><div class="node-title" style="color:#EC4899">LoopAI Chatbot</div><div class="node-sub">Floating · Multi-turn · Markdown</div></div></div>
    </div>
    <div class="node" id="n-feedback" data-layer="backend" style="left:530px;top:400px;width:210px;border-color:rgba(245,158,11,.25)" onclick="openInfo('feedback')">
      <div class="node-header"><div class="node-icon" style="background:rgba(245,158,11,.12)">⭐</div><div><div class="node-title" style="color:#F59E0B">Feedback System</div><div class="node-sub">Survey · Reviews · AI Enhance</div></div></div>
    </div>
    <div class="node" id="n-email" data-layer="backend" style="left:780px;top:400px;width:200px;border-color:rgba(239,68,68,.25)" onclick="openInfo('email')">
      <div class="node-header"><div class="node-icon" style="background:rgba(239,68,68,.12)">📧</div><div><div class="node-title" style="color:#EF4444">Email Auto <span class="node-badge" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="node-sub">Resend · pg_cron · Nightly</div></div></div>
    </div>

    <!-- Data (y:530) -->
    <div class="node" id="n-supabase" data-layer="data" style="left:120px;top:530px;width:320px;border-color:rgba(16,185,129,.25)" onclick="openInfo('supabase')">
      <div class="node-header"><div class="node-icon" style="background:rgba(16,185,129,.12)">🗄️</div><div><div class="node-title" style="color:#10B981">Supabase</div><div class="node-sub">PostgreSQL · Auth · Edge Fn · RLS · pg_cron</div></div></div>
    </div>
    <div class="node" id="n-auth" data-layer="data" style="left:520px;top:530px;width:280px;border-color:rgba(245,158,11,.25)" onclick="openInfo('auth')">
      <div class="node-header"><div class="node-icon" style="background:rgba(245,158,11,.12)">🔑</div><div><div class="node-title" style="color:#F59E0B">Authentication</div><div class="node-sub">Google OAuth · JWT · ProtectedRoute</div></div></div>
    </div>

    <!-- Security (y:640) -->
    <div class="node" id="n-security" data-layer="security" style="left:200px;top:640px;width:400px;border-color:rgba(239,68,68,.25)" onclick="openInfo('security')">
      <div class="node-header"><div class="node-icon" style="background:rgba(239,68,68,.12)">🛡️</div><div><div class="node-title" style="color:#EF4444">Security & Privacy</div><div class="node-sub">HTTPS · RLS · CORS · In-Memory Keys · GDPR/PDPA</div></div></div>
    </div>

    <!-- Infrastructure (y:740) -->
    <div class="node" id="n-pmdash" data-layer="infra" style="left:50px;top:740px;width:260px;border-color:rgba(139,92,246,.25)" onclick="openInfo('pmdash')">
      <div class="node-header"><div class="node-icon" style="background:rgba(139,92,246,.12)">📋</div><div><div class="node-title" style="color:#8B5CF6">PM Command Center</div><div class="node-sub">9 Tabs · Feedback · Growth · TRUST</div></div></div>
    </div>
    <div class="node" id="n-metrics" data-layer="infra" style="left:370px;top:740px;width:260px;border-color:rgba(6,182,212,.25)" onclick="openInfo('metrics')">
      <div class="node-header"><div class="node-icon" style="background:rgba(6,182,212,.12)">📈</div><div><div class="node-title" style="color:#06B6D4">Success Metrics <span class="node-badge" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="node-sub">PRD Gap Analysis · TRUST Framework</div></div></div>
    </div>
    <div class="node" id="n-github" data-layer="infra" style="left:690px;top:740px;width:200px;border-color:rgba(100,116,139,.25)" onclick="openInfo('github')">
      <div class="node-header"><div class="node-icon" style="background:rgba(100,116,139,.12)">🐙</div><div><div class="node-title" style="color:#94A3B8">GitHub</div><div class="node-sub">Version Control · CI/CD</div></div></div>
    </div>
  </div>

  <!-- Legend -->
  <div class="legend fade-in">
    <span style="font-size:10px;color:var(--slate);font-weight:700;margin-right:8px">Flow Types:</span>
    <div class="legend-item" onclick="filterFlows('all')"><div class="leg-dot" style="background:#3B82F6;border-color:#3B82F6"></div> All</div>
    <div class="legend-item" onclick="filterFlows('user')"><div class="leg-dot" style="background:#3B82F6;border-color:#3B82F6"></div> User</div>
    <div class="legend-item" onclick="filterFlows('auth')"><div class="leg-dot" style="background:#F59E0B;border-color:#F59E0B"></div> Auth</div>
    <div class="legend-item" onclick="filterFlows('data')"><div class="leg-dot" style="background:#06B6D4;border-color:#06B6D4"></div> Data</div>
    <div class="legend-item" onclick="filterFlows('api')"><div class="leg-dot" style="background:#10B981;border-color:#10B981"></div> API</div>
    <div class="legend-item" onclick="filterFlows('interaction')"><div class="leg-dot" style="background:#EC4899;border-color:#EC4899"></div> Interaction</div>
    <div class="legend-item" onclick="filterFlows('security')"><div class="leg-dot" style="background:#EF4444;border-color:#EF4444"></div> Security</div>
    <div class="legend-item" onclick="filterFlows('tool')"><div class="leg-dot" style="background:#8B5CF6;border-color:#8B5CF6"></div> Tool</div>
  </div>

  <!-- Tech Stack -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:32px" class="fade-in">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px">
      <h3 style="font-size:12px;font-weight:800;color:#06B6D4;margin-bottom:10px">Frontend</h3>
      <ul style="list-style:none;font-size:10px;color:var(--muted);line-height:2">
        <li>• React 18 + TypeScript</li><li>• Tailwind CSS + shadcn/ui</li><li>• Recharts (10+ chart types)</li><li>• React Router + Context API</li><li>• Sonner (toasts) + Lucide (icons)</li><li>• Display Mode Selector (4 modes)</li>
      </ul>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px">
      <h3 style="font-size:12px;font-weight:800;color:#10B981;margin-bottom:10px">Backend</h3>
      <ul style="list-style:none;font-size:10px;color:var(--muted);line-height:2">
        <li>• Supabase (PostgreSQL + Auth)</li><li>• Edge Functions (Deno runtime)</li><li>• Google OAuth 2.0 + JWT</li><li>• Row-Level Security policies</li><li>• pg_cron (scheduled tasks)</li><li>• Resend API (email automation)</li>
      </ul>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px">
      <h3 style="font-size:12px;font-weight:800;color:#8B5CF6;margin-bottom:10px">AI & Integrations</h3>
      <ul style="list-style:none;font-size:10px;color:var(--muted);line-height:2">
        <li>• Gemini 2.0 Flash (primary AI)</li><li>• OpenAI GPT-4o-mini (fallback)</li><li>• Claude Sonnet (deep analysis)</li><li>• ChatPRD (PRD methodology)</li><li>• Lovable (vibe coding)</li><li>• GitHub (version control + CI/CD)</li>
      </ul>
    </div>
  </div>

  <div class="footer">LoopAI for TECH 41 Stanford · Educational Purpose Only · @ 2026 Dr. Kie Prayarach</div>
</div>

<!-- Info Panel -->
<div class="overlay" id="overlay" onclick="closeInfo()"></div>
<div class="info-panel" id="infoPanel">
  <button class="close-btn" onclick="closeInfo()">✕</button>
  <div id="infoPanelContent"></div>
</div>

<script>
// ═══ Data ═══
const NODES_DATA = {
  lovable: { title:"Lovable", sub:"Vibe Coding Platform", color:"#EC4899", tech:["React+TS","Tailwind","shadcn/ui","Auto-Deploy"], details:["AI-assisted code generation","Real-time preview","Git integration","Supabase connector","Component library"], connections:["frontend","github"] },
  claude: { title:"Anthropic Claude", sub:"Architecture & Deep Analysis", color:"#8B5CF6", tech:["claude-sonnet-4-20250514","200K context","Messages API"], details:["Architecture design","Deep analytical reasoning","Long-context analysis","Code review","PRD support"], connections:["edgefn","aienhance"] },
  chatprd: { title:"ChatPRD", sub:"PRD Methodology", color:"#F59E0B", tech:["PRD Generation","User Stories","Success Metrics"], details:["Automated PRD creation","Success metric frameworks","TRUST framework eval","Milestone planning"], connections:["pmdash","metrics"], isNew:true },
  openai: { title:"ChatGPT / OpenAI", sub:"General AI & Classification", color:"#10B981", tech:["gpt-4o-mini","Function Calling"], details:["Startup classification","Structured output","Fallback provider"], connections:["edgefn"] },
  gemini: { title:"Google Gemini", sub:"Primary AI Provider", color:"#3B82F6", tech:["gemini-2.0-flash","Streaming","Safety Settings"], details:["Primary chat & classification","PWMOIC analysis","Multi-turn context","Low-latency streaming"], connections:["edgefn","chatbot"] },
  frontend: { title:"React SPA", sub:"Client-Side Application", color:"#06B6D4", tech:["React 18","TypeScript","Tailwind","shadcn/ui","Recharts","Router"], details:["12+ feature pages","Dark theme (#0B0F19)","Collapsible sidebar","React Context state","Display mode selector"], connections:["uiux","auth","edgefn","chatbot"] },
  uiux: { title:"UI/UX Design System", sub:"Interface & Experience", color:"#F59E0B", tech:["shadcn/ui","Lucide","Sonner","CSS Vars"], details:["Card-based dark layouts","Synthetic ↔ Custom toggles","Enter buttons with loading","Feedback survey popup","Star ratings & reviews"], connections:["frontend"] },
  display: { title:"Display Mode Selector", sub:"Responsive Layout Control", color:"#A855F7", tech:["DisplayContext","sessionStorage","MobileNav"], details:["🖥️ Wide (100%)","💻 Desktop (1280px)","📱 Tablet (768px)","📲 Mobile (390px)","Emoticon picker top-left"], connections:["frontend"], isNew:true },
  classifier: { title:"Startup Classifier", sub:"AI Classification Engine", color:"#10B981", tech:["LLM Prompts","File Upload","Stage Mapping"], details:["URL + file + text input","Mock keyword mapping","AI structured JSON output","Supports PDF/images/CSV"], connections:["edgefn","frontend"] },
  pwmoic: { title:"PWMOIC Engine", sub:"Risk & Return Computation", color:"#F97316", tech:["M×P×T×F","7 Scenarios","TAM","Score 1-5"], details:["Multiplicative risk framework","3-stage cascade","TAM: 3 approaches","PWMOIC = Σ(Prob × MOIC)"], connections:["frontend","valuation"] },
  valuation: { title:"Valuation Simulator", sub:"Multi-Firm Scoring", color:"#A855F7", tech:["23 Params","3 Firms","Grades","Emoticons"], details:["A(50%) B(25%) C(25%)","Editable weights (=100%)","🏆🥇🥈🥉 winner","Triggers feedback survey"], connections:["nova","frontend","feedback"] },
  nova: { title:"Nova Dashboard", sub:"Analytics & Visualization", color:"#3B82F6", tech:["Recharts","10 Charts","Gap Analysis"], details:["Radar, Bar, Area, Pie, Heatmap","Firm insights auto-detection","Winner ranking banner","Live ValuationContext data"], connections:["valuation","frontend"] },
  aienhance: { title:"Enhance with AI", sub:"Content Generation", color:"#EC4899", tech:["Claude/Gemini","Sentiment-Aware","Context Injection"], details:["Short → professional reviews","Sentiment-matched tone","Feature-aware context","Reduces user friction"], connections:["edgefn","claude","feedback"], isNew:true },
  edgefn: { title:"Supabase Edge Functions", sub:"Serverless API Layer", color:"#06B6D4", tech:["Deno","TypeScript","CORS","Multi-Provider"], details:["chat-ai: AI routing","send-pm-report: email","System prompt injection","Error handling"], connections:["gemini","openai","claude","supabase","email"] },
  chatbot: { title:"LoopAI Chatbot", sub:"Floating AI Assistant", color:"#EC4899", tech:["useChatAI","Multi-turn","Markdown","Quick Chips"], details:["380×520px floating panel","Mock + AI mode","Provider badge","Typing indicator"], connections:["edgefn","frontend"] },
  feedback: { title:"Feedback System", sub:"Survey + Reviews + AI", color:"#F59E0B", tech:["3-Step Survey","Star Ratings","NPS","AI Enhance"], details:["Pre-valuation popup","Customer review page","Enhance with AI button","Sentiment tagging","Helpful voting"], connections:["valuation","pmdash","aienhance"] },
  email: { title:"Email Automation", sub:"Nightly PM Reports", color:"#EF4444", tech:["Resend API","pg_cron","HTML Email","Logging"], details:["Midnight daily reports","7 dashboard sections","Manual + scheduled","Success/failure tracking","Configurable settings"], connections:["edgefn","pmdash","supabase"], isNew:true },
  supabase: { title:"Supabase", sub:"Backend-as-a-Service", color:"#10B981", tech:["PostgreSQL","Auth","Edge Fn","RLS","Cron"], details:["auth.users","activity_logs","feedback_surveys","email_logs","Row-Level Security"], connections:["auth","edgefn","pmdash","email"] },
  auth: { title:"Authentication", sub:"Google OAuth + Session", color:"#F59E0B", tech:["Google OAuth 2.0","JWT","ProtectedRoute"], details:["Gmail sign-in/sign-up","First-time API modal","JWT session","Admin email check"], connections:["supabase","frontend"] },
  security: { title:"Security & Privacy", sub:"Data Protection", color:"#EF4444", tech:["HTTPS","RLS","CORS","GDPR/PDPA"], details:["In-memory API keys","RLS user isolation","CORS on Edge Functions","GDPR/PDPA compliant","Admin-only PM access"], connections:["supabase","edgefn","auth"] },
  pmdash: { title:"PM Command Center", sub:"9-Tab Dashboard", color:"#8B5CF6", tech:["Overview","Feedback","Growth","Funnel","Metrics","B2B","Roadmap","Competitive","System"], details:["PRD goal tracking","AI recommendations","NPS/satisfaction analytics","B2B pipeline","Email automation tab"], connections:["supabase","feedback","metrics","email"] },
  metrics: { title:"Success Metrics & TRUST", sub:"PRD Gap Analysis + Ethics", color:"#06B6D4", tech:["9 Metrics","TRUST Radar","5 Pillars","20 Sub-metrics"], details:["User/Business/Technical metrics","TRUST: T-R-U-S-T pillars","AI governance summary","Gap analysis visualization"], connections:["pmdash","chatprd"], isNew:true },
  github: { title:"GitHub", sub:"Version Control & CI/CD", color:"#94A3B8", tech:["Git","Auto-Deploy","Lovable"], details:["Source repository","Auto-deploy on push","Branch development"], connections:["lovable","frontend"] },
};

const CONNECTIONS = [
  {from:"lovable",to:"frontend",color:"#8B5CF6",label:"Code Gen"},
  {from:"lovable",to:"github",color:"#8B5CF6",label:"Auto-Deploy"},
  {from:"claude",to:"edgefn",color:"#8B5CF6",label:"Deep Analysis"},
  {from:"claude",to:"aienhance",color:"#EC4899",label:"Enhancement"},
  {from:"chatprd",to:"metrics",color:"#F59E0B",label:"PRD Framework"},
  {from:"openai",to:"edgefn",color:"#10B981",label:"Chat API"},
  {from:"gemini",to:"edgefn",color:"#3B82F6",label:"Primary AI"},
  {from:"gemini",to:"chatbot",color:"#3B82F6",label:"Chat Responses"},
  {from:"frontend",to:"auth",color:"#F59E0B",label:"OAuth"},
  {from:"frontend",to:"edgefn",color:"#06B6D4",label:"API Calls"},
  {from:"frontend",to:"classifier",color:"#10B981",label:"Input Data"},
  {from:"frontend",to:"chatbot",color:"#EC4899",label:"Chat Messages"},
  {from:"classifier",to:"edgefn",color:"#10B981",label:"AI Request"},
  {from:"pwmoic",to:"valuation",color:"#F97316",label:"Scores"},
  {from:"valuation",to:"nova",color:"#A855F7",label:"Context"},
  {from:"valuation",to:"feedback",color:"#F59E0B",label:"Trigger Survey"},
  {from:"feedback",to:"pmdash",color:"#F59E0B",label:"Analytics"},
  {from:"feedback",to:"aienhance",color:"#EC4899",label:"Enhance"},
  {from:"chatbot",to:"edgefn",color:"#06B6D4",label:"History"},
  {from:"edgefn",to:"supabase",color:"#10B981",label:"DB Queries"},
  {from:"email",to:"edgefn",color:"#EF4444",label:"send-pm-report"},
  {from:"supabase",to:"email",color:"#10B981",label:"pg_cron"},
  {from:"supabase",to:"pmdash",color:"#8B5CF6",label:"Logs"},
  {from:"auth",to:"supabase",color:"#F59E0B",label:"JWT"},
  {from:"security",to:"supabase",color:"#EF4444",label:"RLS"},
  {from:"security",to:"edgefn",color:"#EF4444",label:"CORS"},
  {from:"pmdash",to:"metrics",color:"#06B6D4",label:"Targets"},
  {from:"display",to:"frontend",color:"#A855F7",label:"Layout Mode"},
];

// ═══ Arrow Drawing ═══
let showingFlows = true;
let currentFilter = 'all';

function getCenter(id) {
  const el = document.getElementById('n-'+id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const c = document.getElementById('canvas').getBoundingClientRect();
  return { x: r.left - c.left + r.width/2, y: r.top - c.top + r.height/2 };
}

function drawArrows() {
  const svg = document.getElementById('arrowsSvg');
  // Clear existing
  svg.querySelectorAll('.drawn-arrow').forEach(e=>e.remove());

  if (!showingFlows) return;

  CONNECTIONS.forEach((conn, i) => {
    const from = getCenter(conn.from);
    const to = getCenter(conn.to);
    if (!from || !to) return;

    const markerColor = conn.color === '#3B82F6' ? 'blue' : conn.color === '#06B6D4' ? 'cyan' : conn.color === '#10B981' ? 'green' : conn.color === '#F59E0B' ? 'amber' : conn.color === '#EC4899' ? 'pink' : conn.color === '#8B5CF6' ? 'purple' : 'red';

    // Curved path
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const cx1 = from.x + dx * 0.3;
    const cy1 = from.y + dy * 0.1;
    const cx2 = from.x + dx * 0.7;
    const cy2 = to.y - dy * 0.1;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = \`M \${from.x} \${from.y} C \${cx1} \${cy1}, \${cx2} \${cy2}, \${to.x} \${to.y}\`;
    path.setAttribute('d', d);
    path.setAttribute('stroke', conn.color);
    path.setAttribute('marker-end', \`url(#ah-\${markerColor})\`);
    path.setAttribute('class', 'drawn-arrow arrow-path');
    path.setAttribute('stroke-dasharray', '4 3');
    path.setAttribute('data-from', conn.from);
    path.setAttribute('data-to', conn.to);
    path.style.animationDelay = \`\${i * 0.05}s\`;

    svg.appendChild(path);

    // Animated dot
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '2.5');
    circle.setAttribute('fill', conn.color);
    circle.setAttribute('class', 'drawn-arrow flow-dot');
    circle.style.offsetPath = \`path("\${d}")\`;
    circle.style.animationDuration = \`\${2 + Math.random() * 2}s\`;
    circle.style.animationDelay = \`\${Math.random() * 2}s\`;
    svg.appendChild(circle);
  });
}

function toggleFlows() {
  showingFlows = !showingFlows;
  document.getElementById('toggleFlows').textContent = showingFlows ? 'Hide Arrows' : 'Show Arrows';
  document.getElementById('toggleFlows').classList.toggle('active', showingFlows);
  drawArrows();
}

function filterFlows(type) {
  currentFilter = type;
  // For now just redraw all — could filter in future
  drawArrows();
}

// ═══ Service Highlight ═══
let activeService = null;

function highlightService(svc) {
  if (activeService === svc) { activeService = null; resetHighlight(); return; }
  activeService = svc;

  const nodeData = NODES_DATA[svc];
  const connected = [svc, ...(nodeData?.connections || [])];

  document.querySelectorAll('.node').forEach(n => {
    const id = n.id.replace('n-','');
    if (connected.includes(id)) {
      n.classList.add('highlighted');
      n.classList.remove('dimmed');
    } else {
      n.classList.remove('highlighted');
      n.classList.add('dimmed');
    }
  });

  document.querySelectorAll('.service-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.svc === svc);
    p.style.borderColor = p.dataset.svc === svc ? getComputedStyle(p).getPropertyValue('--c') : '';
    p.style.background = p.dataset.svc === svc ? getComputedStyle(p).getPropertyValue('--c') + '15' : '';
  });

  // Highlight connected arrows
  document.querySelectorAll('.arrow-path').forEach(a => {
    const f = a.getAttribute('data-from');
    const t = a.getAttribute('data-to');
    if (f === svc || t === svc || connected.includes(f) && connected.includes(t)) {
      a.classList.add('active');
    } else {
      a.style.opacity = '0.08';
    }
  });
}

function resetHighlight() {
  document.querySelectorAll('.node').forEach(n => { n.classList.remove('highlighted','dimmed'); });
  document.querySelectorAll('.service-pill').forEach(p => { p.classList.remove('active'); p.style.borderColor=''; p.style.background=''; });
  document.querySelectorAll('.arrow-path').forEach(a => { a.classList.remove('active'); a.style.opacity=''; });
}

// ═══ Info Panel ═══
function openInfo(id) {
  const data = NODES_DATA[id];
  if (!data) return;

  const panel = document.getElementById('infoPanel');
  const content = document.getElementById('infoPanelContent');

  content.innerHTML = \`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;margin-top:8px">
      <div style="width:40px;height:40px;border-radius:10px;background:\${data.color}15;display:flex;align-items:center;justify-content:center;font-size:18px;border:1px solid \${data.color}33">\${document.querySelector('#n-'+id+' .node-icon')?.textContent||'📦'}</div>
      <div>
        <h2 style="color:\${data.color}">\${data.title} \${data.isNew?'<span style="background:rgba(236,72,153,.15);color:#EC4899;padding:1px 6px;border-radius:4px;font-size:8px;margin-left:4px">NEW</span>':''}</h2>
        <div class="ip-sub">\${data.sub}</div>
      </div>
    </div>
    <div class="ip-section">
      <h3>Tech Stack</h3>
      <div style="display:flex;flex-wrap:wrap;gap:4px">\${data.tech.map(t=>\`<span class="tech-tag">\${t}</span>\`).join('')}</div>
    </div>
    <div class="ip-section">
      <h3>Details</h3>
      <ul class="ip-list">\${data.details.map(d=>\`<li style="color:\${data.color}">\${d}</li>\`).join('')}</ul>
    </div>
    <div class="ip-section">
      <h3>Connections</h3>
      <div>\${data.connections.map(c=>{const n=NODES_DATA[c];return n?\`<span class="conn-badge" style="background:\${n.color}15;color:\${n.color};border:1px solid \${n.color}33" onclick="closeInfo();setTimeout(()=>openInfo('\${c}'),300)">\${n.title}</span>\`:'';}).join('')}</div>
    </div>
  \`;

  panel.classList.add('open');
  document.getElementById('overlay').classList.add('open');
}

function closeInfo() {
  document.getElementById('infoPanel').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
}

function downloadSVG() {
  const canvas = document.getElementById('canvas');
  const rect = canvas.getBoundingClientRect();
  const w = rect.width, h = rect.height;
  
  // Create a standalone SVG
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('width', w);
  svg.setAttribute('height', h + 40);
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + (h + 40));
  svg.setAttribute('style', 'background:#0B0F19');

  // Title
  const title = document.createElementNS(ns, 'text');
  title.setAttribute('x', '20');
  title.setAttribute('y', '24');
  title.setAttribute('fill', '#E2E8F0');
  title.setAttribute('font-size', '16');
  title.setAttribute('font-weight', '800');
  title.setAttribute('font-family', 'Segoe UI, sans-serif');
  title.textContent = 'LoopAI Core Architecture — 23 components · 30 data flows';
  svg.appendChild(title);

  const g = document.createElementNS(ns, 'g');
  g.setAttribute('transform', 'translate(0, 40)');

  // Draw nodes as rects with text
  document.querySelectorAll('.node').forEach(function(node) {
    const nr = node.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const x = nr.left - cr.left, y = nr.top - cr.top;
    const bc = node.style.borderColor || '#1E293B';
    
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', nr.width);
    r.setAttribute('height', nr.height);
    r.setAttribute('rx', '10');
    r.setAttribute('fill', '#111827');
    r.setAttribute('stroke', bc);
    r.setAttribute('stroke-width', '1');
    g.appendChild(r);

    const titleEl = node.querySelector('.node-title, .nt');
    const subEl = node.querySelector('.node-sub, .ns');
    const iconEl = node.querySelector('.node-icon, .ni');

    if (iconEl) {
      const it = document.createElementNS(ns, 'text');
      it.setAttribute('x', x + 14);
      it.setAttribute('y', y + 22);
      it.setAttribute('font-size', '12');
      it.textContent = iconEl.textContent;
      g.appendChild(it);
    }

    if (titleEl) {
      const tt = document.createElementNS(ns, 'text');
      tt.setAttribute('x', x + 40);
      tt.setAttribute('y', y + 20);
      tt.setAttribute('fill', titleEl.style.color || '#E2E8F0');
      tt.setAttribute('font-size', '10');
      tt.setAttribute('font-weight', '700');
      tt.setAttribute('font-family', 'Segoe UI, sans-serif');
      tt.textContent = titleEl.textContent;
      g.appendChild(tt);
    }

    if (subEl) {
      const st = document.createElementNS(ns, 'text');
      st.setAttribute('x', x + 40);
      st.setAttribute('y', y + 34);
      st.setAttribute('fill', '#64748B');
      st.setAttribute('font-size', '8');
      st.setAttribute('font-family', 'Segoe UI, sans-serif');
      st.textContent = subEl.textContent;
      g.appendChild(st);
    }
  });

  // Copy arrow paths
  document.querySelectorAll('#arrowsSvg .arrow-path, #as .arrow-path, .da.arrow-path').forEach(function(path) {
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', path.getAttribute('d'));
    p.setAttribute('stroke', path.getAttribute('stroke'));
    p.setAttribute('stroke-width', '1.5');
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke-dasharray', '4 3');
    p.setAttribute('opacity', '0.4');
    g.appendChild(p);
  });

  // Layer labels
  document.querySelectorAll('.layer-label').forEach(function(lbl) {
    const lr = lbl.getBoundingClientRect();
    const cr = canvas.getBoundingClientRect();
    const lt = document.createElementNS(ns, 'text');
    lt.setAttribute('x', lr.left - cr.left);
    lt.setAttribute('y', lr.top - cr.top + 12);
    lt.setAttribute('fill', lbl.style.color || '#64748B');
    lt.setAttribute('font-size', '9');
    lt.setAttribute('font-weight', '700');
    lt.setAttribute('letter-spacing', '1.5');
    lt.setAttribute('font-family', 'Segoe UI, sans-serif');
    lt.textContent = lbl.textContent;
    g.appendChild(lt);
  });

  svg.appendChild(g);

  // Footer
  const footer = document.createElementNS(ns, 'text');
  footer.setAttribute('x', w / 2);
  footer.setAttribute('y', h + 30);
  footer.setAttribute('fill', '#475569');
  footer.setAttribute('font-size', '8');
  footer.setAttribute('text-anchor', 'middle');
  footer.setAttribute('font-family', 'Segoe UI, sans-serif');
  footer.textContent = 'LoopAI for TECH 41 Stanford · Educational Purpose Only · @ 2026 Dr. Kie Prayarach';
  svg.appendChild(footer);

  // Serialize and download
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LoopAI_Architecture.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fix #2: Refresh — reset to default view with all arrows
function refreshArchitecture() {
  // Reset highlights
  resetHighlight();
  // Re-enable arrows
  showingFlows = true;
  document.getElementById('toggleFlows').textContent = 'Hide Arrows';
  document.getElementById('toggleFlows').classList.add('active');
  // Close info panel
  closeInfo();
  // Redraw arrows fresh
  drawArrows();
}

// ═══ Init ═══
window.addEventListener('load', () => {
  setTimeout(drawArrows, 500);
  // Redraw on resize
  window.addEventListener('resize', drawArrows);
});
</script>
</body>
</html>`;

// ═════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════

export default function PMArchitecture() {
  const [activeTab, setActiveTab] = useState("interactive");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const TABS = [
    { id: "interactive", label: "🌐 LoopAI Interactive", color: "#3B82F6" },
    { id: "overview", label: "📋 Overview", color: "#06B6D4" },
    { id: "external", label: "🌍 External AI", color: "#3B82F6" },
    { id: "frontend", label: "🖥️ Frontend", color: "#06B6D4" },
    { id: "logic", label: "⚡ Prompts & Logic", color: "#F97316" },
    { id: "backend", label: "☁️ Backend", color: "#10B981" },
    { id: "data", label: "🗄️ Data & Auth", color: "#F59E0B" },
    { id: "security", label: "🛡️ Security", color: "#EF4444" },
    { id: "infra", label: "📋 Infrastructure", color: "#8B5CF6" },
  ];

  const layerForTab = (tab: string) => {
    const map: Record<string,string> = { external:"external", frontend:"frontend", logic:"logic", backend:"backend", data:"data", security:"security", infra:"infra" };
    return map[tab];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <Workflow className="w-5 h-5 text-blue-400" />
          LoopAI Core Architecture
        </h1>
        <p className="text-[10px] text-slate-500">{NODES.length} components · {CONNECTIONS.length} data flows · Interactive system diagram</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded-lg text-[10px] font-semibold border whitespace-nowrap transition-all ${
              activeTab === t.id
                ? "scale-[1.02]"
                : "border-[#1E293B] text-slate-500 hover:text-slate-300 hover:border-[#334155]"
            }`}
            style={{
              borderColor: activeTab === t.id ? t.color + "44" : undefined,
              backgroundColor: activeTab === t.id ? t.color + "10" : undefined,
              color: activeTab === t.id ? t.color : undefined,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab 1: Interactive (embedded HTML) ═══ */}
      {activeTab === "interactive" && (
        <Card className="bg-[#111827] border-[#1E293B] overflow-hidden">
          <CardContent className="p-0">
            <iframe
              ref={iframeRef}
              srcDoc={INTERACTIVE_HTML}
              className="w-full border-0"
              style={{ height: "850px", background: "#0B0F19" }}
              title="LoopAI Interactive Architecture"
              sandbox="allow-scripts allow-same-origin"
            />
          </CardContent>
        </Card>
      )}

      {/* ═══ Tab 2: Overview ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Total Components", value: NODES.length, color: "#3B82F6" },
              { label: "Data Flows", value: CONNECTIONS.length, color: "#06B6D4" },
              { label: "Live Components", value: NODES.filter(n=>n.status==="live").length, color: "#10B981" },
              { label: "New Features", value: NODES.filter(n=>n.isNew).length, color: "#EC4899" },
            ].map((s,i) => (
              <Card key={i} className="bg-[#111827] border-[#1E293B]">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Layer Summary */}
          <Card className="bg-[#111827] border-[#1E293B]">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Architecture Layers</h3>
              <div className="space-y-2">
                {LAYERS.map((layer) => {
                  const Icon = layer.icon;
                  const layerNodes = NODES.filter(n => n.layer === layer.id);
                  const hasNew = layerNodes.some(n => n.isNew);
                  return (
                    <div key={layer.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/50 cursor-pointer hover:border-[#334155] transition-colors" onClick={() => setActiveTab(layer.id)}>
                      <Icon className="w-4 h-4" style={{ color: layer.color }} />
                      <div className="flex-1"><span className="text-xs font-bold" style={{ color: layer.color }}>{layer.label}</span></div>
                      <div className="flex gap-1">
                        {layerNodes.map(n => <span key={n.id} className="text-sm" title={n.title}>{n.icon}</span>)}
                      </div>
                      <Badge className="text-[8px]" style={{ backgroundColor: layer.color+"15", color: layer.color }}>{layerNodes.length}</Badge>
                      {hasNew && <span className="w-2 h-2 rounded-full bg-pink-500" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { title:"Frontend", color:"#06B6D4", items:["React 18 + TypeScript","Tailwind + shadcn/ui","Recharts (10+ charts)","React Router + Context","Display Mode (4 modes)"] },
              { title:"Backend", color:"#10B981", items:["Supabase (PostgreSQL)","Edge Functions (Deno)","Google OAuth 2.0 + JWT","Row-Level Security","Resend API + pg_cron"] },
              { title:"AI & Tools", color:"#8B5CF6", items:["Gemini 2.0 Flash","OpenAI GPT-4o-mini","Claude Sonnet","ChatPRD","Lovable + GitHub"] },
            ].map(s => (
              <Card key={s.title} className="bg-[#111827] border-[#1E293B]">
                <CardContent className="p-4">
                  <div className="text-xs font-bold mb-2" style={{ color: s.color }}>{s.title}</div>
                  {s.items.map((item,i) => <div key={i} className="flex items-center gap-1.5 text-[9px] text-slate-400 py-0.5"><div className="w-1 h-1 rounded-full" style={{ backgroundColor: s.color }}/>{item}</div>)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Tabs 3-9: Per-Layer Detail ═══ */}
      {layerForTab(activeTab) && (
        <div className="space-y-4">
          {(() => {
            const layerId = layerForTab(activeTab)!;
            const layer = LAYERS.find(l => l.id === layerId)!;
            const layerNodes = NODES.filter(n => n.layer === layerId);
            const Icon = layer.icon;
            return (
              <>
                {/* Layer header */}
                <Card className="bg-[#111827] border-[#1E293B] overflow-hidden">
                  <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: layer.color+"22", backgroundColor: layer.color+"05" }}>
                    <Icon className="w-4 h-4" style={{ color: layer.color }} />
                    <span className="text-sm font-bold" style={{ color: layer.color }}>{layer.label}</span>
                    <Badge className="text-[8px] ml-auto" style={{ backgroundColor: layer.color+"15", color: layer.color }}>{layerNodes.length} components</Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className={`grid gap-3 ${layerNodes.length <= 2 ? "grid-cols-2" : layerNodes.length <= 3 ? "grid-cols-3" : layerNodes.length >= 5 ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2"}`}>
                      {layerNodes.map(node => <NodeCard key={node.id} node={node} />)}
                    </div>
                  </CardContent>
                </Card>

                {/* Data flows for this layer */}
                <Card className="bg-[#111827] border-[#1E293B]">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-bold text-white mb-3">Data Flows — {layer.label}</h3>
                    <div className="space-y-1.5">
                      {CONNECTIONS.filter(c => {
                        const fromNode = NODES.find(n => n.id === c.from);
                        const toNode = NODES.find(n => n.id === c.to);
                        return fromNode?.layer === layerId || toNode?.layer === layerId;
                      }).map((flow, i) => {
                        const fromNode = NODES.find(n => n.id === flow.from);
                        const toNode = NODES.find(n => n.id === flow.to);
                        const color = FLOW_COLORS[flow.type] || "#64748B";
                        return (
                          <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0F19] border border-[#1E293B]/40">
                            <div className="w-[120px] shrink-0 flex items-center gap-1.5">
                              <span className="text-sm">{fromNode?.icon}</span>
                              <span className="text-[10px] font-semibold" style={{ color: fromNode?.color }}>{fromNode?.title}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 shrink-0" style={{ color }} />
                            <span className="text-[9px] text-slate-400 flex-1">{flow.label}</span>
                            <Badge className="text-[7px] px-1.5 capitalize shrink-0" style={{ backgroundColor: color+"15", color }}>{flow.type}</Badge>
                            <div className="w-[120px] shrink-0 flex items-center gap-1.5 justify-end">
                              <span className="text-[10px] font-semibold" style={{ color: toNode?.color }}>{toNode?.title}</span>
                              <span className="text-sm">{toNode?.icon}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
