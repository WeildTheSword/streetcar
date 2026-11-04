package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SubmissionServiceTest {
    private static final OffsetDateTime CREATED_AT = OffsetDateTime.parse("2026-10-26T12:00:00Z");
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "id");
    private static final AuthenticatedUser ALEX = new AuthenticatedUser(1, "STUDENT");
    private static final AuthenticatedUser JORDAN = new AuthenticatedUser(2, "STUDENT");
    private static final AuthenticatedUser SARAH = new AuthenticatedUser(3, "ADVISOR");

    private SubmissionRepository repository;
    private UserRepository users;
    private SubmissionService service;

    @BeforeEach
    void setUp() {
        repository = mock(SubmissionRepository.class);
        users = mock(UserRepository.class);
        service = new SubmissionService(repository, users);
    }

    private Submission input(String gpa, String courses, String major, String goal) {
        return new Submission(null, new BigDecimal(gpa), courses, major, goal, null);
    }

    private User user(long id) {
        User user = new User("user" + id + "@example.com", "STUDENT");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    /** A stored submission with id 7, owned by Alex. */
    private Submission alexsSubmission() {
        return new Submission(7L, new BigDecimal("3.00"), "None", "Finance", "Analyst", CREATED_AT)
                .withIdentity(7L, CREATED_AT, user(ALEX.id()));
    }

    private Submission savedArgument() {
        ArgumentCaptor<Submission> saved = ArgumentCaptor.forClass(Submission.class);
        verify(repository).save(saved.capture());
        return saved.getValue();
    }

    @Test
    void createSavesTheTrimmedRecordAndReturnsWhatTheRepositorySaved() {
        // Arrange
        Submission stored = alexsSubmission();
        when(repository.save(any())).thenReturn(stored);

        // Act
        Submission created = service.create(input("3.5", "  CMPS 1500  ", " Computer Science ", " Software Engineer "), ALEX);

        // Assert
        assertSame(stored, created);
        Submission saved = savedArgument();
        assertEquals(new BigDecimal("3.50"), saved.getGpa());
        assertEquals("CMPS 1500", saved.getCompletedCourses());
        assertEquals("Computer Science", saved.getMajor());
        assertEquals("Software Engineer", saved.getCareerGoal());
    }

    @Test
    void createRecordsTheSignedInUserAsTheOwner() {
        // Arrange
        User alex = user(ALEX.id());
        when(users.getReferenceById(ALEX.id())).thenReturn(alex);

        // Act
        service.create(input("3.00", "None", "Finance", "Analyst"), ALEX);

        // Assert
        assertSame(alex, savedArgument().getUser());
    }

    @Test
    void createIgnoresAnIdAndCreatedAtSentByTheClient() {
        // Arrange
        Submission fromClient = new Submission(5L, new BigDecimal("3.00"), "None", "Finance", "Analyst", CREATED_AT);

        // Act
        service.create(fromClient, ALEX);

        // Assert
        Submission saved = savedArgument();
        assertNull(saved.getId());
        assertNull(saved.getCreatedAt());
    }

    @Test
    void getAllGivesAStudentOnlyTheirOwn() {
        // Arrange
        List<Submission> own = List.of(alexsSubmission());
        when(repository.findByUserId(ALEX.id(), NEWEST_FIRST)).thenReturn(own);

        // Act
        List<Submission> all = service.getAll(ALEX);

        // Assert
        assertSame(own, all);
        verify(repository, never()).findAll(any(Sort.class));
    }

    @Test
    void getAllGivesAnAdvisorEveryone() {
        // Arrange
        List<Submission> everyone = List.of(alexsSubmission());
        when(repository.findAll(NEWEST_FIRST)).thenReturn(everyone);

        // Act
        List<Submission> all = service.getAll(SARAH);

        // Assert
        assertSame(everyone, all);
        verify(repository, never()).findByUserId(any(), any());
    }

    @Test
    void getByIdReturnsAStudentsOwnRecord() {
        // Arrange
        Submission stored = alexsSubmission();
        when(repository.findById(7L)).thenReturn(Optional.of(stored));

        // Act
        Submission found = service.getById(7L, ALEX);

        // Assert
        assertSame(stored, found);
    }

    @Test
    void getByIdHidesAnotherStudentsRecord() {
        // Arrange
        when(repository.findById(7L)).thenReturn(Optional.of(alexsSubmission()));

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.getById(7L, JORDAN));
    }

    @Test
    void getByIdLetsAnAdvisorReadAnyRecord() {
        // Arrange
        Submission stored = alexsSubmission();
        when(repository.findById(7L)).thenReturn(Optional.of(stored));

        // Act
        Submission found = service.getById(7L, SARAH);

        // Assert
        assertSame(stored, found);
    }

    @Test
    void getByIdHidesARecordWithNoOwnerFromStudents() {
        // Arrange: saved before submissions had owners
        Submission orphan = new Submission(7L, new BigDecimal("3.00"), "None", "Finance", "Analyst", CREATED_AT);
        when(repository.findById(7L)).thenReturn(Optional.of(orphan));

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.getById(7L, ALEX));
    }

    @Test
    void getByIdThrowsWhenRecordDoesNotExist() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.getById(999L, SARAH));
    }

    @Test
    void updateSavesTheChangesAndKeepsIdCreatedAtAndOwner() {
        // Arrange
        Submission existing = alexsSubmission();
        when(repository.findById(7L)).thenReturn(Optional.of(existing));
        Submission changes = input("3.25", " CMPS 1500 ", " Computer Science ", " Data Engineer ");

        // Act
        service.update(7L, changes, ALEX);

        // Assert
        Submission saved = savedArgument();
        assertEquals(7L, saved.getId());
        assertEquals(CREATED_AT, saved.getCreatedAt());
        assertSame(existing.getUser(), saved.getUser());
        assertEquals(new BigDecimal("3.25"), saved.getGpa());
        assertEquals("CMPS 1500", saved.getCompletedCourses());
        assertEquals("Computer Science", saved.getMajor());
        assertEquals("Data Engineer", saved.getCareerGoal());
    }

    @Test
    void anAdvisorUpdatingARecordLeavesTheStudentAsOwner() {
        // Arrange
        Submission existing = alexsSubmission();
        when(repository.findById(7L)).thenReturn(Optional.of(existing));

        // Act
        service.update(7L, input("3.25", "None", "Finance", "Analyst"), SARAH);

        // Assert
        assertSame(existing.getUser(), savedArgument().getUser());
    }

    @Test
    void aStudentCannotUpdateAnotherStudentsRecord() {
        // Arrange
        when(repository.findById(7L)).thenReturn(Optional.of(alexsSubmission()));
        Submission changes = input("1.00", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.update(7L, changes, JORDAN));
        verify(repository, never()).save(any());
    }

    @Test
    void updateThrowsAndSavesNothingWhenRecordDoesNotExist() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());
        Submission changes = input("3.25", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.update(999L, changes, ALEX));
        verify(repository, never()).save(any());
    }

    @Test
    void deleteRemovesTheTargetRecord() {
        // Arrange
        when(repository.existsById(7L)).thenReturn(true);

        // Act
        service.delete(7L);

        // Assert
        verify(repository).deleteById(7L);
    }

    @Test
    void deleteThrowsAndRemovesNothingWhenRecordDoesNotExist() {
        // Arrange
        when(repository.existsById(999L)).thenReturn(false);

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.delete(999L));
        verify(repository, never()).deleteById(any());
    }
}
