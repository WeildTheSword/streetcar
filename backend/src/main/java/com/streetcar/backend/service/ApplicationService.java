package com.streetcar.backend.service;

import com.streetcar.backend.model.ApplicationEntry;
import com.streetcar.backend.model.ApplicationRequest;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Set;

/**
 * A student's job applications: the tracker's CRUD, and the list an advisor
 * sees on the student's page. A student only ever reaches their own rows;
 * anyone else's id looks missing.
 */
@Service
public class ApplicationService {
    public static final Set<String> STATUSES = Set.of("applied", "interview", "offer", "rejected");
    private static final String NOT_FOUND = "Application not found.";

    private final JobApplicationRepository applications;
    private final UserRepository users;
    private final Clock clock;

    public ApplicationService(JobApplicationRepository applications, UserRepository users, Clock clock) {
        this.applications = applications;
        this.users = users;
        this.clock = clock;
    }

    /** The student's applications, most recently applied first. */
    @Transactional(readOnly = true)
    public List<ApplicationEntry> forStudent(long studentId) {
        return applications.findByStudentIdOrderByAppliedOnDescIdDesc(studentId).stream()
                .map(ApplicationService::entry)
                .toList();
    }

    @Transactional
    public ApplicationEntry create(long studentId, ApplicationRequest request) {
        Valid valid = validate(request);
        User student = users.findById(studentId).orElseThrow(() -> new NoSuchElementException("Account not found."));
        return entry(applications.save(new JobApplication(null, student, valid.company, valid.roleTitle,
                valid.status, valid.appliedOn, valid.notes, now())));
    }

    @Transactional
    public ApplicationEntry update(long studentId, long id, ApplicationRequest request) {
        JobApplication existing = owned(studentId, id);
        Valid valid = validate(request);
        return entry(applications.save(new JobApplication(existing.getId(), existing.getStudent(), valid.company,
                valid.roleTitle, valid.status, valid.appliedOn, valid.notes, now())));
    }

    @Transactional
    public void delete(long studentId, long id) {
        applications.delete(owned(studentId, id));
    }

    private JobApplication owned(long studentId, long id) {
        return applications.findById(id)
                .filter(application -> application.isOwnedBy(studentId))
                .orElseThrow(() -> new NoSuchElementException(NOT_FOUND));
    }

    /** Microseconds is what the column keeps, so the response matches later reads. */
    private OffsetDateTime now() {
        return OffsetDateTime.now(clock).truncatedTo(ChronoUnit.MICROS);
    }

    private record Valid(String company, String roleTitle, String status, LocalDate appliedOn, String notes) {}

    private Valid validate(ApplicationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Company is required.");
        }
        String company = required(request.company(), "Company", 120);
        String roleTitle = required(request.roleTitle(), "Role", 160);
        String status = request.status() == null ? "" : request.status().strip().toLowerCase(Locale.ROOT);
        if (!STATUSES.contains(status)) {
            throw new IllegalArgumentException("Status must be applied, interview, offer or rejected.");
        }
        if (request.appliedOn() == null) {
            throw new IllegalArgumentException("The date you applied is required.");
        }
        if (request.appliedOn().isAfter(LocalDate.now(clock))) {
            throw new IllegalArgumentException("The date you applied cannot be in the future.");
        }
        String notes = request.notes() == null ? "" : request.notes().strip();
        if (notes.length() > 500) {
            throw new IllegalArgumentException("Notes must be 500 characters or fewer.");
        }
        return new Valid(company, roleTitle, status, request.appliedOn(), notes.isEmpty() ? null : notes);
    }

    private static String required(String value, String field, int max) {
        String trimmed = value == null ? "" : value.strip();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException(field + " is required.");
        }
        if (trimmed.length() > max) {
            throw new IllegalArgumentException(field + " must be " + max + " characters or fewer.");
        }
        return trimmed;
    }

    static ApplicationEntry entry(JobApplication a) {
        return new ApplicationEntry(a.getId(), a.getCompany(), a.getRoleTitle(), a.getStatus(), a.getAppliedOn(),
                a.getNotes(), a.getUpdatedAt());
    }
}
