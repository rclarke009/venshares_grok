import Link from "next/link";

export default function InvestPlaceholderPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="text-3xl font-bold text-ven-dark md:text-4xl">Invest</h1>
      <p className="mt-4 text-muted-foreground">
        Anything involving investment, securities, or promises of returns
        requires legal review. This section is a{" "}
        <strong>placeholder</strong> until counsel approves copy and flows.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        See <code className="rounded bg-muted px-1">docs/LEGAL_AND_ICP_OUTLINE.md</code>{" "}
        in the repository for the working checklist.
      </p>
      <Link
        href="/contact"
        className="mt-8 inline-flex rounded-full bg-ven-green px-8 py-3 text-sm font-semibold text-white hover:bg-ven-green-dark"
      >
        Contact us
      </Link>
    </div>
  );
}
