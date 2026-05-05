"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { getNetworkErrorMessage, signIn } from "@/lib/auth/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface LoginFormCardProps {
  title?: string;
  description?: string;
}

export function LoginFormCard({
  title = "Добре дошъл обратно",
  description = "Влез с имейла и паролата си, за да отвориш курса.",
}: LoginFormCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace("/dashboard");
        }
      } catch (error) {
        setErrorText(getNetworkErrorMessage(error));
      }
    }

    void checkSession();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");

    if (!email.trim()) {
      setErrorText("Имейлът е задължителен.");
      return;
    }

    if (!password) {
      setErrorText("Паролата е задължителна.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        setErrorText(error);
        return;
      }

      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <NeonCard padding="lg" className="mx-auto w-full max-w-xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="mh-label">Student Login</p>
          <h2 className="mh-heading-lg">{title}</h2>
          <p className="mh-copy-muted text-sm">{description}</p>
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <FormInput
            type="email"
            label="Имейл"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hero@student.bg"
            autoComplete="email"
          />

          <FormInput
            type="password"
            label="Парола"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Минимум 6 символа"
            autoComplete="current-password"
          />

          {errorText ? (
            <div className="rounded-[1.25rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorText}
            </div>
          ) : null}

          <NeonButton type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Влизане..." : "Влез в профила"}
          </NeonButton>
        </form>

        <p className="text-sm text-slate-300">
          Нямаш профил?{" "}
          <Link href="/register" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
            Регистрирай се
          </Link>
        </p>
      </div>
    </NeonCard>
  );
}
