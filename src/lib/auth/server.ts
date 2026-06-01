import "server-only";

import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  DEFAULT_GOAL_SCORE,
  DEFAULT_STUDENT_GRADE,
  normalizeProfileFullName,
} from "@/lib/auth/profile";
import {
  createServerSupabaseClient,
  createServiceRoleSupabaseClient,
} from "@/lib/supabase/server";
import type { UserProfile } from "@/types/user";

interface StudentAccessResult {
  user: User;
  profile: UserProfile | null;
  onboardingMessage: string | null;
}

const INVALID_REFRESH_TOKEN_PATTERNS = [
  "invalid refresh token",
  "refresh token not found",
];
const MISSING_SESSION_PATTERNS = [
  "auth session missing",
  "session missing",
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return String(error ?? "");
}

function isRecoverableAuthError(error: unknown) {
  const normalizedMessage = getErrorMessage(error).toLowerCase();

  return (
    INVALID_REFRESH_TOKEN_PATTERNS.some((pattern) => normalizedMessage.includes(pattern)) ||
    MISSING_SESSION_PATTERNS.some((pattern) => normalizedMessage.includes(pattern))
  );
}

function isAllowedAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.trim().toLowerCase());
}

export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (isRecoverableAuthError(error)) {
        return null;
      }

      throw error;
    }

    return user;
  } catch (error) {
    if (isRecoverableAuthError(error)) {
      return null;
    }

    throw error;
  }
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

function getProfileSeedFromUser(user: User) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return {
    full_name: normalizeProfileFullName(fullName) || null,
    email: user.email ?? null,
  };
}

async function ensureServerStudentProfile(user: User): Promise<UserProfile> {
  const supabase = createServiceRoleSupabaseClient();
  const seed = getProfileSeedFromUser(user);
  const payload = {
    id: user.id,
    full_name: seed.full_name,
    email: seed.email,
    role: "student" as const,
    grade: DEFAULT_STUDENT_GRADE,
    goal_score: DEFAULT_GOAL_SCORE,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserProfile;
}

export async function requireAdmin() {
  const user = await getServerUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
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

export async function requireStudent(): Promise<StudentAccessResult> {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  let profile = await getServerProfile(user.id);

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  if (!profile) {
    try {
      profile = await ensureServerStudentProfile(user);
    } catch {
      return {
        user,
        profile: null,
        onboardingMessage:
          "Профилът ти още не е готов. Опитай да презаредиш страницата след малко или влез отново, за да довършим настройката.",
      };
    }
  }

  return { user, profile, onboardingMessage: null };
}
