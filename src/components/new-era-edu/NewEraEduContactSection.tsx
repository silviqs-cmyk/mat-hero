"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail, MessageSquareText } from "lucide-react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

const initialState: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  message: "",
};

export function NewEraEduContactSection() {
  const [form, setForm] = useState<FormState>(initialState);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = encodeURIComponent(`Запитване от ${form.firstName} ${form.lastName}`.trim());
    const body = encodeURIComponent(
      [
        `Име: ${form.firstName}`,
        `Фамилия: ${form.lastName}`,
        `Имейл: ${form.email}`,
        "",
        "Съобщение:",
        form.message,
      ].join("\n"),
    );

    window.location.href = `mailto:info@neweraedu.bg?subject=${subject}&body=${body}`;
  };

  return (
    <section id="kontakt" className="scroll-mt-36 px-4 py-20 sm:scroll-mt-40 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-slate-200 bg-white px-8 py-8 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:px-10 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-600">
            <MessageSquareText className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.02em] text-[#173979]">Контакти</h2>
          <div className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          <p className="mt-6 max-w-xl text-lg font-normal leading-8 text-slate-600">
            Ако искаш да се свържеш с нас за партньорство, въпроси или идеи, изпрати ни съобщение и ще ти отговорим по
            имейл.
          </p>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#fbfcff_0%,#f6f8ff_100%)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 text-cyan-700">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Имейл за контакт</p>
                <a href="mailto:info@neweraedu.bg" className="mt-2 inline-block text-lg font-medium text-[#2450a6]">
                  info@neweraedu.bg
                </a>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Име
              <input
                required
                type="text"
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Фамилия
              <input
                required
                type="text"
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Имейл
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Съобщение
            <textarea
              required
              rows={7}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              className="resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-cyan-300 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              className="new-era-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
            >
              Изпрати съобщение
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-sm font-normal leading-6 text-slate-500">
              Формата ще отвори имейл до `info@neweraedu.bg`.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
