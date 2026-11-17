package com.streetcar.backend.service;

import com.streetcar.backend.model.AlumniConversation;
import com.streetcar.backend.model.AppointmentEntry;
import com.streetcar.backend.model.StudentAccount;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.StudentSummary;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class StudentDirectoryServiceTest {
    private static final Sort BY_NAME = Sort.by("displayName", "id");

    private UserRepository users;
    private StudentProfileRepository profiles;
    private AlumniService alumni;
    private AppointmentService appointments;
    private StudentDirectoryService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        profiles = mock(StudentProfileRepository.class);
        alumni = mock(AlumniService.class);
        appointments = mock(AppointmentService.class);
        service = new StudentDirectoryService(users, profiles, alumni, appointments);
    }

    private static User user(long id, String role, String name, Submission... submissions) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "submissions", List.of(submissions));
        return user;
    }

    private static Submission submission(long id, String major) {
        return new Submission(id, new BigDecimal("3.20"), "CMPS 1500", major, "Analyst",
                OffsetDateTime.parse("2026-11-17T12:00:00Z"));
    }

    @Test
    void listStudentsReturnsEveryStudentAccountWithItsSubmissionCount() {
        // Arrange
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of(
                user(4, "STUDENT", "Chris Boudreaux", submission(9, "Finance"), submission(8, "Economics")),
                user(2, "STUDENT", "Morgan Thibodaux")));

        // Act
        List<StudentSummary> students = service.listStudents();

        // Assert
        assertEquals(List.of(
                new StudentSummary(4, "Chris Boudreaux", "chris.boudreaux@tulane.edu", 2),
                new StudentSummary(2, "Morgan Thibodaux", "morgan.thibodaux@tulane.edu", 0)), students);
    }

    @Test
    void getStudentReturnsTheAccountWithItsSubmissions() {
        // Arrange
        Submission newest = submission(9, "Finance");
        Submission older = submission(8, "Economics");
        User chrisUser = user(4, "STUDENT", "Chris Boudreaux", newest, older);
        when(users.findById(4L)).thenReturn(Optional.of(chrisUser));
        when(profiles.findById(4L)).thenReturn(Optional.of(new StudentProfile(chrisUser, "Junior")));
        AlumniConversation thread = new AlumniConversation("AC", "Anna Chen", "Freeman '22 · VP", "Hi", null,
                "reply", "Replied", "New York, NY", "1h", false);
        AppointmentEntry session = new AppointmentEntry(10, 4, "Chris Boudreaux", "CB",
                OffsetDateTime.parse("2026-11-17T17:30:00Z"), List.of("First session"));
        when(alumni.conversationsFor(4)).thenReturn(List.of(thread));
        when(appointments.forStudent(4)).thenReturn(List.of(session));

        // Act
        StudentAccount chris = service.getStudent(4);

        // Assert
        assertEquals(4, chris.id());
        assertEquals("Chris Boudreaux", chris.name());
        assertEquals("chris.boudreaux@tulane.edu", chris.email());
        assertEquals("Junior", chris.classYear());
        assertEquals(List.of(newest, older), chris.submissions());
        assertEquals(List.of(thread), chris.conversations());
        assertEquals(List.of(session), chris.appointments());
    }

    @Test
    void getStudentTreatsAnAdvisorAccountAsNotFound() {
        // Arrange
        when(users.findById(3L)).thenReturn(Optional.of(user(3, "ADVISOR", "Bill Hudlow")));

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.getStudent(3));
    }

    @Test
    void getStudentThrowsWhenTheAccountDoesNotExist() {
        // Arrange
        when(users.findById(99L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.getStudent(99));
    }
}
