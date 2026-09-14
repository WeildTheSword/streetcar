import { Eye, FileText, ShieldCheck, Undo2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const GRANTS = [
  {
    icon: FileText,
    title: "Your degree audit",
    body: "Courses, grades, credits, GPA, major, and expected graduation — read directly from the registrar.",
  },
  {
    icon: Eye,
    title: "What you tell Streetcar",
    body: "Your career goal, the firms on your list, and anything you ask it to weigh.",
  },
  {
    icon: ShieldCheck,
    title: "What you do here",
    body: "Alumni you reach out to, applications you log, and the advising sessions you book.",
  },
];

/**
 * Plain-language explanation of the FERPA authorization the student is giving,
 * including the part that matters most: the record is identified rather than
 * anonymized, and what they get in exchange.
 */
export function FerpaDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="font-medium text-[#2563eb] underline-offset-2 hover:underline"
        >
          What is FERPA?
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[19px] font-semibold tracking-[-0.015em] text-ink">
            What you&apos;re authorizing
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-ink">
            The plain-language version. Worth two minutes before you agree.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <section>
            <h3 className="text-[13px] font-semibold text-ink">FERPA, briefly</h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-ink">
              The Family Educational Rights and Privacy Act is the 1974 federal law that
              protects your education records. The default is that Tulane cannot hand your
              transcript to anyone without your written consent.
            </p>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold text-ink">
              The school-official exception
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-ink">
              FERPA lets the university share records with a contractor performing a service
              it would otherwise do itself — here, career advising — provided that contractor
              stays under the university&apos;s direct control and cannot pass your record on
              to anyone else. That is the authorization Streetcar operates under, and it is
              the same basis your advisor already works from.
            </p>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold text-ink">What Streetcar reads</h3>
            <div className="mt-3 flex flex-col gap-3">
              {GRANTS.map((grant) => (
                <div key={grant.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-hairline bg-canvas">
                    <grant.icon className="size-3.5 text-burgundy" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h4 className="text-[12.5px] font-semibold text-ink">{grant.title}</h4>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-muted-ink">
                      {grant.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* The trade-off, stated plainly rather than buried. */}
          <section className="rounded-[10px] border border-[#f3e7c4] bg-highlight p-4">
            <h3 className="text-[13px] font-semibold text-ink">
              Identified, not anonymized — and why that matters
            </h3>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-2">
              This is the part worth reading twice. Your record stays attached to your name.
              Streetcar is not looking at an anonymous row in a dataset — it is looking at
              you.
            </p>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">
              Anonymized data could only tell you what tended to work for students who looked
              roughly like you. Identified data is what lets Streetcar rank courses against
              your actual transcript, hand your advisor a pre-brief on the specific thing you
              are stuck on, and introduce you to the particular alum who took the path you
              want. That is the exchange: you give up some privacy, and the work of landing
              the internship and the job gets materially easier.
            </p>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-2">
              If you are not comfortable with that, do not sign it. The system is useful
              without being mandatory, and declining does not affect your standing or your
              access to normal advising.
            </p>
          </section>

          <section>
            <h3 className="text-[13px] font-semibold text-ink">What you keep control of</h3>
            <ul className="mt-2 flex flex-col gap-1.5">
              {[
                "Revoke access at any time in Settings — reading stops immediately.",
                "Every lookup is written to an audit trail you can read: who opened your record, when, and why.",
                "Nothing goes to an employer unless you send it.",
                "Your data is never sold, and never shared outside the university's authorization.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-[12px] leading-relaxed text-muted-ink"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-mint" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="flex items-start gap-2 border-t border-hairline pt-4 text-[11.5px] leading-relaxed text-muted-ink-2">
            <Undo2 className="mt-0.5 size-3.5 shrink-0" />
            <span>
              This is a plain-language summary for the pilot, not the legal text. The full
              authorization and Tulane&apos;s FERPA notice govern.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
