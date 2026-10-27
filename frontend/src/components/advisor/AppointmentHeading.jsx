import { LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

/** The portal title, the greeting, and the heading over the next appointment. */
export function AppointmentHeading({ greetingName }) {
  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <h1 className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
          Advisor Portal
        </h1>
        <Button
          variant="outline"
          className="h-8 rounded-lg border-hairline-strong bg-white text-[12.5px] font-medium"
        >
          <LayoutGrid className="size-3.5" />
          Customize My Dashboard
        </Button>
      </div>

      <div className="text-[11px] font-medium tracking-[0.12em] text-brass uppercase">
        Hi, {greetingName}.
      </div>
      <h2 className="mt-3 text-[46px] leading-[1.02] font-bold tracking-[-0.03em] text-ink uppercase">
        Your next upcoming appointment
      </h2>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p className="text-[13.5px] text-muted-ink">
          Pre-brief auto-assembled and ready to review.
        </p>
        <button className="text-[13px] font-medium text-ink hover:underline">
          View full schedule →
        </button>
      </div>
    </>
  );
}
