import {
  BarChart3,
  CalendarDays,
  Database,
  Home,
  LayoutGrid,
  ScrollText,
  Target,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import predators from "@/assets/predators.png";

/**
 * The advisor console's sidebar, shared by every advisor page. `active` is the
 * key of the page being shown: portal, students, alumni, trends, appointments,
 * performance, outcomes, reports, logs or account.
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
        {
          icon: TrendingUp,
          label: "Internal Hiring Trends",
          to: "/advisor/trends",
          active: active === "trends",
        },
        {
          icon: CalendarDays,
          label: "Appointments",
          to: "/advisor/appointments",
          active: active === "appointments",
        },
        {
          icon: BarChart3,
          label: "Performance",
          to: "/advisor/performance",
          active: active === "performance",
        },
      ],
    },
    {
      label: "Manage",
      items: [
        { icon: Target, label: "Outcomes", to: "/advisor/outcomes", active: active === "outcomes" },
        { icon: LayoutGrid, label: "Reports", to: "/advisor/reports", active: active === "reports" },
        { icon: ScrollText, label: "Logs", to: "/advisor/logs", active: active === "logs" },
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
