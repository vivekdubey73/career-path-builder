import { useEffect, useState } from "react";
import { Briefcase, Upload, Plus, Trash2, ExternalLink, Github, Sparkles, Loader2, Globe, Lock, FileDown, Lightbulb, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRize } from "@/lib/store";
import { JOB_ROLES } from "@/lib/rize-data";

interface ProjectRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tech: string;
  repo_url: string | null;
  demo_url: string | null;
  file_path: string | null;
  target_role: string | null;
  is_public: boolean;
  created_at: string;
}

interface Suggestion {
  title: string;
  difficulty: string;
  duration: string;
  description: string;
  why_it_matters: string;
  key_features: string[];
  tech_stack: string[];
  learning_outcomes: string[];
}

const BUCKET = "project-files";

export default function Employability() {
  const profile = useRize((s) => s.profile);
  const role = useRize((s) => s.getRole)();
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<"mine" | "showcase" | "suggest">("mine");

  // Projects
  const [myProjects, setMyProjects] = useState<ProjectRow[]>([]);
  const [publicProjects, setPublicProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tech: "",
    repo_url: "",
    demo_url: "",
    target_role: role?.title ?? "",
    is_public: true,
  });
  const [file, setFile] = useState<File | null>(null);

  // Suggestions
  const [dreamJob, setDreamJob] = useState(role?.title ?? "");
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUserId(sess?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadPublic();
    if (userId) loadMine();
  }, [userId]);

  async function loadMine() {
    if (!userId) return;
    const { data, error } = await supabase
      .from("projects").select("*")
      .eq("user_id", userId).order("created_at", { ascending: false });
    if (error) { toast({ title: "Failed to load projects", description: error.message, variant: "destructive" }); return; }
    setMyProjects((data as ProjectRow[]) || []);
  }

  async function loadPublic() {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects").select("*")
      .eq("is_public", true).order("created_at", { ascending: false }).limit(50);
    setLoading(false);
    if (error) { toast({ title: "Failed to load showcase", description: error.message, variant: "destructive" }); return; }
    setPublicProjects((data as ProjectRow[]) || []);
  }

  async function saveProject() {
    if (!userId) { toast({ title: "Sign in required", description: "Please sign up to upload your project.", variant: "destructive" }); return; }
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      let file_path: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        file_path = path;
      }
      const { error } = await supabase.from("projects").insert({
        user_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        tech: form.tech.trim(),
        repo_url: form.repo_url.trim() || null,
        demo_url: form.demo_url.trim() || null,
        file_path,
        target_role: form.target_role.trim() || null,
        is_public: form.is_public,
      });
      if (error) throw error;
      toast({ title: "Project added", description: "Employers can now see it in your showcase." });
      setOpen(false);
      setFile(null);
      setForm({ title: "", description: "", tech: "", repo_url: "", demo_url: "", target_role: role?.title ?? "", is_public: true });
      loadMine(); loadPublic();
    } catch (e: any) {
      toast({ title: "Failed to save", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(p: ProjectRow) {
    if (!confirm(`Delete "${p.title}"?`)) return;
    if (p.file_path) { await supabase.storage.from(BUCKET).remove([p.file_path]); }
    const { error } = await supabase.from("projects").delete().eq("id", p.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    loadMine(); loadPublic();
  }

  function fileUrl(path: string | null) {
    if (!path) return null;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function getSuggestions() {
    if (!dreamJob.trim()) { toast({ title: "Enter your dream job", variant: "destructive" }); return; }
    setSuggesting(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("project-suggestions", {
        body: {
          dreamJob: dreamJob.trim(),
          currentSkills: role?.keywords?.join(", ") ?? "",
          existingProjects: myProjects.map((p) => ({ title: p.title, description: p.description })),
        },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      setSuggestions(((data as any).suggestions as Suggestion[]) || []);
      toast({ title: "Suggestions ready", description: "Pick one and start building." });
    } catch (e: any) {
      toast({ title: "AI error", description: e.message, variant: "destructive" });
    } finally {
      setSuggesting(false);
    }
  }

  return (
    <AppShell>
      {/* Hero */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-glow" />
        <header className="relative px-5 lg:px-0 pt-6 text-primary-foreground">
          <div className="flex items-center gap-2 text-xs font-medium text-white/80">
            <Briefcase className="h-3.5 w-3.5" /> Employability
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold mt-1">Show your work. Land the job.</h1>
          <p className="text-sm text-white/85 mt-1 max-w-xl">Upload projects employers can browse, and get AI-picked project ideas tailored to your dream role.</p>
        </header>

        <div className="relative px-5 lg:px-0 mt-5">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-3 w-full max-w-xl bg-card shadow-card">
              <TabsTrigger value="mine">My Projects</TabsTrigger>
              <TabsTrigger value="showcase">Employer Showcase</TabsTrigger>
              <TabsTrigger value="suggest">AI Project Ideas</TabsTrigger>
            </TabsList>

            {/* MY PROJECTS */}
            <TabsContent value="mine" className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg">Your portfolio</h2>
                  <p className="text-xs text-muted-foreground">Public projects appear in the Employer Showcase.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2"><Plus className="h-4 w-4" /> Add project</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Upload a project</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label>Title *</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Smart Resume Analyzer" />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What it does, your role, the impact..." rows={3} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Tech stack</Label>
                          <Input value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} placeholder="React, Node, Postgres" />
                        </div>
                        <div>
                          <Label>Built for role</Label>
                          <Input value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })} placeholder="Software Engineer" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Repo URL</Label>
                          <Input value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} placeholder="https://github.com/..." />
                        </div>
                        <div>
                          <Label>Demo URL</Label>
                          <Input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })} placeholder="https://..." />
                        </div>
                      </div>
                      <div>
                        <Label>File (zip / pdf / image)</Label>
                        <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".zip,.pdf,.png,.jpg,.jpeg,.webp,.mp4" />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div>
                          <p className="text-sm font-medium">Visible to employers</p>
                          <p className="text-xs text-muted-foreground">Turn off to keep this project private.</p>
                        </div>
                        <Switch checked={form.is_public} onCheckedChange={(v) => setForm({ ...form, is_public: v })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                      <Button onClick={saveProject} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {saving ? "Saving..." : "Save project"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {!authChecked ? null : !userId ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card">
                  <p className="text-sm">Sign up to upload and showcase projects.</p>
                </div>
              ) : myProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card">
                  <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">No projects yet</p>
                  <p className="text-xs text-muted-foreground">Click "Add project" to upload your first one.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {myProjects.map((p) => (
                    <ProjectCard key={p.id} p={p} fileUrl={fileUrl} owner onDelete={() => deleteProject(p)} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* SHOWCASE */}
            <TabsContent value="showcase" className="mt-5 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg">Employer Showcase</h2>
                <p className="text-xs text-muted-foreground">A public gallery of student projects. Recruiters can browse without an account.</p>
              </div>
              {loading ? (
                <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
              ) : publicProjects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center bg-card text-sm text-muted-foreground">No public projects yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {publicProjects.map((p) => (
                    <ProjectCard key={p.id} p={p} fileUrl={fileUrl} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* AI SUGGESTIONS */}
            <TabsContent value="suggest" className="mt-5 space-y-4">
              <div className="rounded-2xl bg-card border border-border shadow-card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Sparkles className="h-4 w-4" /> Project ideas for your dream job
                </div>
                <h2 className="font-display font-bold text-lg mt-1">What should I build next?</h2>
                <p className="text-xs text-muted-foreground mt-1">Tell us your dream role — we'll suggest portfolio projects employers love.</p>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Input
                    list="role-list"
                    value={dreamJob}
                    onChange={(e) => setDreamJob(e.target.value)}
                    placeholder="e.g. Frontend Engineer at Stripe"
                    className="flex-1"
                  />
                  <datalist id="role-list">
                    {JOB_ROLES.map((r) => <option key={r.id} value={r.title} />)}
                  </datalist>
                  <Button onClick={getSuggestions} disabled={suggesting} className="gap-2">
                    {suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
                    {suggesting ? "Thinking..." : "Get ideas"}
                  </Button>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="grid md:grid-cols-2 gap-3">
                  {suggestions.map((s, i) => (
                    <div key={i} className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display font-bold leading-tight">{s.title}</h3>
                        <Badge variant="secondary" className="capitalize shrink-0">{s.difficulty}</Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">⏱ {s.duration}</p>
                      <p className="text-sm">{s.description}</p>
                      <div className="rounded-lg bg-secondary/50 p-2.5 text-xs flex gap-2">
                        <Target className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span>{s.why_it_matters}</span>
                      </div>
                      {s.key_features?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase text-muted-foreground mb-1">Key features</p>
                          <ul className="text-xs space-y-0.5 list-disc list-inside">
                            {s.key_features.map((f, j) => <li key={j}>{f}</li>)}
                          </ul>
                        </div>
                      )}
                      {s.tech_stack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {s.tech_stack.map((t, j) => <Badge key={j} variant="outline" className="text-[10px]">{t}</Badge>)}
                        </div>
                      )}
                      <Button
                        variant="outline" size="sm" className="mt-2 gap-2"
                        onClick={() => {
                          setForm({
                            title: s.title,
                            description: s.description + (s.why_it_matters ? `\n\nWhy it matters: ${s.why_it_matters}` : ""),
                            tech: (s.tech_stack || []).join(", "),
                            repo_url: "", demo_url: "",
                            target_role: dreamJob,
                            is_public: true,
                          });
                          setTab("mine");
                          setOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" /> Start this project
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="h-10" />
    </AppShell>
  );
}

function ProjectCard({ p, fileUrl, owner, onDelete }: { p: ProjectRow; fileUrl: (path: string | null) => string | null; owner?: boolean; onDelete?: () => void; }) {
  const url = fileUrl(p.file_path);
  return (
    <div className="rounded-2xl bg-card border border-border shadow-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-bold leading-tight truncate">{p.title}</h3>
          {p.target_role && <p className="text-[11px] text-muted-foreground">Built for {p.target_role}</p>}
        </div>
        <Badge variant={p.is_public ? "default" : "secondary"} className="shrink-0 gap-1 text-[10px]">
          {p.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
          {p.is_public ? "Public" : "Private"}
        </Badge>
      </div>
      {p.description && <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
      {p.tech && (
        <div className="flex flex-wrap gap-1">
          {p.tech.split(",").map((t, i) => t.trim() && <Badge key={i} variant="outline" className="text-[10px]">{t.trim()}</Badge>)}
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {p.repo_url && <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-primary font-medium"><Github className="h-3.5 w-3.5" />Repo</a>}
        {p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-primary font-medium"><ExternalLink className="h-3.5 w-3.5" />Demo</a>}
        {url && <a href={url} target="_blank" rel="noreferrer" className="text-xs inline-flex items-center gap-1 text-primary font-medium"><FileDown className="h-3.5 w-3.5" />File</a>}
      </div>
      {owner && (
        <div className="flex justify-end mt-1">
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      )}
    </div>
  );
}
