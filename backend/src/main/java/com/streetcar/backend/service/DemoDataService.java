package com.streetcar.backend.service;

import com.streetcar.backend.model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Hardcoded demo fixtures for the pitch walkthrough. Content mirrors the
 * high-fidelity mockups in ui_kits/. There is no database — the only mutable
 * state is which students have completed the fingerprint onboarding, which the
 * demo needs so the splash can be shown once and then skipped.
 */
@Service
public class DemoDataService {

    private static final String MORGAN = "morgan-thibodaux";

    private final Map<String, Boolean> onboarded = new ConcurrentHashMap<>();

    /**
     * Name/initials supplied when an account is created during the demo. The
     * fixture profile is kept in full — only the identity on the front of it is
     * swapped, so a new sign-up sees their own name over the same record.
     */
    private final Map<String, String[]> identities = new ConcurrentHashMap<>();

    public void setIdentity(String profileId, String name, String initials) {
        identities.put(profileId, new String[] { name, initials });
    }

    private String nameFor(String profileId, String fallback) {
        String[] identity = identities.get(profileId);
        return identity != null ? identity[0] : fallback;
    }

    private String initialsFor(String profileId, String fallback) {
        String[] identity = identities.get(profileId);
        return identity != null ? identity[1] : fallback;
    }

    public List<DemoUser> users() {
        return List.of(
            new DemoUser("morgan@tulane.edu", "streetcar", "STUDENT", MORGAN,
                "Morgan A. Thibodaux", "MT", "Finance + CS · Junior"),
            new DemoUser("bill.hudlow@tulane.edu", "streetcar", "ADVISOR", "bill-hudlow",
                "Bill Hudlow", "BH", "Freeman · Consultant")
        );
    }

    public boolean isOnboarded(String studentId) {
        return onboarded.getOrDefault(studentId, false);
    }

    public void completeOnboarding(String studentId) {
        onboarded.put(studentId, true);
    }

    /** Resets onboarding and any created identities so the demo can run again. */
    public void resetOnboarding() {
        onboarded.clear();
        identities.clear();
    }

