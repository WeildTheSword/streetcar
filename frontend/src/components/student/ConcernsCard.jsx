import { CardCta, SectionCard } from "@/components/student/SectionCard";

/** The thought-bubble motif from the mockup's "what's on your mind" card. */
function MindIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto my-2.5 size-9 text-muted-ink-2"
    >
      <path d="M24 44c-6-2-10-7-10-14 0-9 8-16 18-16s18 7 18 16c0 4-1.5 7.5-4 10v6c0 2-1.5 3-3 3h-3v4" />
      <path d="M24 44v8c0 1.5 1 2.5 2.5 2.5H30" />
      <circle cx="50" cy="48" r="2" />
      <circle cx="55" cy="54" r="1.3" />
      <circle cx="58.5" cy="59" r="0.9" />
    </svg>
  );
}

/** The concerns the student has raised ahead of their advising meeting. */
export function ConcernsCard({ concerns }) {
  return (
    <SectionCard eyebrow="What's on your mind">
      <MindIcon />
      <ul className="flex flex-1 flex-col gap-2">
        {concerns.map((concern) => (
          <li key={concern.title} className="flex gap-2 text-[12px] leading-[1.45]">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-ink-2" />
            <span className="text-muted-ink">
              <b className="font-semibold text-ink">{concern.title}.</b> {concern.detail}
            </span>
          </li>
        ))}
      </ul>
      <CardCta>Articulate your concerns →</CardCta>
    </SectionCard>
  );
}
