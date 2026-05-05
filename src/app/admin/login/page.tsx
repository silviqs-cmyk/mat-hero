"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminAuthShell } from "@/components/auth/AdminAuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { getClientProfile, getNetworkErrorMessage, signInAdmin, signOut } from "@/lib/auth/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
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

        if (!session?.user) {
          return;
        }

        const profile = await getClientProfile(session.user.id);

        if (profile?.role === "admin") {
          router.replace("/admin");
          return;
        }

        await signOut();
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
      const result = await signInAdmin({
        email: email.trim(),
        password,
      });

      if (result.error) {
        setErrorText(result.error);
        return;
      }

      router.push(result.redirectTo ?? "/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminAuthShell title="Отвори админ панела" description="Управлявай съдържанието на MatHero.">
      <NeonCard tone="purple" padding="lg" className="w-full">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <FormInput
            type="email"
            label="Имейл"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@mathero.bg"
            autoComplete="email"
          />

          <FormInput
            type="password"
            label="Парола"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Въведи админ паролата"
            autoComplete="current-password"
          />

          {errorText ? (
            <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorText}
            </div>
          ) : null}

          <NeonButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Проверка..." : "Продължи"}
          </NeonButton>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--mh-text-muted)]">
          Търсиш ученическия профил?{" "}
          <Link href="/login" className="font-medium text-cyan-200 transition hover:text-cyan-100">
            MatHero
          </Link>
        </p>
      </NeonCard>
    </AdminAuthShell>
  );
}
