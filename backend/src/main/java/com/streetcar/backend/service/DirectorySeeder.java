package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.Resume;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.ResumeRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import com.streetcar.backend.service.DirectorySeedData.Alum;
import com.streetcar.backend.service.DirectorySeedData.SeedApplication;
import com.streetcar.backend.service.DirectorySeedData.SeedAppointment;
import com.streetcar.backend.service.DirectorySeedData.SeedConversation;
import com.streetcar.backend.service.DirectorySeedData.SeedResume;
import com.streetcar.backend.service.DirectorySeedData.SeedStudent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Writes {@link DirectorySeedData} into the database at startup. Every step
 * adds only what is missing, so restarts keep whatever is already there, and
 * Bill gets the day's appointments only when he has none booked that day.
 */
@Service
public class DirectorySeeder {
    private final UserRepository users;
    private final AlumniProfileRepository alumniProfiles;
    private final StudentProfileRepository studentProfiles;
    private final SubmissionRepository submissions;
    private final ConversationRepository conversations;
    private final AppointmentRepository appointments;
    private final JobApplicationRepository applications;
    private final ResumeRepository resumes;
    private final AppointmentService schedule;
    private final PasswordEncoder passwords;
    private final Clock clock;

    public DirectorySeeder(UserRepository users, AlumniProfileRepository alumniProfiles,
                           StudentProfileRepository studentProfiles, SubmissionRepository submissions,
                           ConversationRepository conversations, AppointmentRepository appointments,
                           JobApplicationRepository applications, ResumeRepository resumes,
                           AppointmentService schedule, PasswordEncoder passwords, Clock clock) {
        this.users = users;
        this.alumniProfiles = alumniProfiles;
        this.studentProfiles = studentProfiles;
        this.submissions = submissions;
        this.conversations = conversations;
        this.appointments = appointments;
        this.applications = applications;
        this.resumes = resumes;
        this.schedule = schedule;
        this.passwords = passwords;
        this.clock = clock;
    }

    @Transactional
    public void ensureDirectory(String advisorEmail) {
        for (Alum alum : DirectorySeedData.ALUMNI) {
            User user = account(alum.email(), alum.name(), AccountRole.ALUMNI);
            if (!alumniProfiles.existsById(user.getId())) {
                alumniProfiles.save(new AlumniProfile(user, alum.school(), alum.gradYear(), alum.jobTitle(), alum.city()));
            }
        }
        for (SeedStudent student : DirectorySeedData.STUDENTS) {
            User user = account(student.email(), student.name(), AccountRole.STUDENT);
            if (!studentProfiles.existsById(user.getId())) {
                studentProfiles.save(new StudentProfile(user, student.classYear()));
            }
            if (user.getSubmissions().isEmpty()) {
                submissions.save(new Submission(null, student.gpa(), student.completedCourses(), student.major(),
                        student.careerGoal(), null).withIdentity(null, null, user));
            }
        }
        OffsetDateTime now = OffsetDateTime.now(clock);
        for (SeedConversation seed : DirectorySeedData.CONVERSATIONS) {
            User student = users.findByEmail(seed.studentEmail()).orElseThrow();
            User alum = users.findByEmail(seed.alumEmail()).orElseThrow();
            if (!conversations.existsByStudentIdAndAlumnusId(student.getId(), alum.getId())) {
                conversations.save(new Conversation(student, alum, seed.status(), seed.snippet(),
                        now.minusMinutes(seed.minutesAgo()), seed.unread()));
            }
        }
        ensureApplicationsAndResumes(now);
        users.findByEmail(advisorEmail).ifPresent(advisor -> {
            if (schedule.today(advisor.getId()).isEmpty()) {
                LocalDate today = LocalDate.now(clock);
                for (SeedAppointment seed : DirectorySeedData.TODAY) {
                    User student = users.findByEmail(seed.studentEmail()).orElseThrow();
                    appointments.save(new AdvisingAppointment(advisor, student,
                            today.atTime(seed.time()).atZone(clock.getZone()).toOffsetDateTime(), seed.tags()));
                }
            }
        });
    }

    /** Each student's seeded applications go in only if they have none, and a resume only if they have none. */
    private void ensureApplicationsAndResumes(OffsetDateTime now) {
        OffsetDateTime stamp = now.truncatedTo(ChronoUnit.MICROS);
        LocalDate today = LocalDate.now(clock);
        Map<String, List<SeedApplication>> byStudent = DirectorySeedData.APPLICATIONS.stream()
                .collect(Collectors.groupingBy(SeedApplication::studentEmail));
        byStudent.forEach((email, seeds) -> {
            User student = users.findByEmail(email).orElseThrow();
            if (!applications.existsByStudentId(student.getId())) {
                for (SeedApplication seed : seeds) {
                    LocalDate appliedOn = today.minusDays(seed.daysAgo());
                    // Last touched mid-morning on the day applied, so the activity log reads as a history.
                    OffsetDateTime touched = appliedOn.atTime(10, 0).atZone(clock.getZone()).toOffsetDateTime();
                    applications.save(new JobApplication(null, student, seed.company(), seed.roleTitle(),
                            seed.status(), appliedOn, seed.notes(), touched));
                }
            }
        });
        for (SeedResume seed : DirectorySeedData.RESUMES) {
            User student = users.findByEmail(seed.studentEmail()).orElseThrow();
            if (!resumes.existsById(student.getId())) {
                resumes.save(new Resume(student, seed.headline(), seed.summary(), seed.experience(), seed.skills(),
                        stamp));
            }
        }
    }

    /** The account with this email, created with the demo password if it is missing. */
    private User account(String email, String name, AccountRole role) {
        return users.findByEmail(email).orElseGet(() ->
                users.save(new User(email, passwords.encode(DirectorySeedData.PASSWORD), role.name(), name)));
    }
}
