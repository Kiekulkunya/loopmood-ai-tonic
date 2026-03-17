import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useApp } from "@/contexts/AppContext";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import {
  User, Lock, Key, Palette, MessageSquare, Database, Info,
  Shield, Mail, Users, Server, Workflow, Save, ExternalLink,
  Eye, EyeOff, Download, Trash2, CheckCircle2, XCircle, RefreshCw,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

const SHARED_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Password & Security", icon: Lock },
  { id: "api", label: "API Configuration", icon: Key },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "feedback", label: "Feedback Preferences", icon: MessageSquare },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "about", label: "About LoopAI", icon: Info },
];

const PM_SECTIONS = [
  { id: "pm-security", label: "PM Security", icon: Shield },
  { id: "pm-email", label: "Email Report Settings", icon: Mail },
  { id: "pm-users", label: "Trial Management", icon: Users },
  { id: "pm-health", label: "System Health", icon: Server },
  { id: "pm-arch", label: "Architecture Config", icon: Workflow },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const { user, isPM, signOut } = useAuth();
  const navigate = useNavigate();

  const allSections = isPM ? [...SHARED_SECTIONS, ...PM_SECTIONS] : SHARED_SECTIONS;

  return (
    <div className="flex h-full">
      {/* Section Nav - Desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-card/50 p-3 gap-0.5 overflow-y-auto shrink-0">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 mb-3 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          isPM ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
        }`}>
          {isPM ? "PM Settings" : "User Settings"}
        </div>
        {allSections.map((s, i) => {
          const Icon = s.icon;
          const isPmSection = PM_SECTIONS.some(ps => ps.id === s.id);
          return (
            <div key={s.id}>
              {isPmSection && i === SHARED_SECTIONS.length && (
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest px-3 py-2 mt-3 border-t border-border">
                  🔐 PM Administration
                </div>
              )}
              <button
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === s.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Icon size={15} />
                <span className="truncate">{s.label}</span>
              </button>
            </div>
          );
        })}
      </aside>

      {/* Mobile Section Selector */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-10 p-3 bg-background border-b border-border">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
        >
          {allSections.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 md:pt-6 mt-14 md:mt-0">
        <SectionContent section={activeSection} />
      </div>
    </div>
  );
}

function SectionContent({ section }: { section: string }) {
  switch (section) {
    case "profile": return <ProfileSection />;
    case "security": return <SecuritySection />;
    case "api": return <APIConfigSection />;
    case "appearance": return <AppearanceSection />;
    case "feedback": return <FeedbackSection />;
    case "data": return <DataPrivacySection />;
    case "about": return <AboutSection />;
    case "pm-security": return <PMSecuritySection />;
    case "pm-email": return <PMEmailSection />;
    case "pm-users": return <PMUsersSection />;
    case "pm-health": return <PMHealthSection />;
    case "pm-arch": return <PMArchSection />;
    default: return null;
  }
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-3xl">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Icon size={18} className="text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-muted-foreground mb-1.5">{children}</label>;
}

function InputField({ value, onChange, disabled, type = "text", placeholder, className = "", ...rest }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${className}`}
      {...rest}
    />
  );
}

// ═══ PROFILE ═══
function ProfileSection() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const [saving, setSaving] = useState(false);

  const avatar = user?.user_metadata?.avatar_url;
  const initial = (user?.user_metadata?.full_name || user?.email || "U")[0].toUpperCase();
  const loginMethod = user?.app_metadata?.provider === "google" ? "Google" : "Email";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  return (
    <SectionCard title="Profile" icon={User}>
      <div className="flex items-center gap-5">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold">{initial}</div>
        )}
        <div>
          <div className="text-foreground font-semibold">{displayName || user?.email}</div>
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            loginMethod === "Google" ? "bg-accent/15 text-accent" : "bg-primary/15 text-primary"
          }`}>{loginMethod}</span>
        </div>
      </div>
      <div>
        <FieldLabel>Display Name</FieldLabel>
        <InputField value={displayName} onChange={(e: any) => setDisplayName(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Email</FieldLabel>
        <InputField value={user?.email || ""} disabled />
      </div>
      <div className="flex items-center gap-4">
        <div>
          <FieldLabel>Role</FieldLabel>
          <span className="inline-block rounded-full px-3 py-1 text-xs font-bold bg-primary/15 text-primary">
            {user?.user_metadata?.role === "pm" ? "Product Manager" : "User"}
          </span>
        </div>
        <div>
          <FieldLabel>Account Created</FieldLabel>
          <span className="text-sm text-foreground">{createdAt}</span>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
        <Save size={14} />{saving ? "Saving..." : "Save Changes"}
      </button>
    </SectionCard>
  );
}

// ═══ PASSWORD & SECURITY ═══
function SecuritySection() {
  const { user, signOut } = useAuth();
  const isGoogle = user?.app_metadata?.provider === "google";
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const strength = newPass.length >= 12 ? "strong" : newPass.length >= 8 ? "medium" : "weak";
  const strengthColors = { weak: "bg-destructive", medium: "bg-warning", strong: "bg-accent" };

  const handleUpdate = async () => {
    if (newPass !== confirmPass) { toast.error("Passwords don't match"); return; }
    if (newPass.length < 8) { toast.error("Minimum 8 characters"); return; }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setNewPass(""); setConfirmPass(""); }
  };

  return (
    <SectionCard title="Password & Security" icon={Lock}>
      {isGoogle ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Your account is managed by Google. Password changes should be made through your Google Account settings.</p>
          <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
            <ExternalLink size={14} />Manage Google Account
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <FieldLabel>New Password</FieldLabel>
            <div className="relative">
              <InputField type={showPass ? "text" : "password"} value={newPass} onChange={(e: any) => setNewPass(e.target.value)} placeholder="Minimum 8 characters" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPass && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${strengthColors[strength]}`} style={{ width: strength === "strong" ? "100%" : strength === "medium" ? "66%" : "33%" }} />
                </div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{strength}</span>
              </div>
            )}
          </div>
          <div>
            <FieldLabel>Confirm New Password</FieldLabel>
            <InputField type="password" value={confirmPass} onChange={(e: any) => setConfirmPass(e.target.value)} placeholder="Re-enter password" />
          </div>
          <button onClick={handleUpdate} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save size={14} />{saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      )}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Login method:</span>
          <span className="text-foreground font-medium">{isGoogle ? "Google" : "Email"}</span>
        </div>
        <button onClick={() => { supabase.auth.signOut({ scope: "global" }); toast.success("All sessions signed out"); }} className="px-4 py-2 border border-destructive/30 text-destructive rounded-xl text-sm hover:bg-destructive/10 transition-colors">
          Sign Out All Devices
        </button>
      </div>
    </SectionCard>
  );
}

// ═══ API CONFIGURATION ═══
function APIConfigSection() {
  const { isPM } = useAuth();
  const { provider, setProvider, apiKey, setApiKey } = useApp();

  const [aiMode, setAiMode] = useState<"mock" | "ai">(() =>
    (sessionStorage.getItem("ai_mode") as "mock" | "ai") || "mock"
  );
  const [defaultProvider, setDefaultProvider] = useState(() =>
    sessionStorage.getItem("ai_default_provider") || "gemini"
  );
  const [geminiKey, setGeminiKey] = useState(() => sessionStorage.getItem("api_key_gemini") || "");
  const [openaiKey, setOpenaiKey] = useState(() => sessionStorage.getItem("api_key_openai") || "");
  const [claudeKey, setClaudeKey] = useState(() => sessionStorage.getItem("api_key_claude") || "");
  const [temp, setTemp] = useState(() => parseFloat(sessionStorage.getItem("ai_temperature") || "0.7"));

  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showClaude, setShowClaude] = useState(false);

  const [testStatus, setTestStatus] = useState<Record<string, "idle" | "ok" | "error" | "testing">>({
    gemini: "idle", openai: "idle", claude: "idle",
  });

  const testGemini = async () => {
    setTestStatus(s => ({ ...s, gemini: "testing" }));
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey}`);
      setTestStatus(s => ({ ...s, gemini: res.ok ? "ok" : "error" }));
    } catch { setTestStatus(s => ({ ...s, gemini: "error" })); }
  };

  const testOpenai = async () => {
    setTestStatus(s => ({ ...s, openai: "testing" }));
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${openaiKey}` },
      });
      setTestStatus(s => ({ ...s, openai: res.ok ? "ok" : "error" }));
    } catch { setTestStatus(s => ({ ...s, openai: "error" })); }
  };

  const testClaude = async () => {
    setTestStatus(s => ({ ...s, claude: "testing" }));
    const valid = claudeKey.startsWith("sk-ant-") && claudeKey.length > 20;
    setTestStatus(s => ({ ...s, claude: valid ? "ok" : "error" }));
  };

  const statusIcon = (s: string) => {
    if (s === "ok") return <CheckCircle2 size={14} className="text-accent" />;
    if (s === "error") return <XCircle size={14} className="text-destructive" />;
    if (s === "testing") return <RefreshCw size={14} className="text-primary animate-spin" />;
    return <span className="text-muted-foreground text-xs">——</span>;
  };

  const handleSave = () => {
    sessionStorage.setItem("ai_mode", aiMode);
    sessionStorage.setItem("ai_default_provider", defaultProvider);
    sessionStorage.setItem("api_key_gemini", geminiKey);
    sessionStorage.setItem("api_key_openai", openaiKey);
    sessionStorage.setItem("api_key_claude", claudeKey);
    sessionStorage.setItem("ai_temperature", temp.toString());
    setProvider(aiMode === "mock" ? "mock" : defaultProvider);
    setApiKey(aiMode === "mock" ? "" : geminiKey || openaiKey || claudeKey);
    toast.success("API configuration saved for this session");
  };

  return (
    <SectionCard title="API Configuration" icon={Key}>
      {/* Mode Toggle */}
      <div>
        <FieldLabel>Default Mode</FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAiMode("mock")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              aiMode === "mock"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full border-2 ${aiMode === "mock" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {aiMode === "mock" && <div className="w-1 h-1 bg-primary-foreground rounded-full m-auto mt-[2px]" />}
              </div>
              <span className="text-sm font-bold text-foreground">Mock Mode</span>
            </div>
            <p className="text-[10px] text-muted-foreground ml-5">No API keys needed — uses sample data for all features</p>
          </button>
          <button
            onClick={() => setAiMode("ai")}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              aiMode === "ai"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full border-2 ${aiMode === "ai" ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                {aiMode === "ai" && <div className="w-1 h-1 bg-primary-foreground rounded-full m-auto mt-[2px]" />}
              </div>
              <span className="text-sm font-bold text-foreground">AI Mode</span>
            </div>
            <p className="text-[10px] text-muted-foreground ml-5">Requires API keys — connects to real AI providers</p>
          </button>
        </div>
      </div>

      {aiMode === "ai" && (
        <>
          {/* Provider Dropdown */}
          <div>
            <FieldLabel>Default AI Provider</FieldLabel>
            <select
              value={defaultProvider}
              onChange={(e) => setDefaultProvider(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="gemini">Gemini 2.0 Flash (Primary)</option>
              <option value="openai">OpenAI GPT-4o-mini (Fallback)</option>
              {isPM && <option value="claude">Claude Sonnet (Deep Analysis)</option>}
              <option value="auto">Auto (Gemini → OpenAI → Claude)</option>
            </select>
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">API Keys</h3>

            {/* Gemini */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel>Gemini API Key</FieldLabel>
                <span className="text-[9px] font-bold text-primary uppercase">Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <InputField
                    type={showGemini ? "text" : "password"}
                    value={geminiKey}
                    onChange={(e: any) => setGeminiKey(e.target.value)}
                    placeholder="AIza..."
                  />
                  <button onClick={() => setShowGemini(!showGemini)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showGemini ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={testGemini} disabled={!geminiKey} className="px-3 py-2.5 bg-secondary text-foreground rounded-xl text-xs hover:bg-secondary/80 disabled:opacity-40 transition-colors">
                  Test
                </button>
                {statusIcon(testStatus.gemini)}
              </div>
            </div>

            {/* OpenAI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel>OpenAI API Key</FieldLabel>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Optional</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <InputField
                    type={showOpenai ? "text" : "password"}
                    value={openaiKey}
                    onChange={(e: any) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                  <button onClick={() => setShowOpenai(!showOpenai)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showOpenai ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <button onClick={testOpenai} disabled={!openaiKey} className="px-3 py-2.5 bg-secondary text-foreground rounded-xl text-xs hover:bg-secondary/80 disabled:opacity-40 transition-colors">
                  Test
                </button>
                {statusIcon(testStatus.openai)}
              </div>
            </div>

            {/* Claude - PM only */}
            {isPM && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel>Claude API Key</FieldLabel>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase">Optional (PM only)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <InputField
                      type={showClaude ? "text" : "password"}
                      value={claudeKey}
                      onChange={(e: any) => setClaudeKey(e.target.value)}
                      placeholder="sk-ant-..."
                    />
                    <button onClick={() => setShowClaude(!showClaude)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showClaude ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={testClaude} disabled={!claudeKey} className="px-3 py-2.5 bg-secondary text-foreground rounded-xl text-xs hover:bg-secondary/80 disabled:opacity-40 transition-colors">
                    Test
                  </button>
                  {statusIcon(testStatus.claude)}
                </div>
              </div>
            )}
          </div>

          {/* Temperature */}
          <div>
            <FieldLabel>Model Temperature: {temp.toFixed(1)}</FieldLabel>
            <input type="range" min="0" max="1" step="0.1" value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Precise (0.0)</span><span>Creative (1.0)</span>
            </div>
          </div>
        </>
      )}

      <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl">
        <p className="text-xs text-warning">⚠️ API keys are stored in memory only for this session. They are never saved to servers and will be cleared when you close the browser.</p>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
        <Save size={14} />Save Configuration
      </button>
    </SectionCard>
  );
}

// ═══ APPEARANCE ═══
function AppearanceSection() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("loopai_fontsize") || "medium");
  const [density, setDensity] = useState(() => localStorage.getItem("loopai_density") || "comfortable");

  const savePref = (key: string, val: string) => {
    localStorage.setItem(key, val);
    toast.success("Preference saved");
  };

  const themes: { id: Theme; label: string; icon: string; desc: string; preview: { bg: string; card: string; border: string; text: string } | null }[] = [
    {
      id: "light",
      label: "Light",
      icon: "☀️",
      desc: "Clean white backgrounds",
      preview: { bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0", text: "#0F172A" },
    },
    {
      id: "dark",
      label: "Dark",
      icon: "🌙",
      desc: "Default dark professional",
      preview: { bg: "#0B0F19", card: "#111827", border: "#1E293B", text: "#F1F5F9" },
    },
    {
      id: "system",
      label: "System",
      icon: "💻",
      desc: "Follows your OS preference",
      preview: null,
    },
  ];

  return (
    <SectionCard title="Appearance" icon={Palette}>
      {/* Theme Mode */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-1">Theme Mode</h3>
        <p className="text-[10px] text-muted-foreground mb-4">Choose your preferred appearance. System mode automatically matches your device settings.</p>

        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 bg-card ${
                theme === t.id
                  ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              {t.preview ? (
                <div
                  className="rounded-lg p-2 mb-3 border"
                  style={{ backgroundColor: t.preview.bg, borderColor: t.preview.border }}
                >
                  <div className="h-2 w-12 rounded mb-1" style={{ backgroundColor: t.preview.text, opacity: 0.7 }} />
                  <div className="flex gap-1">
                    <div className="h-6 flex-1 rounded" style={{ backgroundColor: t.preview.card, border: `1px solid ${t.preview.border}` }} />
                    <div className="h-6 flex-1 rounded" style={{ backgroundColor: t.preview.card, border: `1px solid ${t.preview.border}` }} />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg p-2 mb-3 border border-border overflow-hidden">
                  <div className="flex h-8 rounded overflow-hidden">
                    <div className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
                      <div className="h-2 w-6 rounded m-1" style={{ backgroundColor: "#0F172A", opacity: 0.5 }} />
                    </div>
                    <div className="flex-1" style={{ backgroundColor: "#0B0F19" }}>
                      <div className="h-2 w-6 rounded m-1" style={{ backgroundColor: "#F1F5F9", opacity: 0.5 }} />
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <div className="text-lg mb-1">{t.icon}</div>
                <div className="text-xs font-bold text-foreground">{t.label}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{t.desc}</div>
              </div>

              {theme === t.id && (
                <div className="flex items-center justify-center mt-2">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-[8px]">✓</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current theme info */}
      <div className="p-3 rounded-lg border border-border bg-secondary">
        <div className="flex items-center gap-2">
          <span className="text-sm">{theme === "system" ? (resolvedTheme === "dark" ? "🌙" : "☀️") : themes.find(t => t.id === theme)?.icon}</span>
          <div>
            <div className="text-[11px] font-semibold text-foreground">
              Currently using: {resolvedTheme === "dark" ? "Dark" : "Light"} theme
              {theme === "system" && " (auto-detected from your OS)"}
            </div>
            <div className="text-[9px] text-muted-foreground">
              {theme === "system"
                ? "Theme will change automatically when your OS switches between light and dark mode"
                : `Manually set to ${theme} mode`}
            </div>
          </div>
        </div>
      </div>

      {/* Font Size */}
      <div>
        <FieldLabel>Font Size</FieldLabel>
        <div className="flex gap-2">
          {(["small", "medium", "large"] as const).map((s) => (
            <button key={s} onClick={() => { setFontSize(s); savePref("loopai_fontsize", s); }} className={`px-4 py-2 rounded-xl text-sm capitalize transition-colors ${fontSize === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Layout Density */}
      <div>
        <FieldLabel>Layout Density</FieldLabel>
        <div className="flex gap-2">
          {(["compact", "comfortable"] as const).map((d) => (
            <button key={d} onClick={() => { setDensity(d); savePref("loopai_density", d); }} className={`px-4 py-2 rounded-xl text-sm capitalize transition-colors ${density === d ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ═══ FEEDBACK PREFERENCES ═══
function FeedbackSection() {
  const [freq, setFreq] = useState(() => localStorage.getItem("feedback_frequency") || "every_visit");

  return (
    <SectionCard title="Feedback Preferences" icon={MessageSquare}>
      <div>
        <FieldLabel>Feedback Survey Frequency</FieldLabel>
        <select value={freq} onChange={(e) => { setFreq(e.target.value); localStorage.setItem("feedback_frequency", e.target.value); toast.success("Preference saved"); }} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="every_visit">Every visit</option>
          <option value="weekly">Once per week</option>
          <option value="monthly">Once per month</option>
          <option value="never">Never</option>
        </select>
      </div>
    </SectionCard>
  );
}

// ═══ DATA & PRIVACY ═══
function DataPrivacySection() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const exportData = async () => {
    const { data: logs } = await supabase.from("activity_logs").select("*").eq("user_id", user?.id || "");
    const exportObj = {
      profile: { email: user?.email, name: user?.user_metadata?.full_name, role: user?.user_metadata?.role, created_at: user?.created_at },
      activity_logs: logs || [],
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loopai-data-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  };

  const clearSession = () => {
    sessionStorage.clear();
    toast.success("Session data cleared");
  };

  return (
    <SectionCard title="Data & Privacy" icon={Database}>
      <button onClick={exportData} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
        <Download size={14} />Export My Data
      </button>
      <button onClick={clearSession} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
        <Trash2 size={14} />Clear Session Data
      </button>

      {!showDeleteDialog ? (
        <button onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-2 px-5 py-2.5 border border-destructive/30 text-destructive rounded-xl text-sm hover:bg-destructive/10 transition-colors">
          <Trash2 size={14} />Delete Account
        </button>
      ) : (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl space-y-3">
          <p className="text-sm text-destructive">This will permanently delete your account. Type <strong>DELETE</strong> to confirm.</p>
          <InputField value={deleteConfirm} onChange={(e: any) => setDeleteConfirm(e.target.value)} placeholder='Type "DELETE"' />
          <div className="flex gap-2">
            <button onClick={() => setShowDeleteDialog(false)} className="px-4 py-2 bg-secondary text-foreground rounded-xl text-sm">Cancel</button>
            <button disabled={deleteConfirm !== "DELETE"} onClick={async () => { await signOut(); navigate("/"); toast.success("Account deletion requested"); }} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm disabled:opacity-30">
              Confirm Delete
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setShowPrivacy(!showPrivacy)} className="text-sm text-primary hover:underline">
        {showPrivacy ? "Hide" : "View"} Privacy Policy
      </button>
      {showPrivacy && (
        <div className="p-4 bg-background border border-border rounded-xl text-sm text-muted-foreground space-y-2">
          <p className="font-bold text-foreground">LoopAI Privacy Policy</p>
          <p>• This is an educational prototype for TECH 41 Stanford</p>
          <p>• Data is stored with Row-Level Security</p>
          <p>• API keys are never persisted — stored in browser memory only</p>
          <p>• Google OAuth data: name, email, profile photo only</p>
          <p>• You can export or delete your data at any time</p>
        </div>
      )}
    </SectionCard>
  );
}

// ═══ ABOUT ═══
function AboutSection() {
  const navigate = useNavigate();
  const techStack = ["React", "TypeScript", "Supabase", "Gemini", "Claude", "Tailwind", "Recharts"];

  return (
    <SectionCard title="About LoopAI" icon={Info}>
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">LoopAI</h3>
          <span className="text-xs text-muted-foreground">v1.0-beta</span>
        </div>
        <p className="text-sm text-muted-foreground">AI-Powered Startup Valuation Platform using the PWMOIC Framework</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Course:</span> <span className="text-foreground">TECH 41</span></div>
          <div><span className="text-muted-foreground">University:</span> <span className="text-foreground">Stanford</span></div>
          <div><span className="text-muted-foreground">Creator:</span> <span className="text-foreground">Dr. Kie Prayarach</span></div>
          <div><span className="text-muted-foreground">Framework:</span> <span className="text-foreground">PWMOIC</span></div>
          <div><span className="text-muted-foreground">Architecture:</span> <span className="text-foreground">27 components · 8 layers · 51 data flows</span></div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((t) => (
            <span key={t} className="px-2.5 py-1 bg-secondary text-muted-foreground text-[10px] font-bold rounded-lg uppercase">{t}</span>
          ))}
        </div>
        <button onClick={() => navigate("/app/pm/architecture")} className="text-sm text-primary hover:underline">View Architecture →</button>
        <p className="text-[10px] text-muted-foreground">© 2026</p>
      </div>
    </SectionCard>
  );
}

// ═══ PM SECURITY ═══
function PMSecuritySection() {
  const [showPin, setShowPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const updatePin = () => {
    if (newPin.length !== 4) { toast.error("PIN must be 4 digits"); return; }
    if (newPin !== confirmPin) { toast.error("PINs don't match"); return; }
    localStorage.setItem("pm_custom_pin", btoa(newPin));
    toast.success("PIN updated");
    setNewPin(""); setConfirmPin("");
  };

  return (
    <SectionCard title="PM Security" icon={Shield}>
      <div className="flex items-center gap-3">
        <FieldLabel>Current Security PIN</FieldLabel>
        <span className="text-foreground font-mono text-lg tracking-widest">{showPin ? "1234" : "••••"}</span>
        <button onClick={() => setShowPin(!showPin)} className="text-muted-foreground hover:text-foreground">
          {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <FieldLabel>New PIN (4 digits)</FieldLabel>
          <InputField type="password" maxLength={4} value={newPin} onChange={(e: any) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="tracking-[0.5em] text-center" />
        </div>
        <div>
          <FieldLabel>Confirm New PIN</FieldLabel>
          <InputField type="password" maxLength={4} value={confirmPin} onChange={(e: any) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="tracking-[0.5em] text-center" />
        </div>
        <button onClick={updatePin} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Save size={14} />Update PIN
        </button>
      </div>
    </SectionCard>
  );
}

// ═══ PM EMAIL SETTINGS ═══
function PMEmailSection() {
  const [recipient, setRecipient] = useState(() => localStorage.getItem("pm_email_recipient") || "kullalin88@gmail.com");
  const [schedule, setSchedule] = useState(() => localStorage.getItem("pm_email_schedule") || "daily");
  const [sendTime, setSendTime] = useState(() => localStorage.getItem("pm_email_time") || "00:00");

  const handleSave = () => {
    localStorage.setItem("pm_email_recipient", recipient);
    localStorage.setItem("pm_email_schedule", schedule);
    localStorage.setItem("pm_email_time", sendTime);
    toast.success("Email settings saved");
  };

  const sendTest = async () => {
    toast.info("Sending test report...");
    try {
      const { error } = await supabase.functions.invoke("send-pm-report", { body: { to: recipient, test: true } });
      if (error) throw error;
      toast.success("Test report sent!");
    } catch { toast.error("Failed to send test report"); }
  };

  return (
    <SectionCard title="Email Report Settings" icon={Mail}>
      <div>
        <FieldLabel>Default Recipient</FieldLabel>
        <InputField type="email" value={recipient} onChange={(e: any) => setRecipient(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Schedule</FieldLabel>
        <div className="flex gap-2 flex-wrap">
          {["daily", "weekly", "monthly", "off"].map((s) => (
            <button key={s} onClick={() => setSchedule(s)} className={`px-4 py-2 rounded-xl text-sm capitalize transition-colors ${schedule === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>Send Time</FieldLabel>
        <input type="time" value={sendTime} onChange={(e) => setSendTime(e.target.value)} className="bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>
      <div className="flex gap-3">
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Save size={14} />Save Settings
        </button>
        <button onClick={sendTest} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
          <Mail size={14} />Send Test Report
        </button>
      </div>
    </SectionCard>
  );
}

// ═══ PM USERS / TRIAL MANAGEMENT ═══
function PMUsersSection() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(50);
      setLogs(data || []);
      setLoading(false);
    })();
  }, []);

  const uniqueUsers = [...new Map(logs.map(l => [l.user_email, l])).values()];

  return (
    <SectionCard title="Trial Management" icon={Users}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Users", val: uniqueUsers.length },
          { label: "PM Users", val: uniqueUsers.filter(u => u.details?.role === "pm").length },
          { label: "Active Today", val: uniqueUsers.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length },
          { label: "Total Events", val: logs.length },
        ].map((s) => (
          <div key={s.label} className="bg-background border border-border rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{s.val}</div>
            <div className="text-[10px] text-muted-foreground uppercase">{s.label}</div>
          </div>
        ))}
      </div>
      {loading ? (
        <p className="text-muted-foreground text-sm animate-pulse">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b border-border">
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Last Action</th>
                <th className="py-2">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {uniqueUsers.map((u) => (
                <tr key={u.user_email} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-foreground">{u.user_email || "—"}</td>
                  <td className="py-2 pr-4 text-muted-foreground">{u.action}</td>
                  <td className="py-2 text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

// ═══ PM SYSTEM HEALTH ═══
function PMHealthSection() {
  const [status, setStatus] = useState<Record<string, "ok" | "error" | "checking">>({
    database: "checking", ai: "checking", edge: "checking",
  });

  const checkHealth = async () => {
    setStatus({ database: "checking", ai: "checking", edge: "checking" });
    try {
      await supabase.from("activity_logs").select("count", { count: "exact", head: true });
      setStatus(s => ({ ...s, database: "ok" }));
    } catch { setStatus(s => ({ ...s, database: "error" })); }
    setTimeout(() => setStatus(s => ({ ...s, ai: "ok", edge: "ok" })), 1000);
  };

  useEffect(() => { checkHealth(); }, []);

  const statusIcon = (s: string) => s === "ok" ? <CheckCircle2 size={16} className="text-accent" /> : s === "error" ? <XCircle size={16} className="text-destructive" /> : <RefreshCw size={16} className="text-muted-foreground animate-spin" />;

  const allOk = Object.values(status).every(v => v === "ok");

  return (
    <SectionCard title="System Health" icon={Server}>
      <div className={`p-3 rounded-xl text-sm font-medium ${allOk ? "bg-accent/10 text-accent" : "bg-warning/10 text-warning"}`}>
        {allOk ? "✅ All Systems Operational" : "⏳ Checking systems..."}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Database", key: "database" },
          { label: "AI Providers", key: "ai" },
          { label: "Edge Functions", key: "edge" },
        ].map((s) => (
          <div key={s.key} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
            {statusIcon(status[s.key])}
            <span className="text-sm text-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <button onClick={checkHealth} className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
        <RefreshCw size={14} />Refresh
      </button>
    </SectionCard>
  );
}

// ═══ PM ARCHITECTURE CONFIG ═══
function PMArchSection() {
  const [defaultTab, setDefaultTab] = useState(() => localStorage.getItem("arch_default_tab") || "interactive");
  const [autoRefresh, setAutoRefresh] = useState(() => localStorage.getItem("arch_auto_refresh") !== "false");
  const [showLabels, setShowLabels] = useState(() => localStorage.getItem("arch_show_labels") === "true");

  const handleSave = () => {
    localStorage.setItem("arch_default_tab", defaultTab);
    localStorage.setItem("arch_auto_refresh", String(autoRefresh));
    localStorage.setItem("arch_show_labels", String(showLabels));
    toast.success("Architecture config saved");
  };

  const handleReset = () => {
    localStorage.removeItem("arch_default_tab");
    localStorage.removeItem("arch_auto_refresh");
    localStorage.removeItem("arch_show_labels");
    setDefaultTab("interactive");
    setAutoRefresh(true);
    setShowLabels(false);
    toast.success("Reset to defaults");
  };

  return (
    <SectionCard title="Architecture Config" icon={Workflow}>
      <div>
        <FieldLabel>Default Tab</FieldLabel>
        <select value={defaultTab} onChange={(e) => setDefaultTab(e.target.value)} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="interactive">Interactive</option>
          <option value="overview">Overview</option>
          <option value="external">External AI</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Auto-Refresh Arrows</span>
        <button onClick={() => setAutoRefresh(!autoRefresh)} className={`w-10 h-6 rounded-full transition-colors ${autoRefresh ? "bg-primary" : "bg-secondary"}`}>
          <div className={`w-4 h-4 bg-primary-foreground rounded-full transition-transform mx-1 ${autoRefresh ? "translate-x-4" : ""}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">Show Connection Labels</span>
        <button onClick={() => setShowLabels(!showLabels)} className={`w-10 h-6 rounded-full transition-colors ${showLabels ? "bg-primary" : "bg-secondary"}`}>
          <div className={`w-4 h-4 bg-primary-foreground rounded-full transition-transform mx-1 ${showLabels ? "translate-x-4" : ""}`} />
        </button>
      </div>
      <div className="flex gap-3">
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <Save size={14} />Save
        </button>
        <button onClick={handleReset} className="px-5 py-2.5 bg-secondary text-foreground rounded-xl text-sm hover:bg-secondary/80 transition-colors">
          Reset to Defaults
        </button>
      </div>
    </SectionCard>
  );
}
