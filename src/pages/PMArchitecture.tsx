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
  { id:"lovable",title:"Lovable",subtitle:"Vibe Coding Platform",layer:"external",icon:"💖",color:"#EC4899",tech:["React+TS","Tailwind","shadcn/ui","Auto-Deploy"],details:["AI-assisted code generation & iteration","Real-time preview environment","Auto-deploy to .lovable.app hosting","Supabase connector built-in","Component library (shadcn/ui)"],status:"live",connections:["frontend","uiux","edgefn","supabase"] },
  { id:"claude",title:"Anthropic Claude",subtitle:"Architecture & Deep Analysis",layer:"external",icon:"🧠",color:"#8B5CF6",tech:["claude-sonnet-4-20250514","200K context","Messages API"],details:["Architecture design assistance","Deep analytical reasoning","Long-context document analysis","Code review & optimization","PRD support"],status:"live",connections:["edgefn","aienhance"] },
  { id:"chatprd",title:"ChatPRD",subtitle:"PRD Methodology",layer:"external",icon:"📋",color:"#F59E0B",tech:["PRD Generation","User Stories","Success Metrics"],details:["Automated PRD document creation","Success metric framework (ChatPRD methodology)","TRUST framework evaluation","Milestone & sequencing planning"],status:"live",connections:["pmdash","metrics"],isNew:true },
  { id:"openai",title:"ChatGPT / OpenAI",subtitle:"General AI & Classification",layer:"external",icon:"🤖",color:"#10B981",tech:["gpt-4o-mini","Chat Completions","Function Calling"],details:["Startup classification prompts","Function calling for structured output","Fallback AI provider","System prompt injection"],status:"live",connections:["edgefn"] },
  { id:"gemini",title:"Google Gemini",subtitle:"Primary AI Provider",layer:"external",icon:"✨",color:"#3B82F6",tech:["gemini-2.0-flash","REST API","Streaming","Safety Settings"],details:["Primary AI for chat & classification","PWMOIC analysis generation","Multi-turn conversation context","Low-latency streaming responses"],status:"live",connections:["edgefn","chatbot"] },
  // Frontend
  { id:"frontend",title:"React SPA",subtitle:"Client-Side Application",layer:"frontend",icon:"🖥️",color:"#06B6D4",tech:["React 18","TypeScript","Tailwind CSS","shadcn/ui","Recharts","React Router"],details:["Single Page Application (SPA)","12+ feature pages + Login","Dark professional theme (#0B0F19)","Responsive sidebar layout","Client-side state via React Context","Display mode selector (4 modes)"],status:"live",connections:["uiux","auth","edgefn","chatbot"] },
  { id:"uiux",title:"UI/UX Design System",subtitle:"Interface & Experience",layer:"frontend",icon:"🎨",color:"#F59E0B",tech:["shadcn/ui","Lucide Icons","Sonner Toasts","CSS Variables"],details:["Card-based dark layouts","Synthetic ↔ Custom mode toggles","Enter buttons with loading states","Feedback survey popup (3-step)","Star ratings & review system"],status:"live",connections:["frontend"] },
  { id:"display",title:"Display Mode Selector",subtitle:"Responsive Layout Control",layer:"frontend",icon:"📱",color:"#A855F7",tech:["DisplayContext","sessionStorage","MobileNav","Bottom Tab"],details:["🖥️ Wide Screen (100%)","💻 Desktop (1280px) — default","📱 Tablet (768px) — sidebar hidden","📲 Mobile (390px) — compact mode","Emoticon selector top-left corner"],status:"live",connections:["frontend"],isNew:true },
  // Prompt Engineering
  { id:"prompts",title:"Prompt Engineering",subtitle:"6 AI Instruction Techniques",layer:"prompts",icon:"🧬",color:"#14B8A6",tech:["Zero-Shot","Few-Shot","Structured Reasoning","Constraint-Based","Meta/System","Context Injection"],details:["Zero-Shot: Direct instruction, no examples","Few-Shot: 2-3 examples in prompt","Structured Reasoning: Chain-of-Thought","Constraint-Based: Rules + JSON output","Meta/System: Role definition","Context Injection: Dynamic data in prompt"],status:"live",connections:["classifier","pwmoic","valuation","aienhance","chatbot"],isNew:true },
  // Application Features
  { id:"classifier",title:"Startup Classifier",subtitle:"AI Classification Engine",layer:"features",icon:"🔬",color:"#10B981",tech:["LLM Prompts","File Upload","Stage Mapping"],details:["URL fetching + file upload + text paste","Mock: keyword → stage mapping","AI: structured JSON prompt","Supports PDF, images, CSV, DOCX"],status:"live",connections:["edgefn","frontend"] },
  { id:"pwmoic",title:"PWMOIC Engine",subtitle:"Risk & Return Computation",layer:"features",icon:"⚡",color:"#F97316",tech:["M×P×T×F","7 Scenarios","TAM (3 approaches)","Score 1-5"],details:["Multiplicative: Market × Product × Team × Finance","3-stage cascade: Creation → Early → Mass Market","7 scenarios: S7 (Leader) → S1 (Initial Idea)","TAM: Top-Down, Bottom-Up, Value Theory","PWMOIC = Σ(Probability × MOIC)"],status:"live",connections:["frontend","valuation"] },
  { id:"valuation",title:"Valuation Simulator",subtitle:"Multi-Firm Scoring",layer:"features",icon:"🎯",color:"#A855F7",tech:["23 Parameters","3-Firm Compare","Weighted","Grades"],details:["A. Risk/Reward (50%) — 8 params","B. Team (25%) — 7 params","C. Market (25%) — 8 params","Winner 🏆🥇🥈🥉 emoticons","Triggers feedback survey"],status:"live",connections:["nova","frontend","feedback"] },
  { id:"nova",title:"Nova Dashboard",subtitle:"Analytics & Visualization",layer:"features",icon:"📊",color:"#3B82F6",tech:["Recharts","10 Charts","Gap Analysis","Firm Insights"],details:["Radar, Bar, Area, Pie, Line, Heatmap","Gap analysis + competitive insights","Winner banner with medal ranking","Live data from ValuationContext"],status:"live",connections:["valuation","frontend"] },
  { id:"aienhance",title:"Enhance with AI",subtitle:"AI Content Generation",layer:"features",icon:"✨",color:"#EC4899",tech:["Claude/Gemini","Sentiment-Aware","Context Injection"],details:["Expands short → professional reviews","Sentiment-matched tone","Feature-aware context injection","Used in Customer Feedback"],status:"live",connections:["edgefn","claude","feedback"],isNew:true },
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
  // Infra (reordered: PM → Metrics → PDF → MVP)
  { id:"pmdash",title:"PM Command Center",subtitle:"9-Tab Strategic Dashboard",layer:"infra",icon:"📋",color:"#8B5CF6",tech:["Overview","Feedback","Growth","Funnel","Metrics","B2B","Roadmap","Competitive","System"],details:["PRD goal tracking with progress bars","AI Product Improvement recommendations","NPS + satisfaction analytics","B2B pipeline tracking","Email automation tab"],status:"live",connections:["supabase","feedback","metrics","email"] },
  { id:"metrics",title:"Success Metrics & TRUST",subtitle:"PRD Gap Analysis + Ethical AI",layer:"infra",icon:"📈",color:"#06B6D4",tech:["9 PRD Metrics","TRUST Radar","5 Pillars","20 Sub-metrics"],details:["User/Business/Technical gap analysis","TRUST: Tried, Reinforced, User, Sustainable, Transparent","AI Governance summary","Priority improvement actions"],status:"live",connections:["pmdash","chatprd","pdfexport"],isNew:true },
  { id:"pdfexport",title:"PDF Export",subtitle:"Branded Report Generation",layer:"infra",icon:"📄",color:"#94A3B8",tech:["PDF Library","Templates","Branding","Planned"],details:["Dynamic PDF report generation","Branded valuation reports","Shareable secure links","PRD requirement — Phase 2"],status:"planned",connections:["metrics","mvp"] },
  { id:"mvp",title:"MVP Launch Roadmap",subtitle:"B2C → B2B Scaling Strategy",layer:"infra",icon:"🚀",color:"#84CC16",tech:["Phase 1: B2C","Phase 2: B2B","PRD Targets","6-8 Weeks"],details:["Phase 1: Freemium B2C (2,000 subs Y1)","Phase 2: Enterprise B2B (5 clients, API, RBAC)","PRD: $200K ARR, 15K reports","6-8 week MVP timeline"],status:"live",connections:["pdfexport","pmdash"],isNew:true },
];

