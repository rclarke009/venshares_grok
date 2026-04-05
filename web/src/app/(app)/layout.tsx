import { AppHeader } from "@/components/app/app-header";
import { SiteFooter } from "@/components/site-footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="flex-1 bg-muted/30 px-6 py-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
