export function NewEraEduMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[54rem]">
      <div className="absolute inset-x-[6%] top-[8%] h-[76%] rounded-full bg-[radial-gradient(circle_at_center,rgba(219,233,255,0.92),rgba(231,239,255,0.6)_58%,rgba(255,255,255,0)_80%)] blur-3xl" />

      <div className="relative z-10 min-h-[24rem] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(246,249,255,0.99)_100%)] shadow-[0_32px_80px_rgba(125,146,196,0.22)]">
        <img
          src="/images/new-era-edu/hero-showcase-v6.png"
          alt="NEW ERA EDU product showcase"
          loading="eager"
          className="block h-auto min-h-[24rem] w-full object-cover object-center"
        />
      </div>
    </div>
  );
}
