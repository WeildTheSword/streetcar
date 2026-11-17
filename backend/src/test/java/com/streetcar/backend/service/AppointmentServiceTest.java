package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.AppointmentEntry;
import com.streetcar.backend.model.AppointmentRequest;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AppointmentServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime START_OF_TODAY = OffsetDateTime.parse("2026-11-17T00:00-06:00");
    private static final OffsetDateTime START_OF_TOMORROW = OffsetDateTime.parse("2026-11-18T00:00-06:00");
    private static final OffsetDateTime AT_1130 = OffsetDateTime.parse("2026-11-17T11:30-06:00");

    private AppointmentRepository appointments;
    private UserRepository users;
    private SubmissionRepository submissions;
    private StudentProfileRepository profiles;
    private AppointmentService service;

    private final User bill = user(1, "ADVISOR", "Bill Hudlow");
    private final User morgan = user(5, "STUDENT", "Morgan A. Thibodaux");

    @BeforeEach
    void setUp() {
        appointments = mock(AppointmentRepository.class);
        users = mock(UserRepository.class);
        submissions = mock(SubmissionRepository.class);
        profiles = mock(StudentProfileRepository.class);
        service = new AppointmentService(appointments, users, submissions, profiles, CLOCK);
    }

    private static User user(long id, String role, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static AdvisingAppointment appointment(long id, User advisor, User student, OffsetDateTime at, String tags) {
        AdvisingAppointment appointment = new AdvisingAppointment(advisor, student, at, tags);
        ReflectionTestUtils.setField(appointment, "id", id);
        return appointment;
    }

    private void todayIs(AdvisingAppointment... booked) {
        when(appointments.findByAdvisorIdAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAtAsc(
                1L, START_OF_TODAY, START_OF_TOMORROW)).thenReturn(List.of(booked));
    }

    @Test
    void todayReadsTheStudentsNewestSubmissionAndProfile() {
        // Arrange
        todayIs(appointment(9, bill, morgan, AT_1130, "Interview Thursday, Pre-brief ready"));
        Submission newest = new Submission(3L, new BigDecimal("3.82"), "CMPS 1500", "Finance + CS",
                "Investment Banking", AT_1130);
        when(submissions.findByUserId(eq(5L), any(Sort.class))).thenReturn(List.of(newest));
        when(profiles.findById(5L)).thenReturn(Optional.of(new StudentProfile(morgan, "Junior")));

        // Act
        List<Appointment> schedule = service.today(1);

        // Assert
        assertEquals(List.of(new Appointment("9", "5", "Morgan A. Thibodaux", "MT", "11:30 AM", "Finance + CS",
                "Junior", 3.82, "Investment Banking", List.of("Interview Thursday", "Pre-brief ready"))), schedule);
    }

    @Test
    void todayFillsInForAStudentWithNoSubmissionOrProfile() {
        // Arrange
        todayIs(appointment(9, bill, morgan, AT_1130, ""));
        when(submissions.findByUserId(eq(5L), any(Sort.class))).thenReturn(List.of());
        when(profiles.findById(5L)).thenReturn(Optional.empty());

        // Act
        Appointment row = service.today(1).get(0);

        // Assert
        assertEquals("Undeclared", row.major());
        assertEquals("Year not set", row.year());
        assertEquals(0.0, row.gpa());
        assertEquals("Exploring", row.track());
        assertEquals(List.of(), row.tags());
    }

    @Test
    void theBoardListsEveryAppointmentAsAnEntry() {
        // Arrange
        when(appointments.findByAdvisorIdOrderByStartsAtAsc(1L)).thenReturn(List.of(
                appointment(9, bill, morgan, AT_1130, "First session")));

        // Act
        List<AppointmentEntry> board = service.board(1);

        // Assert
        assertEquals(List.of(new AppointmentEntry(9, 5, "Morgan A. Thibodaux", "MT", AT_1130,
                List.of("First session"))), board);
    }

    @Test
    void forStudentListsThatStudentsAppointments() {
        // Arrange
        when(appointments.findByStudentIdOrderByStartsAtAsc(5L)).thenReturn(List.of(
                appointment(9, bill, morgan, AT_1130, "")));

        // Act
        List<AppointmentEntry> entries = service.forStudent(5);

        // Assert
        assertEquals(1, entries.size());
        assertEquals(9, entries.get(0).id());
    }

    @Test
    void anAdvisorsAccountNamesEachAppointmentByTheStudent() {
        // Arrange
        when(appointments.findByAdvisorIdOrderByStartsAtAsc(1L)).thenReturn(List.of(
                appointment(9, bill, morgan, AT_1130, "First session")));

        // Act
        List<AccountAppointment> rows = service.forAccount(bill);

        // Assert
        assertEquals(List.of(new AccountAppointment(9, "Morgan A. Thibodaux", AT_1130, List.of("First session"))), rows);
    }

    @Test
    void aStudentsAccountNamesEachAppointmentByTheAdvisor() {
        // Arrange
        when(appointments.findByStudentIdOrderByStartsAtAsc(5L)).thenReturn(List.of(
                appointment(9, bill, morgan, AT_1130, "")));

        // Act
        List<AccountAppointment> rows = service.forAccount(morgan);

        // Assert
        assertEquals("Bill Hudlow", rows.get(0).withName());
    }

    @Test
    void bookSavesASessionWithTheStudent() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));
        when(users.getReferenceById(1L)).thenReturn(bill);
        when(appointments.save(any(AdvisingAppointment.class))).thenAnswer(call -> {
            AdvisingAppointment saved = call.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 12L);
            return saved;
        });

        // Act
        AppointmentEntry entry = service.book(1, new AppointmentRequest(5L, AT_1130, " First session ,  Needs fingerprint "));

        // Assert
        assertEquals(new AppointmentEntry(12, 5, "Morgan A. Thibodaux", "MT", AT_1130,
                List.of("First session", "Needs fingerprint")), entry);
    }

    @Test
    void bookRefusesAMissingRequestStudentOrTime() {
        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> service.book(1, null));
        assertThrows(IllegalArgumentException.class, () -> service.book(1, new AppointmentRequest(null, AT_1130, "")));
        assertThrows(IllegalArgumentException.class, () -> service.book(1, new AppointmentRequest(5L, null, "")));
        verify(appointments, never()).save(any());
    }

    @Test
    void bookRefusesAnAccountThatIsNotAStudent() {
        // Arrange
        when(users.findById(1L)).thenReturn(Optional.of(bill));
        when(users.findById(99L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> service.book(1, new AppointmentRequest(1L, AT_1130, "")));
        assertThrows(IllegalArgumentException.class, () -> service.book(1, new AppointmentRequest(99L, AT_1130, "")));
        verify(appointments, never()).save(any());
    }

    @Test
    void cancelDeletesTheAdvisorsOwnAppointment() {
        // Arrange
        AdvisingAppointment booked = appointment(9, bill, morgan, AT_1130, "");
        when(appointments.findById(9L)).thenReturn(Optional.of(booked));

        // Act
        service.cancel(1, 9);

        // Assert
        verify(appointments).delete(booked);
    }

    @Test
    void cancelTreatsAnotherAdvisorsOrAMissingAppointmentAsNotFound() {
        // Arrange
        when(appointments.findById(9L)).thenReturn(Optional.of(appointment(9, bill, morgan, AT_1130, "")));
        when(appointments.findById(10L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.cancel(2, 9));
        assertThrows(NoSuchElementException.class, () -> service.cancel(1, 10));
        verify(appointments, never()).delete(any());
    }
}
