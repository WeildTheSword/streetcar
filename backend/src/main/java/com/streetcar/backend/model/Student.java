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
        List<ActionItem> weeklyActions) {}
