import {
  BarChart3,
  CalendarDays,
  Database,
  Home,
  LayoutGrid,
  ScrollText,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import predators from "@/assets/predators.png";

/**
 * The advisor console's sidebar, shared by every advisor page. `active` is the
 * key of the page being shown: portal, students, appointments, alumni or account.
 */
export function advisorSections(active) {
  return [
    {
      items: [{ icon: Home, label: "Advisor Portal", to: "/advisor", active: active === "portal" }],
    },
    {
      label: "Navigate",
      items: [
        { icon: Users, label: "My Students", to: "/advisor/students", active: active === "students" },
        { icon: Database, label: "Alumni Database", to: "/advisor/alumni", active: active === "alumni" },
        { icon: TrendingUp, label: "Internal Hiring Trends" },
        {
          icon: CalendarDays,
          label: "Appointments",
          to: "/advisor/appointments",
          active: active === "appointments",
        },
        { icon: BarChart3, label: "Performance" },
      ],
    },
    {
      label: "Manage",
      items: [
        { icon: BarChart3, label: "Outcomes" },
        { icon: LayoutGrid, label: "Reports" },
        { icon: ScrollText, label: "Logs" },
        { icon: UserRound, label: "My Account", to: "/account", active: active === "account" },
      ],
    },
  ];
}

/** The account chip at the foot of the advisor sidebar. */
export function advisorShellUser(session) {
  return {
    name: session.displayName,
    subtitle: session.subtitle,
    initials: session.initials,
    email: session.email ?? "bill.hudlow@tulane.edu",
    badge: predators,
  };
}
