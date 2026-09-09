package com.streetcar.backend.service;

import com.streetcar.backend.model.TranscriptCourse;
import com.streetcar.backend.model.TranscriptResult;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TranscriptTextParserTest {

    private final TranscriptTextParser parser = new TranscriptTextParser();

    @Test
    void parsesHeaderFields() {
        String text = """
            Student name Doe, Jane
            Student ID 123456789
            Degree Bachelor Science Management
            Audit date 08/19/2026 2:24 PM
            Overall GPA 3.861
            """;

        TranscriptResult result = parser.parse(text);

        assertEquals("Doe, Jane", result.getStudentName());
        assertEquals("123456789", result.getStudentId());
        assertEquals("Bachelor Science Management", result.getDegree());
        assertEquals(3.861, result.getOverallGpa());
    }

    @Test
    void parsesCourseRowsWithLabelsAndInProgressCredits() {
        String text = """
            |Req. 1| Tier-1 Writing - Complete in First Year ENGL 1010 Writing A 4 2023 Fall
            |Req. 2| Tier-2 Writing MCOM 3010 Management Communication B+ 3 2024 Spring
            |Req. 15| Strategic Management MGMT 4010 Strategic Management IP (3) 2026 Fall
            """;

        TranscriptResult result = parser.parse(text);
        List<TranscriptCourse> courses = result.getCourses();

        assertEquals(3, courses.size());

        TranscriptCourse writing = courses.get(0);
        assertEquals("ENGL 1010", writing.getCode());
        assertEquals("Writing", writing.getTitle());
        assertEquals("A", writing.getGrade());
        assertEquals(4.0, writing.getCredits());
        assertEquals("2023 Fall", writing.getTerm());
        assertTrue(!writing.isInProgress());

        TranscriptCourse inProgress = courses.get(2);
        assertEquals("MGMT 4010", inProgress.getCode());
        assertEquals("IP", inProgress.getGrade());
        assertEquals(3.0, inProgress.getCredits());
        assertTrue(inProgress.isInProgress());
    }

    @Test
    void parsesMultipleRowsPackedOnOneLine() {
        String text = "MGMT 5381 Social Bus Transformation ZC+ 3 2025 Fall "
            + "MGSC 5381 Art Intel and Machine Learning ZB 3 2025 Fall "
            + "MKTG 5381 New Trends in Intl Marketing ZA- 3 2025 Fall";

        List<TranscriptCourse> courses = parser.parse(text).getCourses();

        assertEquals(3, courses.size());
        assertEquals("MGMT 5381", courses.get(0).getCode());
        assertEquals("ZC+", courses.get(0).getGrade());
        assertEquals("MGSC 5381", courses.get(1).getCode());
        assertEquals("MKTG 5381", courses.get(2).getCode());
        assertEquals("ZA-", courses.get(2).getGrade());
    }

    @Test
    void dedupesSameCourseRepeatedAcrossSections() {
        String text = "MATH 2170 Intro To Discrete Math B- 3 2024 Fall "
            + "some other section text "
            + "MATH 2170 Intro To Discrete Math B- 3 2024 Fall";

        List<TranscriptCourse> courses = parser.parse(text).getCourses();

        assertEquals(1, courses.size());
        assertEquals("MATH 2170", courses.get(0).getCode());
    }
}
