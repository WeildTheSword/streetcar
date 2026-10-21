package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SubmissionValidatorTest {
    private final SubmissionValidator validator = new SubmissionValidator();

    private static Submission submission(String gpa, String courses, String major, String goal) {
        return new Submission(null, gpa == null ? null : new BigDecimal(gpa), courses, major, goal, null);
    }

    @Test
    void acceptsAWellFormedSubmission() {
        // Arrange
        Submission input = submission("3.75", "CMPS 1500", "Computer Science", "Data analyst");

        // Act + Assert
        assertDoesNotThrow(() -> validator.validate(input));
    }

    @Test
    void acceptsTheGpaBoundaries() {
        // Arrange
        Submission lowest = submission("0", "None", "Finance", "Analyst");
        Submission highest = submission("4.00", "None", "Finance", "Analyst");

        // Act + Assert
        assertDoesNotThrow(() -> validator.validate(lowest));
        assertDoesNotThrow(() -> validator.validate(highest));
    }

    @Test
    void rejectsAMissingGpa() {
        // Arrange
        Submission input = submission(null, "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> validator.validate(input));
    }

    @Test
    void rejectsAGpaOutsideZeroToFour() {
        // Arrange
        Submission negative = submission("-0.1", "None", "Finance", "Analyst");
        Submission tooHigh = submission("4.01", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> validator.validate(negative));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(tooHigh));
    }

    @Test
    void rejectsAGpaWithMoreThanTwoDecimals() {
        // Arrange
        Submission input = submission("3.333", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> validator.validate(input));
    }

    @Test
    void rejectsBlankOrMissingText() {
        // Arrange
        Submission blankCourses = submission("3.0", "   ", "Finance", "Analyst");
        Submission missingMajor = submission("3.0", "None", null, "Analyst");

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> validator.validate(blankCourses));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(missingMajor));
    }

    @Test
    void rejectsTextOverItsLengthLimit() {
        // Arrange
        Submission longCourses = submission("3.0", "x".repeat(SubmissionValidator.MAX_COURSES + 1), "Finance", "Analyst");
        Submission longMajor = submission("3.0", "None", "x".repeat(SubmissionValidator.MAX_MAJOR + 1), "Analyst");
        Submission longGoal = submission("3.0", "None", "Finance", "x".repeat(SubmissionValidator.MAX_CAREER_GOAL + 1));

        // Act + Assert
        assertThrows(IllegalArgumentException.class, () -> validator.validate(longCourses));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(longMajor));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(longGoal));
    }

    @Test
    void measuresLengthAfterTrimmingWhitespace() {
        // Arrange
        Submission padded = submission("3.0", "None", "  " + "x".repeat(SubmissionValidator.MAX_MAJOR) + "  ", "Analyst");

        // Act + Assert
        assertDoesNotThrow(() -> validator.validate(padded));
    }
}
