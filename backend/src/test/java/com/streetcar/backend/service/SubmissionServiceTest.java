package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import com.streetcar.backend.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Sort;
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

    private SubmissionRepository repository;
    private SubmissionService service;

    @BeforeEach
    void setUp() {
        repository = mock(SubmissionRepository.class);
        service = new SubmissionService(repository);
    }

    private Submission input(String gpa, String courses, String major, String goal) {
        return new Submission(null, new BigDecimal(gpa), courses, major, goal, null);
    }

    private Submission savedArgument() {
        ArgumentCaptor<Submission> saved = ArgumentCaptor.forClass(Submission.class);
        verify(repository).save(saved.capture());
        return saved.getValue();
    }

    @Test
    void createSavesTheTrimmedRecordAndReturnsWhatTheRepositorySaved() {
        // Arrange
        Submission stored = new Submission(1L, new BigDecimal("3.50"), "CMPS 1500", "Computer Science",
                "Software Engineer", CREATED_AT);
        when(repository.save(any())).thenReturn(stored);

        // Act
        Submission created = service.create(input("3.5", "  CMPS 1500  ", " Computer Science ", " Software Engineer "));

        // Assert
        assertSame(stored, created);
        Submission saved = savedArgument();
        assertEquals(new BigDecimal("3.50"), saved.getGpa());
        assertEquals("CMPS 1500", saved.getCompletedCourses());
        assertEquals("Computer Science", saved.getMajor());
        assertEquals("Software Engineer", saved.getCareerGoal());
    }

    @Test
    void createIgnoresAnIdAndCreatedAtSentByTheClient() {
        // Arrange
        Submission fromClient = new Submission(5L, new BigDecimal("3.00"), "None", "Finance", "Analyst", CREATED_AT);

        // Act
        service.create(fromClient);

        // Assert
        Submission saved = savedArgument();
        assertNull(saved.getId());
        assertNull(saved.getCreatedAt());
    }

    @Test
    void getAllAsksTheRepositoryForNewestFirst() {
        // Arrange
        List<Submission> rows = List.of(input("3.00", "None", "Finance", "Analyst"));
        when(repository.findAll(Sort.by(Sort.Direction.DESC, "id"))).thenReturn(rows);

        // Act
        List<Submission> all = service.getAll();

        // Assert
        assertSame(rows, all);
    }

    @Test
    void getByIdReturnsMatchingRecord() {
        // Arrange
        Submission stored = input("2.75", "BSAN 3010", "Business", "Consultant");
        when(repository.findById(7L)).thenReturn(Optional.of(stored));

        // Act
        Submission found = service.getById(7L);

        // Assert
        assertSame(stored, found);
    }

    @Test
    void getByIdThrowsWhenRecordDoesNotExist() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.getById(999L));
    }

    @Test
    void updateSavesTheChangesAndKeepsIdAndCreatedAt() {
        // Arrange
        Submission existing = new Submission(7L, new BigDecimal("3.00"), "None", "Finance", "Analyst", CREATED_AT);
        when(repository.findById(7L)).thenReturn(Optional.of(existing));
        Submission changes = input("3.25", " CMPS 1500 ", " Computer Science ", " Data Engineer ");

        // Act
        service.update(7L, changes);

        // Assert
        Submission saved = savedArgument();
        assertEquals(7L, saved.getId());
        assertEquals(CREATED_AT, saved.getCreatedAt());
        assertEquals(new BigDecimal("3.25"), saved.getGpa());
        assertEquals("CMPS 1500", saved.getCompletedCourses());
        assertEquals("Computer Science", saved.getMajor());
        assertEquals("Data Engineer", saved.getCareerGoal());
    }

    @Test
    void updateThrowsAndSavesNothingWhenRecordDoesNotExist() {
        // Arrange
        when(repository.findById(999L)).thenReturn(Optional.empty());
        Submission changes = input("3.25", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.update(999L, changes));
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
