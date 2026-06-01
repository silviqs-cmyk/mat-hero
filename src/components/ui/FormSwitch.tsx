interface FormSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function FormSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: FormSwitchProps) {
  return (
    <label className={`flex items-center justify-between gap-4 rounded-[var(--mh-radius-card-lg)] border border-white/10 bg-white/[0.03] px-4 py-3 ${disabled ? "opacity-50" : ""}`}>
      <div>
        {label ? <p className="text-sm font-semibold text-white">{label}</p> : null}
        {description ? <p className="mt-1 text-xs text-slate-400">{description}</p> : null}
      </div>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full border transition ${
          checked
            ? "border-cyan-300/40 bg-cyan-400/20"
            : "border-white/10 bg-white/5"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.18)] transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}
