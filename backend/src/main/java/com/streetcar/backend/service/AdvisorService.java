package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Student;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.streetcar.backend.service.DemoFixtures.BILL_ID;
import static com.streetcar.backend.service.DemoFixtures.MORGAN_EMAIL;

/**
 * The advisor console. The schedule, the alumni radar, Morgan's alumni
 * conversations and the header counts come from the database; the pre-brief
 * narrative and the updates feed are still the demo's fixtures.
 */
@Service
public class AdvisorService {
    private final DemoFixtures fixtures;
    private final CurrentProfiles profiles;
    private final AppointmentService appointments;
    private final AlumniService alumni;
    private final UserRepository users;

    public AdvisorService(DemoFixtures fixtures, CurrentProfiles profiles, AppointmentService appointments,
                          AlumniService alumni, UserRepository users) {
        this.fixtures = fixtures;
        this.profiles = profiles;
        this.appointments = appointments;
        this.alumni = alumni;
        this.users = users;
    }

    public Optional<AdvisorDashboard> getDashboard(String advisorId, AuthenticatedUser who) {
        if (!BILL_ID.equals(advisorId)) {
            return Optional.empty();
        }
        List<Appointment> schedule = appointments.today(who.id());
        Optional<Long> morganId = users.findByEmail(MORGAN_EMAIL).map(User::getId);
        // The pre-brief is Morgan's, so her session is the one it introduces when she is booked today.
        Appointment next = schedule.stream()
            .filter(a -> morganId.map(id -> a.studentId().equals(String.valueOf(id))).orElse(false))
            .findFirst()
            .orElse(schedule.isEmpty() ? null : schedule.get(0));
        Student morgan = profiles.morgan();
        Student nextStudent = morganId.map(id -> morgan.withConversations(alumni.conversationsFor(id))).orElse(morgan);
        int studentCount = users.findByRole(AccountRole.STUDENT.name(), Sort.unsorted()).size();
        return Optional.of(new AdvisorDashboard(
            profiles.bill().withCounts(studentCount, schedule.size()),
            nextStudent,
            next,
            schedule,
            fixtures.updates(),
            alumni.radar()));
    }
}
