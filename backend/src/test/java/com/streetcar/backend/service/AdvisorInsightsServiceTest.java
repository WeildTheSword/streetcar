package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.HiringInsights;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.OutcomeInsights;
import com.streetcar.backend.model.PerformanceInsights;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdvisorInsightsServiceTest {
    /** A Tuesday morning in New Orleans; that week starts Monday 2026-11-16. */
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime UPDATED = OffsetDateTime.parse("2026-11-01T16:00:00Z");

    private JobApplicationRepository applications;
    private AlumniProfileRepository alumniProfiles;
    private AppointmentRepository appointments;
    private UserRepository users;
    private AdvisorInsightsService service;

    private final User bill = user(1, "ADVISOR", "Bill Hudlow");
    private final User morgan = user(5, "STUDENT", "Morgan A. Thibodaux");
    private final User jasmine = user(6, "STUDENT", "Jasmine L. Okoye");
    private final User alex = user(7, "STUDENT", "Alex Park");

    @BeforeEach
    void setUp() {
        applications = mock(JobApplicationRepository.class);
        alumniProfiles = mock(AlumniProfileRepository.class);
        appointments = mock(AppointmentRepository.class);
        users = mock(UserRepository.class);
        service = new AdvisorInsightsService(applications, alumniProfiles, appointments, users, CLOCK);
    }

    private static User user(long id, String role, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static JobApplication application(long id, User student, String company, String status, String appliedOn) {
        return new JobApplication(id, student, company, "Summer Analyst", status, LocalDate.parse(appliedOn), null,
                UPDATED);
    }

    private static AlumniProfile alum(long id, String job, String city) {
        return new AlumniProfile(user(id, "ALUMNI", "Alum " + id), "Freeman · Finance", 2020, job, city);
    }

    private AdvisingAppointment session(User student, String startsAt) {
        return new AdvisingAppointment(bill, student, OffsetDateTime.parse(startsAt), "");
    }

    @Test
    void hiringGroupsApplicationsByCompanyAndAlumniByEmployerAndCity() {
        // Arrange
        when(applications.findAll()).thenReturn(List.of(
                application(1, morgan, "Moelis", "applied", "2026-11-01"),
                application(2, morgan, "Goldman Sachs", "interview", "2026-11-02"),
                application(3, jasmine, "Goldman Sachs", "offer", "2026-11-03"),
                application(4, alex, "Anthropic", "applied", "2026-11-04")));
        when(alumniProfiles.findAll()).thenReturn(List.of(
                alum(20, "Goldman Sachs IBD", "New York, NY"),
                alum(21, "Analyst · Goldman Sachs TMT", "New York, NY"),
                alum(22, "SWE-III · Anthropic", "San Francisco, CA"),
                alum(23, "Engineer · Anthropic", "San Francisco, CA"),
                alum(24, "VP, Investment Banking · Goldman Sachs", "New York, NY"),
                alum(25, "Associate · McKinsey Health", "Boston, MA")));

        // Act
        HiringInsights hiring = service.hiring();

        // Assert
        assertEquals(List.of(
                new HiringInsights.Company("Goldman Sachs", 2, 1, 1),
                new HiringInsights.Company("Anthropic", 1, 0, 0),
                new HiringInsights.Company("Moelis", 1, 0, 0)), hiring.studentApplications());
        assertEquals(List.of(
                new HiringInsights.Employer("Anthropic", 2),
                new HiringInsights.Employer("Goldman Sachs", 1),
                new HiringInsights.Employer("Goldman Sachs IBD", 1),
                new HiringInsights.Employer("Goldman Sachs TMT", 1),
                new HiringInsights.Employer("McKinsey Health", 1)), hiring.alumniEmployers());
        assertEquals(List.of(
                new HiringInsights.City("New York, NY", 3),
                new HiringInsights.City("San Francisco, CA", 2),
                new HiringInsights.City("Boston, MA", 1)), hiring.alumniCities());
        assertEquals(4, hiring.totalApplications());
        assertEquals(6, hiring.totalAlumni());
    }

    @Test
    void hiringWithNoDataIsEmpty() {
        // Arrange
        when(applications.findAll()).thenReturn(List.of());
        when(alumniProfiles.findAll()).thenReturn(List.of());

        // Act
        HiringInsights hiring = service.hiring();

        // Assert
        assertEquals(new HiringInsights(List.of(), List.of(), List.of(), 0, 0), hiring);
    }

    @Test
    void theEmployerIsTheTextAfterTheLastSeparator() {
        // Act and Assert
        assertEquals("Goldman Sachs TMT", AdvisorInsightsService.employer("Analyst · Goldman Sachs TMT"));
        assertEquals("Goldman Sachs IBD", AdvisorInsightsService.employer("Goldman Sachs IBD"));
        assertEquals("KPMG M&A", AdvisorInsightsService.employer("Senior · Manager · KPMG M&A"));
    }

    @Test
    void performanceCountsTheAdvisorsSessionsAndEightWeeksAroundThisOne() {
        // Arrange
        when(users.countByRole("STUDENT")).thenReturn(4L);
        when(appointments.findByAdvisorIdOrderByStartsAtAsc(1L)).thenReturn(List.of(
                session(jasmine, "2026-10-01T10:00-05:00"),
                session(morgan, "2026-11-15T23:30-06:00"),
                session(morgan, "2026-11-16T00:00-06:00"),
                session(morgan, "2026-11-18T10:00-06:00"),
                session(jasmine, "2026-11-24T10:00-06:00")));

        // Act
        PerformanceInsights performance = service.performance(1);

        // Assert
        assertEquals(4, performance.students());
        assertEquals(5, performance.appointmentsTotal());
        assertEquals(2, performance.upcoming());
        assertEquals(3, performance.completed());
        assertEquals(2, performance.thisWeek());
        assertEquals(2, performance.studentsSeen());
        assertEquals(50, performance.coveragePercent());
        assertEquals(List.of(
                new PerformanceInsights.Week(LocalDate.parse("2026-10-12"), 0),
                new PerformanceInsights.Week(LocalDate.parse("2026-10-19"), 0),
                new PerformanceInsights.Week(LocalDate.parse("2026-10-26"), 0),
                new PerformanceInsights.Week(LocalDate.parse("2026-11-02"), 0),
                new PerformanceInsights.Week(LocalDate.parse("2026-11-09"), 1),
                new PerformanceInsights.Week(LocalDate.parse("2026-11-16"), 2),
                new PerformanceInsights.Week(LocalDate.parse("2026-11-23"), 1),
                new PerformanceInsights.Week(LocalDate.parse("2026-11-30"), 0)), performance.weeks());
    }

    @Test
    void performanceRoundsCoverageToTheNearestPercent() {
        // Arrange
        when(users.countByRole("STUDENT")).thenReturn(3L);
        when(appointments.findByAdvisorIdOrderByStartsAtAsc(1L)).thenReturn(List.of(
                session(morgan, "2026-11-18T10:00-06:00"), session(jasmine, "2026-11-18T11:00-06:00")));

        // Act
        PerformanceInsights performance = service.performance(1);

        // Assert
        assertEquals(67, performance.coveragePercent());
    }

    @Test
    void performanceWithNoStudentsOrSessionsIsZero() {
        // Arrange
        when(users.countByRole("STUDENT")).thenReturn(0L);
        when(appointments.findByAdvisorIdOrderByStartsAtAsc(1L)).thenReturn(List.of());

        // Act
        PerformanceInsights performance = service.performance(1);

        // Assert
        assertEquals(0, performance.students());
        assertEquals(0, performance.appointmentsTotal());
        assertEquals(0, performance.coveragePercent());
        assertEquals(8, performance.weeks().size());
        assertEquals(LocalDate.parse("2026-11-16"), performance.weeks().get(5).weekStart());
        assertEquals(0, performance.weeks().stream().mapToInt(PerformanceInsights.Week::appointments).sum());
    }

    @Test
    void outcomesBuildTheFunnelOffersAndPerStudentTotals() {
        // Arrange
        when(applications.findAll()).thenReturn(List.of(
                application(1, morgan, "Goldman Sachs", "interview", "2026-11-01"),
                application(2, morgan, "Houlihan Lokey", "offer", "2026-11-10"),
                application(3, morgan, "Lazard", "rejected", "2026-10-20"),
                application(4, jasmine, "McKinsey", "offer", "2026-10-10"),
                application(5, jasmine, "Deloitte", "offer", "2026-10-15"),
                application(6, alex, "Stripe", "applied", "2026-11-05")));

        // Act
        OutcomeInsights outcomes = service.outcomes();

        // Assert
        assertEquals(new OutcomeInsights.Funnel(1, 1, 3, 1), outcomes.funnel());
        assertEquals(6, outcomes.total());
        assertEquals(50, outcomes.offerRate());
        assertEquals(List.of(
                new OutcomeInsights.Offer(5, "Morgan A. Thibodaux", "Houlihan Lokey", "Summer Analyst",
                        LocalDate.parse("2026-11-10")),
                new OutcomeInsights.Offer(6, "Jasmine L. Okoye", "Deloitte", "Summer Analyst",
                        LocalDate.parse("2026-10-15")),
                new OutcomeInsights.Offer(6, "Jasmine L. Okoye", "McKinsey", "Summer Analyst",
                        LocalDate.parse("2026-10-10"))), outcomes.offers());
        assertEquals(List.of(
                new OutcomeInsights.StudentOutcome(5, "Morgan A. Thibodaux", 3, 1, 1),
                new OutcomeInsights.StudentOutcome(6, "Jasmine L. Okoye", 2, 0, 2),
                new OutcomeInsights.StudentOutcome(7, "Alex Park", 1, 0, 0)), outcomes.byStudent());
    }

    @Test
    void outcomesWithNoApplicationsAreZero() {
        // Arrange
        when(applications.findAll()).thenReturn(List.of());

        // Act
        OutcomeInsights outcomes = service.outcomes();

        // Assert
        assertEquals(new OutcomeInsights(new OutcomeInsights.Funnel(0, 0, 0, 0), 0, 0, List.of(), List.of()), outcomes);
    }
}
