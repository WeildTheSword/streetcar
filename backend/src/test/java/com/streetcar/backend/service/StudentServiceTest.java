package com.streetcar.backend.service;

import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StudentServiceTest {
    private DemoSessionState session;
    private StudentService service;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        service = new StudentService(new DemoFixtures(), session);
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
        assertTrue(session.isOnboarded(id));
    }

    @Test
    void completeFingerprintIgnoresUnknownId() {
        // Arrange
        String id = "nobody";

        // Act
        Optional<Student> student = service.completeFingerprint(id);

        // Assert
        assertTrue(student.isEmpty());
        assertFalse(session.isOnboarded(id));
    }
}
