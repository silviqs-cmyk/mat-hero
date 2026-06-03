import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getServerProfile, getServerUser } from "@/lib/auth/server";
import type { UserProfile } from "@/types/user";

interface AdminAccessResult {
  user: User;
  profile: UserProfile;
}

export interface AdminAccessState {
  allowed: boolean;
  reason: "ok" | "missing_user" | "email_not_allowed" | "missing_profile" | "wrong_role";
  user: User | null;
  profile: UserProfile | null;
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

export async function getCurrentAdminAccessState(): Promise<AdminAccessState> {
  const user = await getServerUser();

  if (!user) {
    return {
      allowed: false,
      reason: "missing_user",
      user: null,
      profile: null,
    };
  }

  if (!isAllowedAdminEmail(user.email)) {
    return {
      allowed: false,
      reason: "email_not_allowed",
      user,
      profile: null,
    };
  }

  const profile = await getServerProfile(user.id);

  if (!profile) {
    return {
      allowed: false,
      reason: "missing_profile",
      user,
      profile: null,
    };
  }

  if (profile.role !== "admin") {
    return {
      allowed: false,
      reason: "wrong_role",
      user,
      profile,
    };
  }

  return {
    allowed: true,
    reason: "ok",
    user,
    profile,
  };
}

export async function requireAdminAccess(): Promise<AdminAccessResult> {
  const access = await getCurrentAdminAccessState();

  if (!access.allowed || !access.user || !access.profile) {
    redirect("/admin/login");
  }

  return { user: access.user, profile: access.profile };
}
