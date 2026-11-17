import { useEffect, useState } from "react";
import { useAuth } from "@/auth/useAuth";
import { AppShell } from "@/components/AppShell";
import { advisorSections, advisorShellUser } from "@/components/advisor/advisorNav";
import { Initials, PageHeading, Panel } from "@/components/PagePanel";
import { Input } from "@/components/ui/input";
import { fetchAlumni } from "@/services/advisorService";

const SECTIONS = advisorSections("alumni");

const matches = (alum, query) =>
  [alum.name, alum.school, alum.currentRole, alum.city]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(query));

/** Alumni Database: every alumni account, searchable by name, school, role or city. */
export function AlumniDirectoryPage() {
  const { session, logout, restartDemo } = useAuth();
  const [alumni, setAlumni] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAlumni()
      .then((list) => !cancelled && setAlumni(list))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const shown = alumni?.filter((alum) => matches(alum, query.trim().toLowerCase())) ?? [];

  return (
    <AppShell sections={SECTIONS} user={advisorShellUser(session)} onSignOut={logout} onRestart={restartDemo}>
      <PageHeading title="Alumni Database" lede="Alumni with Streetcar accounts, and how many students each is talking to.">
        <Input
          aria-label="Search alumni"
          placeholder="Search name, school, role or city"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-9 w-[280px] rounded-lg border-hairline-strong bg-white text-[13px]"
        />
      </PageHeading>

      {error && <p role="alert" className="mt-5 text-[13.5px] text-rose">{error}</p>}
      {!alumni && !error && <p className="mt-5 text-[13.5px] text-muted-ink">Loading alumni…</p>}

      {alumni && (
        <Panel className="mt-6" title="Alumni" meta={`${shown.length} of ${alumni.length}`}>
          {shown.length === 0 ? (
            <p className="text-[13px] text-muted-ink">No alumni match that search.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-hairline text-left">
                  {["Alum", "Current role", "City", "Students"].map((heading) => (
                    <th
                      key={heading}
                      className="pb-2 text-[10.5px] font-medium tracking-wide text-muted-ink-2 uppercase"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((alum) => (
                  <tr key={alum.id} className="border-b border-hairline last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <Initials>{alum.initials}</Initials>
                        <div className="leading-tight">
                          <div className="text-[13px] font-semibold text-ink">
                            {alum.name} &apos;{String(alum.gradYear).slice(-2)}
                          </div>
                          <div className="text-[11.5px] text-muted-ink">
                            {alum.school} · {alum.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[13px] text-ink-2">{alum.currentRole}</td>
                    <td className="py-3 text-[13px] text-ink-2">{alum.city}</td>
                    <td className="py-3 text-[13px] text-ink tnum">{alum.studentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}
    </AppShell>
  );
}
