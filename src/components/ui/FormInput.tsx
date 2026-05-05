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
  const fieldClassName = [
    props.className,
    props.as === "textarea" ? "mh-textarea" : props.as === "select" ? "mh-select" : "mh-input",
    error ? props.as === "textarea" ? "mh-textarea--error" : props.as === "select" ? "mh-select--error" : "mh-input--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="grid gap-2">
      {label ? <span className="text-sm font-semibold text-[var(--mh-text-soft)]">{label}</span> : null}
      {props.as === "textarea" ? (
        <textarea {...props} className={fieldClassName} />
      ) : props.as === "select" ? (
        <select {...props} className={fieldClassName}>
          {props.children}
        </select>
      ) : (
        <input {...props} className={fieldClassName} />
      )}
      {error ? (
        <span className="text-sm text-rose-300">{error}</span>
      ) : hint ? (
        <span className="text-sm text-[var(--mh-text-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
