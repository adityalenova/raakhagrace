export function PageHero({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mx-auto max-w-3xl pb-8 text-center sm:pb-10">
      {kicker ? (
        <p className="text-[0.68rem] tracking-[0.28em] text-subtle uppercase">{kicker}</p>
      ) : null}
      <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{title}</h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted">{subtitle}</p>
    </header>
  );
}
