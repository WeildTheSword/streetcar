package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.StudentProfile;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import com.streetcar.backend.service.DirectorySeedData.Alum;
import com.streetcar.backend.service.DirectorySeedData.SeedAppointment;
import com.streetcar.backend.service.DirectorySeedData.SeedConversation;
import com.streetcar.backend.service.DirectorySeedData.SeedStudent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;

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
    private final AppointmentService schedule;
    private final PasswordEncoder passwords;
    private final Clock clock;

    public DirectorySeeder(UserRepository users, AlumniProfileRepository alumniProfiles,
                           StudentProfileRepository studentProfiles, SubmissionRepository submissions,
                           ConversationRepository conversations, AppointmentRepository appointments,
                           AppointmentService schedule, PasswordEncoder passwords, Clock clock) {
        this.users = users;
        this.alumniProfiles = alumniProfiles;
        this.studentProfiles = studentProfiles;
        this.submissions = submissions;
        this.conversations = conversations;
        this.appointments = appointments;
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

    /** The account with this email, created with the demo password if it is missing. */
    private User account(String email, String name, AccountRole role) {
        return users.findByEmail(email).orElseGet(() ->
                users.save(new User(email, passwords.encode(DirectorySeedData.PASSWORD), role.name(), name)));
    }
}
