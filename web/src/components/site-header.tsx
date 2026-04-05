import Image from "next/image";
import Link from "next/link";

const nav = [
  { href: "/invent", label: "INVENT" },
  { href: "/earn", label: "EARN" },
  { href: "/invest", label: "INVEST" },
  { href: "/join", label: "JOIN" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo.svg" alt="VenShares" width={140} height={40} priority />
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            Where Ideas meet Action
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium md:gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground transition-colors hover:text-ven-green"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-ven-green px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ven-green-dark"
          >
            LOGIN
          </Link>
        </nav>
      </div>
    </header>
  );
}
