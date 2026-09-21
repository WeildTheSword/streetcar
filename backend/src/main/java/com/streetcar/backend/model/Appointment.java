package com.streetcar.backend.model;

import java.util.List;

/** A booked advising session, shown on the advisor's schedule. */
public record Appointment(
        String id,
        String studentId,
        String studentName,
        String initials,
        String time,
        String major,
        String year,
        double gpa,
        String track,
        List<String> tags) {}
