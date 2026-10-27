import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The page head with its two actions, and the welcome line under it. */
export function PathHeader({ firstName }) {
  return (
    <>
      {/* Page head */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">My Path</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
          >
            <Plus className="size-3.5" />
            Log a move
          </Button>
          <Button className="h-8 rounded-lg bg-ink text-[12.5px] font-medium hover:bg-ink-2">
            <CalendarDays className="size-3.5" />
            Book with Bill
          </Button>
        </div>
      </div>

      {/* Intro */}
      <div className="text-[11px] font-medium tracking-[0.1em] text-muted-ink-2 uppercase">
        November 18 · 26 weeks to graduation
      </div>
      <div className="mt-3 flex items-end justify-between gap-6">
        <div>
          <div className="text-[30px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Welcome back, {firstName}.
          </div>
          <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-muted-ink">
            The first job is a ten-year bet —{" "}
            <em className="text-ink-2">and most graduates lose it.</em> Let&apos;s make sure
            you don&apos;t.
          </p>
        </div>
        <button className="shrink-0 text-[12.5px] font-medium text-burgundy hover:underline">
          View fingerprint →
        </button>
      </div>
    </>
  );
}
