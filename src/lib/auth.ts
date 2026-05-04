import { supabase } from "@/integrations/supabase/client";

export type UserRole = "user" | "mentor" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function fetchRole(userId: string): Promise<UserRole> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as UserRole);
  if (roles.includes("admin")) return "admin";
  if (roles.includes("mentor")) return "mentor";
  return "user";
}

async function buildProfile(userId: string): Promise<UserProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) return null;
  const role = await fetchRole(userId);
  return { ...profile, email: profile.email ?? "", role } as UserProfile;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return false;

  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  return !error && !!data;
}

export async function signUp(email: string, password: string, name: string) {
  const redirectUrl = `${window.location.origin}/`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl, data: { name } },
  });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: "Signup failed" };
  // Wait briefly for trigger to create profile
  const profile = await buildProfile(data.user.id);
  return { user: profile, error: null };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { user: null, error: error.message };
  if (!data.user) return { user: null, error: "Sign in failed" };
  const profile = await buildProfile(data.user.id);
  if (profile && !profile.is_active) {
    await supabase.auth.signOut();
    return { user: null, error: "Your account has been deactivated." };
  }
  return { user: profile, error: null };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error ? error.message : null };
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data } = await supabase.auth.getUser();
  const authUser = data.user;
  if (!authUser) return null;

  const profile = await buildProfile(authUser.id);
  if (profile) return profile;

  const role = await fetchRole(authUser.id);
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: (authUser.user_metadata as any)?.name ?? authUser.email?.split("@")[0] ?? null,
    role,
    is_active: true,
    created_at: authUser.created_at ?? new Date().toISOString(),
    updated_at: authUser.updated_at ?? authUser.created_at ?? new Date().toISOString(),
  };
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  if (!profiles) return [];
  const roleMap = new Map<string, UserRole>();
  for (const r of roles ?? []) {
    const existing = roleMap.get(r.user_id);
    const role = r.role as UserRole;
    if (!existing || role === "admin" || (role === "mentor" && existing === "user")) {
      roleMap.set(r.user_id, role);
    }
  }
  return profiles.map((p) => ({
    ...p,
    email: p.email ?? "",
    role: roleMap.get(p.id) ?? "user",
  })) as UserProfile[];
}

export async function updateUserRole(userId: string, role: UserRole) {
  // Replace any existing role with the new one
  const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
  if (delErr) return { error: delErr.message };
  const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
  return { error: error ? error.message : null };
}

export async function deactivateUser(userId: string) {
  const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", userId);
  return { error: error ? error.message : null };
}

export async function reactivateUser(userId: string) {
  const { error } = await supabase.from("profiles").update({ is_active: true }).eq("id", userId);
  return { error: error ? error.message : null };
}

export async function deleteUser(userId: string) {
  const { error } = await supabase.from("profiles").delete().eq("id", userId);
  return { error: error ? error.message : null };
}
