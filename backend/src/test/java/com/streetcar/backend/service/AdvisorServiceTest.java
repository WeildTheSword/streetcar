package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AdvisorServiceTest {
    private AdvisorService service;

    @BeforeEach
    void setUp() {
        service = new AdvisorService(new DemoDataService());
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
}
