import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import {
  Bookmark,
  Search,
  Clock,
  Sparkles,
  Mail,
  Twitter,
  Linkedin,
  Link2,
  ListTree,
  Send,
  Star,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "Career" | "Skills" | "Industry" | "Interviews" | "Salary";
  tags: string[];
  author: { name: string; role: string; initials: string };
  readTime: number; // minutes
  publishedAt: string;
  featured?: boolean;
  cover: string; // gradient class
  body: { heading: string; paragraphs: string[] }[];
}

const POSTS: BlogPost[] = [
  {
    id: "p1",
    title: "How to land your first software engineering offer in 2026",
    excerpt:
      "A no-fluff guide to portfolio, applications, and interview reps that actually move the needle for new grads.",
    category: "Career",
    tags: ["job search", "portfolio", "interviews"],
    author: { name: "Aarav Mehta", role: "Senior SWE @ FAANG", initials: "AM" },
    readTime: 8,
    publishedAt: "2 days ago",
    featured: true,
    cover: "from-primary/40 via-accent/30 to-primary-glow/40",
    body: [
      { heading: "The funnel", paragraphs: [
        "Most students underestimate how much application volume matters. A realistic funnel is 80 quality applications → 12 screens → 4 onsites → 1 offer.",
        "Quality means tailored resume bullets, a referral when possible, and a cover note that mentions one specific thing about the team."
      ]},
      { heading: "Portfolio that converts", paragraphs: [
        "Recruiters spend under 30 seconds per profile. Lead with one polished, deployed project that shows the stack you want to be hired for.",
        "A README with screenshots, a live demo URL, and a 60-second loom video doubles callback rates in our cohort data."
      ]},
      { heading: "Interview reps", paragraphs: [
        "Two mediums a day for 8 weeks beats binge sessions. Track patterns, not problems.",
        "Do 10 mock interviews before your first real one — interviewing is a separate skill from coding."
      ]},
    ],
  },
  {
    id: "p2",
    title: "The 5 skills hiring managers actually screen for",
    excerpt: "We analyzed 2,000 job posts. Here's what shows up again and again — and what's mostly noise.",
    category: "Skills",
    tags: ["skills", "trends"],
    author: { name: "Priya Shah", role: "Talent Lead", initials: "PS" },
    readTime: 5,
    publishedAt: "5 days ago",
    cover: "from-accent/40 via-primary/20 to-warning/30",
    body: [
      { heading: "What we found", paragraphs: ["System design, AI literacy, cloud, communication, and shipping speed top the list across roles and seniorities."] },
      { heading: "What's overrated", paragraphs: ["Niche framework knowledge rarely changes hiring decisions for entry roles. Fundamentals do."] },
    ],
  },
  {
    id: "p3",
    title: "AI engineer salaries jumped 38% YoY — here's why",
    excerpt: "Demand for engineers who can ship LLM features outpaces supply. What it means for your roadmap.",
    category: "Salary",
    tags: ["AI", "salary"],
    author: { name: "Rohan Iyer", role: "Career Analyst", initials: "RI" },
    readTime: 4,
    publishedAt: "1 week ago",
    cover: "from-warning/40 via-accent/20 to-primary/30",
    body: [
      { heading: "The data", paragraphs: ["Median base for AI-focused engineers crossed ₹24 LPA at 2 YOE in metro hubs."] },
      { heading: "Your move", paragraphs: ["Add one shipped LLM project to your portfolio. That alone unlocks the next salary band in screens."] },
    ],
  },
  {
    id: "p4",
    title: "Cracking the system design interview as a new grad",
    excerpt: "You're not expected to design Twitter. You are expected to think out loud, ask, and reason about trade-offs.",
    category: "Interviews",
    tags: ["system design", "interviews"],
    author: { name: "Neha Verma", role: "Staff Engineer", initials: "NV" },
    readTime: 7,
    publishedAt: "1 week ago",
    cover: "from-primary-glow/40 via-primary/20 to-accent/30",
    body: [
      { heading: "Frame the problem", paragraphs: ["Always start with requirements: functional, non-functional, and scale."] },
      { heading: "Communicate trade-offs", paragraphs: ["Interviewers reward 'I'd pick X because Y, but Z is the trade-off' over rote answers."] },
    ],
  },
  {
    id: "p5",
    title: "Inside India's product hiring boom",
    excerpt: "Why APMs are the hottest entry role of the year, and how non-CS students are breaking in.",
    category: "Industry",
    tags: ["product", "hiring"],
    author: { name: "Kabir Nair", role: "PM Coach", initials: "KN" },
    readTime: 6,
    publishedAt: "2 weeks ago",
    cover: "from-success/40 via-primary/20 to-accent/30",
    body: [
      { heading: "The shift", paragraphs: ["Indian unicorns hired 3x more APMs in 2025 than 2024."] },
      { heading: "How to break in", paragraphs: ["Build one product case study end-to-end. Ship something tiny but real."] },
    ],
  },
  {
    id: "p6",
    title: "Resume bullets that pass the 6-second scan",
    excerpt: "Stop describing what you did. Start showing what changed because of you.",
    category: "Career",
    tags: ["resume"],
    author: { name: "Ishita Rao", role: "Resume Coach", initials: "IR" },
    readTime: 4,
    publishedAt: "3 weeks ago",
    cover: "from-accent/40 via-primary-glow/20 to-primary/30",
    body: [
      { heading: "The formula", paragraphs: ["Verb + scope + quantified outcome. Every bullet, no exceptions."] },
      { heading: "Examples", paragraphs: ["'Built dashboard' → 'Shipped React dashboard cutting analyst report time from 4h to 20m for 30 users.'"] },
    ],
  },
];

