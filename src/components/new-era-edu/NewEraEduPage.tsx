import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  GraduationCap,
  LayoutPanelTop,
  MessageCircleMore,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import { NewEraEduBackToTopButton } from "@/components/new-era-edu/NewEraEduBackToTopButton";
import { NewEraEduContactSection } from "@/components/new-era-edu/NewEraEduContactSection";
import { NewEraEduHeaderNav } from "@/components/new-era-edu/NewEraEduHeaderNav";

const navItems = [
  { href: "#nachalo", label: "Начало" },
  { href: "#misiya", label: "Мисия" },
  { href: "#produkti", label: "Продукти" },
  { href: "#kak-rabotim", label: "Как работим" },
  { href: "#za-nas", label: "За нас" },
  { href: "#kontakt", label: "Контакт" },
] as const;

const productFlow = [
  { label: "Прочети", icon: BookOpen, iconClassName: "text-blue-600" },
  { label: "Провери", icon: CheckCircle2, iconClassName: "text-cyan-600" },
  { label: "Упражни", icon: LayoutPanelTop, iconClassName: "text-violet-600" },
  { label: "Изпитай се", icon: Target, iconClassName: "text-blue-600" },
  { label: "Резултат", icon: TrendingUp, iconClassName: "text-teal-600" },
] as const;

