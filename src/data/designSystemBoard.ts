export const designSystemPalette = [
  { name: "Primary background", value: "#0B0F1A", className: "bg-[var(--mh-bg)]" },
  { name: "Secondary background", value: "#0F1324", className: "bg-[var(--mh-surface-2)]" },
  { name: "Surface / Card", value: "#151A2E", className: "bg-[var(--mh-surface)]" },
  { name: "Surface elevated", value: "#1B2140", className: "bg-[var(--mh-surface-3)]" },
  { name: "Border / Neon cyan", value: "#22D3EE", className: "bg-[var(--mh-accent-cyan)]" },
  { name: "Accent purple", value: "#7C3AED", className: "bg-[var(--mh-accent-purple)]" },
  { name: "Accent magenta", value: "#EC4899", className: "bg-[var(--mh-accent-pink)]" },
  { name: "Accent green", value: "#22C55E", className: "bg-[var(--mh-success)]" },
  { name: "Accent gold", value: "#FBBF24", className: "bg-[var(--mh-accent-gold)]" },
  { name: "Primary text", value: "#F8FAFC", className: "bg-white" },
  { name: "Secondary text", value: "#CBD5E1", className: "bg-slate-300" },
  { name: "Muted text", value: "#94A3B8", className: "bg-slate-400" },
  { name: "Success / XP glow", value: "Glow", className: "bg-[linear-gradient(180deg,#0c241b,#0f7f4c)]" },
] as const;

export const typographyBoard = [
  { label: "H1", sample: "Как да минеш урока без хаос", meta: "36px / 42px", weight: "Bold" },
  { label: "H2", sample: "Ден 1: Фундамент — числа и действия", meta: "22px / 28px", weight: "Bold" },
  { label: "LABEL / EYEBROW", sample: "ПЛАН ЗА ДЕНЯ", meta: "12px / 16px", weight: "Regular" },
  {
    label: "Body",
    sample:
      "Започваме с Раздел 1 и Раздел 2: естествени и рационални числа, прости и съставни числа, делимост, абсолютна стойност и действия с рационални числа.",
    meta: "16px / 24px",
    weight: "Regular",
  },
  { label: "Small", sample: "Теория, примери и задачи ще ти помогнат да затвърдиш знанията.", meta: "16px / 24px", weight: "Regular" },
  { label: "Button text", sample: "Започни урока", meta: "16px / 20px", weight: "SemiBold" },
] as const;

export const designRules = [
  "Тъмна основа + неонови акценти",
  "Заоблени карти и бутони",
  "Ясна визуална йерархия",
  "Активните елементи имат glow",
  "Цветовете обозначават тип действие",
  "Висок контраст за четимост",
] as const;

export const spacingScale = [4, 8, 12, 16, 32] as const;

export const radiusScale = [
  { name: "Бутони", value: 8 },
  { name: "Карти", value: 12 },
  { name: "Пил (Pill)", value: 999 },
  { name: "Големи панели", value: 20 },
] as const;

export const tokenGroups = [
  [
    ["--color-border-cyan", "#22D3EE", "Граници, активни състояния, акценти"],
    ["--color-accent-purple", "#7C3AED", "Основни действия, бутони, икони"],
    ["--color-success", "#22C55E", "Успех, тестове, XP, положителни състояния"],
  ],
  [
    ["--radius-md", "12px", "Карти, попъпи, модални елементи"],
    ["--radius-sm", "8px", "Бутони, чипове"],
    ["--shadow-card", "0 8px 24px rgba(0,0,0,0.35)", "Карти на слоеве"],
  ],
  [
    ["--font-family", "Inter, Manrope, system-ui, sans-serif", "Основен UI текст"],
    ["--transition-fast", "150ms cubic-bezier(.2,.8,.2,1)", "Hover и active states"],
  ],
] as const;
