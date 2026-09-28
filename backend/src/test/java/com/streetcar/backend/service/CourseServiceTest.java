package com.streetcar.backend.service;

import com.streetcar.backend.model.Course;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CourseServiceTest {

    @Test
    void getAllCoursesReturnsTheCourseCatalog() {
        // Arrange
        CourseService service = new CourseService();

        // Act
        List<Course> courses = service.getAllCourses();

        // Assert
        assertEquals(List.of("CMPS 1500", "CMPS 2200", "BSAN 3010"),
                courses.stream().map(Course::getCode).toList());
    }
}
