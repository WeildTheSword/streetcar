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
