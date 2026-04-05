export function LandingHero() {
  return (
    <section className="hero-gradient relative overflow-hidden px-6 py-20 text-white md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, white 0%, transparent 45%), radial-gradient(circle at 80% 30%, white 0%, transparent 40%)",
        }}
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          VenShares connects skilled professionals with inventors to build
          businesses together.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
          Share ideas, ship work, and align upside—without losing momentum on
          either side of the table.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="/join"
            className="inline-flex rounded-full bg-white px-8 py-3 text-sm font-semibold text-ven-green shadow-md transition hover:bg-white/90"
          >
            Get started
          </a>
          <a
            href="/invent"
            className="inline-flex rounded-full border-2 border-white/80 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            I have an idea
          </a>
        </div>
      </div>
    </section>
  );
}
