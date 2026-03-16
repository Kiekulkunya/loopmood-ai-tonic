import { useState, useMemo } from "react";
import {
  Star, Send, Sparkles, MessageSquare, ThumbsUp, ThumbsDown,
  ChevronDown, ChevronUp, Filter, Clock, User,
  FlaskConical, TrendingUp, Zap, Target,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApp, type CustomerReview } from "@/contexts/AppContext";
const FEATURES = [
  { id: "classifier", name: "Startup Classifier", icon: FlaskConical, color: "#3B82F6", desc: "AI-powered startup stage classification from articles, URLs, and documents" },
  { id: "decoded", name: "Decoded X Return", icon: TrendingUp, color: "#06B6D4", desc: "M×P×T×F risk framework with 7-scenario probability analysis" },
  { id: "risk", name: "Unleashing Risk & PWMOIC", icon: Zap, color: "#10B981", desc: "Full PWMOIC computation with TAM, multipliers, and investment scoring" },
  { id: "valuation", name: "Valuation Simulator", icon: Target, color: "#A855F7", desc: "Multi-firm comparative scoring across 23 weighted parameters" },
];

// Review type is now CustomerReview from AppContext

const SEED_REVIEWS: CustomerReview[] = [
  { id: "r1", featureId: "classifier", userName: "Sarah Chen", userEmail: "sarah@startup.io", rating: 5, title: "Game changer for pitch prep", comment: "The AI classifier accurately identified our startup stage from a TechCrunch article about our funding round. The stage probability breakdown gave me confidence going into investor meetings. The keyword extraction is particularly useful for understanding how the market perceives us.", aiEnhanced: false, helpful: 12, notHelpful: 1, createdAt: "2025-03-10T14:30:00Z", sentiment: "positive", userRole: "Founder" },
  { id: "r2", featureId: "classifier", userName: "Mike Rodriguez", userEmail: "mike@vcfund.com", rating: 4, title: "Solid tool, needs PDF parsing improvement", comment: "Works well with URLs and text input. However, when I uploaded a pitch deck PDF, it only extracted partial text. The classification logic is sound — would love to see better document parsing and support for financial spreadsheets.", aiEnhanced: false, helpful: 8, notHelpful: 2, createdAt: "2025-03-09T09:15:00Z", sentiment: "neutral", userRole: "Investor" },
  { id: "r3", featureId: "decoded", userName: "Anna Park", userEmail: "anna@techstars.com", rating: 5, title: "Best risk framework I've seen", comment: "The multiplicative M×P×T×F framework is more realistic than additive models. Being able to toggle between Synthetic and Custom modes makes it perfect for both quick demos and deep analysis. The scenario distribution chart adds great visual context.", aiEnhanced: true, helpful: 15, notHelpful: 0, createdAt: "2025-03-08T16:45:00Z", sentiment: "positive", userRole: "Accelerator PM" },
  { id: "r4", featureId: "risk", userName: "James Liu", userEmail: "james@founder.co", rating: 3, title: "TAM computation needs more industry data", comment: "The PWMOIC scoring is valuable, but the TAM computation feels limited to basic approaches. Would appreciate integration with market research databases and more granular industry segmentation options. The score reference guide at the bottom is helpful for understanding results.", aiEnhanced: false, helpful: 6, notHelpful: 3, createdAt: "2025-03-07T11:20:00Z", sentiment: "negative", userRole: "Founder" },
  { id: "r5", featureId: "risk", userName: "Lisa Wang", userEmail: "lisa@angel.net", rating: 5, title: "Essential for portfolio analysis", comment: "I use this to score every deal in my pipeline. The industry selection with pre-loaded market caps saves significant research time. The ability to adjust multipliers and investment shares per scenario gives me the flexibility I need for different deal structures.", aiEnhanced: true, helpful: 11, notHelpful: 0, createdAt: "2025-03-06T13:00:00Z", sentiment: "positive", userRole: "Angel Investor" },
  { id: "r6", featureId: "valuation", userName: "Tom Baker", userEmail: "tom@accelerate.io", rating: 4, title: "Great for cohort comparison", comment: "Being able to compare 3 firms side by side with weighted parameters is exactly what our accelerator needs. The grade system with emoticons makes results instantly digestible. Would love support for comparing more than 3 firms simultaneously.", aiEnhanced: false, helpful: 9, notHelpful: 1, createdAt: "2025-03-05T10:30:00Z", sentiment: "positive", userRole: "Accelerator PM" },
  { id: "r7", featureId: "valuation", userName: "David Lim", userEmail: "david@bank.sg", rating: 2, title: "Needs enterprise-grade features", comment: "The scoring framework is academically sound but lacks enterprise requirements: audit trails, role-based access, export to our internal reporting format, and API integration for batch processing. Not ready for institutional use yet.", aiEnhanced: false, helpful: 4, notHelpful: 5, createdAt: "2025-03-04T08:45:00Z", sentiment: "negative", userRole: "Banking Analyst" },
  { id: "r8", featureId: "decoded", userName: "Priya Sharma", userEmail: "priya@seed.in", rating: 4, title: "Intuitive risk visualization", comment: "The stage flow visualization makes complex probability calculations intuitive. My co-founders who aren't finance-savvy can now understand our risk profile. The custom input mode with free-text entry is a nice touch for precise modeling.", aiEnhanced: true, helpful: 7, notHelpful: 1, createdAt: "2025-03-03T15:20:00Z", sentiment: "positive", userRole: "Founder" },
];

