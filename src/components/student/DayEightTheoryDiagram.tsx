import { TheoryConceptVisual } from "@/components/student/TheoryConceptVisual";

interface DayEightTheoryDiagramProps {
  sectionIndex: number;
  sectionTitle: string;
}

export const DAY_EIGHT_TABLE_DATA = [
  { category: "Футбол", value: 8 },
  { category: "Волейбол", value: 5 },
  { category: "Баскетбол", value: 4 },
  { category: "Плуване", value: 3 },
] as const;

export const DAY_EIGHT_LINE_DATA = [
  { label: "Понеделник", value: 12 },
  { label: "Вторник", value: 15 },
  { label: "Сряда", value: 13 },
  { label: "Четвъртък", value: 18 },
] as const;

export const DAY_EIGHT_BAR_DATA = [
  { label: "Книги", value: 6 },
  { label: "Филми", value: 9 },
  { label: "Игри", value: 4 },
  { label: "Спорт", value: 7 },
] as const;

export const DAY_EIGHT_PIE_DATA = [
  { label: "Част А", value: 50, color: "#0891b2" },
  { label: "Част Б", value: 25, color: "#7c3aed" },
  { label: "Част В", value: 15, color: "#d97706" },
  { label: "Част Г", value: 10, color: "#059669" },
] as const;

const DAY_EIGHT_FALLBACKS = [
  null,
  null,
  null,
  null,
  { mainSymbol: "(4 + 6 + 8) / 3", tags: ["Сбор", "Брой", "Средно"] },
  { mainSymbol: "2, 3, 3, 5", tags: ["Подреждане", "Мода", "Медиана"] },
  { mainSymbol: "1/2", tags: ["Монета", "Събитие", "Вероятност"] },
  { mainSymbol: "3/6 = 1/2", tags: ["Благоприятни", "Всички", "Случаи"] },
  { mainSymbol: "1/4 → 0,25 → 25%", tags: ["Дроб", "Десетично", "Процент"] },
  { mainSymbol: "▦ → ?", tags: ["Средно", "Мода", "Вероятност"] },
] as const;

const DAY_EIGHT_SAFE_FALLBACK = {
  mainSymbol: "данни → извод",
  tags: ["Таблица", "Диаграма", "Вероятност"],
} as const;

const LINE_SCALE_VALUES = [0, 5, 10, 15, 20] as const;
const BAR_SCALE_VALUES = [0, 2, 4, 6, 8, 10] as const;

function VisualFrame({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <figure className="w-full min-w-0 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-3 text-slate-900 shadow-[0_12px_34px_rgba(15,23,42,0.12)] sm:p-4">
      <figcaption className="mb-3 text-sm font-semibold leading-5 text-slate-700">{caption}</figcaption>
      {children}
    </figure>
  );
}

function DataTableVisual() {
  return (
    <VisualFrame caption="Таблица с данни за любим спорт">
      <div className="overflow-hidden rounded-xl border border-slate-300">
        <table className="w-full table-fixed border-collapse text-xs leading-5 sm:text-sm">
          <caption className="sr-only">Любим спорт и брой ученици за четири категории</caption>
          <thead className="bg-cyan-50 text-slate-900">
            <tr>
              <th scope="col" className="w-3/5 border-b border-r border-slate-300 px-2 py-2 text-left font-bold sm:px-3">
                Любим спорт
              </th>
              <th scope="col" className="w-2/5 border-b border-slate-300 px-2 py-2 text-center font-bold sm:px-3">
                Брой ученици
              </th>
            </tr>
          </thead>
          <tbody>
            {DAY_EIGHT_TABLE_DATA.map((row) => (
              <tr key={row.category} className="even:bg-slate-50">
                <th scope="row" className="border-r border-t border-slate-200 px-2 py-2 text-left font-medium sm:px-3">
                  {row.category}
                </th>
                <td className="border-t border-slate-200 px-2 py-2 text-center font-semibold tabular-nums sm:px-3">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </VisualFrame>
  );
}

function LineGraphVisual() {
  const points = DAY_EIGHT_LINE_DATA.map((entry, index) => ({
    ...entry,
    x: 92 + index * 158,
    y: 250 - entry.value * 10.5,
  }));

  return (
    <VisualFrame caption="Линейна графика с броя решени задачи от понеделник до четвъртък">
      <svg
        viewBox="0 0 640 330"
        className="block h-auto w-full"
        role="img"
        aria-labelledby="day8-line-title day8-line-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="day8-line-title">Решени задачи през четири дни</title>
        <desc id="day8-line-desc">Понеделник 12, вторник 15, сряда 13 и четвъртък 18 решени задачи.</desc>
        <rect x="0" y="0" width="640" height="330" rx="16" fill="#ffffff" />
        <text x="18" y="28" fill="#334155" fontSize="28" fontWeight="700">Брой задачи</text>
        {LINE_SCALE_VALUES.map((value) => {
          const y = 250 - value * 10.5;
          return (
            <g key={value}>
              <line x1="70" y1={y} x2="590" y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="56" y={y + 9} textAnchor="end" fill="#475569" fontSize="26">{value}</text>
            </g>
          );
        })}
        <line x1="70" y1="40" x2="70" y2="250" stroke="#0f172a" strokeWidth="3" />
        <line x1="70" y1="250" x2="590" y2="250" stroke="#0f172a" strokeWidth="3" />
        <polyline
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke="#0891b2"
          strokeWidth="6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="8" fill="#ffffff" stroke="#0891b2" strokeWidth="5" />
            <text x={point.x} y={point.y - 17} textAnchor="middle" fill="#0f172a" fontSize="28" fontWeight="700">
              {point.value}
            </text>
            <text x={point.x} y="288" textAnchor="middle" fill="#334155" fontSize="28" fontWeight="600">
              {point.label}
            </text>
          </g>
        ))}
        <text x="590" y="320" textAnchor="end" fill="#475569" fontSize="24" fontWeight="700">Ден</text>
      </svg>
    </VisualFrame>
  );
}

