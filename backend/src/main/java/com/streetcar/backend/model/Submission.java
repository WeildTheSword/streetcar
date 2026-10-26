package com.streetcar.backend.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record Submission(Long id, BigDecimal gpa, String completedCourses,
                         String major, String careerGoal, OffsetDateTime createdAt) {

    /** A copy with the text fields trimmed, as they are stored. */
    public Submission normalized() {
        return new Submission(id, gpa, completedCourses.strip(), major.strip(), careerGoal.strip(), createdAt);
    }
}
