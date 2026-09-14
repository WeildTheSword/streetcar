import { ChevronRight, GraduationCap, Users } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    role: "ADVISOR",
    icon: Users,
    title: "Advisor",
    subtitle: "Click here if you advise students",
    accent: "#6B2E82",
    points: ["Your caseload", "Assembled pre-briefs", "Alumni radar", "Outcome reporting"],
  },
  {
    role: "STUDENT",
    icon: GraduationCap,
    title: "Student",
    subtitle: "For students at the university",
    accent: "#2F6B3E",
    points: [
      "Your career fingerprint",
      "Courses ranked to your goal",
      "Alumni already doing the work",
      "Sessions with your advisor",
    ],
  },
];

/**
 * Role gate shown before sign-in, built on the shadcn Card primitives so it
 * matches the rest of the app's component language. The choice scopes which
 * demo accounts are offered; RequireAuth enforces the same split after sign-in.
 */
export function RoleChooser({ onSelect }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      {/* Restrained ground: a dot grid, with one soft Mardi Gras wash behind it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage: "radial-gradient(circle, #d9d6cf 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 40%, #000 30%, transparent 78%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[22%] left-1/2 size-[820px] -translate-x-1/2 opacity-[0.13]"
        style={{
          background:
            "radial-gradient(circle, #6B2E82 0%, #E8C547 45%, transparent 70%)",
        }}
      />

      <header className="relative px-8 pt-8">
        <div className="text-[15px] font-semibold tracking-[-0.01em] text-ink">Streetcar</div>
        <div className="mt-1 text-[11px] font-medium tracking-[0.14em] text-brass uppercase">
          Tulane University Pilot
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[820px]">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11.5px] font-medium text-muted-ink">
              <span className="size-1.5 rounded-full bg-[#2F6B3E]" />
              Choose your access
            </span>
            <h1 className="mt-4 text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              How will you be using Streetcar?
            </h1>
            <p className="mx-auto mt-2 max-w-[440px] text-[13.5px] leading-relaxed text-muted-ink">
              This decides which parts of the product you can reach. You can sign out and
              switch at any time.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {ROLES.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => onSelect(option.role)}
                className="group text-left focus-visible:outline-none"
              >
                <Card
                  className={cn(
                    "relative h-full gap-4 transition-all duration-200",
                    "ring-foreground/10 group-hover:ring-foreground/25",
                    "group-hover:shadow-[0_10px_30px_rgba(42,26,18,0.08)]",
                    "group-focus-visible:ring-2 group-focus-visible:ring-burgundy/50",
                  )}
                >
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-0.5 opacity-80"
                    style={{ background: option.accent }}
                  />

                  <CardHeader>
                    <span className="mb-3 flex size-9 items-center justify-center rounded-lg border border-hairline bg-canvas">
                      <option.icon
                        className="size-[18px]"
                        strokeWidth={1.8}
                        style={{ color: option.accent }}
                      />
                    </span>
                    <CardTitle className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
                      {option.title}
                    </CardTitle>
                    <CardDescription className="text-[13px] text-muted-ink">
                      {option.subtitle}
                    </CardDescription>
                    <CardAction>
                      <ChevronRight className="size-4 text-muted-ink-2 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink" />
                    </CardAction>
                  </CardHeader>

                  <CardContent>
                    <ul className="flex flex-col gap-1.5 border-t border-hairline pt-3.5">
                      {option.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-2 text-[12.5px] text-muted-ink"
                        >
                          <span
                            className="size-1 shrink-0 rounded-full"
                            style={{ background: option.accent }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-[12px] text-muted-ink-2">
            Not sure? Choose <span className="text-muted-ink">Student</span> — switching
            takes one sign-out.
          </p>
        </div>
      </main>

      <footer className="relative flex items-center justify-between px-8 pb-7 text-[11.5px] text-muted-ink-2">
        <span>FERPA opt-in · Every view is attributable</span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 rounded-full bg-[#6B2E82]" />
          <span className="h-0.5 w-5 rounded-full bg-[#2F6B3E]" />
          <span className="h-0.5 w-5 rounded-full bg-[#E8C547]" />
        </span>
      </footer>
    </div>
  );
}
