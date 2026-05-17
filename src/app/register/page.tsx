"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { FormSelect } from "@/components/ui/FormSelect";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { getSessionWithRecovery } from "@/lib/auth/browserSession";
import {
  DEFAULT_GOAL_SCORE,
  DEFAULT_STUDENT_GRADE,
  getPostAuthRedirectPath,
  normalizeProfileFullName,
} from "@/lib/auth/profile";
import { getClientProfile, getNetworkErrorMessage, signUpStudent } from "@/lib/auth/client";

const gradeOptions = Array.from({ length: 6 }, (_, index) => index + 5);

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [grade, setGrade] = useState(String(DEFAULT_STUDENT_GRADE));
  const [goalScore, setGoalScore] = useState(String(DEFAULT_GOAL_SCORE));
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedGoalScore = useMemo(() => Number(goalScore), [goalScore]);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSessionWithRecovery({
          pathname: "/register",
          redirect: true,
          router,
        });

        if (session?.user) {
          const profile = await getClientProfile(session.user.id);
          router.replace(getPostAuthRedirectPath(profile));
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
    setSuccessText("");

    const normalizedFullName = normalizeProfileFullName(fullName);

    if (normalizedFullName.length < 2) {
      setErrorText("Името е задължително и трябва да е поне 2 символа.");
      return;
    }

    if (!email.trim()) {
      setErrorText("Имейлът е задължителен.");
      return;
    }

    if (!password) {
      setErrorText("Паролата е задължителна.");
      return;
    }

    if (password.length < 6) {
      setErrorText("Паролата трябва да е поне 6 символа.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorText("Паролата и потвърждението не съвпадат.");
      return;
    }

    if (!Number.isFinite(normalizedGoalScore) || normalizedGoalScore < 0 || normalizedGoalScore > 100) {
      setErrorText("Целевият резултат трябва да е между 0 и 100.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpStudent({
        email: email.trim(),
        password,
        fullName: normalizedFullName,
        grade: Number(grade),
        goalScore: normalizedGoalScore,
      });

      if (result.error) {
        setErrorText(result.error);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setSuccessText("Провери имейла си, за да потвърдиш профила.");
        return;
      }

      router.push(result.redirectTo ?? "/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell eyebrow="Регистрация" title="Създай профил" description="Започни подготовката си с няколко бързи стъпки.">
      <NeonCard padding="lg" className="w-full">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
          <FormInput
            type="text"
            label="Име"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Иван Петров"
            autoComplete="name"
            required
          />

          <FormInput
            type="email"
            label="Имейл"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="hero@student.bg"
            autoComplete="email"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              type="password"
              label="Парола"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Минимум 6 символа"
              autoComplete="new-password"
              required
            />

            <FormInput
              type="password"
              label="Потвърди паролата"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Повтори паролата"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormSelect label="Клас" value={grade} onChange={(event) => setGrade(event.target.value)}>
              {gradeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} клас
                </option>
              ))}
            </FormSelect>

            <FormInput
              type="number"
              label="Целеви резултат"
              value={goalScore}
              onChange={(event) => setGoalScore(event.target.value)}
              min={0}
              max={100}
              step={1}
            />
          </div>

          {errorText ? (
            <div className="rounded-[1rem] border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorText}
            </div>
          ) : null}

          {successText ? (
            <div className="rounded-[1rem] border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
              {successText}
            </div>
          ) : null}

          <NeonButton type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
            {loading ? "Създаване..." : "Създай профил"}
          </NeonButton>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--mh-text-muted)]">
          Вече имаш профил?{" "}
          <Link href="/login" className="font-medium text-cyan-200 transition hover:text-cyan-100">
            Влез
          </Link>
        </p>
      </NeonCard>
    </AuthShell>
  );
}
