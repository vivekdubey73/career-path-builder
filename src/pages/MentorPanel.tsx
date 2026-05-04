import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Circle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Mentor = {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  full_bio: string;
  photo_url: string;
  skills: string[];
  category: string;
  available: boolean;
  availability_status: string;
  initials: string;
  avatar_color: string;
};

export default function MentorPanel() {
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    const { data } = await supabase
      .from("mentors")
      .select("*")
      .order("match_score", { ascending: false });
    setMentors((data as unknown as Mentor[]) ?? []);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("mentor-panel-mentors")
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  return (
    <AppShell>
      <div className="px-4 lg:px-0 py-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Mentor Panel</h1>
          <p className="text-muted-foreground">
            Meet our world-class mentors. Click any card to book a live session.
          </p>
        </header>

        {mentors === null ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-2xl" />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground rounded-2xl">
            No mentors are available yet. Check back soon.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((m) => (
              <Card
                key={m.id}
                className="group p-5 rounded-2xl border border-border/60 hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg flex flex-col"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        loading="lazy"
                        width={72}
                        height={72}
                        className="h-18 w-18 h-[72px] w-[72px] rounded-2xl object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div
                        className={`h-[72px] w-[72px] rounded-2xl ${m.avatar_color} text-white grid place-items-center text-xl font-semibold`}
                      >
                        {m.initials}
                      </div>
                    )}
                    {m.availability_status === "available_now" && (
                      <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 shadow">
                        <Circle className="h-2 w-2 fill-white" /> Live
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-tight truncate">{m.name}</h3>
                    <p className="text-sm text-foreground/80 truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.company}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                  {m.full_bio || m.bio}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(m.skills || []).slice(0, 4).map((s) => (
                    <Badge key={s} variant="secondary" className="rounded-full font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto pt-5">
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => navigate(`/mentors?mentor=${m.id}`)}
                  >
                    Book a Session <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