function aiEnhanceComment(shortText: string, featureName: string, rating: number): string {
  const sentiment = rating >= 4 ? "positive" : rating >= 3 ? "balanced" : "constructive";
  const expanded = {
    positive: `${shortText}. This feature demonstrates strong product-market fit for the startup analytics space. The implementation aligns well with Dr. Kie Prayarach's PWMOIC methodology, providing actionable insights that go beyond surface-level metrics. The ${featureName} tool specifically addresses a critical gap in the market where founders and investors need data-driven frameworks rather than gut-feel assessments.`,
    balanced: `${shortText}. While the ${featureName} shows promise in its current implementation, there are opportunities for improvement that would elevate it from a useful tool to an essential one. The core analytical framework is sound and well-grounded in the PWMOIC methodology. Enhancing the data input flexibility and adding more visualization options would significantly increase adoption.`,
    constructive: `${shortText}. As a professional user evaluating the ${featureName}, I see potential that isn't fully realized yet. The underlying PWMOIC framework is academically rigorous, but the implementation needs to bridge the gap between academic theory and enterprise practice. Specific improvements would include: more granular data input options, integration with financial data providers, and customizable reporting templates.`,
  };
  return expanded[sentiment];
}

function StarRating({ value, onChange, size = 20, readonly = false }: {
  value: number; onChange?: (v: number) => void; size?: number; readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((v) => (
        <button
          key={v}
          onClick={() => !readonly && onChange?.(v)}
          onMouseEnter={() => !readonly && setHover(v)}
          onMouseLeave={() => !readonly && setHover(0)}
          disabled={readonly}
          className="transition-all duration-150 disabled:cursor-default"
          style={{ transform: (hover >= v || value >= v) && !readonly ? "scale(1.1)" : "scale(1)" }}
        >
          <Star
            style={{ width: size, height: size }}
            className={`transition-colors ${
              (hover || value) >= v ? "text-amber-400 fill-amber-400" : "text-slate-700"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const feature = FEATURES.find((f) => f.id === review.featureId);

  const sentimentColor = review.sentiment === "positive" ? "#10B981" : review.sentiment === "negative" ? "#EF4444" : "#F59E0B";
  const isLong = review.comment.length > 200;
  const displayText = isLong && !expanded ? review.comment.slice(0, 200) + "..." : review.comment;

  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary">
            {review.userName.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{review.userName}</span>
              <Badge variant="secondary" className="text-[7px] px-1.5">
                {review.userRole}
              </Badge>
              {review.aiEnhanced && (
                <Badge className="text-[7px] px-1.5 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="w-2 h-2 mr-0.5" /> AI Enhanced
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating value={review.rating} readonly size={12} />
              <span className="text-[9px] text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sentimentColor }} />
          <span className="text-[8px] capitalize" style={{ color: sentimentColor }}>{review.sentiment}</span>
        </div>
      </div>

      <h4 className="text-xs font-bold text-foreground mb-1.5 ml-12">{review.title}</h4>
      <p className="text-[11px] text-muted-foreground leading-relaxed ml-12">{displayText}</p>
      {isLong && (
        <button onClick={() => setExpanded(!expanded)} className="ml-12 mt-1 text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
        </button>
      )}

      <div className="flex items-center gap-3 mt-2.5 ml-12">
        <span className="text-[9px] text-muted-foreground">Was this helpful?</span>
        <button
          onClick={() => { if (voted !== "up") { setHelpfulCount(review.helpful + 1); setVoted("up"); } }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] transition-all ${voted === "up" ? "bg-emerald-500/15 text-emerald-400" : "text-muted-foreground hover:text-emerald-400"}`}
        >
          <ThumbsUp className="w-3 h-3" /> {helpfulCount}
        </button>
        <button
          onClick={() => { if (voted !== "down") { setVoted("down"); } }}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] transition-all ${voted === "down" ? "bg-red-500/15 text-red-400" : "text-muted-foreground hover:text-red-400"}`}
        >
          <ThumbsDown className="w-3 h-3" /> {review.notHelpful}
        </button>
      </div>
    </div>
  );
}

export default function CustomerFeedback() {
  const { logAct } = useApp();

  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [activeFeature, setActiveFeature] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "helpful">("recent");

  const [showForm, setShowForm] = useState(false);
  const [formFeature, setFormFeature] = useState(FEATURES[0].id);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formComment, setFormComment] = useState("");
  const [formRole, setFormRole] = useState("Founder");
  const [isEnhancing, setIsEnhancing] = useState(false);

  const filteredReviews = useMemo(() => {
    let r = activeFeature === "all" ? [...reviews] : reviews.filter((rev) => rev.featureId === activeFeature);
    if (sortBy === "recent") r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "rating") r.sort((a, b) => b.rating - a.rating);
    else r.sort((a, b) => b.helpful - a.helpful);
    return r;
  }, [reviews, activeFeature, sortBy]);

  const featureStats = useMemo(() => {
    return FEATURES.map((f) => {
      const fReviews = reviews.filter((r) => r.featureId === f.id);
      const avg = fReviews.length > 0 ? fReviews.reduce((a, b) => a + b.rating, 0) / fReviews.length : 0;
      return { ...f, count: fReviews.length, avg: +avg.toFixed(1) };
    });
  }, [reviews]);

  const overallAvg = reviews.length > 0 ? +(reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : 0;

  const handleAIEnhance = () => {
    if (!formComment.trim()) { toast.error("Write a short comment first, then enhance"); return; }
    setIsEnhancing(true);
    const featureName = FEATURES.find((f) => f.id === formFeature)?.name || "this feature";
    setTimeout(() => {
      const enhanced = aiEnhanceComment(formComment.trim(), featureName, formRating || 4);
      setFormComment(enhanced);
      setIsEnhancing(false);
      toast.success("Comment enhanced with AI");
    }, 1200);
  };

  const handleSubmit = () => {
    if (formRating === 0) { toast.error("Please select a star rating"); return; }
    if (!formTitle.trim()) { toast.error("Please add a review title"); return; }
    if (!formComment.trim()) { toast.error("Please write a comment"); return; }

    const sentiment: Review["sentiment"] = formRating >= 4 ? "positive" : formRating >= 3 ? "neutral" : "negative";
    const newReview: Review = {
      id: `r-${Date.now()}`,
      featureId: formFeature,
      userName: "Anonymous User",
      userEmail: "user@loopai.app",
      rating: formRating,
      title: formTitle,
      comment: formComment,
      aiEnhanced: formComment.length > 150,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date().toISOString(),
      sentiment,
      userRole: formRole,
    };

    setReviews((prev) => [newReview, ...prev]);
    logAct("feedback_review", "customer-feedback");
    setShowForm(false);
    setFormRating(0);
    setFormTitle("");
    setFormComment("");
    toast.success("Review submitted successfully!");
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Customer Feedback
          </h1>
          <p className="text-[10px] text-muted-foreground">Professional reviews & ratings from founders, investors, and analysts</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Star className="w-3.5 h-3.5 mr-1.5" />
          Write a Review
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <Card className="col-span-1">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{overallAvg}</div>
            <StarRating value={Math.round(overallAvg)} readonly size={14} />
            <div className="text-[9px] text-muted-foreground mt-1">{reviews.length} reviews</div>
          </CardContent>
        </Card>
        {featureStats.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: f.color }} />
                  <span className="text-[10px] font-bold" style={{ color: f.color }}>{f.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-foreground">{f.avg || "—"}</span>
                  <StarRating value={Math.round(f.avg)} readonly size={10} />
                </div>
                <div className="text-[8px] text-muted-foreground mt-0.5">{f.count} reviews</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm && (
        <Card className="border-primary/20 ring-1 ring-primary/10">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Write Your Review
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1.5">Feature to Review</label>
                <select value={formFeature} onChange={(e) => setFormFeature(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50">
                  {FEATURES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1.5">Your Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50">
                  {["Founder", "Investor", "Angel Investor", "VC Analyst", "Accelerator PM", "Banking Analyst", "Consultant", "Student", "Other"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[10px] text-muted-foreground block mb-1.5">Your Rating</label>
              <div className="flex items-center gap-3">
                <StarRating value={formRating} onChange={setFormRating} size={28} />
                {formRating > 0 && (
                  <span className="text-xs font-semibold" style={{ color: formRating >= 4 ? "#10B981" : formRating >= 3 ? "#F59E0B" : "#EF4444" }}>
                    {["", "Poor", "Below Average", "Good", "Very Good", "Excellent"][formRating]}
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[10px] text-muted-foreground block mb-1.5">Review Title</label>
              <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Summarize your experience in one line..." className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50" maxLength={100} />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-muted-foreground">Your Review</label>
                <button onClick={handleAIEnhance} disabled={isEnhancing || !formComment.trim()} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-semibold bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary hover:from-primary/30 hover:to-accent/30 disabled:opacity-40 transition-all">
                  {isEnhancing ? (
                    <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Enhancing...</>
                  ) : (
                    <><Sparkles className="w-3 h-3" /> Enhance with AI</>
                  )}
                </button>
              </div>
              <textarea value={formComment} onChange={(e) => setFormComment(e.target.value)} placeholder="Write a short sentence — then click 'Enhance with AI' to expand it into a detailed professional review..." rows={5} className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none leading-relaxed" />
              <div className="flex justify-between mt-1">
                <p className="text-[8px] text-muted-foreground">💡 Tip: Write a short sentence, then click "Enhance with AI" to generate a detailed professional review</p>
                <span className="text-[8px] text-muted-foreground">{formComment.length} chars</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1" size="sm">
                <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Review
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button onClick={() => setActiveFeature("all")} className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${activeFeature === "all" ? "bg-primary/15 border-primary/30 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
            All ({reviews.length})
          </button>
          {featureStats.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.id} onClick={() => setActiveFeature(f.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${activeFeature === f.id ? "border-opacity-40 bg-opacity-10" : "border-border text-muted-foreground hover:text-foreground"}`} style={{ borderColor: activeFeature === f.id ? f.color + "55" : undefined, backgroundColor: activeFeature === f.id ? f.color + "10" : undefined, color: activeFeature === f.id ? f.color : undefined }}>
                <Icon className="w-3 h-3" /> {f.name.split(" ")[0]} ({f.count})
              </button>
            );
          })}
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-background border border-border rounded-lg px-3 py-1.5 text-[10px] text-muted-foreground outline-none">
          <option value="recent">Most Recent</option>
          <option value="rating">Highest Rated</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-5">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reviews yet for this feature</p>
              <p className="text-[10px] mt-1">Be the first to write one!</p>
            </div>
          ) : (
            filteredReviews.map((rev) => <ReviewCard key={rev.id} review={rev} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
