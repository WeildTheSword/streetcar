import {
  CalendarDays,
  FileText,
  Fingerprint,
  Home,
  ListOrdered,
  UserRound,
  Users,
} from "lucide-react";

/** The student sidebar, shared by the dashboard and the account page. */
export function studentSections(active) {
  return [
    {
      items: [{ icon: Home, label: "My Path", to: "/student", active: active === "path" }],
    },
    {
      label: "Plan",
      items: [
        { icon: ListOrdered, label: "Courses" },
        { icon: Users, label: "Alumni", count: 3 },
        { icon: CalendarDays, label: "Appointments", count: 1 },
        { icon: FileText, label: "Applications", count: 14 },
      ],
    },
    {
      label: "Me",
      items: [
        { icon: Fingerprint, label: "Fingerprint" },
        { icon: FileText, label: "Resume" },
        { icon: UserRound, label: "My Account", to: "/account", active: active === "account" },
      ],
    },
  ];
}
