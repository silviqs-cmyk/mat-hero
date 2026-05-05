import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/types/user";

export async function getServerUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getServerProfile(userId?: string): Promise<UserProfile | null> {
  const targetUserId = userId ?? (await getServerUser())?.id;

  if (!targetUserId) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetUserId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as UserProfile | null) ?? null;
}

export async function requireAdmin() {
  const user = await getServerUser();

  if (!user) {
    redirect("/admin/login");
  }

  const profile = await getServerProfile(user.id);

  if (!profile) {
    redirect("/admin/login");
  }

  if (profile.role !== "admin") {
    redirect("/login");
  }

  return { user, profile };
}

export async function requireStudent() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getServerProfile(user.id);

  if (!profile) {
    redirect("/login");
  }

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return { user, profile };
}
