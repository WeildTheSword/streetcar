package com.streetcar.backend.model;

import java.time.OffsetDateTime;
import java.util.List;

/** One appointment on the advisor's board. */
public record AppointmentEntry(long id, long studentId, String studentName, String initials,
                               OffsetDateTime startsAt, List<String> tags) {}
