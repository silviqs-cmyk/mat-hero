import type { TextareaHTMLAttributes } from "react";
import { FormInput } from "@/components/ui/FormInput";

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function FormTextarea(props: FormTextareaProps) {
  return <FormInput as="textarea" {...props} />;
}