    public Student morgan() {
        return new Student(
            MORGAN,
            nameFor(MORGAN, "Morgan A. Thibodaux"),
            initialsFor(MORGAN, "MT"),
            "Finance + CS",
            "Junior",
            3.89,
            "Investment Banker",
            87,
            "Based on GPA 3.89, ACCN-2010 (A+), and three other signals. NYC-weighted. "
                + "5 Freeman '24 alumni placed in IB out of 73% of the cohort. Morgan's fit: 87%.",
            "Source: 12Twenty · Freeman outcomes Q3 '25 · Tulane alumni hiring data",
            isOnboarded(MORGAN),
            List.of(
                new CareerMatch("Private Equity Analyst", 79),
                new CareerMatch("M&A Consultant", 71),
                new CareerMatch("Corporate Strategy", 64),
                new CareerMatch("Hedge Fund Research", 58)
            ),
            List.of(
                new Concern("The technical screen",
                    "Froze on an LBO walk-through in my last mock — need reps before Goldman Round 2.",
                    "rose"),
                new Concern("NYC cost of living",
                    "No family support for move-in; rent + signing-bonus math isn't adding up.",
                    "amber"),
                new Concern("Feels \"non-traditional\"",
                    "Finance+CS, not pure Wharton pedigree — am I reading the room right?",
                    "violet"),
                new Concern("Consulting fallback",
                    "MBB apps still warm — worth keeping, or full send on banking?",
                    "sky")
            ),
            List.of(
                new Firm("GS", "Goldman Sachs", "IB Summer Analyst · NYC · 5 Freeman alumni", true),
                new Firm("MS", "Morgan Stanley", "M&A Analyst · NYC · 3 Freeman alumni", true),
                new Firm("SF", "Stifel", "IB Analyst · Midwest · Freeman pipeline school", true)
            ),
            List.of(
                new Strategy("01", "LBO drill w/ Sarah Kim"),
                new Strategy("02", "Reframe Finance+CS as edge"),
                new Strategy("03", "Send NYC housing + stipend info")
            ),
            List.of(
                new TranscriptEntry("Fall '23", "ACCN 2010", "Financial Accounting", 3.0, "A+"),
                new TranscriptEntry("Fall '23", "ECON 1010", "Microeconomic Principles", 3.0, "A"),
                new TranscriptEntry("Fall '23", "CMPS 1500", "Introduction to Computer Science", 4.0, "A"),
                new TranscriptEntry("Spring '24", "FINE 3010", "Corporate Finance", 3.0, "A"),
                new TranscriptEntry("Spring '24", "CMPS 2200", "Data Structures and Algorithms", 4.0, "A-"),
                new TranscriptEntry("Spring '24", "MATH 1220", "Calculus II", 4.0, "B+"),
                new TranscriptEntry("Fall '24", "FINE 4020", "Investments", 3.0, "A"),
                new TranscriptEntry("Fall '24", "BSAN 3010", "Business Analytics", 3.0, "A"),
                new TranscriptEntry("Fall '24", "ACCN 3010", "Managerial Accounting", 3.0, "A-"),
                new TranscriptEntry("Spring '25", "FINE 4110", "Financial Modeling", 3.0, "A+"),
                new TranscriptEntry("Spring '25", "CMPS 3140", "Database Systems", 3.0, "A"),
                new TranscriptEntry("Spring '25", "PHIL 2010", "Ethics in Business", 3.0, "B+")
            ),
            List.of(
                new RecommendedCourse("FINE 4150", "Advanced Corporate Valuation",
                    "LBO, DCF, and M&A modeling — exactly what Goldman Round 2 will screen for.",
                    "Dr. Pham", "TR 9:30", "A+"),
                new RecommendedCourse("ACCN 3100", "Financial Statement Analysis",
                    "Extends your ACCN-2010 A+ — writing-intensive, strengthens the banker narrative.",
                    "Dr. Okonkwo", "W 14:00", "A"),
                new RecommendedCourse("CMPS 3240", "Quantitative Methods in Finance",
                    "Your Finance+CS edge — Python/SQL for trading desks. 4 Goldman alumni took this.",
                    "Prof. Arroyo", "MW 11:00", "A−"),
                new RecommendedCourse("FINE 3320", "Mergers, Acquisitions & Restructuring",
                    "M&A Consultant adjacent path (71% fit) — hedge if banking Round 2 stalls.",
                    "Dr. Varma", "TR 13:00", "B+")
            ),
            List.of(
                new AlumniConversation("SK", "Sarah Kim", "Freeman '16 · Goldman IBD",
                    "Happy to chat — Thursday 3pm ET works. I can walk you through how I prepped "
                        + "for my LBO round and what stumped me my first pass.",
                    null, "reply", "Replied", "NYC · 1st degree", "12 min", true),
                new AlumniConversation("DC", "David Chen", "Freeman '20 · JPM M&A",
                    "Thanks for the modeling tips — I finished the case prep and would love your "
                        + "read before Goldman Round 2 on Jan 14.",
                    "You:", "sent", "Sent", "NYC · Warm intro via Bill", "4h", false),
                new AlumniConversation("RP", "Rachel Pham", "Freeman '19 · Evercore M&A",
                    "Hi Rachel — Bill mentioned your path from Freeman into Evercore. I'm targeting "
                        + "IB for Summer '26 and would love 20 minutes to hear how you framed Finance+CS.",
                    "Draft:", "draft", "Draft ready", "NYC · 2nd degree", "Yesterday", false),
                new AlumniConversation("MO", "Marcus Okafor", "Freeman '21 · Analyst Goldman TMT",
                    "Glad the coffee chat helped. Let me know once you hear back from the Goldman "
                        + "recruiter — happy to ping her a second time if it goes quiet.",
                    null, "warm", "Reply owed", "NYC · 1st degree", "3d", false)
            ),
            List.of(
                new ActionItem("Update resume headline",
                    "Swapped \"aspiring\" for \"Finance + CS analyst — IB track.\"",
                    "Done Nov 12", true),
                new ActionItem("Submit 4 more IB applications",
                    "Cohort median is 23 by end of November; you're at 14.",
                    "Due Fri · via 12Twenty", false),
                new ActionItem("Pre-register FINE 4150",
                    "Spring enrollment opens tomorrow — Dr. Pham's valuation section fills fast.",
                    "Due Wed · Registrar", false),
                new ActionItem("Review Sarah's reply with Bill",
                    "Your next appointment is scheduled for 11:30 today.",
                    "Today · 11:30", false)
            )
        );
    }

