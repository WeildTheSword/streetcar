package com.streetcar.backend.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/** One of a student's job applications, as the tracker and the advisor's student view show it. */
public record ApplicationEntry(long id, String company, String roleTitle, String status, LocalDate appliedOn,
                               String notes, OffsetDateTime updatedAt) {}
