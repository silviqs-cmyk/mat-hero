import Image from "next/image";
import { BrandMark } from "@/components/BrandMark";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BookOpen, CheckCircle2, PenTool, Target, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const royalBlueHeadingClass = "text-[#1d3f91]";

const flowSteps = [
  {
    title: "Прочети",
    icon: BookOpen,
    iconShellClassName: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700",
    titleClassName: "text-fuchsia-700",
    copy: "Кратка теория с ясни обяснения и примери, за да тръгнеш уверено.",
  },
  {
    title: "Провери",
    icon: CheckCircle2,
    iconShellClassName: "border-emerald-300 bg-emerald-50 text-emerald-700",
    titleClassName: "text-emerald-700",
    copy: "Бърза самопроверка, за да видиш какво вече разбираш.",
  },
  {
    title: "Упражни",
    icon: PenTool,
    iconShellClassName: "border-cyan-300 bg-cyan-50 text-cyan-700",
    titleClassName: "text-cyan-700",
    copy: "Задачи с ритъм и постепенна трудност, без излишен шум.",
  },
  {
    title: "Изпитай се",
    icon: Target,
    iconShellClassName: "border-amber-300 bg-amber-50 text-amber-700",
    titleClassName: "text-amber-700",
    copy: "Режим като на реален тест, за да свикнеш със ситуацията.",
  },
  {
    title: "Резултат",
    icon: Trophy,
    iconShellClassName: "border-violet-300 bg-violet-50 text-violet-700",
    titleClassName: "text-violet-700",
    copy: "Получаваш ясна картина къде си силен и какво още да стегнеш.",
  },
] satisfies ReadonlyArray<{
  title: string;
  icon: LucideIcon;
  iconShellClassName: string;
  titleClassName: string;
  copy: string;
}>;

const programDays = [
  "Ден 1 · Основи и стартов ритъм",
  "Ден 2 · Числа, действия и уверен старт",
  "Ден 3 · Изрази и смятане без паника",
  "Ден 4 · Уравнения и логика на решението",
  "Ден 5 · Ъгли и триъгълници",
  "Ден 6 · Геометрия и чертежи",
  "Ден 7 · Лица, обиколки и приложения",
  "Ден 8 · Данни, вероятности и четене на информация",
  "Ден 9 · Смесени задачи и темпо",
  "Ден 10 · Финален преговор и тестова симулация",
] as const;

const faqItems = [
  {
    question: "За кого е MatHero?",
    answer:
      "За ученици, които искат ясен план за НВО, по-малко хаос и повече спокойствие в подготовката.",
  },
  {
    question: "Какво прави Питай Мат полезен?",
    answer:
      "Дава обяснение на разбираем език и помага, когато ученикът блокира и не знае откъде да започне.",
  },
  {
    question: "Подходящо ли е за работа всеки ден?",
    answer:
      "Да. Идеята е подготовката да върви на кратки, ясни стъпки, а не на дълги и изтощителни маратони.",
  },
  {
    question: "Има ли ясен прогрес?",
    answer:
      "Да. Ученикът минава през теория, проверка, упражнения и тест, така че напредъкът се усеща и вижда.",
  },
] as const;

