package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DirectorySeederTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final String BILL = "bill.hudlow@tulane.edu";

    private UserRepository users;
    private AlumniProfileRepository alumniProfiles;
    private StudentProfileRepository studentProfiles;
    private SubmissionRepository submissions;
    private ConversationRepository conversations;
    private AppointmentRepository appointments;
    private AppointmentService schedule;
    private DirectorySeeder seeder;

    /** The users table, by email, so lookups see what the seeder saved. */
    private final Map<String, User> accounts = new HashMap<>();
    private long nextId = 1;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        alumniProfiles = mock(AlumniProfileRepository.class);
        studentProfiles = mock(StudentProfileRepository.class);
        submissions = mock(SubmissionRepository.class);
        conversations = mock(ConversationRepository.class);
        appointments = mock(AppointmentRepository.class);
        schedule = mock(AppointmentService.class);
        PasswordEncoder passwords = mock(PasswordEncoder.class);
        when(passwords.encode(anyString())).thenReturn("hashed");
        when(users.findByEmail(anyString())).thenAnswer(call -> Optional.ofNullable(accounts.get(call.<String>getArgument(0))));
        when(users.save(any(User.class))).thenAnswer(call -> store(call.getArgument(0)));
        seeder = new DirectorySeeder(users, alumniProfiles, studentProfiles, submissions, conversations,
                appointments, schedule, passwords, CLOCK);
    }

    private User store(User user) {
        ReflectionTestUtils.setField(user, "id", nextId++);
        accounts.put(user.getEmail(), user);
        return user;
    }

    private User existing(String email, String role, String name) {
        return store(new User(email, "hashed", role, name));
    }

    @Test
    void anEmptyDatabaseGetsTheWholeDirectory() {
        // Arrange
        User bill = existing(BILL, "ADVISOR", "Bill Hudlow");
        when(schedule.today(bill.getId())).thenReturn(List.of());

        // Act
        seeder.ensureDirectory(BILL);

        // Assert
        int alumni = DirectorySeedData.ALUMNI.size();
        int students = DirectorySeedData.STUDENTS.size();
        verify(users, times(alumni + students)).save(any(User.class));
        verify(alumniProfiles, times(alumni)).save(any());
        verify(studentProfiles, times(students)).save(any());
        verify(submissions, times(students)).save(any(Submission.class));
        verify(conversations, times(DirectorySeedData.CONVERSATIONS.size())).save(any());
        ArgumentCaptor<AdvisingAppointment> booked = ArgumentCaptor.forClass(AdvisingAppointment.class);
        verify(appointments, times(DirectorySeedData.TODAY.size())).save(booked.capture());
        AdvisingAppointment first = booked.getAllValues().get(0);
        assertEquals(OffsetDateTime.parse("2026-11-17T11:30-06:00"), first.getStartsAt());
        assertEquals(bill, first.getAdvisor());
        assertEquals("ALUMNI", accounts.get("sarah.kim@alumni.tulane.edu").getRole());
        assertEquals("STUDENT", accounts.get("alex.park@tulane.edu").getRole());
    }

    @Test
    void whatAlreadyExistsIsLeftAlone() {
        // Arrange
        User bill = existing(BILL, "ADVISOR", "Bill Hudlow");
        DirectorySeedData.ALUMNI.forEach(a -> existing(a.email(), "ALUMNI", a.name()));
        DirectorySeedData.STUDENTS.forEach(s -> {
            User student = existing(s.email(), "STUDENT", s.name());
            ReflectionTestUtils.setField(student, "submissions", List.of(
                    new Submission(1L, new BigDecimal("3.00"), "CMPS 1500", "CS", "SWE", null)));
        });
        when(alumniProfiles.existsById(anyLong())).thenReturn(true);
        when(studentProfiles.existsById(anyLong())).thenReturn(true);
        when(conversations.existsByStudentIdAndAlumnusId(anyLong(), anyLong())).thenReturn(true);
        when(schedule.today(bill.getId())).thenReturn(List.of(new Appointment("1", "2", "Morgan", "MT", "11:30 AM",
                "Finance", "Junior", 3.8, "IB", List.of())));

        // Act
        seeder.ensureDirectory(BILL);

        // Assert
        verify(users, never()).save(any());
        verify(alumniProfiles, never()).save(any());
        verify(studentProfiles, never()).save(any());
        verify(submissions, never()).save(any());
        verify(conversations, never()).save(any());
        verify(appointments, never()).save(any());
    }

    @Test
    void withoutTheAdvisorAccountNoAppointmentsAreBooked() {
        // Act
        seeder.ensureDirectory(BILL);

        // Assert
        verify(schedule, never()).today(anyLong());
        verify(appointments, never()).save(any());
        verify(conversations, times(DirectorySeedData.CONVERSATIONS.size())).save(any());
    }

    @Test
    void theResetKeepsEverySeededAccount() {
        // Act
        List<String> emails = DirectorySeedData.emails();

        // Assert
        assertEquals(DirectorySeedData.ALUMNI.size() + DirectorySeedData.STUDENTS.size(), emails.size());
        assertEquals(true, emails.contains("morgan@tulane.edu"));
        assertEquals(true, emails.contains("rahul.patel@alumni.tulane.edu"));
    }
}
