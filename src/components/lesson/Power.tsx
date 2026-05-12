interface PowerProps {
  base: string;
  exponent: string;
}

export function Power({ base, exponent }: PowerProps) {
  return (
    <span className="inline-flex shrink-0 items-start whitespace-nowrap align-baseline text-current">
      <span>{base}</span>
      <sup className="ml-0.5 text-[0.65em] leading-none">{exponent}</sup>
    </span>
  );
}
