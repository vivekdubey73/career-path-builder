import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, ArrowRight, Video, Calendar, ExternalLink, Bot, Users as UsersIcon, Send, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { BookingModal } from "@/components/BookingModal";
import { useNavigate } from "react-router-dom";
import { useMeeting } from "@/components/meeting/MeetingProvider";

const filters = ["All", "Technical", "Product", "Design", "Data", "Career"] as const;

type Mentor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  title: string;
  company: string;
  bio: string;
  full_bio: string;
  photo_url: string;
  skills: string[];
  match_score: number;
  category: string;
  available: boolean;
  availability_status: string;
  is_featured: boolean;
  avatar_color: string;
};

type Booking = {
  id: string;
  mentor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  jitsi_room_id: string;
  mentors: { name: string } | null;
};

type MentorshipSession = {
  id: string;
  title: string;
  description: string | null;
  mentor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  zoom_meeting_url: string;
  status: string;
};

const matchSteps = [
  { title: "We analyze your skill gaps", desc: "Your quiz results and profile data reveal exactly where you need to improve." },
  { title: "We find mentors who mastered those exact skills", desc: "Our algorithm matches mentors who've successfully bridged similar gaps." },
  { title: "You get ranked matches with availability", desc: "See your best-fit mentors first, with real-time availability status." },
];

