package com.streetcar.backend.model;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * The signed-in user's own account page, for any role. Sections that do not
 * apply to the role are null or empty: classYear for students, alumni for alumni.
 */
public record AccountInfo(
        long id,
        String name,
        String email,
        String role,
        String classYear,
        Alumni alumni,
        int submissionCount,
        List<AccountAppointment> appointments,
        List<AccountConversation> conversations) {

    public record Alumni(String school, int gradYear, String currentRole, String city) {}

    /** An appointment, named by the other side: the student for an advisor, the advisor for a student. */
    public record AccountAppointment(long id, String withName, OffsetDateTime startsAt, List<String> tags) {}

    /** A conversation, named by the other side: the alum for a student, the student for an alum. */
    public record AccountConversation(long id, String withName, String status, String statusLabel, String snippet) {}
}
