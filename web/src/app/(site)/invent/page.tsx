import Link from "next/link";

export default function InventLandingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-ven-blue">
        Inventors
      </p>
      <h1 className="mt-2 text-3xl font-bold text-ven-dark md:text-4xl">
        Turn your idea into a project people can execute with you
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        VenShares helps you articulate the problem, define milestones, and
        collaborate with skilled professionals who can ship—not just comment.
      </p>
      <ul className="mt-8 list-inside list-disc space-y-2 text-muted-foreground">
        <li>Structured project workspace for files and deliverables</li>
        <li>Clear roles and next steps (legal agreements stay outside the app)</li>
        <li>Aligned incentives when you are ready for formal arrangements</li>
      </ul>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/register"
          className="inline-flex rounded-full bg-ven-green px-8 py-3 text-sm font-semibold text-white hover:bg-ven-green-dark"
        >
          Create account
        </Link>
        <Link
          href="/contact"
          className="inline-flex rounded-full border px-8 py-3 text-sm font-semibold hover:bg-muted"
        >
          Talk to us
        </Link>
      </div>
    </div>
  );
}
