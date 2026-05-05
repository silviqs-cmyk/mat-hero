"use client";

import { useEffect, useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import {
  getPublicSupabaseEnv,
  getSupabaseEnvDebugFlags,
} from "@/lib/supabase/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

interface DiagnosticState {
  hostname: string | null;
  anonKeyPrefix: string | null;
  envError: string | null;
  sessionStatus: "idle" | "success" | "error";
  sessionMessage: string;
  coursesStatus: "idle" | "success" | "error";
  coursesMessage: string;
}

const initialState: DiagnosticState = {
  hostname: null,
  anonKeyPrefix: null,
  envError: null,
  sessionStatus: "idle",
  sessionMessage: "РќРµ Рµ СЃС‚Р°СЂС‚РёСЂР°РЅРѕ.",
  coursesStatus: "idle",
  coursesMessage: "РќРµ Рµ СЃС‚Р°СЂС‚РёСЂР°РЅРѕ.",
};

function StatusBadge({
  status,
}: {
  status: "idle" | "success" | "error";
}) {
  const tone =
    status === "success"
      ? "mh-badge mh-badge--green"
      : status === "error"
        ? "mh-badge mh-badge--gold"
        : "mh-badge mh-badge--neutral";

  const label =
    status === "success" ? "OK" : status === "error" ? "Error" : "Idle";

  return <span className={tone}>{label}</span>;
}

function formatDebugValue(value: unknown) {
  if (value === null) {
    return "null";
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function SupabaseDebugClient() {
  const [state, setState] = useState<DiagnosticState>(initialState);
  const [isRunning, setIsRunning] = useState(false);

  async function runDiagnostics() {
    setIsRunning(true);

    const flags = getSupabaseEnvDebugFlags();

    try {
      const { url, anonKey } = getPublicSupabaseEnv();
      const supabase = getSupabaseBrowserClient();
      const hostname = new URL(url).hostname;
      const anonKeyPrefix = anonKey.slice(0, 15);

      setState((current) => ({
        ...current,
        hostname,
        anonKeyPrefix,
        envError: null,
        sessionStatus: "idle",
        sessionMessage: "РР·РїСЂР°С‰Р°РЅРµ РЅР° Р·Р°СЏРІРєР°...",
        coursesStatus: "idle",
        coursesMessage: "РР·РїСЂР°С‰Р°РЅРµ РЅР° Р·Р°СЏРІРєР°...",
      }));

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        setState((current) => ({
          ...current,
          sessionStatus: error ? "error" : "success",
          sessionMessage: error
            ? error.message
            : session
              ? "РРјР° Р°РєС‚РёРІРЅР° session."
              : "РќСЏРјР° Р°РєС‚РёРІРЅР° session, РЅРѕ Р·Р°СЏРІРєР°С‚Р° РјРёРЅР° СѓСЃРїРµС€РЅРѕ.",
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          sessionStatus: "error",
          sessionMessage:
            error instanceof Error ? error.message : "Unknown session error.",
        }));
      }

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("id,title,slug,is_published")
          .limit(5);

        setState((current) => ({
          ...current,
          coursesStatus: error ? "error" : "success",
          coursesMessage: [
            `data.length: ${Array.isArray(data) ? data.length : "n/a"}`,
            `error: ${formatDebugValue(error)}`,
            `data: ${formatDebugValue(data)}`,
          ].join("\n\n"),
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          coursesStatus: "error",
          coursesMessage: [
            "Query threw before Supabase returned a response.",
            `error: ${formatDebugValue(error instanceof Error ? { message: error.message } : error)}`,
          ].join("\n\n"),
        }));
      }
    } catch (error) {
      setState({
        hostname: null,
        anonKeyPrefix: flags.hasPublicAnonKey
          ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").slice(0, 15)
          : null,
        envError: error instanceof Error ? error.message : "Unknown env error.",
        sessionStatus: "error",
        sessionMessage: "РџСЂРѕРїСѓСЃРЅР°С‚Рѕ Р·Р°СЂР°РґРё env РїСЂРѕР±Р»РµРј.",
        coursesStatus: "error",
        coursesMessage: "РџСЂРѕРїСѓСЃРЅР°С‚Рѕ Р·Р°СЂР°РґРё env РїСЂРѕР±Р»РµРј.",
      });
    } finally {
      setIsRunning(false);
    }
  }

  useEffect(() => {
    void runDiagnostics();
  }, []);

  const flags = getSupabaseEnvDebugFlags();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <NeonCard padding="lg" className="space-y-4">
        <div className="space-y-2">
          <p className="mh-label">Supabase Debug</p>
          <h1 className="mh-heading-lg">Р’СЂРµРјРµРЅРЅР° СЃС‚СЂР°РЅРёС†Р° Р·Р° РґРёР°РіРЅРѕСЃС‚РёРєР°</h1>
          <p className="mh-copy-muted">
            РўР°Р·Рё СЃС‚СЂР°РЅРёС†Р° РїСЂРѕРІРµСЂСЏРІР° env РЅР°СЃС‚СЂРѕР№РєРёС‚Рµ, auth session-Р° Рё Р±Р°Р·РѕРІ read РєСЉРј
            `courses`.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <NeonButton
            type="button"
            variant="primary"
            className="sm:min-w-[220px]"
            onClick={() => void runDiagnostics()}
            disabled={isRunning}
          >
            {isRunning ? "РџСЂРѕРІРµСЂРєР°..." : "РџСѓСЃРЅРё РїСЂРѕРІРµСЂРєР° РѕС‚РЅРѕРІРѕ"}
          </NeonButton>
        </div>
      </NeonCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <NeonCard padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">1. Env СЃС‚Р°С‚СѓСЃ</h2>
            <StatusBadge status={state.envError ? "error" : "success"} />
          </div>

          <div className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
              <div>`NEXT_PUBLIC_SUPABASE_URL` РЅР°Р»РёС‡РµРЅ: {String(flags.hasPublicUrl)}</div>
              <div>`NEXT_PUBLIC_SUPABASE_URL` РІР°Р»РёРґРµРЅ: {String(flags.publicUrlLooksValid)}</div>
              <div>`NEXT_PUBLIC_SUPABASE_ANON_KEY` РЅР°Р»РёС‡РµРЅ: {String(flags.hasPublicAnonKey)}</div>
              <div>`NEXT_PUBLIC_SUPABASE_ANON_KEY` РІР°Р»РёРґРµРЅ: {String(flags.publicKeyLooksValid)}</div>
              <div>`SUPABASE_SERVICE_ROLE_KEY` РЅР°Р»РёС‡РµРЅ: {String(flags.hasServiceRoleKey)}</div>
            </div>

            <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4">
              <div>Hostname: {state.hostname ?? "n/a"}</div>
              <div>Anon key prefix: {state.anonKeyPrefix ?? "n/a"}</div>
            </div>

            {state.envError ? (
              <div className="rounded-[1.25rem] border border-rose-400/30 bg-rose-400/10 p-4 whitespace-pre-wrap text-rose-100">
                {state.envError}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border border-emerald-400/25 bg-emerald-400/10 p-4 text-emerald-100">
                Env РїСЂРѕРІРµСЂРєР°С‚Р° РјРёРЅР° СѓСЃРїРµС€РЅРѕ.
              </div>
            )}
          </div>
        </NeonCard>

        <NeonCard padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">2. Session check</h2>
            <StatusBadge status={state.sessionStatus} />
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-white/4 p-4 text-sm text-slate-200">
            {state.sessionMessage}
          </div>
        </NeonCard>

        <NeonCard padding="lg" className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">3. Courses select</h2>
            <StatusBadge status={state.coursesStatus} />
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.25rem] border border-white/10 bg-white/4 p-4 text-sm text-slate-200">
            {state.coursesMessage}
          </pre>
        </NeonCard>
      </div>
    </div>
  );
}
