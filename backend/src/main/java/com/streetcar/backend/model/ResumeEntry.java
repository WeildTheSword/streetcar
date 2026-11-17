package com.streetcar.backend.model;

import java.time.OffsetDateTime;

/** A student's resume. updatedAt is null when they have not saved one yet. */
public record ResumeEntry(String headline, String summary, String experience, String skills,
                          OffsetDateTime updatedAt) {
    /** What a student who has never saved a resume sees. */
    public static ResumeEntry blank() {
        return new ResumeEntry("", "", "", "", null);
    }
}
