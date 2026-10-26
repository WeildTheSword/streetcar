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
        List<String> tags) {

    /** Takes the student's name and initials together, as the {@link Identity} they are shown under. */
    public Appointment(
            String id,
            String studentId,
            Identity student,
            String time,
            String major,
            String year,
            double gpa,
            String track,
            List<String> tags) {
        this(id, studentId, student.name(), student.initials(), time, major, year, gpa, track, tags);
    }
}
