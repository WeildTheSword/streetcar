package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.Identity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdvisorServiceTest {
    private DemoSessionState session;
    private AdvisorService service;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        service = new AdvisorService(new DemoFixtures(), new CurrentProfiles(new DemoFixtures(), session));
    }

    @Test
    void getDashboardReturnsFullPayloadForDemoAdvisor() {
        // Arrange
        String advisorId = "bill-hudlow";

        // Act
        Optional<AdvisorDashboard> dashboard = service.getDashboard(advisorId);

        // Assert
        assertTrue(dashboard.isPresent());
        assertEquals(advisorId, dashboard.get().advisor().id());
        assertEquals("morgan-thibodaux", dashboard.get().nextStudent().id());
        assertFalse(dashboard.get().schedule().isEmpty());
        assertEquals(dashboard.get().schedule().get(0), dashboard.get().nextAppointment());
        assertFalse(dashboard.get().updates().isEmpty());
        assertFalse(dashboard.get().alumniRadar().isEmpty());
    }

    @Test
    void getDashboardReturnsEmptyForUnknownAdvisor() {
        // Arrange
        String advisorId = "nobody";

        // Act
        Optional<AdvisorDashboard> dashboard = service.getDashboard(advisorId);

        // Assert
        assertTrue(dashboard.isEmpty());
    }

    @Test
    void getDashboardShowsMorganUnderSignUpNameAndOnboardingState() {
        // Arrange
        session.setIdentity("morgan-thibodaux", new Identity("Jordan Lee", "JL"));
        session.completeOnboarding("morgan-thibodaux");

        // Act
        AdvisorDashboard dashboard = service.getDashboard("bill-hudlow").orElseThrow();

        // Assert
        assertEquals("Jordan Lee", dashboard.nextStudent().name());
        assertEquals("JL", dashboard.nextStudent().initials());
        assertTrue(dashboard.nextStudent().onboarded());
        assertEquals("Jordan Lee", dashboard.nextAppointment().studentName());
    }
}
