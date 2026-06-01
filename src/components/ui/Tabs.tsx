import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  content?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function Tabs({ items, activeTab, onChange }: TabsProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-[var(--mh-radius-card-lg)] border border-white/8 bg-white/[0.03] p-2">
        {items.map((item) => {
          const isActive = item.id === activeTab;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-cyan-400/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.24)]"
                  : "text-slate-400 hover:bg-white/6 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) =>
        item.id === activeTab ? (
          <div key={item.id} className="mt-4">
            {item.content}
          </div>
        ) : null,
      )}
    </div>
  );
}
