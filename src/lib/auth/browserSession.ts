"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { Session, User } from "@supabase/supabase-js";

interface RouterLike {
  replace: (href: string) => void;
}

interface SessionRecoveryOptions {
  pathname?: string | null;
  redirect?: boolean;
  router?: RouterLike;
}

const INVALID_REFRESH_TOKEN_PATTERNS = [
  "invalid refresh token",
  "refresh token not found",
];
const MISSING_SESSION_PATTERNS = [
  "auth session missing",
  "session missing",
];
const STUDENT_PROTECTED_PREFIXES = ["/course", "/dashboard", "/day", "/profile", "/report", "/roadmap"];

let sessionRecoveryPromise: Promise<string> | null = null;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  return String(error ?? "");
}

function clearSupabaseStorage() {
  if (typeof window === "undefined") {
    return;
  }

  const clearFromStorage = (storage: Storage) => {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);

      if (key?.startsWith("sb-") && key.includes("-auth-token")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      storage.removeItem(key);
    });
  };

  clearFromStorage(window.localStorage);
  clearFromStorage(window.sessionStorage);
}

function getCurrentPathname() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location.pathname;
}

export function isInvalidRefreshTokenError(error: unknown) {
  const normalizedMessage = getErrorMessage(error).toLowerCase();
  return INVALID_REFRESH_TOKEN_PATTERNS.some((pattern) => normalizedMessage.includes(pattern));
}

export function isMissingSessionError(error: unknown) {
  const normalizedMessage = getErrorMessage(error).toLowerCase();
  return MISSING_SESSION_PATTERNS.some((pattern) => normalizedMessage.includes(pattern));
}

export function getAuthRedirectPath(pathname?: string | null) {
  return pathname?.startsWith("/admin") ? "/admin/login" : "/login";
}

export function isProtectedAppRoute(pathname?: string | null) {
  if (!pathname) {
    return false;
  }

  if (pathname === "/admin") {
    return true;
  }

  if (pathname.startsWith("/admin/")) {
    return pathname !== "/admin/login";
  }

  return STUDENT_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function signOutAndClearBrowserSession() {
  clearSupabaseStorage();

  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  } catch {
    // Clearing local session is enough to recover from invalid refresh token state.
  } finally {
    clearSupabaseStorage();
  }
}

export async function recoverInvalidBrowserSession(options: SessionRecoveryOptions = {}) {
  if (!sessionRecoveryPromise) {
    sessionRecoveryPromise = (async () => {
      await signOutAndClearBrowserSession();
      return getAuthRedirectPath(options.pathname ?? getCurrentPathname());
    })().finally(() => {
      sessionRecoveryPromise = null;
    });
  }

  const redirectPath = await sessionRecoveryPromise;

  if (options.redirect === false || typeof window === "undefined") {
    return redirectPath;
  }

  if (window.location.pathname === redirectPath) {
    return redirectPath;
  }

  if (options.router) {
    options.router.replace(redirectPath);
    return redirectPath;
  }

  window.location.replace(redirectPath);
  return redirectPath;
}

export async function getSessionWithRecovery(
  options: SessionRecoveryOptions = {},
): Promise<Session | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      if (isMissingSessionError(error)) {
        return null;
      }

      if (isInvalidRefreshTokenError(error)) {
        await recoverInvalidBrowserSession(options);
        return null;
      }

      throw error;
    }

    return session;
  } catch (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    if (isInvalidRefreshTokenError(error)) {
      await recoverInvalidBrowserSession(options);
      return null;
    }

    throw error;
  }
}

export async function getUserWithRecovery(
  options: SessionRecoveryOptions = {},
): Promise<User | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      if (isMissingSessionError(error)) {
        return null;
      }

      if (isInvalidRefreshTokenError(error)) {
        await recoverInvalidBrowserSession(options);
        return null;
      }

      throw error;
    }

    return user;
  } catch (error) {
    if (isMissingSessionError(error)) {
      return null;
    }

    if (isInvalidRefreshTokenError(error)) {
      await recoverInvalidBrowserSession(options);
      return null;
    }

    throw error;
  }
}
