interface PowerProps {
  base: string;
  exponent: string;
}

export function Power({ base, exponent }: PowerProps) {
  return (
    <span className="inline-flex shrink-0 items-start whitespace-nowrap break-normal align-baseline text-current [overflow-wrap:normal] [word-break:keep-all]">
      <span>{base}</span>
      <sup className="ml-0.5 text-[0.65em] leading-none">{exponent}</sup>
    </span>
  );
}
