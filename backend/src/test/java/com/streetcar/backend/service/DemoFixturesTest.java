package com.streetcar.backend.service;

import com.streetcar.backend.model.Advisor;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.DemoUser;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoFixturesTest {
    private DemoFixtures fixtures;

    @BeforeEach
    void setUp() {
        fixtures = new DemoFixtures();
    }

    @Test
    void usersListsOneStudentAndOneAdvisor() {
        // Arrange: fresh fixtures from setUp

        // Act
        List<String> roles = fixtures.users().stream().map(DemoUser::role).toList();

        // Assert
        assertEquals(List.of("STUDENT", "ADVISOR"), roles);
    }

    @Test
    void profilesAreShownUnderTheIdentityPassedIn() {
        // Arrange
        Identity alex = new Identity("Alex Rivera", "AR");
        Identity dana = new Identity("Dana Lee", "DL");

        // Act
        Student student = fixtures.morgan(alex, false);
        Advisor advisor = fixtures.bill(dana);
        Appointment first = fixtures.schedule(alex).get(0);

        // Assert
        assertEquals("Alex Rivera", student.name());
        assertEquals("AR", student.initials());
        assertEquals("Dana Lee", advisor.name());
        assertEquals("DL", advisor.initials());
        assertEquals("Alex Rivera", first.studentName());
    }

    @Test
    void morganCarriesTheOnboardingFlagPassedIn() {
        // Arrange
        Identity who = DemoFixtures.MORGAN;

        // Act
        Student before = fixtures.morgan(who, false);
        Student after = fixtures.morgan(who, true);

        // Assert
        assertFalse(before.onboarded());
        assertTrue(after.onboarded());
    }

    @Test
    void advisorFeedsAreNotEmpty() {
        // Arrange: fresh fixtures from setUp

        // Act
        int updates = fixtures.updates().size();
        int radar = fixtures.alumniRadar().size();

        // Assert
        assertTrue(updates > 0);
        assertTrue(radar > 0);
    }
}
