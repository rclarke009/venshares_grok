import Link from "next/link";

export function JoinSections() {
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-ven-dark">For inventors</h2>
          <p className="mt-3 text-muted-foreground">
            Bring your idea, define milestones, and collaborate with people who
            can actually build—not just advise.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-full bg-ven-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-ven-green-dark"
          >
            Join as inventor
          </Link>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-ven-dark">For professionals</h2>
          <p className="mt-3 text-muted-foreground">
            Work on projects you believe in with transparent roles and structured
            deliverables—earn with your craft.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-flex rounded-full bg-ven-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-ven-green-dark"
          >
            Join as professional
          </Link>
        </div>
      </div>
    </section>
  );
}
