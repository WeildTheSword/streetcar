package com.streetcar.backend.service;

import com.streetcar.backend.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Hardcoded demo fixtures for the pitch walkthrough. Content mirrors the
 * high-fidelity mockups in ui_kits/. Every method is a pure function of its
 * arguments: this class holds no state, so the demo's mutable progress lives in
 * {@link DemoSessionState} instead.
 */
@Component
public class DemoFixtures {

    public static final String MORGAN_ID = "morgan-thibodaux";
    public static final String BILL_ID = "bill-hudlow";

    public static final Identity MORGAN = new Identity("Morgan A. Thibodaux", "MT");
    public static final Identity BILL = new Identity("Bill Hudlow", "BH");

    public List<DemoUser> users() {
        return List.of(
            new DemoUser("morgan@tulane.edu", "streetcar", "STUDENT", MORGAN_ID,
                MORGAN.name(), MORGAN.initials(), "Finance + CS · Junior"),
            new DemoUser("bill.hudlow@tulane.edu", "streetcar", "ADVISOR", BILL_ID,
                BILL.name(), BILL.initials(), "Freeman · Consultant")
        );
    }

    /** The demo student, shown under {@code who} and at the given onboarding state. */
    public Student morgan(Identity who, boolean onboarded) {
        return new Student(
            MORGAN_ID,
            who.name(),
            who.initials(),
            "Finance + CS",
            "Junior",
            3.89,
            "Investment Banker",
            87,
            "Based on GPA 3.89, ACCN-2010 (A+), and three other signals. NYC-weighted. "
                + "5 Freeman '24 alumni placed in IB out of 73% of the cohort. Morgan's fit: 87%.",
            "Source: 12Twenty · Freeman outcomes Q3 '25 · Tulane alumni hiring data",
            onboarded,
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

    public Advisor bill(Identity who) {
        return new Advisor(BILL_ID, who.name(), who.initials(),
            "Freeman · Consultant", 28, 7);
    }

    /** Today's appointments; the first one is with the demo student, shown as {@code morgan}. */
    public List<Appointment> schedule(Identity morgan) {
        return List.of(
            new Appointment("appt-1", MORGAN_ID, morgan.name(), morgan.initials(), "11:30 AM",
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