    public Advisor bill() {
        return new Advisor("bill-hudlow",
            nameFor("bill-hudlow", "Bill Hudlow"),
            initialsFor("bill-hudlow", "BH"),
            "Freeman · Consultant", 28, 7);
    }

    public List<Appointment> schedule() {
        return List.of(
            new Appointment("appt-1", MORGAN, nameFor(MORGAN, "Morgan A. Thibodaux"),
                initialsFor(MORGAN, "MT"), "11:30 AM",
                "Finance + CS", "Junior", 3.82, "Investment Banking",
                List.of("Interview Thursday", "Pre-brief ready")),
            new Appointment("appt-2", "jasmine-okoye", "Jasmine L. Okoye", "JL", "1:00 PM",
                "Public Health", "Senior", 3.91, "Healthcare Consulting",
                List.of("Undecided between 2 offers")),
            new Appointment("appt-3", "diego-ramirez", "Diego Ramirez", "DR", "2:15 PM",
                "Econ", "Sophomore", 3.65, "Exploring",
                List.of("First session", "Needs fingerprint")),
            new Appointment("appt-4", "alex-park", "Alex Park", "AP", "3:45 PM",
                "CS", "Junior", 3.78, "Product Management",
                List.of("3 alumni matches"))
        );
    }

    public List<FeedItem> updates() {
        return List.of(
            new FeedItem("alert", "3 min ago", "Morgan Thibodaux has an interview Thursday",
                "Goldman Sachs, NYC. Pre-brief auto-generated — 3 alumni intros staged."),
            new FeedItem("check", "1 hr ago", "3 Freeman '22 alumni just updated titles",
                "Two to VP at JPM, one lateral to Blackstone PE. Added to radar."),
            new FeedItem("spark", "Yesterday", "New fingerprint: Diego Ramirez",
                "Initial scan complete. Three exploratory tracks surfaced."),
            new FeedItem("report", "2 days ago", "Q1 placement report available",
                "73.2% placed within 90 days of graduation. +4.1 pts vs. last cohort.")
        );
    }

    public List<AlumniRadarRow> alumniRadar() {
        return List.of(
            new AlumniRadarRow("AC", "Anna Chen '22", "Freeman · Finance",
                "VP, Investment Banking · Goldman Sachs", "New York, NY", 3, "3 students"),
            new AlumniRadarRow("MK", "Marcus Kim '21", "Freeman · Finance + CS",
                "Principal · Blackstone PE", "New York, NY", 2, "2 students"),
            new AlumniRadarRow("RP", "Rahul Patel '23", "SSE · Computer Science",
                "SWE-III · Anthropic", "San Francisco, CA", 1, "1 student"),
            new AlumniRadarRow("SG", "Sarah Goldberg '20", "SLA · Public Health",
                "Associate · McKinsey Health", "Boston, MA", 2, "2 students"),
            new AlumniRadarRow("JW", "James Whitfield '22", "Freeman · Accounting",
                "Senior Manager · KPMG M&A", "Chicago, IL", 0, "0 matches")
        );
    }
}