export function HomeLandingPage() {
  return (
    <main className="text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(124,58,237,0.28),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.18),transparent_22%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.12),transparent_26%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BrandMark
              size="sm"
              title="MatHero"
              subtitle="Подготовка с план, ритъм и ясен напредък"
              animated={false}
            />

            <nav className="flex flex-wrap items-center gap-3 text-sm text-[var(--mh-text-soft)]">
              <a href="#kak-raboti" className="transition hover:text-white">
                Как работи
              </a>
              <a href="#programma" className="transition hover:text-white">
                Програма
              </a>
              <a href="#pitai-mat" className="transition hover:text-white">
                Питай Мат
              </a>
              <a href="#faq" className="transition hover:text-white">
                FAQ
              </a>
              <NeonButton href="#ranen-dostap" variant="primary" className="ml-0 sm:ml-2">
                Искам да започна
              </NeonButton>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
            <div className="max-w-2xl">
              <SectionLabel>НВО · 7. клас · 10-дневна мисия</SectionLabel>
              <h1 className="mt-4 max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl">
                Математика с ритъм, план и увереност за НВО.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--mh-text-soft)]">
                MatHero подрежда подготовката в ясен поток: учиш, проверяваш, упражняваш,
                тестваш се и виждаш резултата си без хаос и без лутане.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <NeonButton href="#ranen-dostap" variant="primary">
                  Започни 10-дневната програма
                </NeonButton>
                <NeonButton href="/login" variant="secondary">
                  Вход
                </NeonButton>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <NeonCard tone="muted" className="rounded-[1.5rem] border-white/10">
                  <p className="mh-card-title">Ясен ред</p>
                  <p className="mh-copy-sm mt-2">Без скачане между теми и без чудене откъде да започнеш.</p>
                </NeonCard>
                <NeonCard tone="muted" className="rounded-[1.5rem] border-white/10">
                  <p className="mh-card-title">Питай Мат</p>
                  <p className="mh-copy-sm mt-2">Помощ, когато ученикът блокира и има нужда от посока.</p>
                </NeonCard>
                <NeonCard tone="muted" className="rounded-[1.5rem] border-white/10">
                  <p className="mh-card-title">Реален прогрес</p>
                  <p className="mh-copy-sm mt-2">Следиш какво е научено и какво още иска внимание.</p>
                </NeonCard>
              </div>
            </div>

            <div className="grid gap-5">
              <NeonCard className="relative overflow-hidden rounded-[2rem] px-6 py-8">
                <div className="pointer-events-none absolute inset-x-8 bottom-0 h-16 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="grid items-center gap-6 md:grid-cols-[1fr_220px]">
                  <div>
                    <p className="mh-label">MatHero мисия</p>
                    <h2 className="mt-3 text-2xl font-bold text-white">
                      Учи с ритъм. Решавай спокойно. Яви се уверено.
                    </h2>
                  </div>
                  <div className="flex justify-center">
                    <AnimatedHeroMascot size="lg" />
                  </div>
                </div>
              </NeonCard>

              <div className="grid gap-5 sm:grid-cols-2">
                <NeonCard tone="cyan" className="rounded-[1.75rem]">
                  <p className="mh-label">Напредък</p>
                  <p className="mt-4 text-5xl font-black text-white">87%</p>
                  <div className="mh-progress mt-4">
                    <div className="mh-progress-track mh-progress-track--compact h-3 w-full">
                      <div className="mh-progress-fill--cyan h-full w-[87%] rounded-full" />
                    </div>
                  </div>
                  <p className="mh-copy-sm mt-3">Теория, упражнения и тестове в един последователен поток.</p>
                </NeonCard>

                <NeonCard tone="purple" className="rounded-[1.75rem]">
                  <p className="mh-label">Дневен ритъм</p>
                  <ul className="mt-4 space-y-3 text-sm text-[var(--mh-text-soft)]">
                    <li>15-20 мин теория</li>
                    <li>Бърза проверка на разбирането</li>
                    <li>Упражнения с постепенно вдигане на нивото</li>
                    <li>Финален тест и ясен резултат</li>
                  </ul>
                </NeonCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kak-raboti" className="bg-slate-50 px-4 py-18 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel className="text-cyan-700">Как работи MatHero</SectionLabel>
            <h2 className={`mt-4 text-4xl font-black tracking-tight ${royalBlueHeadingClass}`}>
              Един поток, който води ученика напред без задънени улици.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Подготовката не е просто списък със задачи. Тя е поредица от правилни следващи стъпки.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-5">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="relative flex justify-center">
                <article className="flex h-full w-full max-w-[15rem] flex-col items-center rounded-[1.75rem] border border-slate-300 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 text-center shadow-[0_22px_48px_rgba(15,23,42,0.12)]">
                  <span
                    className={`${step.iconShellClassName} flex h-16 w-16 items-center justify-center rounded-[1.35rem] border-2 shadow-none`}
                  >
                    <step.icon className="h-7 w-7 stroke-[2.4]" />
                  </span>
                  <h3 className={`mt-5 text-xl font-black ${step.titleClassName}`}>{step.title}</h3>
                  <p className="mt-3 text-base leading-7 text-slate-700">{step.copy}</p>
                </article>
                {index < flowSteps.length - 1 ? (
                  <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 text-3xl text-slate-300 lg:block">
                    →
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programma" className="bg-white px-4 py-18 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <SectionLabel className="text-cyan-700">10-дневна програма</SectionLabel>
              <h2 className={`mt-4 text-4xl font-black tracking-tight ${royalBlueHeadingClass}`}>
                Всеки ден има ясна цел, а не просто още материал.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Програмата е мислена така, че ученикът да усеща движение напред и да не губи темпо.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {programDays.map((dayLabel, index) => (
              <article
                key={dayLabel}
                className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">
                  Ден {index + 1}
                </p>
                <h3 className={`mt-3 text-lg font-bold ${royalBlueHeadingClass}`}>{dayLabel.replace(/^Ден \d+ · /, "")}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">Теория, проверка, упражнения и мини тест.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pitai-mat" className="bg-slate-50 px-4 py-18 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] bg-[linear-gradient(145deg,#0a1020,#131a34)] p-8 text-white shadow-[0_24px_60px_rgba(8,15,40,0.4)]">
            <SectionLabel>Питай Мат</SectionLabel>
            <h2 className="mt-4 text-4xl font-black tracking-tight">Когато се запънеш, не оставаш сам.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[var(--mh-text-soft)]">
              Вместо ученикът да губи време в колебание, MatHero помага да се върне в правилната посока.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <NeonButton href="/register" variant="primary">
                Влез в MatHero
              </NeonButton>
              <NeonButton href="/login" variant="ghost">
                Имам профил
              </NeonButton>
            </div>
          </div>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <h3 className={`text-xl font-bold ${royalBlueHeadingClass}`}>Какво печели ученикът</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>Ясно обяснение, когато условието е трудно.</li>
                <li>Подсказка без да се отнема мисленето.</li>
                <li>По-малко паника и повече увереност в следващия ход.</li>
              </ul>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
              <h3 className={`text-xl font-bold ${royalBlueHeadingClass}`}>Какво печели родителят</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>По-подредена подготовка и по-малко напрежение у дома.</li>
                <li>По-ясно усещане как върви подготовката.</li>
                <li>Система, която подкрепя, вместо да натоварва.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="ranen-dostap" className="bg-white px-4 py-18 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <SectionLabel className="text-cyan-700">Ранен достъп до MatHero</SectionLabel>
            <h2 className={`mt-4 text-4xl font-black tracking-tight ${royalBlueHeadingClass}`}>
              Включи се сред първите потребители и помогни MatHero да стане още по-полезен.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Включи се сред първите потребители и помогни MatHero да стане още по-полезен за ученици и родители.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="relative overflow-hidden rounded-[2rem] border border-cyan-200 bg-[linear-gradient(180deg,#ffffff_0%,#f4fbff_42%,#eef7ff_100%)] p-8 shadow-[0_28px_80px_rgba(15,23,42,0.14)]">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 top-8 h-32 w-32 rounded-full bg-fuchsia-200/25 blur-3xl" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="relative z-10">
                  <div className="inline-flex items-center rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
                    Ранен достъп
                  </div>
                  <h3 className={`mt-3 text-5xl font-black tracking-tight ${royalBlueHeadingClass}`}>14.90 €</h3>
                  <p className="mt-3 text-base font-semibold text-slate-700">Очаквана стартова цена</p>
                </div>

                <div className="relative z-10 rounded-[1.4rem] border border-fuchsia-200 bg-fuchsia-50 px-4 py-3 text-sm font-semibold text-fuchsia-800 shadow-[0_10px_24px_rgba(217,70,239,0.08)]">
                  По-малко от цената на два частни урока
                </div>
              </div>

              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  10-дневна подготовка по математика за НВО
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  кратка теория по важните теми
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  упражнения и тестове
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  задачи в стил НВО
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  обяснения с “Питай Мат”
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                  резултат и прогрес след всеки ден
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 px-4 py-4 text-base leading-7 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:col-span-2">
                  достъп за ограничен период при ранното пускане
                </div>
              </div>

              <div className="relative z-10 mt-8 flex flex-col items-start gap-3">
                <NeonButton href="/register" variant="primary">
                  Искам ранен достъп
                </NeonButton>
                <p className="text-sm font-medium text-slate-600">
                  Без плащане сега. Само заявка за ранен достъп.
                </p>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  По-малко от цената на два частни урока — с ясен 10-дневен план, задачи и обяснения стъпка по стъпка.
                </p>
              </div>
            </article>

            <aside className="flex flex-col gap-5">
              <article className="rounded-[1.85rem] border border-slate-200 bg-slate-50 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700">След официалното пускане</p>
                <h3 className={`mt-4 text-2xl font-black tracking-tight ${royalBlueHeadingClass}`}>
                  Планирана стандартна цена около 24.90 €
                </h3>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Планираната стандартна цена ще бъде около 24.90 €, според финалния обхват на съдържанието и
                  обратната връзка от първите потребители.
                </p>
                <p className="mt-3 text-base leading-7 text-slate-500">
                  Това е очаквана цена и ще бъде уточнена преди официалното пускане.
                </p>
              </article>

              <article className="rounded-[1.85rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
                <h3 className={`text-xl font-black ${royalBlueHeadingClass}`}>Какво означава ранен достъп</h3>
                <ul className="mt-4 space-y-3 text-base leading-7 text-slate-600">
                  <li>Получаваш ранен вход към продукта през съществуващата регистрация.</li>
                  <li>Помагаш с обратна връзка какво е най-полезно за ученици и родители.</li>
                  <li>Виждаш MatHero в по-ранен етап, преди официалното пускане.</li>
                </ul>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-4 py-18 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <SectionLabel className="text-cyan-700">FAQ</SectionLabel>
            <h2 className={`mt-4 text-4xl font-black tracking-tight ${royalBlueHeadingClass}`}>
              Няколко важни въпроса преди старта
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
              >
                <summary className={`cursor-pointer list-none text-lg font-bold ${royalBlueHeadingClass}`}>
                  {item.question}
                </summary>
                <p className="mt-3 text-base leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-18 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(17,24,39,0.92),rgba(35,12,69,0.92),rgba(6,78,110,0.88))] px-6 py-10 shadow-[0_28px_80px_rgba(4,10,28,0.5)] sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <SectionLabel>Финален CTA</SectionLabel>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
                  Готов ли е ученикът да мине през подготовката с ритъм, а не на случаен принцип?
                </h2>
                <p className="mt-4 text-lg leading-8 text-[var(--mh-text-soft)]">
                  MatHero подрежда пътя от първата теория до финалния резултат в един ясен и спокоен поток.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <NeonButton href="/register" variant="primary">
                  Създай профил
                </NeonButton>
                <NeonButton href="/login" variant="secondary">
                  Вход за ученици
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(3,8,19,0.98),rgba(4,10,24,1))] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex flex-col items-center gap-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-5 py-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:px-6">
              <div className="relative h-10 w-[14rem] sm:h-11 sm:w-[16rem]">
                <Image
                  src="/brands/new%20era%20edu.png"
                  alt="NEW ERA EDU"
                  fill
                  sizes="(max-width: 640px) 224px, 256px"
                  className="object-contain"
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white/75">
                  MatHero е продукт на <span className="font-semibold text-cyan-200">NEW ERA EDU</span>
                </p>
                <p className="text-sm text-white/55">Дигитални образователни продукти с мисия.</p>
              </div>
            </div>

            <p className="text-sm text-white/45">© 2026 MatHero / NEW ERA EDU. Всички права запазени.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
