import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerProfile, getServerUser } from "@/lib/auth/server";
import type { UserProfile } from "@/types/user";

interface AdminAccessResult {
  user: User;
  profile: UserProfile;
}

function getAdminEmailAllowlist() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getAdminEmailAllowlist().includes(email.trim().toLowerCase());
}

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const user = await getServerUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  const profile = await getServerProfile(user.id);

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }

  return { user, profile };
}
