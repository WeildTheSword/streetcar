package com.streetcar.backend.service;

import com.streetcar.backend.model.AlumniConversation;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StudentServiceTest {
    private DemoSessionState session;
    private static final AuthenticatedUser MORGAN = new AuthenticatedUser(1, "STUDENT");
    private static final AuthenticatedUser BILL = new AuthenticatedUser(3, "ADVISOR");

    private StudentService service;
    private AlumniService alumni;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        alumni = mock(AlumniService.class);
        service = new StudentService(new CurrentProfiles(new DemoFixtures(), session), session, alumni);
    }

    @Test
    void aSignedInStudentSeesTheirOwnConversationsFromTheDatabase() {
        // Arrange
        AlumniConversation sarah = new AlumniConversation("SK", "Sarah Kim", "Freeman '16 · Goldman Sachs IBD",
                "Happy to chat", null, "reply", "Replied", "New York, NY", "12 min", true);
        when(alumni.conversationsFor(1)).thenReturn(List.of(sarah));

        // Act
        Student student = service.getStudent("morgan-thibodaux", MORGAN).orElseThrow();

        // Assert
        assertEquals(List.of(sarah), student.conversations());
    }

    @Test
    void anAdvisorViewingTheStudentKeepsTheFixtureConversations() {
        // Act
        Student student = service.getStudent("morgan-thibodaux", BILL).orElseThrow();

        // Assert
        assertFalse(student.conversations().isEmpty());
    }

    @Test
    void getStudentReturnsDemoStudentById() {
        // Arrange
        String id = "morgan-thibodaux";

        // Act
        Optional<Student> student = service.getStudent(id, MORGAN);

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
        Optional<Student> student = service.getStudent(id, MORGAN);

        // Assert
        assertTrue(student.isEmpty());
    }

    @Test
    void completeFingerprintMarksStudentOnboarded() {
        // Arrange
        String id = "morgan-thibodaux";

        // Act
        Optional<Student> student = service.completeFingerprint(id, MORGAN);

        // Assert
        assertTrue(student.isPresent());
        assertTrue(session.isOnboarded(id));
    }

    @Test
    void completeFingerprintIgnoresUnknownId() {
        // Arrange
        String id = "nobody";

        // Act
        Optional<Student> student = service.completeFingerprint(id, MORGAN);

        // Assert
        assertTrue(student.isEmpty());
        assertFalse(session.isOnboarded(id));
    }

    @Test
    void getStudentShowsSignUpNameOverTheFixture() {
        // Arrange
        session.setIdentity("morgan-thibodaux", new Identity("Jordan Lee", "JL"));

        // Act
        Student student = service.getStudent("morgan-thibodaux", BILL).orElseThrow();

        // Assert
        assertEquals("Jordan Lee", student.name());
        assertEquals("JL", student.initials());
        assertFalse(student.onboarded());
    }
}
