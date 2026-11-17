package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AlumniContact;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.StudentWorkspaceSummary;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.ConversationRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * The signed-in student's own tabs: the home counts, their appointments, and
 * the alumni they can browse and write to. Applications and the resume have
 * services of their own.
 */
@Service
public class StudentWorkspaceService {
    private static final String ALUMNI = AccountRole.ALUMNI.name();

    private final UserRepository users;
    private final AlumniProfileRepository alumniProfiles;
    private final ConversationRepository conversations;
    private final AppointmentRepository appointmentRows;
    private final JobApplicationRepository applications;
    private final AppointmentService appointments;
    private final Clock clock;

    public StudentWorkspaceService(UserRepository users, AlumniProfileRepository alumniProfiles,
                                   ConversationRepository conversations, AppointmentRepository appointmentRows,
                                   JobApplicationRepository applications, AppointmentService appointments,
                                   Clock clock) {
        this.users = users;
        this.alumniProfiles = alumniProfiles;
        this.conversations = conversations;
        this.appointmentRows = appointmentRows;
        this.applications = applications;
        this.appointments = appointments;
        this.clock = clock;
    }

    /** How many alumni the student is talking to, appointments still to come, and applications. */
    @Transactional(readOnly = true)
    public StudentWorkspaceSummary summary(long studentId) {
        return new StudentWorkspaceSummary(
                (int) conversations.countByStudentId(studentId),
                (int) appointmentRows.countByStudentIdAndStartsAtGreaterThanEqual(studentId, OffsetDateTime.now(clock)),
                (int) applications.countByStudentId(studentId));
    }

    /** The student's appointments, oldest first, each named by the advisor. */
    @Transactional(readOnly = true)
    public List<AccountAppointment> appointments(long studentId) {
        return appointments.forAccount(student(studentId));
    }

    /** Every alum, most recent graduates first, with this student's conversation if there is one. */
    @Transactional(readOnly = true)
    public List<AlumniContact> alumni(long studentId) {
        Map<Long, Conversation> threads = conversations.findByStudentIdOrderByUpdatedAtDesc(studentId).stream()
                .collect(Collectors.toMap(c -> c.getAlumnus().getId(), Function.identity(), (newer, older) -> newer));
        return alumniProfiles.findAllByOrderByGradYearDescUserDisplayNameAsc().stream()
                .map(profile -> contact(profile, threads.get(profile.getUserId())))
                .toList();
    }

    /** Opens a thread with an alum the student is not yet talking to. */
    @Transactional
    public AlumniContact startConversation(long studentId, long alumId, String message) {
        String text = message == null ? "" : message.strip();
        if (text.isEmpty() || text.length() > 500) {
            throw new IllegalArgumentException("Write a message of 1 to 500 characters.");
        }
        User alum = users.findById(alumId)
                .filter(user -> ALUMNI.equals(user.getRole()))
                .orElseThrow(() -> new NoSuchElementException("Alum not found."));
        AlumniProfile profile = alumniProfiles.findById(alumId)
                .orElseThrow(() -> new NoSuchElementException("Alum not found."));
        if (conversations.existsByStudentIdAndAlumnusId(studentId, alumId)) {
            throw new ConflictException("You are already talking to " + alum.getDisplayName() + ".");
        }
        Conversation saved = conversations.save(new Conversation(student(studentId), alum, "sent", text,
                OffsetDateTime.now(clock).truncatedTo(ChronoUnit.MICROS), false));
        return contact(profile, saved);
    }

    private User student(long studentId) {
        return users.findById(studentId).orElseThrow(() -> new NoSuchElementException("Account not found."));
    }

    private static AlumniContact contact(AlumniProfile profile, Conversation thread) {
        User alum = profile.getUser();
        String status = thread == null ? null : thread.getStatus();
        return new AlumniContact(alum.getId(), alum.getDisplayName(), Names.initials(alum.getDisplayName()),
                profile.getSchool(), profile.getGradYear(), profile.getJobTitle(), profile.getCity(), status,
                status == null ? null : AlumniService.statusLabel(status),
                thread == null ? null : thread.getSnippet());
    }
}
