import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FormInputProps =
  | ({ as?: "input"; label?: string; error?: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>)
  | ({ as: "textarea"; label?: string; error?: string; hint?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>)
  | ({
      as: "select";
      label?: string;
      error?: string;
      hint?: string;
      children: ReactNode;
    } & SelectHTMLAttributes<HTMLSelectElement>);

export function FormInput(props: FormInputProps) {
  const { label, error, hint } = props;
  const normalizedProps = "value" in props && (props.value === null || props.value === undefined)
    ? { ...props, value: "" }
    : props;
  const fieldClassName = [
    normalizedProps.className,
    normalizedProps.as === "textarea" ? "mh-textarea" : normalizedProps.as === "select" ? "mh-select" : "mh-input",
    error ? normalizedProps.as === "textarea" ? "mh-textarea--error" : normalizedProps.as === "select" ? "mh-select--error" : "mh-input--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="grid gap-2">
      {label ? <span className="text-sm font-semibold text-[var(--mh-text-soft)]">{label}</span> : null}
      {normalizedProps.as === "textarea" ? (
        <textarea {...normalizedProps} className={fieldClassName} />
      ) : normalizedProps.as === "select" ? (
        <select {...normalizedProps} className={fieldClassName}>
          {normalizedProps.children}
        </select>
      ) : (
        <input {...normalizedProps} className={fieldClassName} />
      )}
      {error ? (
        <span className="text-sm text-rose-300">{error}</span>
      ) : hint ? (
        <span className="text-sm text-[var(--mh-text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
