import { EarningsChart } from "@/components/landing/earnings-chart";
import { HowItWorks } from "@/components/landing/how-it-works";
import { JoinSections } from "@/components/landing/join-sections";
import { LandingHero } from "@/components/landing/hero";

export default function HomePage() {
  return (
    <>
      <LandingHero />
      <HowItWorks />
      <JoinSections />
      <EarningsChart />
    </>
  );
}
