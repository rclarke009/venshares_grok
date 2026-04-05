"use client";

import dynamic from "next/dynamic";

const EarningsChartInner = dynamic(
  () =>
    import("./earnings-chart-inner").then((m) => ({
      default: m.EarningsChartInner,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading chart…
      </div>
    ),
  },
);

export function EarningsChart() {
  return (
    <section className="border-t bg-background px-6 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-ven-dark md:text-3xl">
          Potential earnings trajectory (illustrative)
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          Not a guarantee of returns. For discussion only—see legal counsel for
          any investment or compensation structure.
        </p>
        <div className="mt-10 h-80 min-h-[20rem] w-full min-w-0 rounded-2xl border bg-card p-4 shadow-sm md:p-6">
          <EarningsChartInner />
        </div>
      </div>
    </section>
  );
}
