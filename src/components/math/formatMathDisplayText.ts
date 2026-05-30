export function formatMathDisplayText(text: string) {
  return text
    .replace(/\*/g, "\u00b7")
    .replace(/(^|[\s([{\-+\u00b7/=,:;])-(?=\d)/gu, "$1\u2212");
}
