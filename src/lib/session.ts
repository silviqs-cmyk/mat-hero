const SESSION_KEY = "maturohero-session-id";

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "server-session";
  }

  const existing = window.localStorage.getItem(SESSION_KEY);

  if (existing) {
    return existing;
  }

  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}`;

  window.localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}
