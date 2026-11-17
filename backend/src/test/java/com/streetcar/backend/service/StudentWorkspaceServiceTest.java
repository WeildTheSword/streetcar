package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AlumniContact;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.StudentWorkspaceSummary;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class StudentWorkspaceServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime NOW = OffsetDateTime.now(CLOCK);

    private UserRepository users;
    private AlumniProfileRepository alumniProfiles;
    private ConversationRepository conversations;
    private AppointmentRepository appointmentRows;
    private JobApplicationRepository applications;
    private AppointmentService appointments;
    private StudentWorkspaceService service;

    private final User morgan = user(5, "STUDENT", "Morgan A. Thibodaux");
    private final User sarah = user(20, "ALUMNI", "Sarah Kim");
    private final User rahul = user(21, "ALUMNI", "Rahul Patel");
    private final AlumniProfile sarahProfile =
            profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY");
    private final AlumniProfile rahulProfile =
            profile(rahul, "SSE · Computer Science", 2023, "SWE-III · Anthropic", "San Francisco, CA");

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        alumniProfiles = mock(AlumniProfileRepository.class);
        conversations = mock(ConversationRepository.class);
        appointmentRows = mock(AppointmentRepository.class);
        applications = mock(JobApplicationRepository.class);
        appointments = mock(AppointmentService.class);
        service = new StudentWorkspaceService(users, alumniProfiles, conversations, appointmentRows, applications,
                appointments, CLOCK);
    }

    private static User user(long id, String role, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static AlumniProfile profile(User user, String school, int year, String job, String city) {
        AlumniProfile profile = new AlumniProfile(user, school, year, job, city);
        ReflectionTestUtils.setField(profile, "userId", user.getId());
        return profile;
    }

    @Test
    void summaryCountsConversationsUpcomingAppointmentsAndApplications() {
        // Arrange
        when(conversations.countByStudentId(5L)).thenReturn(5L);
        when(appointmentRows.countByStudentIdAndStartsAtGreaterThanEqual(5L, NOW)).thenReturn(2L);
        when(applications.countByStudentId(5L)).thenReturn(6L);

        // Act
        StudentWorkspaceSummary summary = service.summary(5);

        // Assert
        assertEquals(new StudentWorkspaceSummary(5, 2, 6), summary);
    }

    @Test
    void summaryForANewStudentIsAllZeros() {
        // Act
        StudentWorkspaceSummary summary = service.summary(5);

        // Assert
        assertEquals(new StudentWorkspaceSummary(0, 0, 0), summary);
    }

    @Test
    void appointmentsAreTheStudentsAccountAppointments() {
        // Arrange
        AccountAppointment session = new AccountAppointment(1, "Bill Hudlow", NOW, List.of("First session"));
        when(users.findById(5L)).thenReturn(Optional.of(morgan));
        when(appointments.forAccount(morgan)).thenReturn(List.of(session));

        // Act
        List<AccountAppointment> rows = service.appointments(5);

        // Assert
        assertEquals(List.of(session), rows);
    }

    @Test
    void appointmentsForAMissingAccountAreNotFound() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.appointments(5));
    }

    @Test
    void alumniListsEveryAlumWithThisStudentsThread() {
        // Arrange
        when(alumniProfiles.findAllByOrderByGradYearDescUserDisplayNameAsc()).thenReturn(List.of(rahulProfile, sarahProfile));
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(5L)).thenReturn(List.of(
                new Conversation(morgan, sarah, "reply", "Happy to chat", NOW, true)));

        // Act
        List<AlumniContact> rows = service.alumni(5);

        // Assert
        assertEquals(List.of(
                new AlumniContact(21, "Rahul Patel", "RP", "SSE · Computer Science", 2023, "SWE-III · Anthropic",
                        "San Francisco, CA", null, null, null),
                new AlumniContact(20, "Sarah Kim", "SK", "Freeman · Finance", 2016, "Goldman Sachs IBD",
                        "New York, NY", "reply", "Replied", "Happy to chat")), rows);
    }

    @Test
    void alumniWithNoAlumniIsEmpty() {
        // Arrange
        when(alumniProfiles.findAllByOrderByGradYearDescUserDisplayNameAsc()).thenReturn(List.of());

        // Act
        List<AlumniContact> rows = service.alumni(5);

        // Assert
        assertEquals(List.of(), rows);
    }

    @Test
    void startConversationSavesASentThreadAndReturnsTheRow() {
        // Arrange
        when(users.findById(21L)).thenReturn(Optional.of(rahul));
        when(users.findById(5L)).thenReturn(Optional.of(morgan));
        when(alumniProfiles.findById(21L)).thenReturn(Optional.of(rahulProfile));
        when(conversations.save(any(Conversation.class))).thenAnswer(call -> call.getArgument(0));

        // Act
        AlumniContact row = service.startConversation(5, 21, "  Could I ask about APM roles?  ");

        // Assert
        assertEquals(new AlumniContact(21, "Rahul Patel", "RP", "SSE · Computer Science", 2023,
                "SWE-III · Anthropic", "San Francisco, CA", "sent", "Sent", "Could I ask about APM roles?"), row);
        ArgumentCaptor<Conversation> saved = ArgumentCaptor.forClass(Conversation.class);
        verify(conversations).save(saved.capture());
        assertEquals(morgan, saved.getValue().getStudent());
        assertEquals(NOW, saved.getValue().getUpdatedAt());
        assertEquals(false, saved.getValue().isUnread());
    }

    @Test
    void startConversationRefusesAnEmptyOrOverlongMessage() {
        // Act and Assert
        assertThrows(IllegalArgumentException.class, () -> service.startConversation(5, 21, null));
        assertThrows(IllegalArgumentException.class, () -> service.startConversation(5, 21, "   "));
        assertThrows(IllegalArgumentException.class, () -> service.startConversation(5, 21, "x".repeat(501)));
        verify(conversations, never()).save(any());
    }

    @Test
    void startConversationWithAnUnknownIdOrANonAlumIsNotFound() {
        // Arrange
        when(users.findById(99L)).thenReturn(Optional.empty());
        when(users.findById(5L)).thenReturn(Optional.of(morgan));

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.startConversation(5, 99, "Hello"));
        assertThrows(NoSuchElementException.class, () -> service.startConversation(5, 5, "Hello"));
        verify(conversations, never()).save(any());
    }

    @Test
    void startConversationWithAnAlumMissingAProfileIsNotFound() {
        // Arrange
        when(users.findById(21L)).thenReturn(Optional.of(rahul));
        when(alumniProfiles.findById(21L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.startConversation(5, 21, "Hello"));
    }

    @Test
    void startConversationWhenOneExistsIsAConflict() {
        // Arrange
        when(users.findById(20L)).thenReturn(Optional.of(sarah));
        when(alumniProfiles.findById(20L)).thenReturn(Optional.of(sarahProfile));
        when(conversations.existsByStudentIdAndAlumnusId(5L, 20L)).thenReturn(true);

        // Act
        ConflictException conflict = assertThrows(ConflictException.class,
                () -> service.startConversation(5, 20, "Hello again"));

        // Assert
        assertEquals("You are already talking to Sarah Kim.", conflict.getMessage());
        verify(conversations, never()).save(any());
    }
}
