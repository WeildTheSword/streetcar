package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * The rules a submission must meet before it is saved. This class changes only
 * when those rules change; how requests reach it is the controller's concern.
 */
@Component
public class SubmissionValidator {
    public static final int MAX_COURSES = 2000;
    public static final int MAX_MAJOR = 120;
    public static final int MAX_CAREER_GOAL = 200;

    private static final BigDecimal MAX_GPA = new BigDecimal("4");

    /** What a caller is told when {@link #validate} rejects a submission. */
    public static final String RULES = "Provide GPA (0–4, at most two decimals), completed courses (up to "
            + MAX_COURSES + " characters), major (up to " + MAX_MAJOR + "), and career goal (up to "
            + MAX_CAREER_GOAL + ").";

    /** Throws {@link IllegalArgumentException} if the submission breaks any rule. */
    public void validate(Submission input) {
        if (!validGpa(input.gpa())
                || !validText(input.completedCourses(), MAX_COURSES)
                || !validText(input.major(), MAX_MAJOR)
                || !validText(input.careerGoal(), MAX_CAREER_GOAL)) {
            throw new IllegalArgumentException(RULES);
        }
    }

    private static boolean validGpa(BigDecimal gpa) {
        return gpa != null
                && gpa.compareTo(BigDecimal.ZERO) >= 0
                && gpa.compareTo(MAX_GPA) <= 0
                && gpa.stripTrailingZeros().scale() <= 2;
    }

    private static boolean validText(String value, int max) {
        return value != null && !value.isBlank() && value.strip().length() <= max;
    }
}
