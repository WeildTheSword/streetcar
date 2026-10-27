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
        assertEquals(new Submission(7L, new BigDecimal("3.50"),
                "CMPS 1500", "Computer Science", "Software Engineer", createdAt), normalized);
    }
}
