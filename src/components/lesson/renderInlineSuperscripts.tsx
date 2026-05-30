import { type ReactNode } from "react";
import { formatMathDisplayText } from "@/components/math/formatMathDisplayText";
import { Power } from "@/components/lesson/Power";

const SUPERSCRIPT_MAP: Record<string, string> = {
  "\u2070": "0",
  "\u00b9": "1",
  "\u00b2": "2",
  "\u00b3": "3",
  "\u2074": "4",
  "\u2075": "5",
  "\u2076": "6",
  "\u2077": "7",
  "\u2078": "8",
  "\u2079": "9",
  "\u207a": "+",
  "\u207b": "-",
  "\u207c": "=",
  "\u207d": "(",
  "\u207e": ")",
  "\u207f": "n",
};

const TO_SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "\u2070",
  "1": "\u00b9",
  "2": "\u00b2",
  "3": "\u00b3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079",
  "+": "\u207a",
  "-": "\u207b",
  "=": "\u207c",
  "(": "\u207d",
  ")": "\u207e",
  n: "\u207f",
};

const SUPERSCRIPT_PATTERN = /[\u00b2\u00b3\u00b9\u2070\u2074-\u2079\u207a-\u207f]+/gu;
const SIMPLE_BASE_PATTERN = /[\p{L}\p{N}]+/u;
const CARET_EXPONENT_PATTERN = /\^(?:\((-?[0-9]+)\)|(-?[0-9]+))/gu;

function isSimpleBaseCharacter(character: string | undefined) {
  return typeof character === "string" && SIMPLE_BASE_PATTERN.test(character);
}

function canAttachLeadingSign(previousCharacter: string | undefined) {
  if (!previousCharacter) {
    return true;
  }

  return !/[\p{L}\p{N})\]]/u.test(previousCharacter);
}

function normalizeSuperscript(exponent: string) {
  return Array.from(exponent, (character) => SUPERSCRIPT_MAP[character] ?? character).join("");
}

function convertExponentToSuperscript(exponent: string) {
  return Array.from(exponent, (character) => TO_SUPERSCRIPT_MAP[character] ?? character).join("");
}

function normalizeCaretPowers(text: string) {
  return text.replaceAll(CARET_EXPONENT_PATTERN, (_, groupedExponent: string | undefined, bareExponent: string | undefined) => {
    const exponent = groupedExponent ?? bareExponent ?? "";
    return convertExponentToSuperscript(exponent);
  });
}

function findParenthesizedBaseStart(text: string, closingParenIndex: number) {
  let depth = 0;

  for (let index = closingParenIndex; index >= 0; index -= 1) {
    const character = text[index];

    if (character === ")") {
      depth += 1;
      continue;
    }

    if (character === "(") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return null;
}

function findPowerBaseStart(text: string, exponentStart: number) {
  const previousIndex = exponentStart - 1;
  if (previousIndex < 0) {
    return null;
  }

  const previousCharacter = text[previousIndex];

  if (previousCharacter === ")") {
    const parenthesizedBaseStart = findParenthesizedBaseStart(text, previousIndex);
    if (parenthesizedBaseStart === null) {
      return null;
    }

    const signIndex = parenthesizedBaseStart - 1;
    if (
      signIndex >= 0 &&
      (text[signIndex] === "-" || text[signIndex] === "+") &&
      canAttachLeadingSign(text[signIndex - 1])
    ) {
      return signIndex;
    }

    return parenthesizedBaseStart;
  }

  if (!isSimpleBaseCharacter(previousCharacter)) {
    return null;
  }

  let baseStart = previousIndex;
  while (baseStart > 0 && isSimpleBaseCharacter(text[baseStart - 1])) {
    baseStart -= 1;
  }

  const signIndex = baseStart - 1;
  if (
    signIndex >= 0 &&
    (text[signIndex] === "-" || text[signIndex] === "+") &&
    canAttachLeadingSign(text[signIndex - 1])
  ) {
    return signIndex;
  }

  return baseStart;
}

export function renderInlineSuperscripts(text: string): ReactNode[] {
  const normalizedText = normalizeCaretPowers(text);
  const content: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of normalizedText.matchAll(SUPERSCRIPT_PATTERN)) {
    const exponentStart = match.index ?? 0;
    const exponentEnd = exponentStart + match[0].length;
    const baseStart = findPowerBaseStart(normalizedText, exponentStart);

    if (baseStart === null || baseStart < lastIndex) {
      continue;
    }

    if (baseStart > lastIndex) {
      content.push(formatMathDisplayText(normalizedText.slice(lastIndex, baseStart)));
    }

    content.push(
      <Power
        key={`${baseStart}-${match[0]}`}
        base={formatMathDisplayText(normalizedText.slice(baseStart, exponentStart))}
        exponent={normalizeSuperscript(match[0])}
      />,
    );

    lastIndex = exponentEnd;
  }

  if (lastIndex < normalizedText.length) {
    content.push(formatMathDisplayText(normalizedText.slice(lastIndex)));
  }

  return content;
}
