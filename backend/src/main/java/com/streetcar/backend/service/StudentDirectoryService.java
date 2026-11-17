package com.streetcar.backend.service;

import com.streetcar.backend.model.StudentAccount;
import com.streetcar.backend.model.StudentSummary;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

/**
 * The advisor's view of every student account in the database. Each student's
 * submissions come through the User-to-Submission relationship, so these reads
 * run in a transaction while that lazy collection loads. SecurityConfig limits
 * the endpoints on top of this to advisors.
 */
@Service
public class StudentDirectoryService {
    private static final String STUDENT = AccountRole.STUDENT.name();
    private static final Sort BY_NAME = Sort.by("displayName", "id");

    private final UserRepository users;
    private final StudentProfileRepository studentProfiles;
    private final AlumniService alumni;
    private final AppointmentService appointments;
    private final ApplicationService applications;
    private final ResumeService resumes;

    public StudentDirectoryService(UserRepository users, StudentProfileRepository studentProfiles,
                                   AlumniService alumni, AppointmentService appointments,
                                   ApplicationService applications, ResumeService resumes) {
        this.users = users;
        this.studentProfiles = studentProfiles;
        this.alumni = alumni;
        this.appointments = appointments;
        this.applications = applications;
        this.resumes = resumes;
    }

    @Transactional(readOnly = true)
    public List<StudentSummary> listStudents() {
        return users.findByRole(STUDENT, BY_NAME).stream()
                .map(user -> new StudentSummary(user.getId(), user.getDisplayName(), user.getEmail(),
                        user.getSubmissions().size()))
                .toList();
    }

    /** An advisor's id, or one that doesn't exist, is not a student to look up. */
    @Transactional(readOnly = true)
    public StudentAccount getStudent(long id) {
        User user = users.findById(id)
                .filter(found -> STUDENT.equals(found.getRole()))
                .orElseThrow(() -> new NoSuchElementException("Student " + id + " not found"));
        return new StudentAccount(user.getId(), user.getDisplayName(), user.getEmail(),
                studentProfiles.findById(id).map(profile -> profile.getClassYear()).orElse(null),
                List.copyOf(user.getSubmissions()), alumni.conversationsFor(id), appointments.forStudent(id),
                applications.forStudent(id), resumes.find(id).orElse(null));
    }
}
