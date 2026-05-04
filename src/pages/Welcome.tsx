import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, FileText, Map, Target, ArrowRight, Sparkles, Zap, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import rizeLogo from "@/assets/rize-logo.png";

const FEATURES = [
  {
    icon: Target,
    label: "Skill Map",
    description: "AI-powered skill gap analysis",
    gradient: "from-violet-500/20 to-purple-600/20",
    border: "hover:border-violet-500/50",
    iconColor: "text-violet-400",
  },
  {
    icon: Code2,
    label: "Coding Signal",
    description: "Real-time code proficiency scoring",
    gradient: "from-cyan-500/20 to-blue-600/20",
    border: "hover:border-cyan-500/50",
    iconColor: "text-cyan-400",
  },
  {
    icon: Map,
    label: "AI Roadmap",
    description: "Personalized learning pathways",
    gradient: "from-emerald-500/20 to-green-600/20",
    border: "hover:border-emerald-500/50",
    iconColor: "text-emerald-400",
  },
  {
    icon: FileText,
    label: "Resume Proof",
    description: "Verified skill-backed résumés",
    gradient: "from-amber-500/20 to-orange-600/20",
    border: "hover:border-amber-500/50",
    iconColor: "text-amber-400",
  },
];

const STATS = [
  { value: "10K+", label: "Students" },
  { value: "94%", label: "Placement Rate" },
  { value: "500+", label: "Mentors" },
  { value: "4.9★", label: "Rating" },
];

export default function Welcome() {
  const navigate = useNavigate();
  const handleStartEngine = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) navigate("/career-engine");
    else navigate("/signin?redirect=/career-engine");
  };
  const heroRef = useRef<HTMLElement>(null);
  const [cursor, setCursor] = useState({ x: 50, y: 42 });
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (isTouch) return;
    let frame = 0;
    let target = { x: 50, y: 42 };
    const onMove = (event: PointerEvent) => {
      const node = heroRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      target = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      if (!frame) {
        frame = requestAnimationFrame(() => {
          setCursor(target);
          frame = 0;
        });
      }
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const node = heroRef.current;
    node?.addEventListener("pointermove", onMove);
    node?.addEventListener("pointerenter", onEnter);
    node?.addEventListener("pointerleave", onLeave);
    return () => {
      node?.removeEventListener("pointermove", onMove);
      node?.removeEventListener("pointerenter", onEnter);
      node?.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isTouch]);

  const cursorStyle = !isTouch ? { cursor: "none" as const } : undefined;

  return (
    <AppShell hideNav>
      <main
        ref={heroRef}
        style={cursorStyle}
        className="relative min-h-screen overflow-hidden bg-background"
      >
        {/* Background layers */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.12)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.12)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-90" />

        {/* Large ambient glow orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px] animate-glow-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent/6 blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/5 blur-[80px] animate-glow-pulse" style={{ animationDelay: "3s" }} />

        {/* Cursor circles — desktop only */}
        {!isTouch && (
          <>
            <div
              className="pointer-events-none absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/5 blur-sm"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 480ms cubic-bezier(0.22,1,0.36,1), top 480ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease" }}
            />
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 90ms linear, top 90ms linear, opacity 180ms ease" }}
            />
          </>
        )}

        {/* Floating ambient elements */}
        <div className="pointer-events-none absolute left-[6%] top-[15%] h-16 w-16 rounded-full border border-accent/15 bg-accent/5 animate-ambient-drift" />
        <div className="pointer-events-none absolute bottom-[22%] right-[8%] h-24 w-24 rounded-full border border-primary/15 bg-primary/5 animate-ambient-drift" style={{ animationDelay: "1.2s" }} />
        <div className="pointer-events-none absolute right-[25%] top-[12%] h-12 w-12 rounded-full border border-primary/10 bg-primary/5 animate-ambient-drift" style={{ animationDelay: "2.4s" }} />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 lg:px-10">
          {/* Nav */}
          <nav className="flex items-center justify-between animate-slide-up">
            <Link to="/" className="flex items-center gap-2">
              <img src={rizeLogo} alt="Rize" className="h-10 w-24 object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/signin"
                className="inline-flex h-11 items-center rounded-full border border-border/60 bg-card/50 px-5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40"
              >
                Sign In
              </Link>
              <Button asChild size="sm" className="h-11 rounded-full bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </nav>

          {/* Hero content */}
          <section className="flex flex-1 flex-col justify-center py-12 lg:py-16">
            <div className="max-w-5xl">
              {/* Badge */}
              <div
                className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-sm"
                style={{ animationDelay: "100ms" }}
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Career Operating System
              </div>

              {/* Headline */}
              <h1
                className="animate-slide-up font-hero mt-8 text-5xl leading-[1.05] md:text-7xl lg:text-8xl"
                style={{ animationDelay: "200ms" }}
              >
                <span className="text-gradient-hero">Code, prove,</span>
                <br />
                <span className="text-foreground">and launch your</span>
                <br />
                <span className="text-foreground">next role</span>
                <span className="text-primary">.</span>
              </h1>

              {/* Subheadline */}
              <p
                className="animate-slide-up mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
                style={{ animationDelay: "300ms", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Rize turns quizzes, coding attempts, resumes, and roadmaps into one{" "}
                <span className="font-semibold text-foreground/90">live employability signal</span>{" "}
                so you know exactly what to improve next.
              </p>

              {/* CTA Buttons */}
              <div
                className="animate-slide-up mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
                style={{ animationDelay: "400ms" }}
              >
                <Button
                  size="lg"
                  onClick={handleStartEngine}
                  className="group h-14 rounded-full bg-gradient-primary px-10 text-base font-bold text-primary-foreground shadow-glow transition-all hover:shadow-[0_0_50px_hsl(262_83%_58%_/_0.5)]"
                >
                  <span className="flex items-center gap-2">
                    Start Readiness Engine
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </div>

              {/* Stats bar */}
              <div
                className="animate-slide-up mt-10 flex flex-wrap gap-6 sm:gap-10"
                style={{ animationDelay: "500ms" }}
              >
                {STATS.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="font-hero text-2xl text-foreground md:text-3xl">{stat.value}</span>
                    <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature cards */}
            <div
              className="animate-slide-up mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              style={{ animationDelay: "600ms" }}
            >
              {FEATURES.map((item, idx) => (
                <div
                  key={item.label}
                  className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated ${item.border} animate-float-card`}
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  {/* Card gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/30 bg-background/50">
                      <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <p className="mt-4 font-display text-base font-bold">{item.label}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer bar */}
          <div className="flex items-center justify-between gap-4 pb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Free for students · Compiler-backed practice · Web-first
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <Users className="h-3.5 w-3.5 text-primary" />
              Trusted by 10K+ students
            </span>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
