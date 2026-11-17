package com.streetcar.backend.model;

import java.util.List;

/** Everything the student dashboard renders for one student. */
public record Student(
        String id,
        String name,
        String initials,
        String major,
        String year,
        double gpa,
        String targetRole,
        int matchPercent,
        String matchBasis,
        String matchSource,
        boolean onboarded,
        List<CareerMatch> adjacentPaths,
        List<Concern> concerns,
        List<Firm> firms,
        List<Strategy> strategies,
        List<TranscriptEntry> transcript,
        List<RecommendedCourse> courses,
        List<AlumniConversation> conversations,
        List<ActionItem> weeklyActions) {

    /** The same student with conversations read from the database in place of the fixture's. */
    public Student withConversations(List<AlumniConversation> real) {
        return new Student(id, name, initials, major, year, gpa, targetRole, matchPercent, matchBasis,
            matchSource, onboarded, adjacentPaths, concerns, firms, strategies, transcript, courses,
            real, weeklyActions);
    }

    /** Takes the name and initials together, as the {@link Identity} they are shown under. */
    public Student(
            String id,
            Identity who,
            String major,
            String year,
            double gpa,
            String targetRole,
            int matchPercent,
            String matchBasis,
            String matchSource,
            boolean onboarded,
            List<CareerMatch> adjacentPaths,
            List<Concern> concerns,
            List<Firm> firms,
            List<Strategy> strategies,
            List<TranscriptEntry> transcript,
            List<RecommendedCourse> courses,
            List<AlumniConversation> conversations,
            List<ActionItem> weeklyActions) {
        this(id, who.name(), who.initials(), major, year, gpa, targetRole, matchPercent,
            matchBasis, matchSource, onboarded, adjacentPaths, concerns, firms, strategies,
            transcript, courses, conversations, weeklyActions);
    }
}
