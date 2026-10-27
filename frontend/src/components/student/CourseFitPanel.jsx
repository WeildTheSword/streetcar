import { Button } from "@/components/ui/button";
import { Panel } from "@/components/student/Panel";

/** Next term's courses, ranked by fit to the student's target role. */
export function CourseFitPanel({ courses }) {
  return (
    <Panel
      data-tour="courses"
      title="Courses for Spring"
      sub="Ranked by fit to your target — not by what's popular."
      action={
        <Button
          variant="outline"
          className="h-7 rounded-lg border-hairline-strong bg-white text-[12px]"
        >
          See all 8 →
        </Button>
      }
    >
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-hairline text-left">
            <th className="w-[110px] pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
              Code
            </th>
            <th className="pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
              Course
            </th>
            <th className="w-[150px] pb-2 text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
              Instructor
            </th>
            <th className="w-[90px] pb-2 text-right text-[11px] font-medium tracking-wide text-muted-ink-2 uppercase">
              Fit
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.code} className="border-b border-hairline last:border-0">
              <td className="py-3.5 align-top text-[12px] font-medium text-muted-ink tnum">
                {course.code}
              </td>
              <td className="py-3.5 pr-6 align-top">
                <div className="text-[13.5px] font-medium text-ink">{course.title}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-muted-ink">
                  {course.why}
                </div>
              </td>
              <td className="py-3.5 align-top text-[12.5px] text-ink-2">
                {course.instructor}
                <div className="text-[11.5px] text-muted-ink-2">{course.meeting}</div>
              </td>
              <td className="py-3.5 text-right align-top">
                <span className="text-[15px] font-semibold text-ink tnum">
                  {course.fit}
                </span>
                <span className="ml-1 text-[11px] text-muted-ink-2">fit</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