const LAYERS = [
  { id:"external", label:"External AI Services", color:"#3B82F6", icon:Globe },
  { id:"frontend", label:"Frontend Layer", color:"#06B6D4", icon:Monitor },
  { id:"prompts", label:"Prompt Engineering", color:"#14B8A6", icon:Brain },
  { id:"features", label:"Application Features", color:"#F97316", icon:Cpu },
  { id:"backend", label:"Backend Services", color:"#10B981", icon:Server },
  { id:"data", label:"Data & Auth Layer", color:"#F59E0B", icon:Database },
  { id:"security", label:"Security & Privacy", color:"#EF4444", icon:Shield },
  { id:"infra", label:"Infrastructure & PM", color:"#8B5CF6", icon:Layout },
];

const CONNECTIONS = [
  {from:"lovable",to:"frontend",label:"Code Gen",type:"tool"},
  {from:"claude",to:"edgefn",label:"Deep Analysis",type:"api"},
  {from:"claude",to:"aienhance",label:"Enhancement",type:"api"},
  {from:"chatprd",to:"metrics",label:"PRD Framework",type:"tool"},
  {from:"openai",to:"edgefn",label:"Chat API",type:"api"},
  {from:"gemini",to:"edgefn",label:"Primary AI",type:"api"},
  {from:"gemini",to:"chatbot",label:"Chat Responses",type:"api"},
  {from:"frontend",to:"auth",label:"OAuth",type:"auth"},
  {from:"frontend",to:"edgefn",label:"API Calls",type:"data"},
  {from:"frontend",to:"prompts",label:"Input Data",type:"data"},
  {from:"frontend",to:"chatbot",label:"Chat Messages",type:"interaction"},
  {from:"prompts",to:"classifier",label:"Zero/Few-Shot",type:"data"},
  {from:"prompts",to:"pwmoic",label:"Structured Reasoning",type:"data"},
  {from:"prompts",to:"valuation",label:"Constraint-Based",type:"data"},
  {from:"prompts",to:"aienhance",label:"Context Injection",type:"data"},
  {from:"prompts",to:"chatbot",label:"Meta/System",type:"data"},
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
  {from:"metrics",to:"pdfexport",label:"Report Gen",type:"data"},
  {from:"pdfexport",to:"mvp",label:"Launch Ready",type:"data"},
  {from:"display",to:"frontend",label:"Layout Mode",type:"interaction"},
];

const FLOW_COLORS: Record<string,string> = {user:"#3B82F6",auth:"#F59E0B",data:"#06B6D4",api:"#10B981",interaction:"#EC4899",security:"#EF4444",tool:"#8B5CF6"};

// ─── Expandable Node Card ────────────────────────────

