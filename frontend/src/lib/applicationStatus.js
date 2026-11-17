/** The four states an application can be in, in funnel order, with how each is shown. */
export const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied", tone: "sky" },
  { value: "interview", label: "Interview", tone: "amber" },
  { value: "offer", label: "Offer", tone: "mint" },
  { value: "rejected", label: "Rejected", tone: "rose" },
];

const BY_VALUE = Object.fromEntries(APPLICATION_STATUSES.map((status) => [status.value, status]));

/** How to show one status value; an unknown value is shown as itself, muted. */
export const applicationStatus = (value) => BY_VALUE[value] ?? { value, label: value, tone: "muted" };
