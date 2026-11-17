package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.AppointmentEntry;
import com.streetcar.backend.model.AppointmentRequest;
import com.streetcar.backend.model.Submission;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.StudentProfileRepository;
import com.streetcar.backend.repository.SubmissionRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * The appointments table: an advisor's schedule and board, a student's
 * upcoming sessions, and booking and cancelling. Reads run in a transaction
 * because both users on an appointment load lazily.
 */
@Service
public class AppointmentService {
    private static final Sort NEWEST_FIRST = Sort.by(Sort.Direction.DESC, "id");
    private static final DateTimeFormatter TIME = DateTimeFormatter.ofPattern("h:mm a", Locale.US);

    private final AppointmentRepository appointments;
    private final UserRepository users;
    private final SubmissionRepository submissions;
    private final StudentProfileRepository studentProfiles;
    private final Clock clock;

    public AppointmentService(AppointmentRepository appointments, UserRepository users,
                              SubmissionRepository submissions, StudentProfileRepository studentProfiles,
                              Clock clock) {
        this.appointments = appointments;
        this.users = users;
        this.submissions = submissions;
        this.studentProfiles = studentProfiles;
        this.clock = clock;
    }

    /** The advisor's appointments today, earliest first, as the dashboard's schedule shows them. */
    @Transactional(readOnly = true)
    public List<Appointment> today(long advisorId) {
        LocalDate today = LocalDate.now(clock);
        OffsetDateTime from = today.atStartOfDay(clock.getZone()).toOffsetDateTime();
        OffsetDateTime to = today.plusDays(1).atStartOfDay(clock.getZone()).toOffsetDateTime();
        return appointments
                .findByAdvisorIdAndStartsAtGreaterThanEqualAndStartsAtLessThanOrderByStartsAtAsc(advisorId, from, to)
                .stream()
                .map(this::toScheduleRow)
                .toList();
    }

    /** Every appointment the advisor has, earliest first, for the appointments board. */
    @Transactional(readOnly = true)
    public List<AppointmentEntry> board(long advisorId) {
        return appointments.findByAdvisorIdOrderByStartsAtAsc(advisorId).stream().map(AppointmentService::entry).toList();
    }

    /** A student's appointments, for the advisor looking that student up. */
    @Transactional(readOnly = true)
    public List<AppointmentEntry> forStudent(long studentId) {
        return appointments.findByStudentIdOrderByStartsAtAsc(studentId).stream().map(AppointmentService::entry).toList();
    }

    /** Appointments on someone's account page, each named by the other side. */
    @Transactional(readOnly = true)
    public List<AccountAppointment> forAccount(User user) {
        boolean advisor = AccountRole.ADVISOR.name().equals(user.getRole());
        List<AdvisingAppointment> rows = advisor
                ? appointments.findByAdvisorIdOrderByStartsAtAsc(user.getId())
                : appointments.findByStudentIdOrderByStartsAtAsc(user.getId());
        return rows.stream()
                .map(a -> new AccountAppointment(a.getId(),
                        (advisor ? a.getStudent() : a.getAdvisor()).getDisplayName(), a.getStartsAt(), a.getTagList()))
                .toList();
    }

    /** Books a session with a student account. A missing time or a non-student is refused. */
    @Transactional
    public AppointmentEntry book(long advisorId, AppointmentRequest request) {
        if (request == null || request.studentId() == null || request.startsAt() == null) {
            throw new IllegalArgumentException("A student and a start time are required.");
        }
        User student = users.findById(request.studentId())
                .filter(user -> AccountRole.STUDENT.name().equals(user.getRole()))
                .orElseThrow(() -> new IllegalArgumentException("That student does not exist."));
        AdvisingAppointment saved = appointments.save(
                new AdvisingAppointment(users.getReferenceById(advisorId), student, request.startsAt(), request.tags()));
        return entry(saved);
    }

    /** Cancels one of this advisor's appointments; anyone else's looks missing. */
    @Transactional
    public void cancel(long advisorId, long appointmentId) {
        AdvisingAppointment appointment = appointments.findById(appointmentId)
                .filter(a -> a.getAdvisor().getId() == advisorId)
                .orElseThrow(() -> new NoSuchElementException("Appointment " + appointmentId + " not found"));
        appointments.delete(appointment);
    }

    private static AppointmentEntry entry(AdvisingAppointment a) {
        User student = a.getStudent();
        return new AppointmentEntry(a.getId(), student.getId(), student.getDisplayName(),
                Names.initials(student.getDisplayName()), a.getStartsAt(), a.getTagList());
    }

    /** The student's major, GPA and goal come from their newest submission; the year from their profile. */
    private Appointment toScheduleRow(AdvisingAppointment a) {
        User student = a.getStudent();
        Optional<Submission> latest = submissions.findByUserId(student.getId(), NEWEST_FIRST).stream().findFirst();
        String year = studentProfiles.findById(student.getId()).map(p -> p.getClassYear()).orElse("Year not set");
        return new Appointment(
                String.valueOf(a.getId()),
                String.valueOf(student.getId()),
                student.getDisplayName(),
                Names.initials(student.getDisplayName()),
                a.getStartsAt().atZoneSameInstant(clock.getZone()).format(TIME),
                latest.map(Submission::getMajor).orElse("Undeclared"),
                year,
                latest.map(s -> s.getGpa().doubleValue()).orElse(0.0),
                latest.map(Submission::getCareerGoal).orElse("Exploring"),
                a.getTagList());
    }
}
