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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * The advisor's reports tab, one row of totals per student, and the activity
 * log, built from every table a student writes to. Each runs in a transaction
 * because the users behind each row load lazily.
 */
@Service
public class AdvisorReportService {
    private static final String STUDENT = AccountRole.STUDENT.name();
    private static final Sort BY_NAME = Sort.by("displayName", "id");
    static final int LOG_LIMIT = 50;

    private final UserRepository users;
    private final StudentProfileRepository studentProfiles;
    private final SubmissionRepository submissions;
    private final JobApplicationRepository applications;
    private final AppointmentRepository appointments;
    private final ConversationRepository conversations;
    private final ResumeRepository resumes;
    private final Clock clock;

    public AdvisorReportService(UserRepository users, StudentProfileRepository studentProfiles,
                                SubmissionRepository submissions, JobApplicationRepository applications,
                                AppointmentRepository appointments, ConversationRepository conversations,
                                ResumeRepository resumes, Clock clock) {
        this.users = users;
        this.studentProfiles = studentProfiles;
        this.submissions = submissions;
        this.applications = applications;
        this.appointments = appointments;
        this.conversations = conversations;
        this.resumes = resumes;
        this.clock = clock;
    }

    /** Every student account, by name, with a count from each table they appear in. */
    @Transactional(readOnly = true)
    public List<StudentReportRow> students() {
        Map<Long, String> years = studentProfiles.findAll().stream()
                .collect(Collectors.toMap(StudentProfile::getUserId, StudentProfile::getClassYear));
        List<JobApplication> allApplications = applications.findAll();
        Map<Long, Long> applied = countBy(allApplications, a -> a.getStudent().getId());
        Map<Long, Long> offered = countBy(allApplications.stream().filter(a -> "offer".equals(a.getStatus())).toList(),
                a -> a.getStudent().getId());
        Map<Long, Long> booked = countBy(appointments.findAll(), a -> a.getStudent().getId());
        Map<Long, Long> threads = countBy(conversations.findAll(), c -> c.getStudent().getId());
        Set<Long> withResume = resumes.findAll().stream().map(r -> r.getUser().getId()).collect(Collectors.toSet());
        return users.findByRole(STUDENT, BY_NAME).stream()
                .map(user -> {
                    long id = user.getId();
                    return new StudentReportRow(id, user.getDisplayName(), user.getEmail(), years.get(id),
                            user.getSubmissions().size(), number(applied, id), number(offered, id),
                            number(booked, id), number(threads, id), withResume.contains(id));
                })
                .toList();
    }

    /** What students have done, newest first, at most fifty entries, nothing still to come. */
    @Transactional(readOnly = true)
    public List<ActivityLogEntry> logs() {
        OffsetDateTime now = OffsetDateTime.now(clock);
        List<ActivityLogEntry> log = new ArrayList<>();
        for (User user : users.findByRole(STUDENT, BY_NAME)) {
            if (user.getCreatedAt() != null) {
                log.add(new ActivityLogEntry("signup", user.getDisplayName(), "Created a student account",
                        user.getCreatedAt()));
            }
        }
        for (Submission submission : submissions.findAll()) {
            User owner = submission.getUser();
            if (owner != null && submission.getCreatedAt() != null) {
                log.add(new ActivityLogEntry("submission", owner.getDisplayName(),
                        "Submitted a profile: " + submission.getMajor() + ", GPA " + submission.getGpa().toPlainString(),
                        submission.getCreatedAt()));
            }
        }
        for (JobApplication a : applications.findAll()) {
            log.add(new ActivityLogEntry("application", a.getStudent().getDisplayName(),
                    a.getCompany() + " · " + a.getRoleTitle() + ": " + a.getStatus(), a.getUpdatedAt()));
        }
        for (Conversation c : conversations.findAll()) {
            log.add(new ActivityLogEntry("conversation", c.getStudent().getDisplayName(),
                    "Conversation with " + c.getAlumnus().getDisplayName() + ": " + AlumniService.statusLabel(c.getStatus()),
                    c.getUpdatedAt()));
        }
        for (Resume resume : resumes.findAll()) {
            log.add(new ActivityLogEntry("resume", resume.getUser().getDisplayName(), "Updated their resume",
                    resume.getUpdatedAt()));
        }
        for (AdvisingAppointment a : appointments.findAll()) {
            if (a.getStartsAt().isBefore(now)) {
                log.add(new ActivityLogEntry("appointment", a.getStudent().getDisplayName(),
                        "Met with " + a.getAdvisor().getDisplayName(), a.getStartsAt()));
            }
        }
        return log.stream()
                .filter(entry -> !entry.at().isAfter(now))
                .sorted(Comparator.comparing((ActivityLogEntry entry) -> entry.at().toInstant()).reversed())
                .limit(LOG_LIMIT)
                .toList();
    }

    private static <T> Map<Long, Long> countBy(List<T> rows, Function<T, Long> studentId) {
        return rows.stream().collect(Collectors.groupingBy(studentId, Collectors.counting()));
    }

    private static int number(Map<Long, Long> counts, long id) {
        return counts.getOrDefault(id, 0L).intValue();
    }
}