const CATEGORIES = ["All", "Career", "Skills", "Industry", "Interviews", "Salary"] as const;

export default function Insights() {
  const role = useRize((s) => s.getRole)();
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = useState("");
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);
  const [email, setEmail] = useState("");
  const [askInput, setAskInput] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const filtered = useMemo(() => {
    return POSTS.filter((p) => {
      const matchCat = filter === "All" || p.category === filter;
      const q = query.trim().toLowerCase();
      const matchQuery = !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [filter, query]);

  const featured = POSTS.find((p) => p.featured);
  const list = filtered.filter((p) => !p.featured || filter !== "All" || query);

  const related = (post: BlogPost) =>
    POSTS.filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t)))).slice(0, 3);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast({ title: "Enter a valid email", variant: "destructive" });
      return;
    }
    toast({ title: "Subscribed!", description: "Weekly career insights coming your way." });
    setEmail("");
  };

  const handleShare = async (platform: "twitter" | "linkedin" | "copy", post: BlogPost) => {
    const url = `${window.location.origin}/blog#${post.id}`;
    if (platform === "copy") {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
      return;
    }
    const text = encodeURIComponent(post.title);
    const u = encodeURIComponent(url);
    const target =
      platform === "twitter"
        ? `https://twitter.com/intent/tweet?text=${text}&url=${u}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    window.open(target, "_blank", "noopener");
  };

  const handleAsk = async () => {
    const q = askInput.trim();
    if (!q) return;
    setAsking(true);
    setAskAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-mentor-chat", {
        body: { messages: [{ role: "user", content: `Answer this career/skills question briefly (3-5 sentences): ${q}` }] },
      });
      if (error) throw error;
      const reply = (data as any)?.reply || (data as any)?.message || (typeof data === "string" ? data : "");
      setAskAnswer(reply || "I couldn't fetch an answer right now. Try again in a moment.");
    } catch (err: any) {
      setAskAnswer("AI is busy. Try again shortly.");
    } finally {
      setAsking(false);
    }
  };

  if (openPost) {
    return (
      <AppShell>
        <article className="px-5 lg:px-0 pt-6 lg:pt-8 max-w-3xl mx-auto animate-float-up">
          <button
            onClick={() => setOpenPost(null)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-base mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </button>

          <div className={`rounded-3xl bg-gradient-to-br ${openPost.cover} h-48 lg:h-64 mb-6 shadow-card`} />

          <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            {openPost.category}
          </span>
          <h1 className="font-display text-3xl lg:text-4xl font-bold mt-3 leading-tight">{openPost.title}</h1>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                {openPost.author.initials}
              </div>
              <div>
                <div className="text-sm font-semibold">{openPost.author.name}</div>
                <div className="text-[11px] text-muted-foreground">{openPost.author.role}</div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {openPost.readTime} min read
            </span>
            <span className="text-xs text-muted-foreground">· {openPost.publishedAt}</span>
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_220px] gap-6">
            <div>
              <p className="text-base text-foreground/85 leading-relaxed">{openPost.excerpt}</p>
              <div className="mt-6 space-y-6">
                {openPost.body.map((section) => (
                  <section key={section.heading} id={section.heading.toLowerCase().replace(/\s+/g, "-")}>
                    <h2 className="font-display text-xl font-bold mb-2">{section.heading}</h2>
                    {section.paragraphs.map((para, i) => (
                      <p key={i} className="text-sm text-foreground/85 leading-relaxed mb-3">{para}</p>
                    ))}
                  </section>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Share this post</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleShare("twitter", openPost)} className="gap-2">
                    <Twitter className="h-4 w-4" /> Twitter
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare("linkedin", openPost)} className="gap-2">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare("copy", openPost)} className="gap-2">
                    <Link2 className="h-4 w-4" /> Copy
                  </Button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-display text-lg font-bold mb-3">Related posts</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  {related(openPost).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setOpenPost(r); window.scrollTo(0, 0); }}
                      className="text-left rounded-2xl border border-border bg-card p-4 shadow-card hover:border-primary/40 transition-base"
                    >
                      <div className={`h-16 rounded-lg bg-gradient-to-br ${r.cover} mb-2`} />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent">{r.category}</p>
                      <p className="text-sm font-semibold leading-tight mt-1 line-clamp-2">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{r.readTime} min read</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-20 self-start">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-3">
                  <ListTree className="h-3.5 w-3.5" /> On this page
                </p>
                <ul className="space-y-2">
                  {openPost.body.map((s) => (
                    <li key={s.heading}>
                      <a
                        href={`#${s.heading.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-base"
                      >
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </article>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-5 lg:px-0 pt-6 lg:pt-8 animate-float-up">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Rize Blog</p>
            <h1 className="font-display text-3xl font-bold">Career stories & insights</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Hand-picked reads on landing roles in {role.domain}, sharpening skills, and navigating your first jobs.
            </p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-accent">
            {POSTS.length} posts
          </div>
        </div>

        {/* Search + categories */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, tags, authors…"
              className="pl-9 h-11 rounded-full"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`h-9 rounded-full px-4 text-sm font-semibold transition-base whitespace-nowrap ${
                  filter === c
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Featured post */}
        {featured && filter === "All" && !query && (
          <button
            onClick={() => setOpenPost(featured)}
            className="mt-6 w-full text-left rounded-3xl border border-border bg-card overflow-hidden shadow-card hover:border-primary/40 transition-base group"
          >
            <div className={`h-44 lg:h-56 bg-gradient-to-br ${featured.cover} relative`}>
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-xs font-bold text-primary shadow-card">
                <Star className="h-3.5 w-3.5 fill-primary" /> Featured
              </span>
            </div>
            <div className="p-5 lg:p-6">
              <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {featured.category}
              </span>
              <h2 className="font-display text-2xl lg:text-3xl font-bold leading-tight mt-3 group-hover:text-primary transition-base">
                {featured.title}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">{featured.excerpt}</p>
              <div className="mt-4 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[11px]">
                    {featured.author.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{featured.author.name}</div>
                    <div className="text-[11px] text-muted-foreground">{featured.author.role}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> {featured.readTime} min read
                </span>
                <span className="text-xs text-muted-foreground">· {featured.publishedAt}</span>
              </div>
            </div>
          </button>
        )}

        {/* Layout: posts + sidebar */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="grid gap-4 sm:grid-cols-2">
            {list.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                No posts match your search.
              </div>
            )}
            {list.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-card transition-base hover:-translate-y-0.5 hover:border-primary/40"
              >
                <button onClick={() => setOpenPost(post)} className="block w-full text-left">
                  <div className={`h-32 bg-gradient-to-br ${post.cover}`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                        {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {post.readTime} min
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold leading-tight line-clamp-2">{post.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                          {post.author.initials}
                        </div>
                        <div className="text-[11px]">
                          <div className="font-semibold leading-tight">{post.author.name}</div>
                          <div className="text-muted-foreground">{post.publishedAt}</div>
                        </div>
                      </div>
                      <Bookmark className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
                <div className="px-5 pb-4 flex gap-1">
                  <button
                    onClick={() => handleShare("twitter", post)}
                    className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-base"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleShare("linkedin", post)}
                    className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-base"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleShare("copy", post)}
                    className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-base"
                    aria-label="Copy link"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="space-y-4">
            {/* AI Ask widget */}
            <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
              <h2 className="font-display font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Ask the AI
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Get a quick career answer based on these posts.
              </p>
              <Textarea
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                placeholder="e.g. How do I prepare for a system design interview?"
                className="mt-3 min-h-[72px] text-sm"
              />
              <Button onClick={handleAsk} disabled={asking || !askInput.trim()} className="mt-3 w-full gap-2">
                {asking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {asking ? "Thinking…" : "Ask"}
              </Button>
              {askAnswer && (
                <div className="mt-3 rounded-xl border border-border bg-background p-3 text-sm text-foreground/85 leading-relaxed">
                  {askAnswer}
                </div>
              )}
            </div>

            {/* Newsletter CTA */}
            <form
              onSubmit={handleSubscribe}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <h2 className="font-display font-bold flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" /> Weekly career digest
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                One email a week. New posts, hot jobs, and skill trends. No spam.
              </p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-3"
              />
              <Button type="submit" className="mt-3 w-full">
                Subscribe
              </Button>
            </form>

            {/* Popular tags */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display font-bold">Popular tags</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(POSTS.flatMap((p) => p.tags))).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold hover:border-primary/40 hover:text-primary transition-base"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
