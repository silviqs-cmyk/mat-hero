import type { User } from "@supabase/supabase-js";
import {
  getUserWithRecovery,
  signOutAndClearBrowserSession,
} from "@/lib/auth/browserSession";
import {
  DEFAULT_GOAL_SCORE,
  DEFAULT_STUDENT_GRADE,
  getPostAuthRedirectPath,
  hasRequiredProfileName,
  normalizeProfileFullName,
} from "@/lib/auth/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getPublicSupabaseEnv } from "@/lib/supabase/env";
import type { UserProfile } from "@/types/user";

interface StudentAuthInput {
  email: string;
  password: string;
}

interface StudentSignUpInput extends StudentAuthInput {
  fullName: string;
  grade?: number;
  goalScore?: number;
}

interface AuthResult {
  error: string | null;
  redirectTo: string | null;
  profile: UserProfile | null;
  requiresEmailConfirmation?: boolean;
}

async function checkCurrentAdminAccess() {
  const response = await fetch("/api/admin/access", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Could not verify admin access.");
  }

  const data = (await response.json()) as { allowed?: boolean };
  return data.allowed === true;
}

export async function isCurrentEmailAllowedAdmin(email: string) {
  void email;
  return checkCurrentAdminAccess();
}

function getSupabaseHostname(): string | null {
  try {
    const { url } = getPublicSupabaseEnv();
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function errorContainsNetworkHint(error: unknown, patterns: string[]) {
  const causeText =
    error instanceof Error && "cause" in error ? String(error.cause ?? "") : "";
  const normalized = `${error instanceof Error ? error.message : String(error ?? "")} ${causeText}`.toLowerCase();

  return patterns.some((pattern) => normalized.includes(pattern));
}

function getNetworkErrorMessage(error: unknown): string {
  const hostname = getSupabaseHostname();

  if (errorContainsNetworkHint(error, ["enotfound", "getaddrinfo", "name not resolved", "dns"])) {
    return hostname
      ? `Не успяхме да намерим Supabase адреса ${hostname}. Провери NEXT_PUBLIC_SUPABASE_URL в .env.local и рестартирай dev сървъра.`
      : "Не успяхме да намерим Supabase адреса. Провери NEXT_PUBLIC_SUPABASE_URL в .env.local и рестартирай dev сървъра.";
  }

  if (error instanceof Error && error.message) {
    if (error.message === "Failed to fetch" || error.message === "fetch failed") {
      return hostname
        ? `Неуспешна връзка със Supabase (${hostname}). Провери Project URL, дали проектът е активен и дали имаш достъп до интернет.`
        : "Неуспешна връзка със Supabase. Провери Project URL и интернет връзката.";
    }

    return error.message;
  }

  return "Неуспешна връзка със Supabase. Провери Project URL и интернет връзката.";
}

function getFriendlyInvalidCredentialsMessage() {
  return "Имейлът или паролата не са правилни.";
}

function getFriendlyUnconfirmedEmailMessage() {
  return "Профилът не е потвърден. Провери имейла си или се свържи с администратора.";
}

function normalizeAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return getFriendlyInvalidCredentialsMessage();
  }

  if (normalized.includes("email not confirmed")) {
    return getFriendlyUnconfirmedEmailMessage();
  }

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests")
  ) {
    return "Изпратихме твърде много имейли за кратко. Изчакай малко и пробвай пак.";
  }

  if (normalized.includes("user already registered")) {
    return "Този имейл вече е регистриран. Влез в профила си.";
  }

  return message;
}

function getAuthRedirectUrl(): string | undefined {
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  if (!publicSiteUrl) {
    return undefined;
  }

  try {
    return new URL(publicSiteUrl).toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

function getProfileSeedFromUser(user: User) {
  const fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  return {
    full_name: fullName,
    email: user.email ?? null,
  };
}

export async function getCurrentUserClient(): Promise<User | null> {
  return getUserWithRecovery({ redirect: true });
}

export async function getClientProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as UserProfile | null) ?? null;
}

async function ensureStudentProfile(
  user: User,
  overrides?: Partial<Pick<UserProfile, "full_name" | "email" | "grade" | "goal_score">>,
): Promise<UserProfile> {
  const supabase = getSupabaseBrowserClient();
  const seed = getProfileSeedFromUser(user);
  const normalizedFullName = normalizeProfileFullName(overrides?.full_name ?? seed.full_name);
  const payload = {
    id: user.id,
    full_name: normalizedFullName || null,
    email: overrides?.email ?? seed.email,
    role: "student" as const,
    grade: overrides?.grade ?? DEFAULT_STUDENT_GRADE,
    goal_score: overrides?.goal_score ?? DEFAULT_GOAL_SCORE,
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

export async function signInStudent({
  email,
  password,
}: StudentAuthInput): Promise<AuthResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: normalizeAuthErrorMessage(error.message),
        redirectTo: null,
        profile: null,
      };
    }

    const authUser = data.user;
    if (!authUser) {
      return {
        error: "Не успяхме да заредим профила след вход.",
        redirectTo: null,
        profile: null,
      };
    }

    const profile = await getClientProfile(authUser.id);

    return {
      error: null,
      redirectTo: getPostAuthRedirectPath(profile),
      profile,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
      redirectTo: null,
      profile: null,
    };
  }
}

