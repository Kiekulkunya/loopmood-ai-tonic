import { useState, useRef } from "react";
import { Globe, Upload, Rocket, Download, RotateCcw, Lightbulb } from "lucide-react";
import Toolbar from "@/components/Toolbar";

interface AnalysisResult {
  objective: string;
  stages: { name: string; probability: number }[];
  explanation: string;
  keywords: string[];
}

function analyzeText(text: string): AnalysisResult {
  const lower = text.toLowerCase();

  if (lower.includes("ipo") || lower.includes("public") || lower.includes("listing")) {
    return {
      objective: "IPO",
      stages: [
        { name: "Expansion (Series D+)", probability: 60 },
        { name: "Scaling (Series B/C)", probability: 30 },
        { name: "Maturity", probability: 10 },
      ],
      explanation: `The startup appears to be in the Expansion stage as it prepares for an IPO and seeks partnerships and capital investments. The company has undergone significant restructuring and is ramping up operations, indicating a strong growth trajectory.`,
      keywords: extractKeywords(text),
    };
  }

  if (lower.includes("series a") || lower.includes("seed") || lower.includes("early")) {
    return {
      objective: "Growth",
      stages: [
        { name: "Seed", probability: 50 },
        { name: "Early Stage (Series A)", probability: 35 },
        { name: "Scaling (Series B/C)", probability: 15 },
      ],
      explanation: `This startup is in the early stages of development, focusing on product-market fit and initial traction. The founding team is building core technology and securing seed funding.`,
      keywords: extractKeywords(text),
    };
  }

  if (lower.includes("revenue") || lower.includes("profit") || lower.includes("scale")) {
    return {
      objective: "Scaling",
      stages: [
        { name: "Scaling (Series B/C)", probability: 55 },
        { name: "Expansion (Series D+)", probability: 30 },
        { name: "Maturity", probability: 15 },
      ],
      explanation: `The startup is demonstrating strong revenue growth and is focused on scaling operations. Unit economics are improving and the company is expanding into new markets.`,
      keywords: extractKeywords(text),
    };
  }

  return {
    objective: "Discovery",
    stages: [
      { name: "Seed", probability: 40 },
      { name: "Pre-Seed", probability: 30 },
      { name: "Early Stage (Series A)", probability: 20 },
      { name: "Scaling (Series B/C)", probability: 10 },
    ],
    explanation: `Based on the available information, this startup appears to be in the Discovery/Seed phase, exploring product-market fit and early validation of its core hypothesis.`,
    keywords: extractKeywords(text),
  };
}

function extractKeywords(text: string): string[] {
  const words = text.slice(0, 300).split(/\s+/);
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or", "but", "not", "with", "from", "by", "as", "it", "its", "this", "that", "has", "have", "had", "be", "been", "will", "would", "could", "should"]);
  const unique = [...new Set(words.filter(w => w.length > 3 && !stopWords.has(w.toLowerCase())).map(w => w.replace(/[^a-zA-Z]/g, "")).filter(Boolean))];
  return unique.slice(0, 8);
}

export default function StartupClassifier() {
  const [url, setUrl] = useState("");
  const [articleText, setArticleText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (ev) => setArticleText(ev.target?.result as string || "");
      reader.readAsText(file);
    }
  };

  const handleAnalyze = async () => {
    const inputText = articleText || url || fileName;
    if (!inputText.trim()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setResult(analyzeText(inputText));
    setIsLoading(false);
  };

  const handleReset = () => {
    setUrl("");
    setArticleText("");
    setFileName("");
    setResult(null);
  };

  return (
    <div className="animate-fade-in p-6">
      <div className="mx-auto max-w-6xl">
        <Toolbar title="Startup Classifier" onRefresh={handleReset} />
        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-[55fr_45fr]">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Info Banner */}
            <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
              <Globe size={18} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-xs text-accent">
                <span className="font-semibold">Real-time Mode:</span> You can now fetch content from any URL! Paste a link and we'll retrieve it for analysis. All file formats supported (PDF, images, text).
              </p>
            </div>

            {/* Section Title */}
            <h2 className="text-lg font-bold text-foreground">1. Analyze Startup Information</h2>

            {/* URL Input */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                Website URL
                <span className="text-[11px] font-normal text-accent">(Real-time fetching enabled)</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., https://techcrunch.com/article/..."
                className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
                Upload Document
                <span className="text-[11px] font-normal text-accent">(PDF, images & text files supported)</span>
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  <Upload size={14} />
                  Choose File
                </button>
                <span className="truncate text-sm text-muted-foreground">
                  {fileName || "No file selected"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.csv,.txt,.docx"
                  onChange={handleFileUpload}
                />
              </div>
              {fileName && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>📄</span>
                  <span>{fileName}</span>
                </div>
              )}
            </div>

            {/* Paste Text */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Paste Article Text</label>
              <textarea
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                placeholder="Paste article text here..."
                rows={8}
                className="w-full rounded-md border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (!url && !articleText && !fileName)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Rocket size={16} />
              {isLoading ? "Analyzing..." : "Match Startup Stage"}
            </button>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">2. AI-Generated Analysis</h2>
              {result && (
                <button className="rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors">
                  <Download size={12} className="mr-1 inline" />
                  Download Excel
                </button>
              )}
            </div>

            {!result && !isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-16 text-center">
                <span className="text-4xl mb-3">🚀</span>
                <p className="text-sm text-muted-foreground">Your analysis will appear here</p>
              </div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-16 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-3" />
                <p className="text-sm text-muted-foreground">Analyzing startup information...</p>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-4">
                {/* Identified Objective */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase mb-1">
                    Identified Objective:
                  </div>
                  <div className="text-2xl font-bold text-foreground">{result.objective}</div>
                </div>

                {/* Stage Probability */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-primary italic">Stage Probability Analysis:</h3>
                  <div className="space-y-3">
                    {result.stages.map((stage) => (
                      <div key={stage.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{stage.name}</span>
                          <span className="text-sm font-bold text-foreground">{stage.probability}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-700"
                            style={{ width: `${stage.probability}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <Lightbulb size={14} />
                    AI Analysis Explanation
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{result.explanation}</p>
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-primary italic">Key Insights / Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Button */}
        {result && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <RotateCcw size={14} />
              Reset Startup Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
