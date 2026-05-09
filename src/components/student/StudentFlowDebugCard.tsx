import { NeonCard } from "@/components/ui/NeonCard";

interface StudentFlowDebugItem {
  label: string;
  value: boolean | number | string | null | undefined;
}

interface StudentFlowDebugCardProps {
  title: string;
  items: StudentFlowDebugItem[];
}

function formatDebugValue(value: StudentFlowDebugItem["value"]) {
  if (typeof value === "boolean") {
    return value ? "yes" : "no";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "string" && value.length === 0) {
    return "(empty)";
  }

  return String(value);
}

export function StudentFlowDebugCard({ title, items }: StudentFlowDebugCardProps) {
  return (
    <NeonCard padding="sm" className="rounded-[24px] border-amber-300/30 bg-slate-950/90">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/90">Debug</p>
      <h2 className="mt-2 text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
            <p className="mt-2 break-words text-sm text-white">{formatDebugValue(item.value)}</p>
          </div>
        ))}
      </div>
    </NeonCard>
  );
}
