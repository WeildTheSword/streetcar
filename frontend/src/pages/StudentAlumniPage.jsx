import { useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { studentSections, studentShellUser } from "@/components/student/studentNav";
import { Initials, LoadError, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLoad } from "@/hooks/useLoad";
import { useStudentCounts } from "@/hooks/useStudentCounts";
import { fetchMyAlumni, startConversation } from "@/services/studentService";

const MAX_MESSAGE = 500;

const STATUS_TONE = { reply: "mint", sent: "sky", draft: "muted", warm: "amber" };

/** The inline "Reach out" form under one alum. */
function ReachOutForm({ alum, onSent, onClose }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const fieldId = `reach-out-${alum.id}`;

  async function send(event) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Write a message first.");
      return;
    }
    if (trimmed.length > MAX_MESSAGE) {
      setError(`Keep it to ${MAX_MESSAGE} characters.`);
      return;
    }
    setError(null);
    setSending(true);
    try {
      onSent(await startConversation(alum.id, trimmed));
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} className="mt-2.5 flex flex-col gap-2">
      <Label htmlFor={fieldId} className="text-[12px] font-medium text-ink-2">
        Message to {alum.name}
      </Label>
      <textarea
        id={fieldId}
        rows={3}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Introduce yourself and say what you would like to learn."
        className="rounded-lg border border-hairline-strong bg-white px-2.5 py-2 text-[13px] text-ink focus-visible:ring-[3px] focus-visible:ring-burgundy/25 focus-visible:outline-none"
      />
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={sending}
          className="h-7 rounded-lg bg-ink text-[11.5px] font-medium hover:bg-ink-2"
        >
          {sending ? "Sending…" : "Send"}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose} className="h-7 rounded-lg text-[11.5px]">
          Cancel
        </Button>
        <span className="ml-auto text-[11px] text-muted-ink-2 tnum">
          {message.trim().length}/{MAX_MESSAGE}
        </span>
      </div>
      {error && <p role="alert" className="text-[12.5px] text-rose">{error}</p>}
    </form>
  );
}

/** Alumni: every alum on Streetcar, where the student stands with each, and a way to reach out. */
export function StudentAlumniPage() {
  const { session, logout, restartDemo } = useAuth();
  const { counts, refresh } = useStudentCounts();
  const { data: alumni, error, setData: setAlumni, reload } = useLoad(fetchMyAlumni);
  const [openId, setOpenId] = useState(null);

  function sent(updated) {
    setAlumni((previous) => previous.map((alum) => (alum.id === updated.id ? updated : alum)));
    setOpenId(null);
    refresh();
  }

  const talkingTo = alumni?.filter((alum) => alum.status).length ?? 0;

  return (
    <AppShell
      sections={studentSections("alumni", counts)}
      user={studentShellUser(session)}
      onSignOut={logout}
      onRestart={restartDemo}
    >
      <PageHeading title="Alumni" lede="Alumni on Streetcar, and where each conversation stands." />

      {error && <LoadError className="mt-5" message={error} onRetry={reload} />}
      {!alumni && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading alumni…</p>}

      {alumni && (
        <Panel
          className="mt-6 max-w-[860px]"
          title="Alumni"
          meta={`${alumni.length} alumni · talking to ${talkingTo}`}
        >
          {alumni.length === 0 ? (
            <p className="text-[13px] text-muted-ink">No alumni on Streetcar yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-hairline">
              {alumni.map((alum) => (
                <li key={alum.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <Initials>{alum.initials}</Initials>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-semibold text-ink">
                          {alum.name} &apos;{String(alum.gradYear).slice(-2)}
                        </div>
                        <div className="text-[12px] text-muted-ink">
                          {alum.currentRole} · {alum.school} · {alum.city}
                        </div>
                      </div>
                      {alum.status ? (
                        <Pill tone={STATUS_TONE[alum.status]}>{alum.statusLabel}</Pill>
                      ) : (
                        openId !== alum.id && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpenId(alum.id)}
                            className="h-7 rounded-lg text-[11.5px]"
                          >
                            Reach out
                          </Button>
                        )
                      )}
                    </div>
                    {alum.snippet && <p className="mt-1.5 line-clamp-2 text-[12.5px] text-ink-2">{alum.snippet}</p>}
                    {openId === alum.id && (
                      <ReachOutForm alum={alum} onSent={sent} onClose={() => setOpenId(null)} />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
