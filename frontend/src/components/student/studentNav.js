import {
  CalendarDays,
  FileText,
  Fingerprint,
  Home,
  ListOrdered,
  ScrollText,
  UserRound,
  Users,
} from "lucide-react";

/**
 * The student console's sidebar, shared by every student page. `active` is the
 * key of the page being shown: path, courses, alumni, appointments,
 * applications, fingerprint, resume or account. `counts` is GET /me/summary;
 * the badges stay hidden until it has loaded.
 */
export function studentSections(active, counts) {
  const item = (key, icon, label, to, count) => ({ icon, label, to, active: active === key, count });
  return [
    {
      items: [item("path", Home, "My Path", "/student")],
    },
    {
      label: "Plan",
      items: [
        item("courses", ListOrdered, "Courses", "/student/courses"),
        item("alumni", Users, "Alumni", "/student/alumni", counts?.alumni),
        item("appointments", CalendarDays, "Appointments", "/student/appointments", counts?.appointments),
        item("applications", FileText, "Applications", "/student/applications", counts?.applications),
      ],
    },
    {
      label: "Me",
      items: [
        item("fingerprint", Fingerprint, "Fingerprint", "/student/fingerprint"),
        item("resume", ScrollText, "Resume", "/student/resume"),
        item("account", UserRound, "My Account", "/account"),
      ],
    },
  ];
}

/** The account chip at the foot of the student sidebar. */
export function studentShellUser(session) {
  return {
    name: session.displayName,
    subtitle: session.subtitle,
    initials: session.initials,
    email: session.email ?? "morgan@tulane.edu",
  };
}
