package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo;
import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AccountInfo.AccountConversation;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AccountServiceTest {
    private static final OffsetDateTime AT = OffsetDateTime.parse("2026-11-18T15:30:00Z");

    private UserRepository users;
    private StudentProfileRepository studentProfiles;
    private AlumniService alumni;
    private AppointmentService appointments;
    private AccountService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        studentProfiles = mock(StudentProfileRepository.class);
        alumni = mock(AlumniService.class);
        appointments = mock(AppointmentService.class);
        service = new AccountService(users, studentProfiles, alumni, appointments);
    }

    private User stored(long id, String role, String name, Submission... submissions) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        ReflectionTestUtils.setField(user, "submissions", List.of(submissions));
        when(users.findById(id)).thenReturn(Optional.of(user));
        return user;
    }

    @Test
    void aStudentSeesTheirYearSubmissionsAppointmentsAndConversations() {
        // Arrange
        Submission one = new Submission(1L, new BigDecimal("3.50"), "CMPS 1500", "Finance", "Analyst", AT);
        User chris = stored(4, "STUDENT", "Chris Boudreaux", one);
        when(studentProfiles.findById(4L)).thenReturn(Optional.of(new StudentProfile(chris, "Junior")));
        List<AccountAppointment> sessions = List.of(new AccountAppointment(9, "Bill Hudlow", AT, List.of()));
        List<AccountConversation> threads = List.of(new AccountConversation(2, "Sarah Kim", "reply", "Replied", "Hi"));
        when(appointments.forAccount(chris)).thenReturn(sessions);
        when(alumni.accountConversationsForStudent(4)).thenReturn(threads);

        // Act
        AccountInfo account = service.account(new AuthenticatedUser(4, "STUDENT"));

        // Assert
        assertEquals(new AccountInfo(4, "Chris Boudreaux", "chris.boudreaux@tulane.edu", "STUDENT", "Junior", null,
                1, sessions, threads), account);
    }

    @Test
    void aStudentWithoutAProfileHasNoClassYear() {
        // Arrange
        User chris = stored(4, "STUDENT", "Chris Boudreaux");
        when(studentProfiles.findById(4L)).thenReturn(Optional.empty());
        when(appointments.forAccount(chris)).thenReturn(List.of());
        when(alumni.accountConversationsForStudent(4)).thenReturn(List.of());

        // Act
        AccountInfo account = service.account(new AuthenticatedUser(4, "STUDENT"));

        // Assert
        assertNull(account.classYear());
        assertEquals(0, account.submissionCount());
    }

    @Test
    void anAdvisorSeesTheirAppointmentsAndNoStudentFields() {
        // Arrange
        User bill = stored(1, "ADVISOR", "Bill Hudlow");
        List<AccountAppointment> sessions = List.of(new AccountAppointment(9, "Chris Boudreaux", AT, List.of("First")));
        when(appointments.forAccount(bill)).thenReturn(sessions);

        // Act
        AccountInfo account = service.account(new AuthenticatedUser(1, "ADVISOR"));

        // Assert
        assertEquals(new AccountInfo(1, "Bill Hudlow", "bill.hudlow@tulane.edu", "ADVISOR", null, null, 0,
                sessions, List.of()), account);
    }

    @Test
    void anAlumSeesTheirProfileAndConversations() {
        // Arrange
        User sarah = stored(10, "ALUMNI", "Sarah Kim");
        when(alumni.profile(10)).thenReturn(Optional.of(
                new AlumniProfile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY")));
        List<AccountConversation> threads = List.of(new AccountConversation(2, "Chris Boudreaux", "reply", "Replied", "Hi"));
        when(alumni.accountConversationsForAlumnus(10)).thenReturn(threads);

        // Act
        AccountInfo account = service.account(new AuthenticatedUser(10, "ALUMNI"));

        // Assert
        assertEquals(new AccountInfo(10, "Sarah Kim", "sarah.kim@tulane.edu", "ALUMNI", null,
                new AccountInfo.Alumni("Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY"),
                0, List.of(), threads), account);
    }

    @Test
    void anAlumWithoutAProfileHasNoAlumniSection() {
        // Arrange
        stored(10, "ALUMNI", "Sarah Kim");
        when(alumni.profile(10)).thenReturn(Optional.empty());
        when(alumni.accountConversationsForAlumnus(10)).thenReturn(List.of());

        // Act
        AccountInfo account = service.account(new AuthenticatedUser(10, "ALUMNI"));

        // Assert
        assertNull(account.alumni());
    }

    @Test
    void anAccountThatNoLongerExistsIsNotFound() {
        // Arrange
        when(users.findById(99L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.account(new AuthenticatedUser(99, "STUDENT")));
    }
}
