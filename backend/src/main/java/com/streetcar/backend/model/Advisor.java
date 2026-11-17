package com.streetcar.backend.model;

/** The signed-in advisor. */
public record Advisor(
        String id,
        String name,
        String initials,
        String title,
        int studentCount,
        int appointmentCount) {

    /** The same advisor with counts read from the database. */
    public Advisor withCounts(int students, int appointments) {
        return new Advisor(id, name, initials, title, students, appointments);
    }

    /** Takes the name and initials together, as the {@link Identity} they are shown under. */
    public Advisor(String id, Identity who, String title, int studentCount, int appointmentCount) {
        this(id, who.name(), who.initials(), title, studentCount, appointmentCount);
    }
}
