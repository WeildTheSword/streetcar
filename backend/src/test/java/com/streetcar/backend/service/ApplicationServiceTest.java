package com.streetcar.backend.service;

import com.streetcar.backend.model.ApplicationEntry;
import com.streetcar.backend.model.ApplicationRequest;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ApplicationServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime NOW = OffsetDateTime.now(CLOCK);
    private static final LocalDate TODAY = LocalDate.parse("2026-11-17");

    private JobApplicationRepository applications;
    private UserRepository users;
    private ApplicationService service;

    private final User morgan = user(5, "Morgan A. Thibodaux");
    private final User chris = user(6, "Chris Boudreaux");

    @BeforeEach
    void setUp() {
        applications = mock(JobApplicationRepository.class);
        users = mock(UserRepository.class);
        service = new ApplicationService(applications, users, CLOCK);
        when(applications.save(any(JobApplication.class))).thenAnswer(call -> {
            JobApplication saved = call.getArgument(0);
            if (saved.getId() == null) ReflectionTestUtils.setField(saved, "id", 100L);
            return saved;
        });
    }

    private static User user(long id, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", "STUDENT", name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static JobApplication application(long id, User student, String company, String status) {
        return new JobApplication(id, student, company, "Summer Analyst", status,
                LocalDate.parse("2026-11-01"), null, OffsetDateTime.parse("2026-11-01T16:00:00Z"));
    }

    private static ApplicationRequest request(String company, String role, String status, LocalDate on, String notes) {
        return new ApplicationRequest(company, role, status, on, notes);
    }

    @Test
    void forStudentListsTheirApplicationsInRepositoryOrder() {
        // Arrange
        when(applications.findByStudentIdOrderByAppliedOnDescIdDesc(5L)).thenReturn(List.of(
                application(2, morgan, "Moelis", "applied"), application(1, morgan, "Lazard", "rejected")));

        // Act
        List<ApplicationEntry> rows = service.forStudent(5);

        // Assert
        assertEquals(List.of("Moelis", "Lazard"), rows.stream().map(ApplicationEntry::company).toList());
        assertEquals("rejected", rows.get(1).status());
        assertEquals(LocalDate.parse("2026-11-01"), rows.get(0).appliedOn());
    }

    @Test
    void forStudentWithNoApplicationsIsEmpty() {
        // Arrange
        when(applications.findByStudentIdOrderByAppliedOnDescIdDesc(5L)).thenReturn(List.of());

        // Act
        List<ApplicationEntry> rows = service.forStudent(5);

        // Assert
        assertEquals(List.of(), rows);
    }

    @Test
    void createTrimsTheFieldsAndStampsTheTime() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));

        // Act
        ApplicationEntry saved = service.create(5,
                request("  Goldman Sachs ", " IB Summer Analyst ", " Interview ", TODAY, "  Superday Friday  "));

        // Assert
        assertEquals(new ApplicationEntry(100, "Goldman Sachs", "IB Summer Analyst", "interview", TODAY,
                "Superday Friday", NOW), saved);
        ArgumentCaptor<JobApplication> stored = ArgumentCaptor.forClass(JobApplication.class);
        verify(applications).save(stored.capture());
        assertEquals(morgan, stored.getValue().getStudent());
    }

    @Test
    void createStoresBlankNotesAsNull() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));

        // Act
        ApplicationEntry saved = service.create(5, request("Moelis", "Summer Analyst", "applied", TODAY, "   "));

        // Assert
        assertNull(saved.notes());
    }

    @Test
    void createForAMissingAccountIsNotFound() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class,
                () -> service.create(5, request("Moelis", "Summer Analyst", "applied", TODAY, null)));
    }

    @Test
    void createRefusesEveryInvalidField() {
        // Arrange
        String longCompany = "x".repeat(121);
        String longRole = "x".repeat(161);
        String longNotes = "x".repeat(501);
        List<ApplicationRequest> invalid = List.of(
                request(null, "Analyst", "applied", TODAY, null),
                request("   ", "Analyst", "applied", TODAY, null),
                request(longCompany, "Analyst", "applied", TODAY, null),
                request("Moelis", "", "applied", TODAY, null),
                request("Moelis", longRole, "applied", TODAY, null),
                request("Moelis", "Analyst", "ghosted", TODAY, null),
                request("Moelis", "Analyst", null, TODAY, null),
                request("Moelis", "Analyst", "applied", null, null),
                request("Moelis", "Analyst", "applied", TODAY.plusDays(1), null),
                request("Moelis", "Analyst", "applied", TODAY, longNotes));

        // Act and Assert
        for (ApplicationRequest bad : invalid) {
            assertThrows(IllegalArgumentException.class, () -> service.create(5, bad), bad.toString());
        }
        assertThrows(IllegalArgumentException.class, () -> service.create(5, null));
        verify(applications, never()).save(any());
    }

    @Test
    void createAcceptsTheLongestValuesAndToday() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));

        // Act
        ApplicationEntry saved = service.create(5,
                request("x".repeat(120), "y".repeat(160), "offer", TODAY, "z".repeat(500)));

        // Assert
        assertEquals(120, saved.company().length());
        assertEquals("offer", saved.status());
    }

    @Test
    void updateReplacesTheRowUnderTheSameId() {
        // Arrange
        when(applications.findById(7L)).thenReturn(Optional.of(application(7, morgan, "Evercore", "applied")));

        // Act
        ApplicationEntry saved = service.update(5, 7,
                request("Evercore", "M&A Summer Analyst", "offer", TODAY.minusDays(3), "Signed"));

        // Assert
        assertEquals(new ApplicationEntry(7, "Evercore", "M&A Summer Analyst", "offer", TODAY.minusDays(3),
                "Signed", NOW), saved);
    }

    @Test
    void updatingAnotherStudentsApplicationIsNotFound() {
        // Arrange
        when(applications.findById(7L)).thenReturn(Optional.of(application(7, chris, "Evercore", "applied")));

        // Act and Assert
        assertThrows(NoSuchElementException.class,
                () -> service.update(5, 7, request("Evercore", "Analyst", "offer", TODAY, null)));
        verify(applications, never()).save(any());
    }

    @Test
    void updatingAMissingApplicationIsNotFound() {
        // Arrange
        when(applications.findById(7L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class,
                () -> service.update(5, 7, request("Evercore", "Analyst", "offer", TODAY, null)));
    }

    @Test
    void updateWithAnInvalidBodyIsRefused() {
        // Arrange
        when(applications.findById(7L)).thenReturn(Optional.of(application(7, morgan, "Evercore", "applied")));

        // Act and Assert
        assertThrows(IllegalArgumentException.class,
                () -> service.update(5, 7, request("Evercore", "Analyst", "maybe", TODAY, null)));
        verify(applications, never()).save(any());
    }

    @Test
    void deleteRemovesTheStudentsOwnApplication() {
        // Arrange
        JobApplication mine = application(7, morgan, "Evercore", "applied");
        when(applications.findById(7L)).thenReturn(Optional.of(mine));

        // Act
        service.delete(5, 7);

        // Assert
        verify(applications).delete(mine);
    }

    @Test
    void deletingAnotherStudentsApplicationIsNotFound() {
        // Arrange
        when(applications.findById(7L)).thenReturn(Optional.of(application(7, chris, "Evercore", "applied")));

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.delete(5, 7));
        verify(applications, never()).delete(any());
    }
}