const buildCards = [
  {
    title: "Ясна структура",
    copy: "Подреждаме знанието стъпка по стъпка, така че ученето да бъде лесно за следване и разбиране.",
    icon: LayoutPanelTop,
    iconShellClassName: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    title: "Красив и практичен дизайн",
    copy: "Създаваме интерфейси, които са чисти, спокойни и удобни за реална употреба всеки ден.",
    icon: GraduationCap,
    iconShellClassName: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  {
    title: "Обяснения на разбираем език",
    copy: "Превеждаме сложните теми на ясен и човешки език, без излишна тежест и объркване.",
    icon: MessageCircleMore,
    iconShellClassName: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    title: "Фокус върху реален напредък",
    copy: "Всеки продукт има цел: да помага, да мотивира и да води до устойчиви резултати.",
    icon: TrendingUp,
    iconShellClassName: "border-teal-200 bg-teal-50 text-teal-700",
  },
] as const;

const pageFontClass = "[font-family:var(--font-display-app),var(--font-sans-app),sans-serif]";

export function NewEraEduPage() {
  return (
    <main
      className={`min-h-screen bg-[linear-gradient(180deg,#f5f5f7_0%,#f1f3f5_42%,#eceff3_100%)] text-slate-900 ${pageFontClass}`}
    >
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @media (prefers-reduced-motion: no-preference) {
          .new-era-fade-up {
            opacity: 0;
            transform: translateY(28px);
            animation: new-era-fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            will-change: transform, opacity;
          }

          .new-era-fade-in {
            opacity: 0;
            animation: new-era-fade-in 0.95s ease forwards;
          }

          .new-era-float {
            animation: new-era-float 6.8s ease-in-out infinite;
            will-change: transform;
          }

          .new-era-card {
            transition:
              transform 220ms ease,
              box-shadow 220ms ease,
              border-color 220ms ease;
          }

          .new-era-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 24px 54px rgba(15, 23, 42, 0.1);
            border-color: rgba(34, 211, 238, 0.7);
          }

          .new-era-button {
            transition:
              transform 180ms ease,
              box-shadow 180ms ease,
              filter 180ms ease;
          }

          .new-era-button:hover {
            transform: translateY(-2px);
            filter: saturate(1.05);
          }

          .new-era-nav-link {
            transition:
              color 180ms ease,
              transform 180ms ease,
              opacity 180ms ease;
          }

          .new-era-nav-link:hover {
            transform: translateY(-1px);
          }
        }

        @keyframes new-era-fade-up {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes new-era-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes new-era-float {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
      `}</style>

      <NewEraEduBackToTopButton />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-cyan-200/70 bg-[linear-gradient(90deg,rgba(109,40,217,0.92)_0%,rgba(79,70,229,0.94)_45%,rgba(6,182,212,0.9)_100%)] shadow-[0_18px_42px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_auto] lg:px-8">
          <Link href="/new-era-edu" className="flex min-w-0 items-center justify-center lg:justify-start">
            <div className="relative h-16 w-[14rem] sm:h-[4.5rem] sm:w-[17rem] lg:h-[5rem] lg:w-[20rem] xl:h-[5.5rem] xl:w-[22rem]">
              <Image
                src="/brands/new-era-edu-header-logo-v2.png"
                alt="NEW ERA EDU"
                fill
                sizes="(max-width: 640px) 224px, (max-width: 1024px) 272px, 352px"
                className="object-contain object-left"
              />
            </div>
          </Link>

          <NewEraEduHeaderNav items={navItems} />

          <div className="flex justify-center lg:justify-end">
            <a
              href="#produkti"
              className="new-era-button inline-flex whitespace-nowrap items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
            >
              Разгледай продуктите
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <section
        id="nachalo"
        className="scroll-mt-36 relative overflow-hidden pt-36 sm:scroll-mt-40 sm:pt-40 lg:pt-44"
      >
        <div className="absolute inset-0">
          <Image
            src="/images/new-era-edu/hero-background-v1.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid min-h-[42rem] w-full items-center lg:min-h-[48rem]">
            <div className="new-era-fade-up max-w-2xl rounded-[2rem] border border-white/70 bg-white/58 p-8 shadow-[0_24px_60px_rgba(115,136,186,0.18)] backdrop-blur-md sm:p-10">
              <h1 className="mt-2 text-5xl font-semibold tracking-[-0.03em] text-[#14306d] sm:text-6xl lg:text-7xl">
                NEW ERA{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-teal-400 bg-clip-text text-transparent">EDU</span>
              </h1>
              <h2 className="mt-4 max-w-2xl text-3xl font-medium leading-tight text-[#1a3b80] sm:text-4xl lg:text-[2.8rem]">
                Дигитални образователни продукти с мисия.
              </h2>
              <p className="mt-8 max-w-xl text-xl font-normal leading-9 text-slate-700">
                Създаваме модерни дигитални решения за учене, развитие и нови умения - ясни, красиви и полезни.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#produkti"
                  className="new-era-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
                >
                  Разгледай продуктите
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/"
                  className="new-era-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
                >
                  Виж MatHero
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="misiya"
        className="scroll-mt-36 relative overflow-hidden border-y border-slate-200/70 bg-[linear-gradient(180deg,#f8fbff_0%,#f1f5fb_52%,#eef3f9_100%)] py-24 sm:scroll-mt-40 lg:min-h-[32rem] lg:py-28"
      >
        <div
          className="new-era-fade-up relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          style={{ animationDelay: "120ms" }}
        >
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#173979]">Мисия</h2>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(320px,544px)_minmax(0,1fr)]">
            <div className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -left-6 top-12 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
              <div className="absolute -right-4 top-6 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />
              <Image
                src="/images/new-era-edu/mission-visual-v3.png"
                alt="Илюстрация за образователна мисия и развитие"
                width={1456}
                height={1120}
                sizes="(max-width: 1024px) 100vw, 544px"
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_26px_50px_rgba(125,146,196,0.2)]"
              />
            </div>

            <div className="space-y-4 text-lg font-normal leading-8 text-slate-700">
              <p>Вярваме, че ученето може да бъде ясно, достъпно и мотивиращо — независимо от възрастта и темата.</p>
              <p>
                Нашата мисия е да създаваме дигитални продукти, които помагат на хората да разбират по-добре, да
                развиват нови умения и да напредват уверено — стъпка по стъпка.
              </p>
              <p>
                Ние от NEW ERA EDU изграждаме образователни решения, които съчетават добра структура, модерен дизайн и
                разбираем език. Всеки продукт започва от реален проблем в ученето и се развива с една цел — да
                направи процеса по-спокоен, подреден и ефективен.
              </p>
              <p>
                За нас добрият образователен продукт не е просто красив екран. Той трябва да води човека ясно, да му
                показва къде се намира, какво вече е усвоил и коя е следващата полезна стъпка.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="produkti" className="scroll-mt-36 px-4 py-20 sm:scroll-mt-40 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#173979]">Продукти</h2>
            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article
              className="new-era-card new-era-fade-up rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_46px_rgba(15,23,42,0.06)]"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex items-start gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-blue-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-3xl font-semibold tracking-[-0.02em] text-[#173979]">MatHero</h3>
                  <p className="mt-2 text-xl font-medium text-violet-700">Математика с ритъм.</p>
                  <p className="mt-4 max-w-xl text-lg font-normal leading-8 text-slate-600">
                    10-дневна подготовка за НВО по математика в 7. клас.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-5">
                <p className="flex flex-wrap gap-x-3 gap-y-2 text-sm font-medium text-slate-700">
                  {productFlow.map((item, index) => (
                    <span key={item.label} className="contents">
                      <span className="inline-flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.iconClassName}`} />
                        {item.label}
                      </span>
                      {index < productFlow.length - 1 ? <span className="text-slate-300">→</span> : null}
                    </span>
                  ))}
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/"
                  className="new-era-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
                >
                  Към MatHero
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <article
              className="new-era-card new-era-fade-up rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f9fbff_100%)] p-7 shadow-[0_18px_46px_rgba(15,23,42,0.05)]"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-start gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-600">
                  <Rocket className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-semibold tracking-[-0.02em] text-[#173979]">БелHero</h3>
                  <p className="mt-4 text-lg font-normal leading-8 text-slate-600">
                    Подготовка за матурата по Български език и литература за 7. клас.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <article
            className="new-era-card new-era-fade-up mt-6 rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-7 shadow-[0_18px_46px_rgba(15,23,42,0.05)]"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-cyan-700">
                <Code2 className="h-10 w-10" />
              </div>

              <div className="min-w-0">
                <h3 className="text-3xl font-semibold tracking-[-0.02em] text-[#173979]">VibeCode Hero</h3>
                <p className="mt-2 text-xl font-medium text-violet-700">Нова посока за дигитално създаване.</p>
                <p className="mt-4 max-w-4xl text-lg font-normal leading-8 text-slate-600">
                  VibeCode Hero е идея за следващ продукт на NEW ERA EDU — пространство, в което ученици и начинаещи
                  създатели ще могат да учат чрез практика, модерни дигитални инструменти и ясни стъпки за изграждане
                  на собствени проекти.
                </p>
                <p className="mt-4 max-w-4xl text-lg font-normal leading-8 text-slate-600">
                  Целта е обучението да бъде по-интерактивно, по-съвременно и по-близо до реалния процес на мислене,
                  създаване и тестване на идеи.
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="kak-rabotim" className="scroll-mt-36 px-4 py-20 sm:scroll-mt-40 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#173979]">Как създаваме продуктите</h2>
            <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {buildCards.map((card, index) => (
              <article
                key={card.title}
                className="new-era-card new-era-fade-up rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[0_16px_36px_rgba(15,23,42,0.05)]"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border ${card.iconShellClassName}`}
                >
                  <card.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-[#173979]">{card.title}</h3>
                <p className="mt-3 text-base font-normal leading-7 text-slate-600">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="za-nas" className="scroll-mt-36 px-4 py-20 sm:scroll-mt-40 sm:px-6 lg:px-8">
        <div
          className="new-era-card new-era-fade-up mx-auto grid max-w-7xl gap-8 rounded-3xl border border-slate-200 bg-white px-8 py-8 shadow-[0_18px_46px_rgba(15,23,42,0.06)] sm:px-10 lg:grid-cols-[minmax(320px,544px)_1fr] lg:items-center"
          style={{ animationDelay: "140ms" }}
        >
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/images/new-era-edu/about-team-v1.png"
              alt="Екип на NEW ERA EDU в работна среда"
              width={1466}
              height={1150}
              sizes="(max-width: 1024px) 100vw, 544px"
              className="h-auto w-full max-w-[34rem] object-cover drop-shadow-[0_26px_50px_rgba(125,146,196,0.2)]"
            />
          </div>

          <div>
            <h2 className="text-4xl font-semibold tracking-[-0.02em] text-[#173979]">За NEW ERA EDU</h2>
            <div className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
            <p className="mt-5 text-lg font-normal leading-8 text-slate-600">
              NEW ERA EDU е създаден от екип от сертифицирани професионалисти в областта на дигиталните продукти и
              информационните технологии, както и опитни педагози.
            </p>
            <p className="mt-4 text-lg font-normal leading-8 text-slate-600">
              Комбинираме дизайн, ясна структура и съвременни технологии, за да правим ученето по-достъпно,
              по-разбираемо и по-мотивиращо.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div
          className="new-era-fade-up mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#fcf8ff_0%,#f7efff_40%,#edf8ff_100%)] px-8 py-8 text-[#14306d] shadow-[0_24px_64px_rgba(15,23,42,0.12)]"
          style={{ animationDelay: "160ms" }}
        >
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(340px,520px)] lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center rounded-full border border-cyan-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-cyan-700 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
                MatHero preview
              </div>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.02em]">Първият ни продукт вече е в развитие.</h2>
              <p className="mt-3 text-xl font-normal leading-8 text-slate-700">
                Запознай се с MatHero - дигитална подготовка по математика за НВО в 7. клас.
              </p>
              <p className="mt-5 max-w-xl text-base font-normal leading-7 text-slate-600">
                Показваме реален екран от приложението в по-динамична продуктова визия, за да се усети по-ясно как
                изглежда самото преживяване вътре.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  className="new-era-button inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-500 px-6 py-4 text-base font-medium text-white shadow-[0_16px_34px_rgba(59,130,246,0.16)]"
                >
                  Виж MatHero
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[34rem]">
              <div className="absolute -left-6 top-10 h-40 w-40 rounded-full bg-cyan-300/30 blur-3xl" />
              <div className="absolute -right-4 top-0 h-36 w-36 rounded-full bg-violet-300/30 blur-3xl" />
              <div className="absolute inset-x-10 bottom-0 h-20 rounded-full bg-slate-900/10 blur-2xl" />
              <Image
                src="/images/new-era-edu/cta-mathhero-screen-v2.png"
                alt="Екран от приложението MatHero"
                width={1466}
                height={1138}
                sizes="(max-width: 1024px) 100vw, 544px"
                className="relative z-10 h-auto w-full object-contain drop-shadow-[0_26px_50px_rgba(34,58,112,0.22)]"
              />
            </div>
          </div>
        </div>
      </section>

      <NewEraEduContactSection />

      <footer className="border-t border-cyan-200/70 bg-[linear-gradient(90deg,rgba(109,40,217,0.92)_0%,rgba(79,70,229,0.94)_45%,rgba(6,182,212,0.9)_100%)] px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
            <div className="max-w-sm">
              <div className="relative h-10 w-[14.5rem] sm:h-11 sm:w-[15.5rem]">
                <Image
                  src="/brands/new-era-edu-footer-logo.png"
                  alt="NEW ERA EDU"
                  fill
                  sizes="248px"
                  className="object-contain object-left"
                />
              </div>
              <p className="mt-5 text-base font-normal leading-7 text-cyan-50/95">
                Дигитални образователни продукти с мисия.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100">Навигация</h3>
              <ul className="mt-4 space-y-3 text-sm font-normal text-white/80">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="transition hover:text-white">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100">Продукти</h3>
              <ul className="mt-4 space-y-3 text-sm font-normal text-white/80">
                <li>
                  <Link href="/" className="transition hover:text-white">
                    MatHero
                  </Link>
                </li>
                <li>Очаквайте скоро</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-100">Контакт</h3>
              <ul className="mt-4 space-y-3 text-sm font-normal text-white/80">
                <li>
                  <a href="mailto:info@neweraedu.bg" className="transition hover:text-white">
                    info@neweraedu.bg
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-6 text-center text-sm font-normal text-white/65">
            © 2026 NEW ERA EDU. Всички права запазени.
          </div>
        </div>
      </footer>
    </main>
  );
}
