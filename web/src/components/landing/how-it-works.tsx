import {
  BadgeCheck,
  Banknote,
  ChartSpline,
  Lightbulb,
  Rocket,
  Users,
  Wallet,
} from "lucide-react";

const steps = [
  {
    title: "Inventor shares an idea",
    body: "Capture the concept, context, and what “success” means.",
    icon: Lightbulb,
  },
  {
    title: "IP & fit check",
    body: "Align on scope, roles, and how work will be credited.",
    icon: BadgeCheck,
  },
  {
    title: "Professionals join the project",
    body: "Match skills to milestones with clear ownership.",
    icon: Users,
  },
  {
    title: "Crowdfunding / funding path",
    body: "Optional capital milestones when the project is ready.",
    icon: Wallet,
  },
  {
    title: "Funded & executing",
    body: "Operate in a shared workspace with deliverables front and center.",
    icon: Rocket,
  },
  {
    title: "Revenue & operations",
    body: "Track outcomes and agreements outside the app, in writing.",
    icon: Banknote,
  },
  {
    title: "Growth",
    body: "Measure progress and iterate with your team.",
    icon: ChartSpline,
  },
];

export function HowItWorks() {
  return (
    <section className="border-t bg-muted/40 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold text-ven-dark md:text-4xl">
          How does VenShares work?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          A simple path from idea to execution—designed for clarity and trust.
        </p>
        <ol className="mt-12 space-y-6">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm md:gap-6 md:p-6"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ven-green/15 text-ven-green">
                <step.icon className="h-6 w-6" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ven-blue">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
