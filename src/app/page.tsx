"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { signInWithEmail, signUpWithEmail, supabase } from "@/lib/supabaseClient";

const floatingSymbols = [
  {
    id: "percent-left",
    type: "text" as const,
    content: "%",
    className:
      "absolute left-[6%] top-[18%] text-xl font-light text-cyan-300 drop-shadow-[0_0_12px_rgba(37,221,255,0.8)]",
    duration: 9,
    delay: 0.2,
    rotate: -18,
  },
  {
    id: "x2-right",
    type: "text" as const,
    content: "x²",
    className:
      "absolute right-[7%] top-[17%] text-xl font-light text-pink-400 drop-shadow-[0_0_12px_rgba(255,78,209,0.75)]",
    duration: 10,
    delay: 0.7,
    rotate: 14,
  },
  {
    id: "plus-top",
    type: "text" as const,
    content: "+",
    className:
      "absolute left-[13%] top-[9%] text-lg font-light text-lime-200 drop-shadow-[0_0_10px_rgba(201,255,0,0.72)]",
    duration: 7.5,
    delay: 0.4,
    rotate: 12,
  },
  {
    id: "divide-top",
    type: "text" as const,
    content: "÷",
    className:
      "absolute right-[15%] top-[12%] text-lg font-light text-cyan-200 drop-shadow-[0_0_10px_rgba(37,221,255,0.72)]",
    duration: 8.4,
    delay: 1.1,
    rotate: -10,
  },
  {
    id: "triangle-left",
    type: "triangle" as const,
    className:
      "absolute left-[4%] top-[52%] h-10 w-10 overflow-visible text-indigo-300 drop-shadow-[0_0_10px_rgba(129,140,248,0.6)]",
    duration: 11,
    delay: 0.9,
    rotate: -12,
  },
  {
    id: "sqrt-right",
    type: "text" as const,
    content: "√",
    className:
      "absolute right-[8%] top-[60%] text-lg font-light text-pink-300 drop-shadow-[0_0_10px_rgba(255,78,209,0.66)]",
    duration: 8.8,
    delay: 0.5,
    rotate: 9,
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      if (!supabase) {
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    }

    void checkSession();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!email || !password) {
      setErrorText("Попълни имейл и парола.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErrorText("Паролите не съвпадат.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);

        if (error) {
          setErrorText(error);
          return;
        }

        router.push("/dashboard");
        return;
      }

      const { error } = await signUpWithEmail(email, password);

      if (error) {
        setErrorText(error);
        return;
      }

      setSuccessText(
        "Профилът е създаден. Ако Supabase изисква email потвърждение, провери пощата си.",
      );
      setMode("login");
      setConfirmPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070d] px-5 py-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(37,221,255,0.16),transparent_18%),radial-gradient(circle_at_22%_74%,rgba(182,92,255,0.16),transparent_24%),radial-gradient(circle_at_82%_55%,rgba(255,78,209,0.12),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,rgba(143,244,255,0.7)_0_1px,transparent_1px)] [background-position:18px_32px] [background-size:58px_58px]" />

      {floatingSymbols.map((symbol) => (
        <motion.div
          key={symbol.id}
          className={`pointer-events-none ${symbol.className}`}
          initial={{ opacity: 0.24, rotate: symbol.rotate, scale: 0.92 }}
          animate={{
            opacity: [0.25, 0.75, 0.3],
            rotate: [symbol.rotate, symbol.rotate + 18, symbol.rotate],
            y: [0, -8, 0, 6, 0],
            scale: [0.94, 1.04, 0.97],
          }}
          transition={{
            duration: symbol.duration,
            delay: symbol.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {symbol.type === "triangle" ? (
            <svg viewBox="0 0 70 70" className="h-full w-full overflow-visible">
              <path d="M8 60 L24 8 L62 56 Z" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="49" cy="50" r="1.5" fill="currentColor" />
            </svg>
          ) : (
            symbol.content
          )}
        </motion.div>
      ))}

      <main className="relative z-10 flex min-h-[calc(100vh-4.5rem)] flex-col items-center text-center">
        <section className="mt-[76px] w-full max-w-[360px]">
          <header className="relative mb-7 flex items-center justify-center">
            <div className="flex w-full items-center justify-center gap-3 rounded-[28px] px-4 py-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                <AnimatedHeroMascot size="sm" animated={false} />
              </div>
              <span className="font-display text-[2.55rem] font-black leading-none tracking-tight text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.08)]">
                MatHero
              </span>
            </div>
          </header>

          <div className="panel-glow rounded-[28px] p-5 text-left shadow-[0_0_34px_rgba(37,221,255,0.12)]">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorText("");
                  setSuccessText("");
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "login"
                    ? "border border-cyan-300/70 bg-cyan-400/10 text-cyan-100 shadow-[0_0_18px_rgba(37,221,255,0.2)]"
                    : "border border-cyan-300/35 bg-cyan-400/5 text-white/80 shadow-[0_0_14px_rgba(37,221,255,0.1)]"
                }`}
              >
                Вход
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorText("");
                  setSuccessText("");
                }}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "register"
                    ? "border border-pink-300/70 bg-pink-400/10 text-pink-100 shadow-[0_0_18px_rgba(255,78,209,0.2)]"
                    : "border border-pink-300/35 bg-pink-400/5 text-white/80 shadow-[0_0_14px_rgba(255,78,209,0.1)]"
                }`}
              >
                Регистрация
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  Имейл
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="hero@student.bg"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                  Парола
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
                />
              </label>

              {mode === "register" ? (
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Повтори парола
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300/40"
                  />
                </label>
              ) : null}

              {errorText ? (
                <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {errorText}
                </div>
              ) : null}

              {successText ? (
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                  {successText}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="btn-neon-primary mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-2xl text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading
                  ? "Изчакване..."
                  : mode === "login"
                    ? "Влез в приложението"
                    : "Създай профил"}
                <span className="text-lg leading-none">›</span>
              </button>
            </form>

            <p className="mt-3 text-center text-xs text-white/55">
              Реален вход с Supabase Auth. Ако регистрацията изисква потвърждение,
              провери пощата си.
            </p>
          </div>

          <p className="mx-auto mt-5 max-w-[310px] text-center text-sm leading-5 text-white/78">
            10 дни. Ясна стратегия. Реални резултати.
            <br />
            Подготви се уверено и постигни отличен резултат.
          </p>
        </section>
      </main>
    </div>
  );
}
