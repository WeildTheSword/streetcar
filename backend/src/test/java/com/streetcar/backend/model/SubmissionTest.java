package com.streetcar.backend.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SubmissionTest {

    @Test
    void normalizedTrimsTheTextFieldsAndKeepsEverythingElse() {
        // Arrange
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-10-26T12:00:00Z");
        Submission raw = new Submission(7L, new BigDecimal("3.50"),
                "  CMPS 1500  ", " Computer Science ", " Software Engineer ", createdAt);

        // Act
        Submission normalized = raw.normalized();

        // Assert
        assertEquals(7L, normalized.getId());
        assertEquals(new BigDecimal("3.50"), normalized.getGpa());
        assertEquals("CMPS 1500", normalized.getCompletedCourses());
        assertEquals("Computer Science", normalized.getMajor());
        assertEquals("Software Engineer", normalized.getCareerGoal());
        assertEquals(createdAt, normalized.getCreatedAt());
    }

    @Test
    void normalizedPadsTheGpaToTheColumnScale() {
        // Arrange
        Submission raw = new Submission(null, new BigDecimal("3.5"), "None", "Finance", "Analyst", null);

        // Act
        Submission normalized = raw.normalized();

        // Assert
        assertEquals(new BigDecimal("3.50"), normalized.getGpa());
    }

    @Test
    void withIdentityReplacesTheIdAndCreatedAtOnly() {
        // Arrange
        OffsetDateTime createdAt = OffsetDateTime.parse("2026-10-26T12:00:00Z");
        Submission raw = new Submission(1L, new BigDecimal("3.50"), "None", "Finance", "Analyst", null);

        // Act
        Submission changed = raw.withIdentity(9L, createdAt);

        // Assert
        assertEquals(9L, changed.getId());
        assertEquals(createdAt, changed.getCreatedAt());
        assertEquals("Finance", changed.getMajor());
    }
}