export default function Mentors() {
  const [tab, setTab] = useState<"mentors" | "ai">("mentors");
  const [filter, setFilter] = useState<string>("All");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [liveSessions, setLiveSessions] = useState<MentorshipSession[]>([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const { joinMeeting } = useMeeting();

  const loadMentors = async () => {
    const { data } = await supabase.from("mentors").select("*").order("match_score", { ascending: false });
    if (data) setMentors(data as unknown as Mentor[]);
  };

  const loadBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("bookings")
      .select("id, mentor_id, scheduled_at, duration_minutes, status, jitsi_room_id, mentors(name)")
      .eq("student_id", user.id)
      .order("scheduled_at", { ascending: true });
    if (data) setMyBookings(data as unknown as Booking[]);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from("mentorship_sessions")
      .select("*")
      .in("status", ["scheduled", "live"])
      .order("scheduled_at", { ascending: true });
    if (data) setLiveSessions(data as unknown as MentorshipSession[]);
  };

  useEffect(() => {
    loadMentors();
    loadBookings();
    loadSessions();

    const channel = supabase
      .channel("mentors-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "mentorship_sessions" }, () => loadSessions())
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, () => loadMentors())
      .on("postgres_changes", { event: "*", schema: "public", table: "mentor_availability" }, () => loadMentors())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = filter === "All" ? mentors : mentors.filter(m => m.category === filter);
  const upcomingBookings = myBookings.filter(b => b.status !== "cancelled" && new Date(b.scheduled_at) > new Date());

  const askAiTrainer = () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiAnswer(`Great question! Here's some guidance on "${aiQuestion}": Focus on understanding the fundamentals first, then practice with hands-on exercises. (AI integration coming soon.)`);
      setAiLoading(false);
    }, 700);
  };

  const statusBadge = (m: Mentor) => {
    if (m.availability_status === "available_now" || (m.available && m.availability_status !== "unavailable")) {
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Available Now</span>;
    }
    if (m.availability_status === "scheduled") {
      return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full"><Calendar className="h-2.5 w-2.5" /> Scheduled</span>;
    }
    return <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Unavailable</span>;
  };

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10">
        <h1 className="font-display text-2xl font-bold">Find Your Mentor</h1>
        <p className="text-sm text-muted-foreground mt-1">Matched to your skill gaps and target role</p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="mentors" className="gap-2"><UsersIcon className="h-4 w-4" /> Mentors</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2"><Bot className="h-4 w-4" /> AI Trainer</TabsTrigger>
          </TabsList>

          {/* AI Trainer */}
          <TabsContent value="ai" className="mt-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-card max-w-3xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-display font-bold text-xl">Chat with Your AI Trainer</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">
                Get instant guidance, doubt resolution, and personalized learning plans from our AI trainer — available 24/7.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask anything — e.g. How do I learn React hooks?"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") askAiTrainer(); }}
                  className="h-12 rounded-xl"
                />
                <Button onClick={askAiTrainer} disabled={aiLoading || !aiQuestion.trim()} className="h-12 rounded-xl gap-2">
                  <Send className="h-4 w-4" /> Ask AI Trainer
                </Button>
              </div>
              {(aiAnswer || aiLoading) && (
                <div className="mt-5 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-bold text-primary mb-1.5">AI Trainer</p>
                  <p className="text-sm leading-relaxed">{aiLoading ? "Thinking…" : aiAnswer}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Mentors tab — live availability + bookings */}
          <TabsContent value="mentors" className="mt-6">
            {liveSessions.length > 0 && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  <Video className="h-4 w-4 text-primary" /> Live & Upcoming Sessions
                </h3>
                <div className="mt-3 space-y-2">
                  {liveSessions.map(s => {
                    const isLive = s.status === "live";
                    const isNow = !isLive && new Date(s.scheduled_at) <= new Date(Date.now() + 15 * 60000);
                    return (
                      <div key={s.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold">{s.title}</p>
                            {isLive && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Mentor: {s.mentor_name} ·{" "}
                            {new Date(s.scheduled_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at{" "}
                            {new Date(s.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            {" · "}{s.duration_minutes} min
                          </p>
                          {s.description && <p className="text-xs text-muted-foreground/70 mt-1">{s.description}</p>}
                        </div>
                        {(isLive || isNow || s.status === "scheduled") && (
                          <Button
                            size="sm"
                            className={cn("rounded-xl gap-1.5", isLive && "bg-success hover:bg-success/90 text-success-foreground")}
                            onClick={() => joinMeeting({
                              zoomUrl: s.zoom_meeting_url,
                              meetingTitle: s.title,
                              participantName: s.mentor_name,
                            })}
                          >
                            <Video className="h-3.5 w-3.5" /> {isLive ? "Join Live" : "Join Zoom"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {upcomingBookings.length > 0 && (
              <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-4">
                <h3 className="font-display font-bold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent" /> Your Booked Sessions
                </h3>
                <div className="mt-3 space-y-2">
                  {upcomingBookings.map(b => {
                    const isNow = new Date(b.scheduled_at) <= new Date(Date.now() + 15 * 60000);
                    return (
                      <div key={b.id} className="flex items-center justify-between bg-card rounded-xl border border-border p-3">
                        <div>
                          <p className="text-sm font-semibold">{(b.mentors as any)?.name ?? "Mentor"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(b.scheduled_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at{" "}
                            {new Date(b.scheduled_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                            {" · "}{b.duration_minutes} min
                          </p>
                        </div>
                        {isNow && (
                          <Button size="sm" className="rounded-xl gap-1.5" onClick={() => navigate(`/meeting/${b.jitsi_room_id}`)}>
                            <Video className="h-3.5 w-3.5" /> Join Call
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    filter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(m => (
                <div key={m.id} className="relative bg-card border border-border rounded-2xl p-5 shadow-card hover:border-primary/30 transition-all">
                  <div className="absolute top-4 right-4">{statusBadge(m)}</div>
                  <div className="flex items-center gap-3">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="h-12 w-12 rounded-full object-cover" />
                    ) : (
                      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground", m.avatar_color)}>{m.initials}</div>
                    )}
                    <div>
                      <div className="font-display font-bold text-sm">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.role} at {m.company}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {m.skills?.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">{s}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl" onClick={() => setBookingMentor(m)}>View Profile</Button>
                    <Button
                      size="sm"
                      className="flex-1 text-xs rounded-xl"
                      disabled={m.availability_status === "unavailable"}
                      onClick={() => setBookingMentor(m)}
                    >
                      Book Session
                    </Button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">No mentors available right now.</p>
              )}
            </div>

            <section className="mt-10">
              <h2 className="font-display font-bold text-lg mb-4">How matching works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchSteps.map((s, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-card relative">
                    <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold mb-3">{i + 1}</div>
                    <h3 className="font-display font-bold text-sm">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                    {i < 2 && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>

      {bookingMentor && (
        <BookingModal
          mentor={bookingMentor}
          onClose={() => setBookingMentor(null)}
          onBooked={() => { loadBookings(); setBookingMentor(null); }}
        />
      )}
    </AppShell>
  );
}
