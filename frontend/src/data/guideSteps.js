/**
 * Walkthrough copy for each screen after sign-in.
 *
 * Kept here rather than inline so the narration reads as one script, and so a
 * presenter can adjust wording without touching page markup.
 */

export const PROFILE_STEPS = [
  {
    title: "This is a student's first sign-in",
    target: "splash",
    body: "Everything Streetcar knows begins with one Splash Card scan. The record comes from the registrar's degree audit — the student never types their coursework in.",
  },
  {
    title: "The goal is the only opinion they give",
    target: "goal",
    body: "\"Where do you want to end up?\" drives everything downstream. Course rankings, alumni matches, and the pre-brief your advisor sees are all weighted to this answer.",
  },
  {
    title: "Consent is explicit, not buried",
    target: "consent",
    body: "Nothing is read without the FERPA School-Official Authorization, and every lookup is logged to an audit trail. That's what lets this survive a privacy review.",
  },
];

export const TRANSCRIPT_STEPS = [
  {
    title: "The record loads itself",
    target: "transcript",
    body: "Twelve courses, thirty-nine credits, straight from the degree audit. No forms, no re-entry — which is exactly why students actually finish onboarding.",
  },
  {
    title: "This is the part that compounds",
    target: "promises",
    body: "It stays current on its own. Every course they finish updates the fingerprint, and the same live record is what reaches their advisor before each session.",
  },
];

export const SCAN_STEPS = [
  {
    title: "What the scan is actually doing",
    target: "fingerprint",
    body: "Streetcar weighs the transcript against 1,204 Tulane alumni outcomes and Freeman placement data for the cohort, then ranks the paths that record actually supports.",
  },
];

export const STUDENT_STEPS = [
  {
    title: "The match score, and its alternatives",
    target: "hero",
    body: "87% to Investment Banker — but the adjacent paths sit right beside it. The student sees a ranked set of options, never a single verdict.",
  },
  {
    title: "Courses ranked by fit, not popularity",
    target: "courses",
    body: "Each row carries the reason it's there. FINE 4150 is first because LBO and DCF modeling is what a Goldman second round actually screens for.",
  },
  {
    title: "The advisor is already in the loop",
    target: "meeting",
    body: "That 11:30 with Bill runs off this same record. The student walks in and the conversation starts at the real problem instead of the catch-up.",
  },
  {
    title: "Now switch sides",
    target: "account",
    body: "Open the account menu at the bottom of the sidebar and sign out — then sign back in as Bill to see what the advisor gets.",
  },
];

export const ADVISOR_STEPS = [
  {
    title: "The same record, the other side",
    target: "prebrief",
    body: "Bill opens his console and the pre-brief for his 11:30 is already assembled. He didn't request it and Morgan didn't prepare it.",
  },
  {
    title: "What the student is actually worried about",
    target: "concerns",
    body: "Surfaced from onboarding and from their own words — the frozen LBO walk-through, the NYC cost-of-living math. The session starts at the real problem.",
  },
  {
    title: "Alumni radar",
    target: "radar",
    body: "Recent alumni role changes matched against open student tracks, with an intro ready to draft. This is the network working without anyone remembering to check it.",
  },
];
