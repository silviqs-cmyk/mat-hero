import { CheckCircle2, Sparkles, Star } from "lucide-react";
import { AnimatedHeroMascot } from "@/components/AnimatedHeroMascot";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonCard } from "@/components/ui/NeonCard";
import {
  designRules,
  designSystemPalette,
  radiusScale,
  spacingScale,
  tokenGroups,
  typographyBoard,
} from "@/data/designSystemBoard";

function SectionFrame({
  index,
  title,
  children,
  className = "",
}: {
  index: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NeonCard padding="sm" className={`rounded-[24px] ${className}`}>
      <p className="mh-label">{index}. {title}</p>
      <div className="mt-4">{children}</div>
    </NeonCard>
  );
}

function PaletteSwatch({
  name,
  value,
  className,
}: {
  name: string;
  value: string;
  className: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-3">
      <div className={`h-14 rounded-[14px] border border-white/10 ${className}`} />
      <p className="mt-3 text-[0.95rem] font-semibold text-white">{name}</p>
      <p className="mt-1 text-sm text-slate-400">{value}</p>
    </div>
  );
}

function EffectPreview({
  title,
  className,
}: {
  title: string;
  className: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4">
      <p className="text-center text-sm text-slate-300">{title}</p>
      <div className={`mt-4 h-16 rounded-[16px] border ${className}`} />
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-[1480px] space-y-3">
      <NeonCard padding="md" className="rounded-[28px]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/5">
              <AnimatedHeroMascot size="sm" animated={false} />
            </div>
            <div>
              <h1 className="font-display text-[3.5rem] font-bold leading-none text-white">
                MatHero — Дизайн система
              </h1>
              <p className="mt-3 text-[1.1rem] text-slate-300">Извлечена от екрана за Ден 1</p>
              <p className="mt-4 text-[1.05rem] font-semibold text-cyan-300">Dark neon educational dashboard</p>
            </div>
          </div>

          <NeonCard as="aside" padding="sm" className="rounded-[22px]">
            <p className="mh-label">7. Правила</p>
            <div className="mt-4 space-y-3">
              {designRules.map((rule) => (
                <div key={rule} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-cyan-300" />
                  <p className="text-sm text-slate-200">{rule}</p>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>
      </NeonCard>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_1fr]">
        <SectionFrame index={1} title="Цветова палитра">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {designSystemPalette.map((swatch) => (
              <PaletteSwatch key={swatch.name} {...swatch} />
            ))}
          </div>
        </SectionFrame>

        <SectionFrame index={2} title="Типография">
          <div className="space-y-4">
            {typographyBoard.map((item) => (
              <div key={item.label} className="grid gap-2 border-b border-white/8 pb-3 last:border-b-0 last:pb-0 md:grid-cols-[160px_minmax(0,1fr)_110px]">
                <p className={`font-semibold ${item.label.includes("LABEL") ? "text-cyan-300 tracking-[0.18em]" : "text-white"} ${item.label.includes("LABEL") ? "text-xs uppercase" : "text-[1.05rem]"}`}>
                  {item.label}
                </p>
                <p
                  className={
                    item.label === "H1"
                      ? "font-display text-[2.3rem] font-bold text-white"
                      : item.label === "H2"
                        ? "font-display text-[1.8rem] font-bold text-white"
                        : item.label === "Button text"
                          ? "inline-flex w-fit rounded-full bg-[linear-gradient(135deg,#7328ff_0%,#c74cf8_48%,#ff6ad7_100%)] px-6 py-2 text-base font-semibold text-white"
                          : "text-[1rem] leading-7 text-slate-200"
                  }
                >
                  {item.sample}
                </p>
                <div className="text-right text-sm text-slate-400">
                  <p>{item.meta}</p>
                  <p>{item.weight}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionFrame>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1.08fr]">
        <SectionFrame index={3} title="Разстояния и радиуси">
          <div className="grid gap-3 md:grid-cols-2">
            <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
              <p className="text-sm font-semibold text-cyan-300">Разстояния (px)</p>
              <div className="mt-6 flex items-end gap-6">
                {spacingScale.map((space) => (
                  <div key={space} className="text-center">
                    <div className="mx-auto bg-cyan-300/80" style={{ width: 8 + space / 2, height: 2 + space }} />
                    <p className="mt-4 text-sm text-slate-300">{space}</p>
                  </div>
                ))}
              </div>
            </NeonCard>

            <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
              <p className="text-sm font-semibold text-cyan-300">Радиуси (px)</p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {radiusScale.map((radius) => (
                  <div key={radius.name}>
                    <p className="text-sm text-slate-300">{radius.name}</p>
                    <div
                      className="mt-3 h-12 border border-white/12 bg-white/[0.03]"
                      style={{ borderRadius: radius.value === 999 ? 999 : radius.value }}
                    />
                  </div>
                ))}
              </div>
            </NeonCard>
          </div>
        </SectionFrame>

        <SectionFrame index={4} title="Ефекти">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <EffectPreview title="Cyan glow border" className="border-cyan-400/80 shadow-[0_0_24px_rgba(34,211,238,0.45)]" />
            <EffectPreview title="Purple glow border" className="border-fuchsia-400/80 shadow-[0_0_24px_rgba(217,70,239,0.45)]" />
            <EffectPreview title="Soft inner shadow" className="border-white/12 shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)]" />
            <EffectPreview title="Card shadow" className="border-indigo-400/20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" />
            <EffectPreview title="Hover glow" className="border-cyan-300/80 shadow-[0_0_30px_rgba(34,211,238,0.55)]" />
          </div>
        </SectionFrame>
      </div>

      <SectionFrame index={5} title="Компоненти">
        <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Бутон — Primary</p>
                <NeonButton className="w-full">Започни урока</NeonButton>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Бутон — Secondary</p>
                <NeonButton variant="secondary" className="w-full">Теория</NeonButton>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Badge / Pill</p>
                <Badge tone="cyan"><Sparkles className="h-4 w-4" />Ясен ред</Badge>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Чип — Статистика</p>
                <div className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-2">
                  <Star className="h-4 w-4 text-amber-300" />
                  <div>
                    <p className="text-sm font-semibold text-white">125</p>
                    <p className="text-[11px] text-slate-400">XP точки</p>
                  </div>
                </div>
              </NeonCard>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Навигация — Default</p>
                <div className="mh-sidebar-item border border-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400">⬦</div>
                  <span className="text-base">Табло</span>
                </div>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Навигация — Active</p>
                <div className="mh-sidebar-item mh-sidebar-item--active border border-cyan-400/20">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 text-cyan-300">⬦</div>
                  <span className="text-base">Табло</span>
                </div>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Дневен план — Active</p>
                <div className="mh-timeline-item mh-timeline-item--active">
                  <p className="text-base font-semibold text-white">Ден 1</p>
                  <p className="mt-1 text-sm text-slate-300">Фундамент — числа и действия</p>
                </div>
              </NeonCard>
              <NeonCard as="div" tone="muted" padding="sm" className="rounded-[18px]">
                <p className="mb-3 text-sm text-slate-300">Дневен план — Inactive</p>
                <div className="mh-timeline-item border border-white/10">
                  <p className="text-base font-semibold text-white">Ден 2</p>
                  <p className="mt-1 text-sm text-slate-300">Проценти и въвеждане в алгебрата</p>
                </div>
              </NeonCard>
            </div>

            <div className="grid gap-3 xl:grid-cols-[1.2fr_0.95fr_0.95fr_0.95fr]">
              <NeonCard tone="purple" padding="sm" className="rounded-[22px]">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-300">1. ПРОЧЕТИ</p>
                <p className="mt-3 text-[1.55rem] font-semibold text-white">Урокът</p>
                <div className="mt-5"><Badge tone="purple" className="w-full justify-center">Теория и пример</Badge></div>
              </NeonCard>
              <NeonCard tone="cyan" padding="sm" className="rounded-[22px]">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">2. УПРАЖНИ</p>
                <p className="mt-3 text-[1.55rem] font-semibold text-white">10 основни задачи</p>
                <div className="mt-5"><Badge tone="cyan" className="w-full justify-center">Задачи</Badge></div>
              </NeonCard>
              <NeonCard tone="green" padding="sm" className="rounded-[22px]">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300">3. ПРОВЕРИ</p>
                <p className="mt-3 text-[1.55rem] font-semibold text-white">10 въпроса</p>
                <div className="mt-5"><Badge tone="green" className="w-full justify-center">Тест за деня</Badge></div>
              </NeonCard>
              <NeonCard tone="gold" padding="sm" className="rounded-[22px]">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">ИЗПИТАЙ СЕ</p>
                <p className="mt-3 text-[1.55rem] font-semibold text-white">Реални задачи от НВО</p>
                <div className="mt-5"><Badge tone="gold" className="w-full justify-center">Изпитай се</Badge></div>
              </NeonCard>
            </div>
          </div>

          <div className="space-y-3">
            <NeonCard tone="cyan" padding="sm" className="rounded-[20px]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-300">Инфо карта</p>
              <h3 className="mt-3 text-[1.35rem] font-semibold text-white">НАЙ-ВАЖНОТО</h3>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Започваме с Раздел 1 и Раздел 2: естествени и рационални числа, прости и съставни числа, делимост, абсолютна стойност и действия с рационални числа.
              </p>
            </NeonCard>

            <NeonCard padding="sm" className="rounded-[20px]">
              <p className="text-sm text-slate-300">Hero Buddy — преглед</p>
              <div className="mt-3 flex items-start gap-4">
                <div className="flex h-28 w-24 items-center justify-center">
                  <AnimatedHeroMascot size="sm" animated={false} />
                </div>
                <div>
                  <h3 className="text-[2rem] font-bold text-white">Супер ход!</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Мини първо през кратката теория, после отвори основните задачи, една по една и чак накрая тръгни към теста.
                  </p>
                  <NeonButton variant="success" className="mt-4 min-h-0 px-4 py-2 text-sm">
                    +25 XP след тест
                  </NeonButton>
                </div>
              </div>
            </NeonCard>
          </div>
        </div>
      </SectionFrame>

      <SectionFrame index={6} title="Дизайн токени (извадка)">
        <div className="grid gap-3 xl:grid-cols-3">
          {tokenGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="overflow-hidden rounded-[18px] border border-white/10">
              <table className="w-full text-left">
                <thead className="bg-white/[0.04]">
                  <tr className="text-xs uppercase tracking-[0.12em] text-cyan-300">
                    <th className="px-4 py-3">Токен</th>
                    <th className="px-4 py-3">Стойност</th>
                    <th className="px-4 py-3">Употреба</th>
                  </tr>
                </thead>
                <tbody>
                  {group.map(([token, value, usage]) => (
                    <tr key={token} className="border-t border-white/8 text-sm text-slate-200">
                      <td className="px-4 py-3 font-mono text-cyan-200">{token}</td>
                      <td className="px-4 py-3">{value}</td>
                      <td className="px-4 py-3 text-slate-400">{usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </SectionFrame>

      <SectionFrame index={7} title="Прогрес бар">
        <div className="max-w-sm">
          <ProgressBar value={10} max={100} label="Прогрес" accent="cyan" compact />
        </div>
      </SectionFrame>
    </div>
  );
}
