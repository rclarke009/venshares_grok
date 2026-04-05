import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto bg-ven-dark py-8 text-center text-sm text-white">
      <p>
        VenShares, Inc. Copyright 2020–{year} ·{" "}
        <Link
          href="/contact"
          className="underline underline-offset-2 hover:text-ven-green"
        >
          Contact Us
        </Link>
      </p>
    </footer>
  );
}
