package com.streetcar.backend.service;

import com.streetcar.backend.model.Advisor;
import com.streetcar.backend.model.DemoUser;
import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoDataServiceTest {
    private static final String MORGAN = "morgan-thibodaux";
    private DemoDataService service;

    @BeforeEach
    void setUp() {
        service = new DemoDataService();
    }

    @Test
    void usersListsOneStudentAndOneAdvisor() {
        // Arrange: fresh service from setUp

        // Act
        List<String> roles = service.users().stream().map(DemoUser::role).toList();

        // Assert
        assertEquals(List.of("STUDENT", "ADVISOR"), roles);
    }

    @Test
    void setIdentityRenamesTheFixtureProfiles() {
        // Arrange
        service.setIdentity(MORGAN, "Alex Rivera", "AR");
        service.setIdentity("bill-hudlow", "Dana Lee", "DL");

        // Act
        Student student = service.morgan();
        Advisor advisor = service.bill();

        // Assert
        assertEquals("Alex Rivera", student.name());
        assertEquals("AR", student.initials());
        assertEquals("Dana Lee", advisor.name());
        assertEquals("DL", advisor.initials());
    }

    @Test
    void completeOnboardingIsReflectedOnTheStudent() {
        // Arrange: student starts not onboarded

        // Act
        service.completeOnboarding(MORGAN);

        // Assert
        assertTrue(service.isOnboarded(MORGAN));
        assertTrue(service.morgan().onboarded());
    }

    @Test
    void resetOnboardingClearsProgressAndIdentities() {
        // Arrange
        service.completeOnboarding(MORGAN);
        service.setIdentity(MORGAN, "Alex Rivera", "AR");

        // Act
        service.resetOnboarding();

        // Assert
        assertFalse(service.isOnboarded(MORGAN));
        assertEquals("Morgan A. Thibodaux", service.morgan().name());
    }
}