function BarChartVisual() {
  return (
    <VisualFrame caption="Стълбовидна диаграма с предпочитания на ученици">
      <svg
        viewBox="0 0 640 330"
        className="block h-auto w-full"
        role="img"
        aria-labelledby="day8-bar-title day8-bar-desc"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="day8-bar-title">Предпочитания на ученици</title>
        <desc id="day8-bar-desc">Книги 6, филми 9, игри 4 и спорт 7 ученици.</desc>
        <rect x="0" y="0" width="640" height="330" rx="16" fill="#ffffff" />
        <text x="18" y="28" fill="#334155" fontSize="28" fontWeight="700">Брой ученици</text>
        {BAR_SCALE_VALUES.map((value) => {
          const y = 250 - value * 21;
          return (
            <g key={value}>
              <line x1="70" y1={y} x2="590" y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="56" y={y + 9} textAnchor="end" fill="#475569" fontSize="26">{value}</text>
            </g>
          );
        })}
        <line x1="70" y1="40" x2="70" y2="250" stroke="#0f172a" strokeWidth="3" />
        <line x1="70" y1="250" x2="590" y2="250" stroke="#0f172a" strokeWidth="3" />
        {DAY_EIGHT_BAR_DATA.map((entry, index) => {
          const x = 100 + index * 128;
          const height = entry.value * 21;
          const y = 250 - height;
          return (
            <g key={entry.label}>
              <rect x={x} y={y} width="78" height={height} rx="6" fill="#0891b2" />
              <text x={x + 39} y={y - 12} textAnchor="middle" fill="#0f172a" fontSize="28" fontWeight="700">
                {entry.value}
              </text>
              <text x={x + 39} y="288" textAnchor="middle" fill="#334155" fontSize="28" fontWeight="600">
                {entry.label}
              </text>
            </g>
          );
        })}
        <text x="590" y="320" textAnchor="end" fill="#475569" fontSize="24" fontWeight="700">Категория</text>
      </svg>
    </VisualFrame>
  );
}

function PieChartVisual() {
  return (
    <VisualFrame caption="Кръгова диаграма с четири части, които образуват 100%">
      <div className="grid min-w-0 grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <svg
          viewBox="0 0 240 240"
          className="mx-auto block h-auto w-full max-w-[240px]"
          role="img"
          aria-labelledby="day8-pie-title day8-pie-desc"
          preserveAspectRatio="xMidYMid meet"
        >
          <title id="day8-pie-title">Кръгова диаграма с четири сектора</title>
          <desc id="day8-pie-desc">Секторите са 50, 25, 15 и 10 процента и общо образуват 100 процента.</desc>
          <rect width="240" height="240" fill="#ffffff" />
          <path d="M 120 120 L 120 24 A 96 96 0 0 1 120 216 Z" fill="#0891b2" stroke="#ffffff" strokeWidth="4" />
          <path d="M 120 120 L 120 216 A 96 96 0 0 1 24 120 Z" fill="#7c3aed" stroke="#ffffff" strokeWidth="4" />
          <path d="M 120 120 L 24 120 A 96 96 0 0 1 63.572 42.334 Z" fill="#d97706" stroke="#ffffff" strokeWidth="4" />
          <path d="M 120 120 L 63.572 42.334 A 96 96 0 0 1 120 24 Z" fill="#059669" stroke="#ffffff" strokeWidth="4" />
          <circle cx="120" cy="120" r="96" fill="none" stroke="#0f172a" strokeWidth="2" />
        </svg>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-semibold text-slate-700 sm:grid-cols-1 sm:text-sm">
          {DAY_EIGHT_PIE_DATA.map((entry) => (
            <li key={entry.label} className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              <span>{entry.label}: {entry.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </VisualFrame>
  );
}

export function hasDayEightTheoryDiagram(sectionIndex: number) {
  return Number.isInteger(sectionIndex) && sectionIndex >= 0;
}

export function DayEightTheoryDiagram({ sectionIndex }: DayEightTheoryDiagramProps) {
  if (sectionIndex === 0) return <DataTableVisual />;
  if (sectionIndex === 1) return <LineGraphVisual />;
  if (sectionIndex === 2) return <BarChartVisual />;
  if (sectionIndex === 3) return <PieChartVisual />;

  const fallback = DAY_EIGHT_FALLBACKS[sectionIndex] ?? DAY_EIGHT_SAFE_FALLBACK;
  return <TheoryConceptVisual {...fallback} />;
}
