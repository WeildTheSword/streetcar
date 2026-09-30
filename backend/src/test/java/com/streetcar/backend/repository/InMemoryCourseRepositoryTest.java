package com.streetcar.backend.repository;

import com.streetcar.backend.model.Course;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InMemoryCourseRepositoryTest {

    @Test
    void findAllReturnsTheDemoCatalogue() {
        // Arrange
        CourseRepository repository = new InMemoryCourseRepository();

        // Act
        List<Course> courses = repository.findAll();

        // Assert
        assertEquals(List.of("CMPS 1500", "CMPS 2200", "BSAN 3010"),
                courses.stream().map(Course::getCode).toList());
    }
}