export async function signInAdmin({
  email,
  password,
}: StudentAuthInput): Promise<AuthResult> {
  try {
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail.length === 0) {
      return {
        error: "Нямаш достъп до админ панела.",
        redirectTo: null,
        profile: null,
      };
    }

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return {
        error: normalizeAuthErrorMessage(error.message),
        redirectTo: null,
        profile: null,
      };
    }

    const authUser = data.user;
    if (!authUser) {
      await supabase.auth.signOut();
      return {
        error: "Не успяхме да заредим админ профила.",
        redirectTo: null,
        profile: null,
      };
    }

    if (!(await checkCurrentAdminAccess())) {
      await supabase.auth.signOut();
      return {
        error: "Нямаш достъп до админ панела.",
        redirectTo: null,
        profile: null,
      };
    }

    const profile = await getClientProfile(authUser.id);

    if (!profile) {
      return {
        error: null,
        redirectTo: getPostAuthRedirectPath({
          id: authUser.id,
          full_name: null,
          email: authUser.email ?? normalizedEmail,
          role: "admin",
          grade: DEFAULT_STUDENT_GRADE,
          goal_score: DEFAULT_GOAL_SCORE,
          avatar_url: null,
          created_at: "",
          updated_at: "",
        }),
        profile: null,
      };
    }

    if (profile.role !== "admin") {
      await supabase.auth.signOut();
      return {
        error: "Нямаш администраторска роля.",
        redirectTo: null,
        profile,
      };
    }

    return {
      error: null,
      redirectTo: getPostAuthRedirectPath(profile),
      profile,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
      redirectTo: null,
      profile: null,
    };
  }
}

export async function signUpStudent({
  email,
  password,
  fullName,
  grade = DEFAULT_STUDENT_GRADE,
  goalScore = DEFAULT_GOAL_SCORE,
}: StudentSignUpInput): Promise<AuthResult> {
  try {
    const normalizedFullName = normalizeProfileFullName(fullName);

    if (!hasRequiredProfileName(normalizedFullName)) {
      return {
        error: "Името е задължително и трябва да е поне 2 символа.",
        redirectTo: null,
        profile: null,
        requiresEmailConfirmation: false,
      };
    }

    const supabase = getSupabaseBrowserClient();
    const emailRedirectTo = getAuthRedirectUrl();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        data: {
          full_name: normalizedFullName,
          role: "student",
          grade,
          goal_score: goalScore,
        },
      },
    });

    if (error) {
      return {
        error: normalizeAuthErrorMessage(error.message),
        redirectTo: null,
        profile: null,
        requiresEmailConfirmation: false,
      };
    }

    let profile: UserProfile | null = null;

    if (data.user && data.session) {
      profile = await ensureStudentProfile(data.user, {
        full_name: normalizedFullName,
        email,
        grade,
        goal_score: goalScore,
      });
    }

    return {
      error: null,
      redirectTo: data.session ? getPostAuthRedirectPath(profile) : null,
      profile,
      requiresEmailConfirmation: !data.session,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
      redirectTo: null,
      profile: null,
      requiresEmailConfirmation: false,
    };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = getSupabaseBrowserClient();
    const redirectTo = getAuthRedirectUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      ...(redirectTo ? { redirectTo } : {}),
    });

    return {
      error: error ? normalizeAuthErrorMessage(error.message) : null,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
    };
  }
}

export async function signOut() {
  try {
    await signOutAndClearBrowserSession();
    return {
      error: null,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
    };
  }
}

interface CompleteProfileInput {
  fullName: string;
  grade?: number;
  goalScore?: number;
}

export async function upsertCurrentUserProfile({
  fullName,
  grade = DEFAULT_STUDENT_GRADE,
  goalScore = DEFAULT_GOAL_SCORE,
}: CompleteProfileInput): Promise<AuthResult> {
  try {
    const normalizedFullName = normalizeProfileFullName(fullName);

    if (!hasRequiredProfileName(normalizedFullName)) {
      return {
        error: "Името е задължително и трябва да е поне 2 символа.",
        redirectTo: null,
        profile: null,
      };
    }

    const user = await getCurrentUserClient();

    if (!user) {
      return {
        error: "Сесията липсва. Влез отново.",
        redirectTo: "/login",
        profile: null,
      };
    }

    const existingProfile = await getClientProfile(user.id);
    const isAdmin =
      existingProfile?.role === "admin" ||
      (user.email ? await isCurrentEmailAllowedAdmin(user.email) : false);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: normalizedFullName,
          email: user.email ?? existingProfile?.email ?? null,
          role: isAdmin ? "admin" : "student",
          grade,
          goal_score: goalScore,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) {
      return {
        error: error.message,
        redirectTo: null,
        profile: null,
      };
    }

    const profile = data as UserProfile;

    return {
      error: null,
      redirectTo: getPostAuthRedirectPath(profile),
      profile,
    };
  } catch (error) {
    return {
      error: getNetworkErrorMessage(error),
      redirectTo: null,
      profile: null,
    };
  }
}

export async function signIn(email: string, password: string) {
  return signInStudent({ email, password });
}

export async function signUp(input: StudentSignUpInput) {
  return signUpStudent(input);
}

export { getNetworkErrorMessage };
