import Link from "next/link";

export default function EarnLandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-ven-blue">
        Professionals
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ven-dark md:text-4xl">
        Earn with your craft on projects that respect your time
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Join inventor-led initiatives with transparent scope, artifacts, and
        expectations—so you can focus on building, not chasing context.
      </p>
      <ul className="mt-8 list-inside list-disc space-y-2 text-muted-foreground">
        <li>Project-based collaboration with a shared file workspace</li>
        <li>Ownership of deliverables you create (per your agreements)</li>
        <li>Room to grow into longer-term partnerships</li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/register"
          className="inline-flex rounded-full bg-ven-green px-8 py-3 text-sm font-semibold text-white hover:bg-ven-green-dark"
        >
          Create account
        </Link>
        <Link href="/dashboard" className="inline-flex rounded-full border px-8 py-3 text-sm font-semibold hover:bg-muted">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
