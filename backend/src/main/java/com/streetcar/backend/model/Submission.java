package com.streetcar.backend.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record Submission(Long id, BigDecimal gpa, String completedCourses,
                         String major, String careerGoal, OffsetDateTime createdAt) {
}
