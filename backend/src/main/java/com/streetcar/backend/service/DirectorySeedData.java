package com.streetcar.backend.service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Stream;

/**
 * The accounts and records the demo directory starts with: alumni, more
 * students, Morgan's alumni conversations and Bill's appointments. Every
 * seeded account signs in with the demo password. {@link DirectorySeeder}
 * writes these to the database; nothing reads them from here at runtime.
 */
public final class DirectorySeedData {
    private DirectorySeedData() {}

    public static final String PASSWORD = "streetcar";

    public record Alum(String name, String email, String school, int gradYear, String jobTitle, String city) {}

    public record SeedStudent(String name, String email, String classYear, String major, BigDecimal gpa,
                              String completedCourses, String careerGoal) {}

    public record SeedConversation(String studentEmail, String alumEmail, String status, String snippet,
                                   long minutesAgo, boolean unread) {}

    public record SeedAppointment(String studentEmail, LocalTime time, String tags) {}

    public static final List<Alum> ALUMNI = List.of(
        new Alum("Sarah Kim", "sarah.kim@alumni.tulane.edu", "Freeman · Finance", 2016,
            "Goldman Sachs IBD", "New York, NY"),
        new Alum("David Chen", "david.chen@alumni.tulane.edu", "Freeman · Finance", 2020,
            "JPMorgan M&A", "New York, NY"),
        new Alum("Rachel Pham", "rachel.pham@alumni.tulane.edu", "Freeman · Finance + CS", 2019,
            "Evercore M&A", "New York, NY"),
        new Alum("Marcus Okafor", "marcus.okafor@alumni.tulane.edu", "Freeman · Finance", 2021,
            "Analyst · Goldman Sachs TMT", "New York, NY"),
        new Alum("Anna Chen", "anna.chen@alumni.tulane.edu", "Freeman · Finance", 2022,
            "VP, Investment Banking · Goldman Sachs", "New York, NY"),
        new Alum("Rahul Patel", "rahul.patel@alumni.tulane.edu", "SSE · Computer Science", 2023,
            "SWE-III · Anthropic", "San Francisco, CA"),
        new Alum("Sarah Goldberg", "sarah.goldberg@alumni.tulane.edu", "SLA · Public Health", 2020,
            "Associate · McKinsey Health", "Boston, MA"),
        new Alum("James Whitfield", "james.whitfield@alumni.tulane.edu", "Freeman · Accounting", 2022,
            "Senior Manager · KPMG M&A", "Chicago, IL"));

    /** Morgan is the demo account from DemoFixtures; the rest are added here. */
    public static final List<SeedStudent> STUDENTS = List.of(
        new SeedStudent("Morgan A. Thibodaux", DemoFixtures.MORGAN_EMAIL, "Junior", "Finance + CS",
            new BigDecimal("3.82"), "CMPS 1500, CMPS 2200, FINE 3010", "Investment Banking"),
        new SeedStudent("Jasmine L. Okoye", "jasmine.okoye@tulane.edu", "Senior", "Public Health",
            new BigDecimal("3.91"), "SPHU 1010, SPHU 3150", "Healthcare Consulting"),
        new SeedStudent("Diego Ramirez", "diego.ramirez@tulane.edu", "Sophomore", "Economics",
            new BigDecimal("3.65"), "ECON 1010", "Exploring"),
        new SeedStudent("Alex Park", "alex.park@tulane.edu", "Junior", "Computer Science",
            new BigDecimal("3.78"), "CMPS 1500, CMPS 2200, CMPS 2300", "Product Management"));

    public static final List<SeedConversation> CONVERSATIONS = List.of(
        new SeedConversation(DemoFixtures.MORGAN_EMAIL, "sarah.kim@alumni.tulane.edu", "reply",
            "Happy to chat — Thursday 3pm ET works. I can walk you through how I prepped for my LBO round.",
            12, true),
        new SeedConversation(DemoFixtures.MORGAN_EMAIL, "david.chen@alumni.tulane.edu", "sent",
            "Thanks for the modeling tips — I finished the case prep and would love your read before Round 2.",
            240, false),
        new SeedConversation(DemoFixtures.MORGAN_EMAIL, "rachel.pham@alumni.tulane.edu", "draft",
            "Hi Rachel — Bill mentioned your path from Freeman into Evercore. Would you have 20 minutes?",
            1500, false),
        new SeedConversation(DemoFixtures.MORGAN_EMAIL, "marcus.okafor@alumni.tulane.edu", "warm",
            "Glad the coffee chat helped. Let me know once you hear back from the Goldman recruiter.",
            4320, false),
        new SeedConversation(DemoFixtures.MORGAN_EMAIL, "anna.chen@alumni.tulane.edu", "sent",
            "Congratulations on the VP promotion — could I ask how you approached the analyst-to-associate jump?",
            2880, false),
        new SeedConversation("alex.park@tulane.edu", "rahul.patel@alumni.tulane.edu", "reply",
            "Glad to help — product roles at AI labs value shipped side projects more than titles.", 90, true),
        new SeedConversation("jasmine.okoye@tulane.edu", "sarah.goldberg@alumni.tulane.edu", "warm",
            "Both offers are strong. Happy to compare the McKinsey and Deloitte health practices with you.",
            600, false),
        new SeedConversation("diego.ramirez@tulane.edu", "anna.chen@alumni.tulane.edu", "draft",
            "Hi Anna — I am a sophomore in Economics exploring banking. Could I ask a few questions?",
            30, false));

    /** Bill's sessions, booked for whichever day the app starts on. */
    public static final List<SeedAppointment> TODAY = List.of(
        new SeedAppointment(DemoFixtures.MORGAN_EMAIL, LocalTime.of(11, 30), "Interview Thursday, Pre-brief ready"),
        new SeedAppointment("jasmine.okoye@tulane.edu", LocalTime.of(13, 0), "Undecided between 2 offers"),
        new SeedAppointment("diego.ramirez@tulane.edu", LocalTime.of(14, 15), "First session, Needs fingerprint"),
        new SeedAppointment("alex.park@tulane.edu", LocalTime.of(15, 45), "1 alumni match"));

    /** Every account this class adds. */
    public static List<String> emails() {
        return Stream.concat(ALUMNI.stream().map(Alum::email),
                STUDENTS.stream().map(SeedStudent::email)).distinct().toList();
    }
}
