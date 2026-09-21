package com.streetcar.backend.model;

/** A course ranked by fit to the student's target role, with the reason why. */
public record RecommendedCourse(
        String code,
        String title,
        String why,
        String instructor,
        String meeting,
        String fit) {}
