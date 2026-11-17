import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { sessionRole } from "@/auth/sessionRole";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { studentSections } from "@/components/student/studentNav";
import { Initials, PageHeading, Panel, Pill } from "@/components/PagePanel";
import { formatDateTime, initialsOf } from "@/lib/format";
import { fetchAccount } from "@/services/advisorService";

const ROLE_LABEL = { STUDENT: "Student", ADVISOR: "Advisor", ALUMNI: "Alumni" };

const ALUMNI_SECTIONS = [
  { items: [{ icon: UserRound, label: "My Account", to: "/account", active: true }] },
];

/** The sidebar and account chip for whichever role is signed in. */
function chromeFor(role, session) {
  const user = {
    name: session.displayName,
    subtitle: session.subtitle,
    initials: session.initials,
    email: session.email ?? "",
  };
  if (role === "ADVISOR") return { sections: advisorSections("account"), user: advisorShellUser(session) };
  if (role === "STUDENT") return { sections: studentSections("account"), user };
  return { sections: ALUMNI_SECTIONS, user };
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase">{label}</dt>
      <dd className="mt-0.5 text-[13.5px] text-ink">{value}</dd>
    </div>
  );
}

/** My Account: the signed-in user's own record, for students, advisors and alumni alike. */
export function AccountPage() {
  const { session, logout, restartDemo } = useAuth();
  const role = sessionRole(session);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAccount()
      .then((data) => !cancelled && setAccount(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const { sections, user } = chromeFor(role, session);

  return (
    <AppShell sections={sections} user={user} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="My Account" lede="What Streetcar has on file for you." />

      {error && <p role="alert" className="mt-5 text-[13.5px] text-rose">{error}</p>}
      {!account && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading your account…</p>}

      {account && (
        <div className="mt-6 flex max-w-[860px] flex-col gap-4">
          <Panel>
            <div className="flex items-center gap-3">
              <Initials>{initialsOf(account.name)}</Initials>
              <div className="leading-tight">
                <h2 className="text-[17px] font-semibold tracking-[-0.015em] text-ink">{account.name}</h2>
                <p className="text-[12.5px] text-muted-ink">{ROLE_LABEL[account.role] ?? account.role}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-hairline pt-4">
              <Detail label="Email" value={account.email} />
              <Detail label="Role" value={ROLE_LABEL[account.role] ?? account.role} />
              {account.role === "STUDENT" && (
                <>
                  <Detail label="Class year" value={account.classYear ?? "Not set"} />
                  <Detail label="Profiles submitted" value={account.submissionCount} />
                </>
              )}
              {account.alumni && (
                <>
                  <Detail label="School" value={`${account.alumni.school} '${String(account.alumni.gradYear).slice(-2)}`} />
                  <Detail label="Current role" value={account.alumni.currentRole} />
                  <Detail label="City" value={account.alumni.city} />
                </>
              )}
            </dl>
          </Panel>

          <div className="grid grid-cols-2 gap-4">
            <Panel title="Appointments" meta={`${account.appointments.length} booked`}>
              {account.appointments.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No appointments booked.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {account.appointments.map((appointment) => (
                    <li key={appointment.id} className="leading-tight">
                      <div className="text-[13px] font-medium text-ink">{appointment.withName}</div>
                      <div className="text-[12px] text-muted-ink tnum">{formatDateTime(appointment.startsAt)}</div>
                      {appointment.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {appointment.tags.map((tag) => (
                            <Pill key={tag}>{tag}</Pill>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Conversations" meta={`${account.conversations.length} threads`}>
              {account.conversations.length === 0 ? (
                <p className="text-[13px] text-muted-ink">No conversations yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {account.conversations.map((convo) => (
                    <li key={convo.id} className="leading-tight">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-ink">{convo.withName}</span>
                        <Pill>{convo.statusLabel}</Pill>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[12px] text-ink-2">{convo.snippet}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}
