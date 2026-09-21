package com.streetcar.backend.service;

import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StudentServiceTest {
    private DemoDataService demoData;
    private StudentService service;

    @BeforeEach
    void setUp() {
        demoData = new DemoDataService();
        service = new StudentService(demoData);
    }

    @Test
    void getStudentReturnsDemoStudentById() {
        // Arrange
        String id = "morgan-thibodaux";

        // Act
        Optional<Student> student = service.getStudent(id);

        // Assert
        assertTrue(student.isPresent());
        assertEquals(id, student.get().id());
        assertFalse(student.get().transcript().isEmpty());
    }

    @Test
    void getStudentReturnsEmptyForUnknownId() {
        // Arrange
        String id = "nobody";

        // Act
        Optional<Student> student = service.getStudent(id);

        // Assert
        assertTrue(student.isEmpty());
    }

    @Test
    void completeFingerprintMarksStudentOnboarded() {
        // Arrange
        String id = "morgan-thibodaux";

        // Act
        Optional<Student> student = service.completeFingerprint(id);

        // Assert
        assertTrue(student.isPresent());
        assertTrue(demoData.isOnboarded(id));
    }

    @Test
    void completeFingerprintIgnoresUnknownId() {
        // Arrange
        String id = "nobody";

        // Act
        Optional<Student> student = service.completeFingerprint(id);

        // Assert
        assertTrue(student.isEmpty());
        assertFalse(demoData.isOnboarded(id));
    }
}
