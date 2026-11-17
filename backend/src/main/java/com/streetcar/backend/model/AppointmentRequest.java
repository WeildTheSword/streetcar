package com.streetcar.backend.model;

import java.time.OffsetDateTime;

/** What the board's booking form posts. Tags are comma-separated and optional. */
public record AppointmentRequest(Long studentId, OffsetDateTime startsAt, String tags) {}
