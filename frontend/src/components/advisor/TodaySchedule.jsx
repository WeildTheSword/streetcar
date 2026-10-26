import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** Today's appointments, with the next student's card outlined in brass. */
export function TodaySchedule({ schedule, nextStudentId }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">
          Today&apos;s Schedule
        </h3>
        <div className="flex items-center gap-2">
          <Tabs defaultValue="24h">
            <TabsList className="h-7 rounded-lg bg-hairline/60 p-0.5">
              {["24h", "7d", "30d", "90d"].map((range) => (
                <TabsTrigger
                  key={range}
                  value={range}
                  className="h-6 rounded-md px-2.5 text-[11.5px] data-[state=active]:bg-ink data-[state=active]:text-white"
                >
                  {range}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button className="h-7 rounded-lg bg-ink text-[11.5px] hover:bg-ink-2">
            <Plus className="size-3.5" />
            New appointment
          </Button>
        </div>
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3">
        {schedule.map((appointment) => (
          <div
            key={appointment.id}
            className={cn(
              "rounded-[10px] border bg-surface p-3.5",
              appointment.studentId === nextStudentId
                ? "border-brass/45"
                : "border-hairline",
            )}
          >
            <div className="flex items-start gap-2.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#d7d2c8] text-[10px] font-semibold text-[#3d3a35]">
                {appointment.initials}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="text-[13px] font-semibold text-ink">
                  {appointment.studentName}
                </div>
                <div className="text-[11px] text-muted-ink">
                  {appointment.major} · {appointment.year} · {appointment.gpa}
                </div>
              </div>
              <span className="shrink-0 text-[11.5px] text-muted-ink tnum">
                {appointment.time}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11.5px] text-ink-2">
              <span className="size-1.5 rounded-full bg-brass" />
              Track: {appointment.track}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {appointment.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-hairline/70 px-1.5 py-0.5 text-[10px] text-muted-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
