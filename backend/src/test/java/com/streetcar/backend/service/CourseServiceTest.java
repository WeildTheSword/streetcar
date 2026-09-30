package com.streetcar.backend.service;

import com.streetcar.backend.model.Course;
import com.streetcar.backend.repository.CourseRepository;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CourseServiceTest {

    /** A stand-in repository, so the service is tested without the real catalogue. */
    private static CourseRepository fakeRepository(List<Course> courses) {
        return () -> courses;
    }

    @Test
    void getAllCoursesReturnsWhatTheRepositoryHolds() {
        // Arrange
        List<Course> stored = List.of(
                new Course(10, "TEST 1000", "Fake Course", "Only exists in this test."),
                new Course(11, "TEST 2000", "Another Fake", "Also only in this test."));
        CourseService service = new CourseService(fakeRepository(stored));

        // Act
        List<Course> courses = service.getAllCourses();

        // Assert
        assertEquals(List.of("TEST 1000", "TEST 2000"),
                courses.stream().map(Course::getCode).toList());
    }

    @Test
    void getAllCoursesReturnsEmptyWhenTheRepositoryIsEmpty() {
        // Arrange
        CourseService service = new CourseService(fakeRepository(List.of()));

        // Act
        List<Course> courses = service.getAllCourses();

        // Assert
        assertTrue(courses.isEmpty());
    }
}
