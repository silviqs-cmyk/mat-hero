"use client";

import { useRef } from "react";
import { NeonButton } from "@/components/ui/NeonButton";

interface RichTextTextareaProps {
  label: string;
  value: string;
  rows?: number;
  hint?: string;
  onChangeValue: (value: string) => void;
}

function updateValueAtSelection(
  currentValue: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after = "",
  fallback = "",
) {
  const selectedText = currentValue.slice(selectionStart, selectionEnd);
  const innerContent = selectedText || fallback;
  const nextValue = `${currentValue.slice(0, selectionStart)}${before}${innerContent}${after}${currentValue.slice(selectionEnd)}`;
  const nextSelectionStart = selectionStart + before.length;
  const nextSelectionEnd = nextSelectionStart + innerContent.length;

  return { nextValue, nextSelectionStart, nextSelectionEnd };
}

export function RichTextTextarea({
  label,
  value,
  rows = 12,
  hint,
  onChangeValue,
}: RichTextTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function applyWrapper(before: string, after = "", fallback = "") {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChangeValue(`${value}${before}${fallback}${after}`);
      return;
    }

    const selectionStart = textarea.selectionStart ?? value.length;
    const selectionEnd = textarea.selectionEnd ?? value.length;
    const { nextValue, nextSelectionStart, nextSelectionEnd } = updateValueAtSelection(
      value,
      selectionStart,
      selectionEnd,
      before,
      after,
      fallback,
    );

    onChangeValue(nextValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  }

  function insertBlock(block: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChangeValue(value ? `${value}\n\n${block}` : block);
      return;
    }

    const selectionStart = textarea.selectionStart ?? value.length;
    const prefix = selectionStart > 0 && value.slice(0, selectionStart).trim().length > 0 ? "\n\n" : "";
    const nextValue = `${value.slice(0, selectionStart)}${prefix}${block}${value.slice(textarea.selectionEnd ?? selectionStart)}`;
    const caretPosition = selectionStart + prefix.length + block.length;

    onChangeValue(nextValue);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caretPosition, caretPosition);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <NeonButton type="button" variant="ghost" className="min-h-10 px-3" onClick={() => insertBlock("## \u0422\u0435\u043c\u0430: \u041d\u043e\u0432\u0430 \u0442\u0435\u043c\u0430\n\u0422\u0435\u043a\u0441\u0442...")}>
          {"\u0422\u0435\u043c\u0430"}
        </NeonButton>
      </div>

      <div className="flex flex-wrap gap-2">
        <NeonButton type="button" variant="secondary" className="min-h-10 px-3" onClick={() => applyWrapper("**", "**", "\u0443\u0434\u0435\u0431\u0435\u043b\u0435\u043d \u0442\u0435\u043a\u0441\u0442")}>
          Bold
        </NeonButton>
        <NeonButton type="button" variant="secondary" className="min-h-10 px-3" onClick={() => applyWrapper("[color=cyan]", "[/color]", "\u0430\u043a\u0446\u0435\u043d\u0442")}>
          Cyan
        </NeonButton>
        <NeonButton type="button" variant="secondary" className="min-h-10 px-3" onClick={() => applyWrapper("[color=gold]", "[/color]", "\u0432\u0430\u0436\u043d\u043e")}>
          Gold
        </NeonButton>
        <NeonButton type="button" variant="secondary" className="min-h-10 px-3" onClick={() => applyWrapper("[color=green]", "[/color]", "\u043f\u043e\u0434\u0441\u043a\u0430\u0437\u043a\u0430")}>
          Green
        </NeonButton>
        <NeonButton type="button" variant="secondary" className="min-h-10 px-3" onClick={() => applyWrapper("[color=red]", "[/color]", "\u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435")}>
          Red
        </NeonButton>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--mh-text-soft)]">{label}</span>
        <textarea
          ref={textareaRef}
          rows={rows}
          value={value}
          className="mh-textarea"
          onChange={(event) => onChangeValue(event.currentTarget?.value ?? "")}
        />
        {hint ? <span className="text-sm text-[var(--mh-text-muted)]">{hint}</span> : null}
      </label>
    </div>
  );
}
