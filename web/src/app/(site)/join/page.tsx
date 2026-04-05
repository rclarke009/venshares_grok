import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
      <h1 className="text-3xl font-bold text-ven-dark md:text-4xl">Join VenShares</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Create an account to start projects, upload files, and collaborate.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/register"
          className="inline-flex rounded-full bg-ven-green px-8 py-3 text-sm font-semibold text-white hover:bg-ven-green-dark"
        >
          Register
        </Link>
        <Link
          href="/login"
          className="inline-flex rounded-full border px-8 py-3 text-sm font-semibold hover:bg-muted"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
