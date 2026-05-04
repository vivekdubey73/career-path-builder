import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Signin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/home";
  const setProfile = useRize((s) => s.setProfile);
  const finishOnboarding = useRize((s) => s.finishOnboarding);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    const name = (data.user?.user_metadata as any)?.name || data.user?.email?.split("@")[0] || "";
    setProfile({ name, email: data.user?.email || "" });
    finishOnboarding();
    navigate(redirect);
  };

  return (
    <AppShell hideNav>
      <div className="px-6 pt-6 pb-10 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted tap-scale" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="mt-4 mb-8 animate-float-up">
          <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1.5">Sign in to continue your journey.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 rounded-xl" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold mt-4 shadow-glow">
            {loading ? "Signing in..." : <>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account? <Link to={`/signup${redirect !== "/home" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="text-primary font-semibold">Sign up</Link>
          </p>
        </form>
      </div>
    </AppShell>
  );
}
