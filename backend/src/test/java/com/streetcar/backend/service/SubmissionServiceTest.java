package com.streetcar.backend.service;

import com.streetcar.backend.model.Submission;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubmissionServiceTest {
    private SubmissionService service;

    @BeforeEach
    void setUp() {
        // Fresh in-memory database per test so tests never see each other's rows
        var dataSource = new DriverManagerDataSource(
                "jdbc:h2:mem:" + UUID.randomUUID() + ";DB_CLOSE_DELAY=-1", "sa", "");
        new ResourceDatabasePopulator(new ClassPathResource("schema.sql")).execute(dataSource);
        service = new SubmissionService(JdbcClient.create(dataSource));
    }

    private Submission input(String gpa, String courses, String major, String goal) {
        return new Submission(null, new BigDecimal(gpa), courses, major, goal, null);
    }

    @Test
    void createSavesRecordAndReturnsItWithGeneratedFields() {
        // Arrange
        Submission input = input("3.50", "  CMPS 1500  ", " Computer Science ", " Software Engineer ");

        // Act
        Submission created = service.create(input);

        // Assert
        assertNotNull(created.id());
        assertNotNull(created.createdAt());
        assertEquals(0, new BigDecimal("3.5").compareTo(created.gpa()));
        assertEquals("CMPS 1500", created.completedCourses());
        assertEquals("Computer Science", created.major());
        assertEquals("Software Engineer", created.careerGoal());
    }

    @Test
    void getAllReturnsEmptyListWhenNoRecordsExist() {
        // Arrange: empty database from setUp

        // Act
        List<Submission> all = service.getAll();

        // Assert
        assertTrue(all.isEmpty());
    }

    @Test
    void getAllReturnsNewestRecordFirst() {
        // Arrange
        Submission first = service.create(input("3.00", "None", "Finance", "Analyst"));
        Submission second = service.create(input("3.90", "CMPS 2200", "Computer Science", "Researcher"));

        // Act
        List<Submission> all = service.getAll();

        // Assert
        assertEquals(List.of(second.id(), first.id()), all.stream().map(Submission::id).toList());
    }

    @Test
    void getByIdReturnsMatchingRecord() {
        // Arrange
        Submission created = service.create(input("2.75", "BSAN 3010", "Business", "Consultant"));

        // Act
        Submission found = service.getById(created.id());

        // Assert
        assertEquals(created, found);
    }

    @Test
    void getByIdThrowsWhenRecordDoesNotExist() {
        // Arrange
        long missingId = 999L;

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.getById(missingId));
    }

    @Test
    void updateChangesFieldsAndKeepsIdAndCreatedAt() {
        // Arrange
        Submission created = service.create(input("3.00", "None", "Finance", "Analyst"));
        Submission changes = input("3.25", " CMPS 1500 ", " Computer Science ", " Data Engineer ");

        // Act
        Submission updated = service.update(created.id(), changes);

        // Assert
        assertEquals(created.id(), updated.id());
        assertEquals(created.createdAt(), updated.createdAt());
        assertEquals(0, new BigDecimal("3.25").compareTo(updated.gpa()));
        assertEquals("CMPS 1500", updated.completedCourses());
        assertEquals("Computer Science", updated.major());
        assertEquals("Data Engineer", updated.careerGoal());
        assertEquals(updated, service.getById(created.id()));
    }

    @Test
    void updateThrowsWhenRecordDoesNotExist() {
        // Arrange
        Submission changes = input("3.25", "None", "Finance", "Analyst");

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.update(999L, changes));
    }

    @Test
    void deleteRemovesOnlyTheTargetRecord() {
        // Arrange
        Submission kept = service.create(input("3.00", "None", "Finance", "Analyst"));
        Submission removed = service.create(input("3.90", "CMPS 2200", "Computer Science", "Researcher"));

        // Act
        service.delete(removed.id());

        // Assert
        assertEquals(List.of(kept), service.getAll());
        assertThrows(NoSuchElementException.class, () -> service.getById(removed.id()));
    }

    @Test
    void deleteThrowsWhenRecordDoesNotExist() {
        // Arrange
        long missingId = 999L;

        // Act + Assert
        assertThrows(NoSuchElementException.class, () -> service.delete(missingId));
    }
}
