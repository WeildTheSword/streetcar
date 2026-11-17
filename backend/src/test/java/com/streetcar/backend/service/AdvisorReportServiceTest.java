package com.streetcar.backend.service;

import com.streetcar.backend.model.ActivityLogEntry;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.Resume;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.StudentReportRow;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.ResumeRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.IntStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AdvisorReportServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T15:00:00Z"), ZoneId.of("America/Chicago"));
    private static final Sort BY_NAME = Sort.by("displayName", "id");

    private UserRepository users;
    private StudentProfileRepository studentProfiles;
    private SubmissionRepository submissions;
    private JobApplicationRepository applications;
    private AppointmentRepository appointments;
    private ConversationRepository conversations;
    private ResumeRepository resumes;
    private AdvisorReportService service;

    private final User bill = user(1, "ADVISOR", "Bill Hudlow");
    private final User chris = user(4, "STUDENT", "Chris Boudreaux");
    private final User morgan = user(5, "STUDENT", "Morgan A. Thibodaux");
    private final User sarah = user(20, "ALUMNI", "Sarah Kim");

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        studentProfiles = mock(StudentProfileRepository.class);
        submissions = mock(SubmissionRepository.class);
        applications = mock(JobApplicationRepository.class);
        appointments = mock(AppointmentRepository.class);
        conversations = mock(ConversationRepository.class);
        resumes = mock(ResumeRepository.class);
        service = new AdvisorReportService(users, studentProfiles, submissions, applications, appointments,
                conversations, resumes, CLOCK);
    }

    private static User user(long id, String role, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static OffsetDateTime at(String instant) {
        return OffsetDateTime.parse(instant);
    }

    private static JobApplication application(long id, User student, String company, String status,
                                              OffsetDateTime updatedAt) {
        return new JobApplication(id, student, company, "IB Summer Analyst", status, LocalDate.parse("2026-11-01"),
                null, updatedAt);
    }

    private static Submission submission(User owner, OffsetDateTime createdAt) {
        return new Submission(null, new BigDecimal("3.82"), "CMPS 1500", "Finance + CS", "Investment Banking", null)
                .withIdentity(9L, createdAt, owner);
    }

    @Test
    void studentsReportsEveryStudentWithTheirTotals() {
        // Arrange
        ReflectionTestUtils.setField(morgan, "submissions", List.of(submission(morgan, at("2026-11-02T10:00:00Z"))));
        StudentProfile junior = new StudentProfile(morgan, "Junior");
        ReflectionTestUtils.setField(junior, "userId", 5L);
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of(chris, morgan));
        when(studentProfiles.findAll()).thenReturn(List.of(junior));
        when(applications.findAll()).thenReturn(List.of(
                application(1, morgan, "Goldman Sachs", "interview", at("2026-11-03T10:00:00Z")),
                application(2, morgan, "Houlihan Lokey", "offer", at("2026-11-04T10:00:00Z"))));
        when(appointments.findAll()).thenReturn(List.of(
                new AdvisingAppointment(bill, morgan, at("2026-11-06T10:00:00Z"), "")));
        when(conversations.findAll()).thenReturn(List.of(
                new Conversation(morgan, sarah, "reply", "Hi", at("2026-11-04T10:00:00Z"), false),
                new Conversation(chris, sarah, "sent", "Hi", at("2026-11-04T10:00:00Z"), false)));
        when(resumes.findAll()).thenReturn(List.of(
                new Resume(morgan, "Finance + CS", "", "", "", at("2026-11-05T10:00:00Z"))));

        // Act
        List<StudentReportRow> rows = service.students();

        // Assert
        assertEquals(List.of(
                new StudentReportRow(4, "Chris Boudreaux", "chris.boudreaux@tulane.edu", null, 0, 0, 0, 0, 1, false),
                new StudentReportRow(5, "Morgan A. Thibodaux", "morgan.a..thibodaux@tulane.edu", "Junior", 1, 2, 1, 1,
                        1, true)), rows);
    }

    @Test
    void studentsWithNoStudentAccountsIsEmpty() {
        // Arrange
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of());

        // Act
        List<StudentReportRow> rows = service.students();

        // Assert
        assertEquals(List.of(), rows);
    }

    @Test
    void logsListsEveryKindOfActivityNewestFirstAndSkipsTheFuture() {
        // Arrange
        ReflectionTestUtils.setField(morgan, "createdAt", at("2026-11-01T10:00:00Z"));
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of(chris, morgan));
        Submission orphan = new Submission(8L, new BigDecimal("3.00"), "CMPS 1500", "CS", "SWE", at("2026-11-02T11:00:00Z"));
        when(submissions.findAll()).thenReturn(List.of(submission(morgan, at("2026-11-02T10:00:00Z")), orphan));
        when(applications.findAll()).thenReturn(List.of(
                application(1, morgan, "Goldman Sachs", "interview", at("2026-11-03T10:00:00Z")),
                application(2, morgan, "Moelis", "applied", at("2026-11-18T10:00:00Z"))));
        when(conversations.findAll()).thenReturn(List.of(
                new Conversation(morgan, sarah, "reply", "Hi", at("2026-11-04T10:00:00Z"), false)));
        when(resumes.findAll()).thenReturn(List.of(
                new Resume(morgan, "Finance + CS", "", "", "", at("2026-11-05T10:00:00Z"))));
        when(appointments.findAll()).thenReturn(List.of(
                new AdvisingAppointment(bill, morgan, at("2026-11-06T04:00:00-06:00"), ""),
                new AdvisingAppointment(bill, morgan, at("2026-11-20T10:00:00Z"), "")));

        // Act
        List<ActivityLogEntry> log = service.logs();

        // Assert
        String actor = "Morgan A. Thibodaux";
        assertEquals(List.of(
                new ActivityLogEntry("appointment", actor, "Met with Bill Hudlow", at("2026-11-06T04:00:00-06:00")),
                new ActivityLogEntry("resume", actor, "Updated their resume", at("2026-11-05T10:00:00Z")),
                new ActivityLogEntry("conversation", actor, "Conversation with Sarah Kim: Replied",
                        at("2026-11-04T10:00:00Z")),
                new ActivityLogEntry("application", actor, "Goldman Sachs · IB Summer Analyst: interview",
                        at("2026-11-03T10:00:00Z")),
                new ActivityLogEntry("submission", actor, "Submitted a profile: Finance + CS, GPA 3.82",
                        at("2026-11-02T10:00:00Z")),
                new ActivityLogEntry("signup", actor, "Created a student account", at("2026-11-01T10:00:00Z"))), log);
    }

    @Test
    void logsKeepOnlyTheNewestFifty() {
        // Arrange
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of(morgan));
        when(applications.findAll()).thenReturn(IntStream.range(0, 60)
                .mapToObj(day -> application(day, morgan, "Firm " + day, "applied",
                        at("2026-09-01T10:00:00Z").plusDays(day)))
                .toList());

        // Act
        List<ActivityLogEntry> log = service.logs();

        // Assert
        assertEquals(AdvisorReportService.LOG_LIMIT, log.size());
        assertEquals("Firm 59 · IB Summer Analyst: applied", log.get(0).detail());
        assertEquals("Firm 10 · IB Summer Analyst: applied", log.get(49).detail());
    }

    @Test
    void logsWithNoActivityAreEmpty() {
        // Arrange
        when(users.findByRole("STUDENT", BY_NAME)).thenReturn(List.of());

        // Act
        List<ActivityLogEntry> log = service.logs();

        // Assert
        assertEquals(List.of(), log);
    }
}
