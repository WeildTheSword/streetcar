package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.AlumniConversation;
import com.streetcar.backend.model.AlumniRadarRow;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdvisorServiceTest {
    private static final AuthenticatedUser BILL = new AuthenticatedUser(3, "ADVISOR");
    private static final Appointment JASMINE_AT_ONE = appointment("11", "5", "Jasmine L. Okoye", "1:00 PM");
    private static final Appointment MORGAN_AT_ELEVEN = appointment("10", "1", "Morgan A. Thibodaux", "11:30 AM");

    private DemoSessionState session;
    private AppointmentService appointments;
    private AlumniService alumni;
    private UserRepository users;
    private AdvisorService service;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        appointments = mock(AppointmentService.class);
        alumni = mock(AlumniService.class);
        users = mock(UserRepository.class);
        service = new AdvisorService(new DemoFixtures(), new CurrentProfiles(new DemoFixtures(), session),
                appointments, alumni, users);
        User morgan = new User("morgan@tulane.edu", "hash", "STUDENT", "Morgan A. Thibodaux");
        ReflectionTestUtils.setField(morgan, "id", 1L);
        when(users.findByEmail("morgan@tulane.edu")).thenReturn(Optional.of(morgan));
        when(users.findByRole(eq("STUDENT"), any(Sort.class))).thenReturn(List.of(morgan, morgan, morgan, morgan));
    }

    private static Appointment appointment(String id, String studentId, String name, String time) {
        return new Appointment(id, studentId, name, "XX", time, "Finance", "Junior", 3.5, "Banking", List.of());
    }

    @Test
    void getDashboardReadsScheduleRadarConversationsAndCountsFromTheDatabase() {
        // Arrange
        AlumniConversation sarah = new AlumniConversation("SK", "Sarah Kim", "Freeman '16 · Goldman Sachs IBD",
                "Happy to chat", null, "reply", "Replied", "New York, NY", "12 min", true);
        AlumniRadarRow anna = new AlumniRadarRow("AC", "Anna Chen '22", "Freeman · Finance", "VP", "New York, NY", 2,
                "2 students");
        when(appointments.today(3)).thenReturn(List.of(MORGAN_AT_ELEVEN, JASMINE_AT_ONE));
        when(alumni.conversationsFor(1)).thenReturn(List.of(sarah));
        when(alumni.radar()).thenReturn(List.of(anna));

        // Act
        Optional<AdvisorDashboard> dashboard = service.getDashboard("bill-hudlow", BILL);

        // Assert
        assertTrue(dashboard.isPresent());
        assertEquals("bill-hudlow", dashboard.get().advisor().id());
        assertEquals(4, dashboard.get().advisor().studentCount());
        assertEquals(2, dashboard.get().advisor().appointmentCount());
        assertEquals("morgan-thibodaux", dashboard.get().nextStudent().id());
        assertEquals(List.of(sarah), dashboard.get().nextStudent().conversations());
        assertEquals(List.of(MORGAN_AT_ELEVEN, JASMINE_AT_ONE), dashboard.get().schedule());
        assertEquals(List.of(anna), dashboard.get().alumniRadar());
        assertFalse(dashboard.get().updates().isEmpty());
    }

    @Test
    void theNextAppointmentIsMorgansWhenSheIsBookedToday() {
        // Arrange
        when(appointments.today(3)).thenReturn(List.of(JASMINE_AT_ONE, MORGAN_AT_ELEVEN));

        // Act
        AdvisorDashboard dashboard = service.getDashboard("bill-hudlow", BILL).orElseThrow();

        // Assert
        assertEquals(MORGAN_AT_ELEVEN, dashboard.nextAppointment());
    }

    @Test
    void theNextAppointmentIsTheFirstWhenMorganIsNotBooked() {
        // Arrange
        when(appointments.today(3)).thenReturn(List.of(JASMINE_AT_ONE));

        // Act
        AdvisorDashboard dashboard = service.getDashboard("bill-hudlow", BILL).orElseThrow();

        // Assert
        assertEquals(JASMINE_AT_ONE, dashboard.nextAppointment());
    }

    @Test
    void thereIsNoNextAppointmentOnAnEmptyDay() {
        // Arrange
        when(appointments.today(3)).thenReturn(List.of());

        // Act
        AdvisorDashboard dashboard = service.getDashboard("bill-hudlow", BILL).orElseThrow();

        // Assert
        assertNull(dashboard.nextAppointment());
        assertTrue(dashboard.schedule().isEmpty());
    }

    @Test
    void getDashboardReturnsEmptyForUnknownAdvisor() {
        // Arrange
        String advisorId = "nobody";

        // Act
        Optional<AdvisorDashboard> dashboard = service.getDashboard(advisorId, BILL);

        // Assert
        assertTrue(dashboard.isEmpty());
    }

    @Test
    void getDashboardShowsMorganUnderSignUpNameAndOnboardingState() {
        // Arrange
        when(appointments.today(3)).thenReturn(List.of());
        session.setIdentity("morgan-thibodaux", new Identity("Jordan Lee", "JL"));
        session.completeOnboarding("morgan-thibodaux");

        // Act
        AdvisorDashboard dashboard = service.getDashboard("bill-hudlow", BILL).orElseThrow();

        // Assert
        assertEquals("Jordan Lee", dashboard.nextStudent().name());
        assertEquals("JL", dashboard.nextStudent().initials());
        assertTrue(dashboard.nextStudent().onboarded());
    }
}
