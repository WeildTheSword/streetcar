package com.streetcar.backend.service;

import com.streetcar.backend.model.Resume;
import com.streetcar.backend.model.ResumeEntry;
import com.streetcar.backend.model.ResumeRequest;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.ResumeRepository;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResumeServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime NOW = OffsetDateTime.now(CLOCK);

    private ResumeRepository resumes;
    private UserRepository users;
    private ResumeService service;
    private User morgan;

    @BeforeEach
    void setUp() {
        resumes = mock(ResumeRepository.class);
        users = mock(UserRepository.class);
        service = new ResumeService(resumes, users, CLOCK);
        morgan = new User("morgan@tulane.edu", "not-a-real-hash", "STUDENT", "Morgan A. Thibodaux");
        ReflectionTestUtils.setField(morgan, "id", 5L);
    }

    @Test
    void mineIsBlankBeforeTheFirstSave() {
        // Arrange
        when(resumes.findById(5L)).thenReturn(Optional.empty());

        // Act
        ResumeEntry resume = service.mine(5);

        // Assert
        assertEquals(new ResumeEntry("", "", "", "", null), resume);
        assertTrue(service.find(5).isEmpty());
    }

    @Test
    void mineReturnsTheSavedResume() {
        // Arrange
        OffsetDateTime saved = OffsetDateTime.parse("2026-11-10T16:00:00Z");
        when(resumes.findById(5L)).thenReturn(Optional.of(
                new Resume(morgan, "Finance + CS", "Junior", "Fund analyst", "Excel", saved)));

        // Act
        ResumeEntry resume = service.mine(5);

        // Assert
        assertEquals(new ResumeEntry("Finance + CS", "Junior", "Fund analyst", "Excel", saved), resume);
    }

    @Test
    void saveTrimsTheFieldsAndAllowsBlankSections() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));

        // Act
        ResumeEntry resume = service.save(5, new ResumeRequest("  Finance + CS  ", null, " ", "Excel "));

        // Assert
        assertEquals(new ResumeEntry("Finance + CS", "", "", "Excel", NOW), resume);
    }

    @Test
    void theFirstSaveInsertsARowForTheAccount() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));
        when(resumes.replace(5L, "Finance + CS", "", "", "", NOW)).thenReturn(0);
        ArgumentCaptor<Resume> stored = ArgumentCaptor.forClass(Resume.class);

        // Act
        service.save(5, new ResumeRequest("Finance + CS", "", "", ""));

        // Assert
        verify(resumes).save(stored.capture());
        assertEquals(morgan, stored.getValue().getUser());
        assertEquals("Finance + CS", stored.getValue().getHeadline());
    }

    @Test
    void aLaterSaveReplacesTheRowInsteadOfInsertingAnother() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.of(morgan));
        when(resumes.replace(5L, "Finance + CS, '27", "Junior", "Fund", "Python", NOW)).thenReturn(1);

        // Act
        ResumeEntry resume = service.save(5, new ResumeRequest("Finance + CS, '27", "Junior", "Fund", "Python"));

        // Assert
        assertEquals(new ResumeEntry("Finance + CS, '27", "Junior", "Fund", "Python", NOW), resume);
        verify(resumes, never()).save(any());
    }

    @Test
    void saveRefusesAMissingOrOverlongField() {
        // Arrange
        List<ResumeRequest> invalid = List.of(
                new ResumeRequest(null, "", "", ""),
                new ResumeRequest("   ", "", "", ""),
                new ResumeRequest("x".repeat(201), "", "", ""),
                new ResumeRequest("Headline", "x".repeat(2001), "", ""),
                new ResumeRequest("Headline", "", "x".repeat(4001), ""),
                new ResumeRequest("Headline", "", "", "x".repeat(1001)));

        // Act and Assert
        for (ResumeRequest bad : invalid) {
            assertThrows(IllegalArgumentException.class, () -> service.save(5, bad));
        }
        assertThrows(IllegalArgumentException.class, () -> service.save(5, null));
        verify(resumes, never()).save(any());
    }

    @Test
    void saveForAMissingAccountIsNotFound() {
        // Arrange
        when(users.findById(5L)).thenReturn(Optional.empty());

        // Act and Assert
        assertThrows(NoSuchElementException.class, () -> service.save(5, new ResumeRequest("Headline", "", "", "")));
    }
}
