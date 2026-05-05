import type { ReactNode, SelectHTMLAttributes } from "react";
import { FormInput } from "@/components/ui/FormInput";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormSelect(props: FormSelectProps) {
  return <FormInput as="select" {...props} />;
}