function NodeCard({ node }: { node: SysNode }) {
  const [open, setOpen] = useState(false);
  const nodeConns = CONNECTIONS.filter(c => c.from === node.id || c.to === node.id);
  return (
    <div onClick={() => setOpen(!open)} className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${open ? "ring-1 ring-offset-1 ring-offset-[#0B0F19] scale-[1.01]" : "hover:border-[#334155]"}`}
      style={{ borderColor: open ? node.color+"55" : "#1E293B", backgroundColor: open ? node.color+"08" : "#111827" }}>
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
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0B0F19">
<title>LoopAI Core Architecture</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;background:#0B0F19;color:#E2E8F0;min-height:100vh;overflow-x:hidden}
a{color:inherit;text-decoration:none}
:root{--bg:#0B0F19;--card:#111827;--border:#1E293B;--border2:#334155;--blue:#3B82F6;--cyan:#06B6D4;--green:#10B981;--amber:#F59E0B;--pink:#EC4899;--purple:#8B5CF6;--red:#EF4444;--orange:#F97316;--teal:#14B8A6;--lime:#84CC16;--slate:#64748B;--muted:#94A3B8}
.container{max-width:1200px;margin:0 auto;padding:20px}
.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
.header h1{font-size:22px;font-weight:900;color:#fff;display:flex;align-items:center;gap:10px}
.header h1 svg{color:var(--blue)}
.header .sub{font-size:10px;color:var(--slate);margin-top:2px}
.header-actions{display:flex;gap:6px}
.btn{padding:7px 14px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:transparent;color:var(--muted);transition:all .2s}
.btn:hover{border-color:var(--border2);color:#fff;background:rgba(255,255,255,.03)}
.btn.active{background:rgba(59,130,246,.12);border-color:rgba(59,130,246,.3);color:var(--blue)}
.services-bar{display:flex;align-items:center;gap:10px;padding:14px 20px;margin-bottom:16px;border-radius:12px;border:1px dashed var(--border);background:rgba(255,255,255,.01);flex-wrap:wrap}
.services-bar .label{font-size:9px;color:var(--slate);letter-spacing:2px;text-transform:uppercase;margin-right:4px}
.service-pill{display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:20px;border:1px solid var(--border);cursor:pointer;transition:all .3s;font-size:11px;font-weight:600;color:var(--muted);white-space:nowrap}
.service-pill:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.3)}
.service-pill .dot{width:7px;height:7px;border-radius:50%}
.service-pill.active{transform:translateY(-2px)}
.arch-canvas{position:relative;min-height:1180px;margin-bottom:24px}
.node{position:absolute;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .4s cubic-bezier(.16,1,.3,1);min-width:130px;z-index:2}
.node:hover{transform:scale(1.03);z-index:10}
.node.highlighted{z-index:10;box-shadow:0 0 24px rgba(59,130,246,.15)}
.node.dimmed{opacity:.18;filter:grayscale(.7)}
.node .nh{display:flex;align-items:center;gap:6px}
.node .ni{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:12px}
.node .nt{font-size:10px;font-weight:700}
.node .ns{font-size:8px;color:var(--slate)}
.node .nb{font-size:6px;padding:1px 4px;border-radius:4px;font-weight:700;margin-left:3px}
.arrows-svg{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1}
.arrow-path{fill:none;stroke-width:1.5;opacity:.35;stroke-dasharray:4 3}
.arrow-path.active{opacity:1;stroke-width:2.5}
@keyframes flowDot{0%{offset-distance:0%}100%{offset-distance:100%}}
.flow-dot{animation:flowDot 3s linear infinite;offset-rotate:0deg}
.layer-label{position:absolute;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;z-index:3;padding:3px 10px;border-radius:5px;border:1px solid}
.legend{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;padding:10px 14px;background:var(--card);border:1px solid var(--border);border-radius:10px}
.legend-item{display:flex;align-items:center;gap:5px;font-size:9px;color:var(--muted);cursor:pointer;padding:3px 6px;border-radius:6px;transition:all .2s}
.legend-item:hover{background:rgba(255,255,255,.03);color:#fff}
.legend-item .leg-dot{width:8px;height:8px;border-radius:50%;border:2px solid}
.info-panel{position:fixed;right:-400px;top:0;width:380px;height:100vh;background:var(--card);border-left:1px solid var(--border);z-index:100;transition:right .4s cubic-bezier(.16,1,.3,1);overflow-y:auto;padding:20px}
.info-panel.open{right:0}
.info-panel .close-btn{position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:6px;background:var(--border);border:none;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px}
.info-panel h2{font-size:15px;font-weight:800;margin-bottom:3px}
.info-panel .ips{font-size:10px;color:var(--slate);margin-bottom:14px}
.info-panel .iph{font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px;letter-spacing:.5px;text-transform:uppercase}
.info-panel .ipl{list-style:none}
.info-panel .ipl li{font-size:10px;color:var(--muted);padding:2px 0}
.info-panel .ipl li::before{content:"•";font-weight:700;margin-right:6px}
.tech-tag{display:inline-block;padding:2px 5px;border-radius:3px;font-size:7px;font-weight:600;background:var(--border);color:var(--muted);margin:1px}
.conn-badge{display:inline-block;padding:2px 6px;border-radius:5px;font-size:8px;font-weight:600;margin:2px;cursor:pointer}
.footer{text-align:center;padding:16px;font-size:8px;color:var(--slate);letter-spacing:1.5px;border-top:1px solid var(--border);margin-top:24px}
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:99;display:none}
.overlay.open{display:block}
.mobile-section{display:none;padding:8px 12px;margin:12px 0 6px;border-radius:8px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;border:1px solid}
@media(max-width:900px){.container{padding:12px}.arch-canvas{min-height:auto;position:static}.node{position:static!important;width:100%!important;margin-bottom:6px}.arrows-svg{display:none}.layer-label{display:none}.mobile-section{display:flex;align-items:center;gap:8px}.services-bar{flex-wrap:wrap;gap:6px;padding:10px}.header h1{font-size:17px}.legend{gap:4px;padding:8px}}
@media(max-width:600px){.container{padding:8px}.header{flex-direction:column;align-items:flex-start;gap:8px}.header-actions{width:100%;display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px}.btn{padding:8px 8px;font-size:10px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}.service-pill{padding:7px 10px;font-size:10px}.info-panel{right:0!important;left:0;bottom:-100vh;top:auto;width:100%;height:75vh;border-radius:16px 16px 0 0;border-left:none;border-top:1px solid var(--border);transition:bottom .4s cubic-bezier(.16,1,.3,1)}.info-panel.open{bottom:0;right:0!important}div[style*="grid-template-columns"]{grid-template-columns:1fr!important}.footer{font-size:7px;padding:10px}}
@media(hover:none)and(pointer:coarse){.node{padding:12px;min-height:48px}.node:hover{transform:none}.service-pill:hover{transform:none;box-shadow:none}.btn{min-height:40px}.close-btn,.info-panel .close-btn{width:36px;height:36px;font-size:18px}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .4s ease forwards}
</style>
</head>
<body>
<div class="container">
  <div class="header fade-in">
    <div>
      <h1><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24"/></svg>LoopAI Core Architecture</h1>
      <div class="sub">27 components · 8 layers · ~55 data flows · TECH 41 Stanford</div>
    </div>
    <div class="header-actions">
      <button class="btn" onclick="downloadSVG()">📥 Save SVG</button>
      <button class="btn" onclick="refreshArchitecture()">🔄 Refresh</button>
      <button class="btn active" id="toggleFlows" onclick="toggleFlows()">Hide Arrows</button>
    </div>
  </div>

  <div class="services-bar fade-in">
    <span class="label">External:</span>
    <div class="service-pill" data-svc="lovable" onclick="hl('lovable')"><span class="dot" style="background:#EC4899"></span>Lovable <span style="font-size:8px;color:#EC4899">9</span></div>
    <div class="service-pill" data-svc="claude" onclick="hl('claude')"><span class="dot" style="background:#8B5CF6"></span>Claude <span style="font-size:8px;color:#8B5CF6">7</span></div>
    <div class="service-pill" data-svc="chatprd" onclick="hl('chatprd')"><span class="dot" style="background:#F59E0B"></span>ChatPRD <span style="font-size:8px;color:#F59E0B">2</span></div>
    <div class="service-pill" data-svc="openai" onclick="hl('openai')"><span class="dot" style="background:#10B981"></span>ChatGPT <span style="font-size:8px;color:#10B981">2</span></div>
    <div class="service-pill" data-svc="gemini" onclick="hl('gemini')"><span class="dot" style="background:#3B82F6"></span>Gemini <span style="font-size:8px;color:#3B82F6">3</span></div>
  </div>

  <div class="arch-canvas" id="canvas">
    <svg class="arrows-svg" id="as"><defs>
      <marker id="a-b" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#3B82F6" opacity=".5"/></marker>
      <marker id="a-c" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#06B6D4" opacity=".5"/></marker>
      <marker id="a-g" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#10B981" opacity=".5"/></marker>
      <marker id="a-a" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#F59E0B" opacity=".5"/></marker>
      <marker id="a-p" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#EC4899" opacity=".5"/></marker>
      <marker id="a-v" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#8B5CF6" opacity=".5"/></marker>
      <marker id="a-r" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#EF4444" opacity=".5"/></marker>
      <marker id="a-o" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#F97316" opacity=".5"/></marker>
      <marker id="a-t" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto"><polygon points="0 0,7 2.5,0 5" fill="#14B8A6" opacity=".5"/></marker>
    </defs></svg>

    <!-- Layer Labels (desktop) -->
    <div class="layer-label" style="top:0;left:0;color:#3B82F6;border-color:rgba(59,130,246,.2);background:rgba(59,130,246,.05)">1. External AI Services</div>
    <div class="layer-label" style="top:100px;left:0;color:#06B6D4;border-color:rgba(6,182,212,.2);background:rgba(6,182,212,.05)">2. Frontend</div>
    <div class="layer-label" style="top:200px;left:0;color:#14B8A6;border-color:rgba(20,184,166,.2);background:rgba(20,184,166,.05)">3. Prompt Engineering</div>
    <div class="layer-label" style="top:290px;left:0;color:#F97316;border-color:rgba(249,115,22,.2);background:rgba(249,115,22,.05)">4. Application Features</div>
    <div class="layer-label" style="top:400px;left:0;color:#10B981;border-color:rgba(16,185,129,.2);background:rgba(16,185,129,.05)">5. Backend Services</div>
    <div class="layer-label" style="top:550px;left:0;color:#F59E0B;border-color:rgba(245,158,11,.2);background:rgba(245,158,11,.05)">6. Data & Auth</div>
    <div class="layer-label" style="top:650px;left:0;color:#EF4444;border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.05)">7. Security</div>
    <div class="layer-label" style="top:740px;left:0;color:#8B5CF6;border-color:rgba(139,92,246,.2);background:rgba(139,92,246,.05)">8. Infrastructure & PM</div>

    <!-- ═══ L1: External AI Services (y:26) ═══ -->
    <div class="mobile-section" style="color:#3B82F6;border-color:rgba(59,130,246,.2);background:rgba(59,130,246,.05)">🌍 1. External AI Services</div>
    <div class="node" id="n-lovable" style="left:0;top:26px;width:170px;border-color:rgba(236,72,153,.25)" onclick="oi('lovable')"><div class="nh"><div class="ni" style="background:rgba(236,72,153,.12)">💖</div><div><div class="nt" style="color:#EC4899">Lovable</div><div class="ns">Build · Deploy · Host</div></div></div></div>
    <div class="node" id="n-claude" style="left:195px;top:26px;width:170px;border-color:rgba(139,92,246,.25)" onclick="oi('claude')"><div class="nh"><div class="ni" style="background:rgba(139,92,246,.12)">🧠</div><div><div class="nt" style="color:#8B5CF6">Claude AI</div><div class="ns">Deep Analysis + Code</div></div></div></div>
    <div class="node" id="n-chatprd" style="left:390px;top:26px;width:155px;border-color:rgba(245,158,11,.25)" onclick="oi('chatprd')"><div class="nh"><div class="ni" style="background:rgba(245,158,11,.12)">📋</div><div><div class="nt" style="color:#F59E0B">ChatPRD</div><div class="ns">PRD Methodology</div></div></div></div>
    <div class="node" id="n-openai" style="left:570px;top:26px;width:155px;border-color:rgba(16,185,129,.25)" onclick="oi('openai')"><div class="nh"><div class="ni" style="background:rgba(16,185,129,.12)">🤖</div><div><div class="nt" style="color:#10B981">ChatGPT</div><div class="ns">General AI</div></div></div></div>
    <div class="node" id="n-gemini" style="left:750px;top:26px;width:155px;border-color:rgba(59,130,246,.25)" onclick="oi('gemini')"><div class="nh"><div class="ni" style="background:rgba(59,130,246,.12)">✨</div><div><div class="nt" style="color:#3B82F6">Gemini</div><div class="ns">Primary AI</div></div></div></div>

    <!-- ═══ L2: Frontend (y:120) ═══ -->
    <div class="mobile-section" style="color:#06B6D4;border-color:rgba(6,182,212,.2);background:rgba(6,182,212,.05)">🖥️ 2. Frontend</div>
    <div class="node" id="n-frontend" style="left:40px;top:120px;width:250px;border-color:rgba(6,182,212,.25)" onclick="oi('frontend')"><div class="nh"><div class="ni" style="background:rgba(6,182,212,.12)">🖥️</div><div><div class="nt" style="color:#06B6D4">React SPA</div><div class="ns">12+ pages · TypeScript · Tailwind</div></div></div></div>
    <div class="node" id="n-uiux" style="left:330px;top:120px;width:220px;border-color:rgba(245,158,11,.25)" onclick="oi('uiux')"><div class="nh"><div class="ni" style="background:rgba(245,158,11,.12)">🎨</div><div><div class="nt" style="color:#F59E0B">UI/UX System</div><div class="ns">shadcn/ui · Dark Theme</div></div></div></div>
    <div class="node" id="n-display" style="left:590px;top:120px;width:210px;border-color:rgba(168,85,247,.25)" onclick="oi('display')"><div class="nh"><div class="ni" style="background:rgba(168,85,247,.12)">📱</div><div><div class="nt" style="color:#A855F7">Display Mode<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">🖥💻📱📲 4 modes</div></div></div></div>

    <!-- ═══ L3: Prompt Engineering (y:218) ═══ -->
    <div class="mobile-section" style="color:#14B8A6;border-color:rgba(20,184,166,.2);background:rgba(20,184,166,.05)">🧬 3. Prompt Engineering</div>
    <div class="node" id="n-prompts" style="left:150px;top:218px;width:600px;border-color:rgba(20,184,166,.25)" onclick="oi('prompts')"><div class="nh"><div class="ni" style="background:rgba(20,184,166,.12)">🧬</div><div><div class="nt" style="color:#14B8A6">Prompt Engineering<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">Zero-Shot · Few-Shot · Structured Reasoning · Constraint-Based · Meta/System · Context Injection</div></div></div></div>

    <!-- ═══ L4: Application Features (y:312) ═══ -->
    <div class="mobile-section" style="color:#F97316;border-color:rgba(249,115,22,.2);background:rgba(249,115,22,.05)">⚡ 4. Application Features</div>
    <div class="node" id="n-classifier" style="left:0;top:312px;width:160px;border-color:rgba(16,185,129,.25)" onclick="oi('classifier')"><div class="nh"><div class="ni" style="background:rgba(16,185,129,.12)">🔬</div><div><div class="nt" style="color:#10B981">Classifier</div><div class="ns">AI Stage</div></div></div></div>
    <div class="node" id="n-pwmoic" style="left:185px;top:312px;width:160px;border-color:rgba(249,115,22,.25)" onclick="oi('pwmoic')"><div class="nh"><div class="ni" style="background:rgba(249,115,22,.12)">⚡</div><div><div class="nt" style="color:#F97316">PWMOIC</div><div class="ns">M×P×T×F</div></div></div></div>
    <div class="node" id="n-valuation" style="left:370px;top:312px;width:160px;border-color:rgba(168,85,247,.25)" onclick="oi('valuation')"><div class="nh"><div class="ni" style="background:rgba(168,85,247,.12)">🎯</div><div><div class="nt" style="color:#A855F7">Valuation Sim</div><div class="ns">3-Firm · 23 Params</div></div></div></div>
    <div class="node" id="n-nova" style="left:555px;top:312px;width:160px;border-color:rgba(59,130,246,.25)" onclick="oi('nova')"><div class="nh"><div class="ni" style="background:rgba(59,130,246,.12)">📊</div><div><div class="nt" style="color:#3B82F6">Nova Dashboard</div><div class="ns">10 Charts</div></div></div></div>
    <div class="node" id="n-aienhance" style="left:740px;top:312px;width:160px;border-color:rgba(236,72,153,.25)" onclick="oi('aienhance')"><div class="nh"><div class="ni" style="background:rgba(236,72,153,.12)">✨</div><div><div class="nt" style="color:#EC4899">AI Enhance<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">Content Gen</div></div></div></div>

    <!-- ═══ L5: Backend Services (y:420) ═══ -->
    <div class="mobile-section" style="color:#10B981;border-color:rgba(16,185,129,.2);background:rgba(16,185,129,.05)">☁️ 5. Backend Services</div>
    <div class="node" id="n-apigateway" style="left:0;top:420px;width:145px;border-color:rgba(20,184,166,.25)" onclick="oi('apigateway')"><div class="nh"><div class="ni" style="background:rgba(20,184,166,.12)">🔌</div><div><div class="nt" style="color:#14B8A6">API Gateway<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">REST · Keys · CORS</div></div></div></div>
    <div class="node" id="n-edgefn" style="left:170px;top:420px;width:155px;border-color:rgba(6,182,212,.25)" onclick="oi('edgefn')"><div class="nh"><div class="ni" style="background:rgba(6,182,212,.12)">☁️</div><div><div class="nt" style="color:#06B6D4">Edge Functions</div><div class="ns">Deno Runtime</div></div></div></div>
    <div class="node" id="n-chatbot" style="left:350px;top:420px;width:145px;border-color:rgba(236,72,153,.25)" onclick="oi('chatbot')"><div class="nh"><div class="ni" style="background:rgba(236,72,153,.12)">💬</div><div><div class="nt" style="color:#EC4899">Chatbot</div><div class="ns">Floating AI</div></div></div></div>
    <div class="node" id="n-automation" style="left:520px;top:420px;width:145px;border-color:rgba(132,204,22,.25)" onclick="oi('automation')"><div class="nh"><div class="ni" style="background:rgba(132,204,22,.12)">⚙️</div><div><div class="nt" style="color:#84CC16">Automation<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">Workflows</div></div></div></div>
    <div class="node" id="n-feedback" style="left:690px;top:420px;width:145px;border-color:rgba(245,158,11,.25)" onclick="oi('feedback')"><div class="nh"><div class="ni" style="background:rgba(245,158,11,.12)">⭐</div><div><div class="nt" style="color:#F59E0B">Feedback</div><div class="ns">Survey+Reviews</div></div></div></div>
    <div class="node" id="n-email" style="left:860px;top:420px;width:130px;border-color:rgba(239,68,68,.25)" onclick="oi('email')"><div class="nh"><div class="ni" style="background:rgba(239,68,68,.12)">📧</div><div><div class="nt" style="color:#EF4444">Email Auto</div><div class="ns">Resend+Cron</div></div></div></div>

    <!-- ═══ L6: Data & Auth (y:550) ═══ -->
    <div class="mobile-section" style="color:#F59E0B;border-color:rgba(245,158,11,.2);background:rgba(245,158,11,.05)">🗄️ 6. Data & Auth</div>
    <div class="node" id="n-supabase" style="left:120px;top:565px;width:320px;border-color:rgba(16,185,129,.25)" onclick="oi('supabase')"><div class="nh"><div class="ni" style="background:rgba(16,185,129,.12)">🗄️</div><div><div class="nt" style="color:#10B981">Supabase</div><div class="ns">PostgreSQL · RLS · pg_cron · Storage</div></div></div></div>
    <div class="node" id="n-auth" style="left:500px;top:565px;width:280px;border-color:rgba(245,158,11,.25)" onclick="oi('auth')"><div class="nh"><div class="ni" style="background:rgba(245,158,11,.12)">🔑</div><div><div class="nt" style="color:#F59E0B">Authentication</div><div class="ns">Google OAuth · JWT · Protected Routes</div></div></div></div>

    <!-- ═══ L7: Security (y:665) ═══ -->
    <div class="mobile-section" style="color:#EF4444;border-color:rgba(239,68,68,.2);background:rgba(239,68,68,.05)">🛡️ 7. Security & Privacy</div>
    <div class="node" id="n-security" style="left:200px;top:670px;width:400px;border-color:rgba(239,68,68,.25)" onclick="oi('security')"><div class="nh"><div class="ni" style="background:rgba(239,68,68,.12)">🛡️</div><div><div class="nt" style="color:#EF4444">Security & Privacy</div><div class="ns">HTTPS · RLS · CORS · In-Memory Keys · GDPR/PDPA</div></div></div></div>

    <!-- ═══ L8: Infrastructure & PM (y:760) ═══ -->
    <div class="mobile-section" style="color:#8B5CF6;border-color:rgba(139,92,246,.2);background:rgba(139,92,246,.05)">📋 8. Infrastructure & PM</div>
    <div class="node" id="n-pmdash" style="left:0;top:770px;width:200px;border-color:rgba(139,92,246,.25)" onclick="oi('pmdash')"><div class="nh"><div class="ni" style="background:rgba(139,92,246,.12)">📋</div><div><div class="nt" style="color:#8B5CF6">PM Center</div><div class="ns">9-Tab Dashboard</div></div></div></div>
    <div class="node" id="n-metrics" style="left:225px;top:770px;width:210px;border-color:rgba(6,182,212,.25)" onclick="oi('metrics')"><div class="nh"><div class="ni" style="background:rgba(6,182,212,.12)">📈</div><div><div class="nt" style="color:#06B6D4">Success Metrics<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">TRUST Framework</div></div></div></div>
    <div class="node" id="n-pdfexport" style="left:460px;top:770px;width:200px;border-color:rgba(100,116,139,.3)" onclick="oi('pdfexport')"><div class="nh"><div class="ni" style="background:rgba(100,116,139,.12)">📄</div><div><div class="nt" style="color:#94A3B8">PDF Export<span class="nb" style="background:rgba(100,116,139,.15);color:#94A3B8">PLANNED</span></div><div class="ns">Report Generation</div></div></div></div>
    <div class="node" id="n-mvp" style="left:685px;top:770px;width:200px;border-color:rgba(132,204,22,.25)" onclick="oi('mvp')"><div class="nh"><div class="ni" style="background:rgba(132,204,22,.12)">🚀</div><div><div class="nt" style="color:#84CC16">MVP Roadmap<span class="nb" style="background:rgba(236,72,153,.15);color:#EC4899">NEW</span></div><div class="ns">B2C → B2B Scale</div></div></div></div>
  </div>

  <!-- Legend -->
  <div class="legend fade-in">
    <span style="font-size:9px;color:var(--slate);font-weight:700;margin-right:6px">Flow Types:</span>
    <div class="legend-item" onclick="filterFlows('all')"><div class="leg-dot" style="background:#3B82F6;border-color:#3B82F6"></div>All</div>
    <div class="legend-item" onclick="filterFlows('user')"><div class="leg-dot" style="background:#3B82F6;border-color:#3B82F6"></div>User</div>
    <div class="legend-item" onclick="filterFlows('auth')"><div class="leg-dot" style="background:#F59E0B;border-color:#F59E0B"></div>Auth</div>
    <div class="legend-item" onclick="filterFlows('data')"><div class="leg-dot" style="background:#06B6D4;border-color:#06B6D4"></div>Data</div>
    <div class="legend-item" onclick="filterFlows('api')"><div class="leg-dot" style="background:#10B981;border-color:#10B981"></div>API</div>
    <div class="legend-item" onclick="filterFlows('prompt')"><div class="leg-dot" style="background:#14B8A6;border-color:#14B8A6"></div>Prompt</div>
    <div class="legend-item" onclick="filterFlows('interaction')"><div class="leg-dot" style="background:#EC4899;border-color:#EC4899"></div>Interaction</div>
    <div class="legend-item" onclick="filterFlows('security')"><div class="leg-dot" style="background:#EF4444;border-color:#EF4444"></div>Security</div>
    <div class="legend-item" onclick="filterFlows('tool')"><div class="leg-dot" style="background:#8B5CF6;border-color:#8B5CF6"></div>Tool</div>
    <div class="legend-item" onclick="filterFlows('auto')"><div class="leg-dot" style="background:#84CC16;border-color:#84CC16"></div>Automation</div>
  </div>

  <!-- Tech Stack -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px" class="fade-in">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <h3 style="font-size:11px;font-weight:800;color:#06B6D4;margin-bottom:8px">Frontend</h3>
      <ul style="list-style:none;font-size:9px;color:var(--muted);line-height:2.2">
        <li>• React 18 + TypeScript</li><li>• Tailwind CSS + shadcn/ui</li><li>• Recharts (10+ chart types)</li><li>• React Router + Context API</li><li>• Sonner (toasts) + Lucide (icons)</li><li>• Display Mode Selector (4 modes)</li>
      </ul>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <h3 style="font-size:11px;font-weight:800;color:#10B981;margin-bottom:8px">Backend</h3>
      <ul style="list-style:none;font-size:9px;color:var(--muted);line-height:2.2">
        <li>• Supabase (PostgreSQL + Auth)</li><li>• Edge Functions (Deno runtime)</li><li>• Google OAuth 2.0 + JWT</li><li>• Row-Level Security policies</li><li>• pg_cron (scheduled tasks)</li><li>• Resend API (email automation)</li>
      </ul>
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:10px;padding:14px">
      <h3 style="font-size:11px;font-weight:800;color:#8B5CF6;margin-bottom:8px">AI & Integrations</h3>
      <ul style="list-style:none;font-size:9px;color:var(--muted);line-height:2.2">
        <li>• Gemini 2.0 Flash (primary AI)</li><li>• OpenAI GPT-4o-mini (fallback)</li><li>• Claude Sonnet (deep analysis)</li><li>• ChatPRD (PRD methodology)</li><li>• Lovable (build · deploy · host)</li>
      </ul>
    </div>
  </div>

  <div class="footer">LoopAI for TECH 41 Stanford · Educational Purpose Only · @ 2026 Dr. Kie Prayarach</div>
</div>

<div class="overlay" id="overlay" onclick="ci()"></div>
<div class="info-panel" id="infoPanel"><button class="close-btn" onclick="ci()">✕</button><div id="ipc"></div></div>

<script>
const D={
  lovable:{t:"Lovable",s:"Build · Deploy · Host (Auto CI/CD)",c:"#EC4899",k:["React+TS","Tailwind","shadcn/ui","Auto-Deploy","Hosting","Supabase"],d:["AI-assisted vibe coding platform","Builds entire frontend SPA (12+ pages)","Auto-deploys to .lovable.app hosting","No GitHub needed — Lovable IS the CI/CD","Deploys Supabase Edge Functions","Connects Auth, DB, Storage automatically"],cn:["frontend","uiux","edgefn","supabase","auth","chatbot","feedback","automation","pmdash"]},
  claude:{t:"Anthropic Claude",s:"Architecture · Deep Analysis · Code Review",c:"#8B5CF6",k:["claude-sonnet-4-20250514","200K context","Messages API"],d:["Architecture design & system planning","Deep analytical reasoning","AI Enhance content expansion","Chatbot deep analysis mode","System prompt engineering","Code review & optimization"],cn:["apigateway","aienhance","chatbot","classifier","pmdash","metrics","feedback"]},
  chatprd:{t:"ChatPRD",s:"PRD Methodology & Framework",c:"#F59E0B",k:["PRD Generation","User Stories","Success Metrics","TRUST"],d:["Automated PRD document creation","Success metric framework","TRUST framework evaluation","Milestone & sequencing planning"],cn:["pmdash","metrics"]},
  openai:{t:"ChatGPT / OpenAI",s:"General AI & Classification",c:"#10B981",k:["gpt-4o-mini","Chat Completions","Function Calling"],d:["Startup classification prompts","Function calling for structured output","Fallback AI provider"],cn:["apigateway","edgefn"]},
  gemini:{t:"Google Gemini",s:"Primary AI Provider",c:"#3B82F6",k:["gemini-2.0-flash","REST API","Streaming","Safety Settings"],d:["Primary chat & classification AI","PWMOIC analysis generation","Multi-turn conversation context","Low-latency streaming responses"],cn:["apigateway","edgefn","chatbot"]},
  frontend:{t:"React SPA",s:"Client-Side Application",c:"#06B6D4",k:["React 18","TypeScript","Tailwind CSS","shadcn/ui","Recharts","React Router"],d:["Single Page Application","12+ feature pages + Login","Dark professional theme (#0B0F19)","Responsive sidebar layout","Client-side state via React Context"],cn:["uiux","auth","edgefn","chatbot","prompts"]},
  uiux:{t:"UI/UX Design System",s:"Interface & Experience",c:"#F59E0B",k:["shadcn/ui","Lucide Icons","Sonner Toasts","CSS Variables"],d:["Card-based dark layouts","Synthetic ↔ Custom mode toggles","Enter buttons with loading states","Star ratings & review system","Feedback survey popup (3-step)"],cn:["frontend"]},
  display:{t:"Display Mode Selector",s:"Responsive Layout Control",c:"#A855F7",k:["DisplayContext","sessionStorage","MobileNav","Bottom Tab"],d:["🖥️ Wide Screen (100%)","💻 Desktop (1280px) — default","📱 Tablet (768px) — sidebar hidden","📲 Mobile (390px) — compact mode","Emoticon selector top-left corner"],cn:["frontend"],n:1},
  prompts:{t:"Prompt Engineering",s:"6 Techniques for AI Instruction",c:"#14B8A6",k:["Zero-Shot","Few-Shot","Structured Reasoning","Constraint-Based","Meta/System","Context Injection"],d:["Zero-Shot: Direct instruction, no examples (Chatbot Q&A)","Few-Shot: 2-3 examples in prompt (Classifier, Sentiment)","Structured Reasoning: Chain-of-Thought (PWMOIC analysis)","Constraint-Based: Rules + JSON output (Score 1-5, formulas)","Meta/System: Role definition (You are LoopAI...)","Context Injection: Dynamic data in prompt (industry, history)"],cn:["classifier","pwmoic","valuation","aienhance","chatbot","apigateway"],n:1},
  classifier:{t:"Startup Classifier",s:"AI Stage Classification",c:"#10B981",k:["LLM Prompts","File Upload","Stage Mapping","PDF/CSV/IMG"],d:["URL + file upload + text paste input","Mock: keyword → stage mapping","AI: structured JSON prompt to LLM","Supports PDF, images, CSV, DOCX"],cn:["edgefn","frontend","prompts"]},
  pwmoic:{t:"PWMOIC Engine",s:"Risk & Return Computation",c:"#F97316",k:["M×P×T×F","7 Scenarios","TAM (3 methods)","Score 1-5"],d:["Multiplicative: Market × Product × Team × Finance","3-stage: Creation → Early → Mass Market","TAM: Top-Down, Bottom-Up, Value Theory","PWMOIC = Σ(Probability × MOIC)"],cn:["frontend","valuation","prompts"]},
  valuation:{t:"Valuation Simulator",s:"Multi-Firm Comparative Scoring",c:"#A855F7",k:["23 Parameters","3-Firm","Weighted","Grades 🏆"],d:["A. Risk/Reward (50%) — 8 params","B. Team (25%) — 7 params","C. Market (25%) — 8 params","Winner 🏆🥇🥈🥉 emoticons","Triggers feedback survey before Enter"],cn:["nova","frontend","feedback","prompts"]},
  nova:{t:"Nova Dashboard",s:"Analytics & Visualization",c:"#3B82F6",k:["Recharts","10 Charts","Gap Analysis","Firm Insights"],d:["Radar, Bar, Area, Pie, Line, Heatmap","Gap analysis + competitive insights","Firm strengths/weaknesses auto-detection","Winner banner with medal ranking"],cn:["valuation","frontend"]},
  aienhance:{t:"Enhance with AI",s:"AI Content Generation",c:"#EC4899",k:["Claude/Gemini","Sentiment-Aware","Context Injection"],d:["Expands short → professional reviews","Sentiment-matched tone (positive/constructive)","Feature-aware context injection","Used in Customer Feedback page"],cn:["edgefn","claude","feedback","prompts"],n:1},
  apigateway:{t:"API Gateway",s:"Unified API Routing Layer",c:"#14B8A6",k:["REST","API Keys","CORS","Rate Limiting","In-Memory Auth"],d:["Routes all external API calls","Manages API keys (in-memory only)","Enforces CORS policies","Rate limiting per provider","Single entry point for Gemini/Claude/GPT/Resend"],cn:["edgefn","email","gemini","openai","claude"],n:1},
  edgefn:{t:"Edge Functions",s:"Serverless Business Logic",c:"#06B6D4",k:["Deno Runtime","TypeScript","CORS","Multi-Provider"],d:["chat-ai: Routes to AI providers","send-pm-report: Email reports","System prompt injection per provider","Error handling & logging"],cn:["supabase","apigateway","chatbot"]},
  chatbot:{t:"LoopAI Chatbot",s:"Floating AI Assistant",c:"#EC4899",k:["useChatAI","Multi-turn","Markdown","Quick Chips"],d:["380×520px floating panel","Mock + AI mode with provider badge","Typing indicator + message history","Quick action chips above input"],cn:["edgefn","frontend","prompts"]},
  automation:{t:"Automation Engine",s:"Scheduled & Triggered Workflows",c:"#84CC16",k:["pg_cron","Triggers","Workflows","Scheduling"],d:["Email report scheduling (midnight daily)","Feedback survey trigger (pre-valuation)","Activity logging (auto-capture actions)","Future: Slack/webhook notifications"],cn:["email","feedback","supabase","pmdash"],n:1},
  feedback:{t:"Feedback System",s:"Survey + Reviews + AI Enhance",c:"#F59E0B",k:["3-Step Survey","Star Ratings","NPS","AI Enhance"],d:["Pre-valuation survey popup (ranking + NPS)","Customer review page with star ratings","Enhance with AI button for lazy writers","Sentiment tagging + helpful voting"],cn:["valuation","pmdash","aienhance","automation"]},
  email:{t:"Email Automation",s:"Nightly PM Reports via Resend",c:"#EF4444",k:["Resend API","pg_cron","HTML Email","Send Log"],d:["Midnight daily automated PM report","Dark HTML email with 7 sections","Manual trigger + scheduled cron","Success/failure tracking with email ID"],cn:["apigateway","automation","pmdash"]},
  supabase:{t:"Supabase",s:"Backend-as-a-Service",c:"#10B981",k:["PostgreSQL","Auth","Edge Fn","RLS","pg_cron","Storage"],d:["auth.users — Google OAuth profiles","activity_logs, feedback_surveys, email_logs","Row-Level Security on all tables","pg_cron for scheduled automation"],cn:["auth","edgefn","pmdash","automation"]},
  auth:{t:"Authentication",s:"Google OAuth + Session Management",c:"#F59E0B",k:["Supabase Auth","Google OAuth 2.0","JWT","ProtectedRoute"],d:["Sign in/up via Google Gmail","First-time API setup modal","JWT session persistence","Admin email check for PM access"],cn:["supabase","frontend"]},
  security:{t:"Security & Privacy",s:"Data Protection & Compliance",c:"#EF4444",k:["HTTPS/TLS","RLS","CORS","In-Memory Keys","GDPR/PDPA"],d:["API keys in-memory only (never persisted)","Row-Level Security: users see only own data","CORS headers on all Edge Functions","GDPR/PDPA compliant data handling","Admin-only PM dashboard access"],cn:["supabase","edgefn","auth","apigateway"]},
  pmdash:{t:"PM Command Center",s:"9-Tab Strategic Dashboard",c:"#8B5CF6",k:["Overview","Feedback","Growth","Funnel","Metrics","B2B","Roadmap","Competitive","System"],d:["PRD goal tracking with progress bars","AI Product Improvement recommendations","NPS + satisfaction + sentiment analytics","B2B pipeline + email automation tab"],cn:["supabase","feedback","metrics","automation"]},
  metrics:{t:"Success Metrics & TRUST",s:"PRD Gap Analysis + Ethical AI",c:"#06B6D4",k:["9 PRD Metrics","TRUST Radar","5 Pillars","20 Sub-metrics"],d:["User-Centric: Completion, NPS, Return rate","Business: MRR growth, B2B contracts, LTV:CAC","Technical: Report time, uptime, AI accuracy","TRUST: Tried, Reinforced, User, Sustainable, Transparent"],cn:["pmdash","chatprd","pdfexport"],n:1},
  pdfexport:{t:"PDF Export",s:"Branded Report Generation",c:"#94A3B8",k:["PDF Library","Templates","Branding","Planned"],d:["Dynamic PDF report generation","Branded valuation reports","Shareable secure links","PRD requirement — Phase 2"],cn:["metrics","mvp"],p:1},
  mvp:{t:"MVP Launch Roadmap",s:"B2C → B2B Scaling Strategy",c:"#84CC16",k:["Phase 1: B2C","Phase 2: B2B","PRD Targets","6-8 Weeks"],d:["Phase 1: Freemium B2C (2,000 subscribers Y1)","Phase 2: Enterprise B2B (5 clients, API, RBAC)","PRD: $200K ARR, 15K reports, 85% retention","6-8 week MVP timeline"],cn:["pdfexport","pmdash"],n:1}
};

const CN=[
  // Lovable → builds everything
  {f:"lovable",t:"frontend",c:"#EC4899"},{f:"lovable",t:"uiux",c:"#EC4899"},{f:"lovable",t:"edgefn",c:"#EC4899"},{f:"lovable",t:"supabase",c:"#EC4899"},{f:"lovable",t:"chatbot",c:"#EC4899"},{f:"lovable",t:"feedback",c:"#EC4899"},{f:"lovable",t:"automation",c:"#EC4899"},{f:"lovable",t:"pmdash",c:"#EC4899"},{f:"lovable",t:"auth",c:"#EC4899"},
  // Claude → intelligence layer
  {f:"claude",t:"apigateway",c:"#8B5CF6"},{f:"claude",t:"aienhance",c:"#8B5CF6"},{f:"claude",t:"chatbot",c:"#8B5CF6"},{f:"claude",t:"classifier",c:"#8B5CF6"},{f:"claude",t:"pmdash",c:"#8B5CF6"},{f:"claude",t:"metrics",c:"#8B5CF6"},{f:"claude",t:"feedback",c:"#8B5CF6"},
  // Other external → API Gateway
  {f:"openai",t:"apigateway",c:"#10B981"},{f:"gemini",t:"apigateway",c:"#3B82F6"},{f:"gemini",t:"chatbot",c:"#3B82F6"},{f:"chatprd",t:"metrics",c:"#F59E0B"},{f:"chatprd",t:"pmdash",c:"#F59E0B"},
  // API Gateway → Backend
  {f:"apigateway",t:"edgefn",c:"#14B8A6"},{f:"apigateway",t:"email",c:"#14B8A6"},
  // Frontend → features via prompts
  {f:"frontend",t:"prompts",c:"#14B8A6"},{f:"frontend",t:"auth",c:"#F59E0B"},{f:"frontend",t:"chatbot",c:"#EC4899"},
  // Prompts → features
  {f:"prompts",t:"classifier",c:"#14B8A6"},{f:"prompts",t:"pwmoic",c:"#14B8A6"},{f:"prompts",t:"valuation",c:"#14B8A6"},{f:"prompts",t:"aienhance",c:"#14B8A6"},{f:"prompts",t:"chatbot",c:"#14B8A6"},
  // Feature flows
  {f:"classifier",t:"edgefn",c:"#10B981"},{f:"pwmoic",t:"valuation",c:"#F97316"},{f:"valuation",t:"nova",c:"#A855F7"},{f:"valuation",t:"feedback",c:"#F59E0B"},{f:"feedback",t:"pmdash",c:"#F59E0B"},{f:"feedback",t:"aienhance",c:"#EC4899"},
  // Backend internal
  {f:"chatbot",t:"edgefn",c:"#06B6D4"},{f:"edgefn",t:"supabase",c:"#10B981"},
  // Automation
  {f:"automation",t:"email",c:"#84CC16"},{f:"automation",t:"feedback",c:"#84CC16"},{f:"automation",t:"supabase",c:"#84CC16"},
  {f:"supabase",t:"pmdash",c:"#8B5CF6"},
  // Auth + Security
  {f:"auth",t:"supabase",c:"#F59E0B"},{f:"security",t:"supabase",c:"#EF4444"},{f:"security",t:"edgefn",c:"#EF4444"},{f:"security",t:"apigateway",c:"#EF4444"},
  // Infrastructure
  {f:"pmdash",t:"metrics",c:"#06B6D4"},{f:"metrics",t:"pdfexport",c:"#94A3B8"},{f:"pdfexport",t:"mvp",c:"#84CC16"},
  // Display
  {f:"display",t:"frontend",c:"#A855F7"}
];

let sf=true,as=null;
function gc(id){const e=document.getElementById('n-'+id);if(!e)return null;const r=e.getBoundingClientRect(),p=document.getElementById('canvas').getBoundingClientRect();return{x:r.left-p.left+r.width/2,y:r.top-p.top+r.height/2}}
function da(){const s=document.getElementById('as');s.querySelectorAll('.da').forEach(e=>e.remove());if(!sf)return;CN.forEach((c,i)=>{const f=gc(c.f),t=gc(c.t);if(!f||!t)return;const mc=c.c==='#3B82F6'?'b':c.c==='#06B6D4'?'c':c.c==='#10B981'?'g':c.c==='#F59E0B'?'a':c.c==='#EC4899'?'p':c.c==='#8B5CF6'?'v':c.c==='#EF4444'?'r':c.c==='#F97316'?'o':c.c==='#14B8A6'?'t':c.c==='#84CC16'?'g':c.c==='#A855F7'?'v':'b';const dx=t.x-f.x,dy=t.y-f.y;const d='M '+f.x+' '+f.y+' C '+(f.x+dx*.3)+' '+(f.y+dy*.1)+', '+(f.x+dx*.7)+' '+(t.y-dy*.1)+', '+t.x+' '+t.y;const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('stroke',c.c);p.setAttribute('marker-end','url(#a-'+mc+')');p.setAttribute('class','da arrow-path');p.setAttribute('data-from',c.f);p.setAttribute('data-to',c.t);s.appendChild(p);const ci=document.createElementNS('http://www.w3.org/2000/svg','circle');ci.setAttribute('r','2');ci.setAttribute('fill',c.c);ci.setAttribute('class','da flow-dot');ci.style.offsetPath='path("'+d+'")';ci.style.animationDuration=(2+Math.random()*2)+'s';ci.style.animationDelay=(Math.random()*2)+'s';s.appendChild(ci)})}
function toggleFlows(){sf=!sf;document.getElementById('toggleFlows').textContent=sf?'Hide Arrows':'Show Arrows';document.getElementById('toggleFlows').classList.toggle('active',sf);da()}
function filterFlows(t){da()}
function hl(v){if(as===v){as=null;rh();return}as=v;const nd=D[v],cn=[v,...(nd?.cn||[])];document.querySelectorAll('.node').forEach(n=>{const id=n.id.replace('n-','');cn.includes(id)?(n.classList.add('highlighted'),n.classList.remove('dimmed')):(n.classList.remove('highlighted'),n.classList.add('dimmed'))});document.querySelectorAll('.service-pill').forEach(p=>{const a=p.dataset.svc===v;p.classList.toggle('active',a)});document.querySelectorAll('.arrow-path').forEach(a=>{const f=a.getAttribute('data-from'),t=a.getAttribute('data-to');(f===v||t===v||cn.includes(f)&&cn.includes(t))?a.classList.add('active'):a.style.opacity='0.06'})}
function rh(){document.querySelectorAll('.node').forEach(n=>{n.classList.remove('highlighted','dimmed')});document.querySelectorAll('.service-pill').forEach(p=>{p.classList.remove('active')});document.querySelectorAll('.arrow-path').forEach(a=>{a.classList.remove('active');a.style.opacity=''})}
function oi(id){const d=D[id];if(!d)return;const p=document.getElementById('infoPanel'),c=document.getElementById('ipc');const ic=document.querySelector('#n-'+id+' .ni')?.textContent||'📦';c.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin:8px 0 12px"><div style="width:36px;height:36px;border-radius:8px;background:'+d.c+'15;display:flex;align-items:center;justify-content:center;font-size:16px;border:1px solid '+d.c+'33">'+ic+'</div><div><h2 style="color:'+d.c+'">'+d.t+(d.n?' <span style="background:rgba(236,72,153,.15);color:#EC4899;padding:1px 5px;border-radius:3px;font-size:7px">NEW</span>':'')+(d.p?' <span style="background:rgba(100,116,139,.15);color:#94A3B8;padding:1px 5px;border-radius:3px;font-size:7px">PLANNED</span>':'')+'</h2><div class="ips">'+d.s+'</div></div></div><div style="margin-bottom:12px"><div class="iph">Tech Stack</div><div>'+d.k.map(t=>'<span class="tech-tag">'+t+'</span>').join('')+'</div></div><div style="margin-bottom:12px"><div class="iph">Details</div><ul class="ipl">'+d.d.map(x=>'<li style="color:'+d.c+'">'+x+'</li>').join('')+'</ul></div><div><div class="iph">Connections</div><div>'+d.cn.map(x=>{const n=D[x];return n?'<span class="conn-badge" style="background:'+n.c+'15;color:'+n.c+';border:1px solid '+n.c+'33" onclick="ci();setTimeout(()=>oi(\\''+x+'\\'),300)">'+n.t+'</span>':''}).join('')+'</div></div>';p.classList.add('open');document.getElementById('overlay').classList.add('open')}
function ci(){document.getElementById('infoPanel').classList.remove('open');document.getElementById('overlay').classList.remove('open')}
function refreshArchitecture(){rh();sf=true;document.getElementById('toggleFlows').textContent='Hide Arrows';document.getElementById('toggleFlows').classList.add('active');ci();da()}
function downloadSVG(){const canvas=document.getElementById('canvas');const rect=canvas.getBoundingClientRect();const w=rect.width,h=rect.height;const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('xmlns',ns);svg.setAttribute('width',w);svg.setAttribute('height',h+40);svg.setAttribute('viewBox','0 0 '+w+' '+(h+40));svg.setAttribute('style','background:#0B0F19');const title=document.createElementNS(ns,'text');title.setAttribute('x','20');title.setAttribute('y','24');title.setAttribute('fill','#E2E8F0');title.setAttribute('font-size','14');title.setAttribute('font-weight','800');title.setAttribute('font-family','Segoe UI,sans-serif');title.textContent='LoopAI Core Architecture — 27 components · 8 layers · ~55 flows';svg.appendChild(title);const g=document.createElementNS(ns,'g');g.setAttribute('transform','translate(0,40)');document.querySelectorAll('.node').forEach(function(node){const nr=node.getBoundingClientRect();const cr=canvas.getBoundingClientRect();const x=nr.left-cr.left,y=nr.top-cr.top;const r=document.createElementNS(ns,'rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width',nr.width);r.setAttribute('height',nr.height);r.setAttribute('rx','10');r.setAttribute('fill','#111827');r.setAttribute('stroke',node.style.borderColor||'#1E293B');r.setAttribute('stroke-width','1');g.appendChild(r);const te=node.querySelector('.nt');const se=node.querySelector('.ns');const ie=node.querySelector('.ni');if(ie){const it=document.createElementNS(ns,'text');it.setAttribute('x',x+12);it.setAttribute('y',y+18);it.setAttribute('font-size','11');it.textContent=ie.textContent;g.appendChild(it)}if(te){const tt=document.createElementNS(ns,'text');tt.setAttribute('x',x+36);tt.setAttribute('y',y+16);tt.setAttribute('fill',te.style.color||'#E2E8F0');tt.setAttribute('font-size','9');tt.setAttribute('font-weight','700');tt.setAttribute('font-family','Segoe UI,sans-serif');tt.textContent=te.textContent;g.appendChild(tt)}if(se){const st=document.createElementNS(ns,'text');st.setAttribute('x',x+36);st.setAttribute('y',y+28);st.setAttribute('fill','#64748B');st.setAttribute('font-size','7');st.setAttribute('font-family','Segoe UI,sans-serif');st.textContent=se.textContent;g.appendChild(st)}});document.querySelectorAll('.da.arrow-path').forEach(function(path){const p=document.createElementNS(ns,'path');p.setAttribute('d',path.getAttribute('d'));p.setAttribute('stroke',path.getAttribute('stroke'));p.setAttribute('stroke-width','1.5');p.setAttribute('fill','none');p.setAttribute('stroke-dasharray','4 3');p.setAttribute('opacity','0.4');g.appendChild(p)});document.querySelectorAll('.layer-label').forEach(function(lbl){const lr=lbl.getBoundingClientRect();const cr=canvas.getBoundingClientRect();const lt=document.createElementNS(ns,'text');lt.setAttribute('x',lr.left-cr.left);lt.setAttribute('y',lr.top-cr.top+10);lt.setAttribute('fill',lbl.style.color||'#64748B');lt.setAttribute('font-size','8');lt.setAttribute('font-weight','700');lt.setAttribute('font-family','Segoe UI,sans-serif');lt.textContent=lbl.textContent;g.appendChild(lt)});svg.appendChild(g);const footer=document.createElementNS(ns,'text');footer.setAttribute('x',w/2);footer.setAttribute('y',h+30);footer.setAttribute('fill','#475569');footer.setAttribute('font-size','7');footer.setAttribute('text-anchor','middle');footer.setAttribute('font-family','Segoe UI,sans-serif');footer.textContent='LoopAI for TECH 41 Stanford · @ 2026 Dr. Kie Prayarach';svg.appendChild(footer);const serializer=new XMLSerializer();const svgStr=serializer.serializeToString(svg);const blob=new Blob([svgStr],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='LoopAI_Architecture.svg';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url)}
window.addEventListener('load',()=>{setTimeout(da,500);window.addEventListener('resize',da);document.getElementById('overlay').addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});var ty=0;var pn=document.getElementById('infoPanel');pn.addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});pn.addEventListener('touchend',function(e){if(e.changedTouches[0].clientY-ty>80)ci()},{passive:true});if(window.innerWidth<=600){var h=document.createElement('div');h.style.cssText='width:40px;height:4px;border-radius:2px;background:#334155;margin:8px auto 4px;';pn.insertBefore(h,pn.firstChild)}});
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
    { id: "prompts", label: "🧬 Prompt Engineering", color: "#14B8A6" },
    { id: "features", label: "⚡ App Features", color: "#F97316" },
    { id: "backend", label: "☁️ Backend", color: "#10B981" },
    { id: "data", label: "🗄️ Data & Auth", color: "#F59E0B" },
    { id: "security", label: "🛡️ Security", color: "#EF4444" },
    { id: "infra", label: "📋 Infrastructure", color: "#8B5CF6" },
  ];

  const layerForTab = (tab: string) => {
    const map: Record<string,string> = { external:"external", frontend:"frontend", prompts:"prompts", features:"features", backend:"backend", data:"data", security:"security", infra:"infra" };
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
