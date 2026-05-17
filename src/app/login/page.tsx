"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { getSessionWithRecovery } from "@/lib/auth/browserSession";
import { getPostAuthRedirectPath } from "@/lib/auth/profile";
import { getClientProfile, getNetworkErrorMessage, signInStudent } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSessionWithRecovery({
          pathname: "/login",
          redirect: true,
          router,
        });

        if (!session?.user) {
          return;
        }

        const profile = await getClientProfile(session.user.id);
        router.replace(getPostAuthRedirectPath(profile));
      } catch (error) {
        setErrorText(getNetworkErrorMessage(error));
      }
    }

    void checkSession();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");
    setLoading(true);

    try {
      const result = await signInStudent({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setErrorText(result.error);
        return;
      }

      router.push(result.redirectTo ?? "/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="MatHero"
      title="Продължи с MatHero"
      description="Продължи подготовката си за НВО."
      hideIntro
    >
      <NeonCard padding="lg" className="w-full">
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
            placeholder="Въведи паролата си"
            autoComplete="current-password"
          />

          {errorText ? (
            <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorText}
            </div>
          ) : null}

          <NeonButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Зареждане..." : "Вход"}
          </NeonButton>
        </form>

        <div className="mt-5 space-y-3 text-center text-sm">
          <Link href="/register" className="block font-medium text-cyan-200 transition hover:text-cyan-100">
            Създай профил
          </Link>
          <Link href="/forgot-password" className="block text-[var(--mh-text-muted)] transition hover:text-white">
            Забравена парола?
          </Link>
        </div>
      </NeonCard>
    </AuthShell>
  );
}
