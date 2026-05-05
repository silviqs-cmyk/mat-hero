"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { sendPasswordResetEmail } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorText("");
    setSuccessText("");

    if (!email.trim()) {
      setErrorText("Имейлът е задължителен.");
      return;
    }

    setLoading(true);

    try {
      const result = await sendPasswordResetEmail(email.trim());

      if (result.error) {
        setErrorText(result.error);
        return;
      }

      setSuccessText("Изпратихме инструкции за смяна на паролата.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Възстановяване"
      title="Нова парола"
      description="Изпрати линк за възстановяване."
    >
      <NeonCard padding="lg" className="mx-auto w-full max-w-xl">
        <div className="space-y-6">
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
            <FormInput
              type="email"
              label="Имейл"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="hero@student.bg"
              autoComplete="email"
            />

            {errorText ? (
              <div className="rounded-[1.25rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {errorText}
              </div>
            ) : null}

            {successText ? (
              <div className="rounded-[1.25rem] border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
                {successText}
              </div>
            ) : null}

            <NeonButton type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? "Изпращане..." : "Изпрати линк"}
            </NeonButton>
          </form>

          <p className="text-sm text-slate-300">
            <Link href="/login" className="font-semibold text-cyan-200 transition hover:text-cyan-100">
              Назад към входа
            </Link>
          </p>
        </div>
      </NeonCard>
    </AuthShell>
  );
}
