package com.streetcar.backend.service;

import com.streetcar.backend.model.Course;
import com.streetcar.backend.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CourseServiceTest {
    private CourseRepository repository;
    private CourseService service;

    @BeforeEach
    void setUp() {
        repository = mock(CourseRepository.class);
        service = new CourseService(repository);
    }

    @Test
    void getAllCoursesReturnsWhatTheRepositoryHolds() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of(
                new Course(10, "TEST 1000", "Fake Course", "Only exists in this test."),
                new Course(11, "TEST 2000", "Another Fake", "Also only in this test.")));

        // Act
        List<Course> courses = service.getAllCourses();

        // Assert
        assertEquals(List.of("TEST 1000", "TEST 2000"),
                courses.stream().map(Course::getCode).toList());
        verify(repository).findAll();
    }

    @Test
    void getAllCoursesReturnsEmptyWhenTheRepositoryIsEmpty() {
        // Arrange
        when(repository.findAll()).thenReturn(List.of());

        // Act
        List<Course> courses = service.getAllCourses();

        // Assert
        assertTrue(courses.isEmpty());
    }
}
