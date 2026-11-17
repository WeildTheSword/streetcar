package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.Student;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static com.streetcar.backend.service.DemoFixtures.MORGAN_ID;

@Service
public class StudentService {

    private final CurrentProfiles profiles;
    private final DemoSessionState session;
    private final AlumniService alumni;

    public StudentService(CurrentProfiles profiles, DemoSessionState session, AlumniService alumni) {
        this.profiles = profiles;
        this.session = session;
        this.alumni = alumni;
    }

    /** The demo student, with the signed-in student's own alumni conversations from the database. */
    public Optional<Student> getStudent(String id, AuthenticatedUser who) {
        if (!MORGAN_ID.equals(id)) {
            return Optional.empty();
        }
        Student morgan = profiles.morgan();
        return Optional.of(who != null && !who.isAdvisor()
            ? morgan.withConversations(alumni.conversationsFor(who.id()))
            : morgan);
    }

    public Optional<Student> completeFingerprint(String id, AuthenticatedUser who) {
        if (getStudent(id, who).isEmpty()) {
            return Optional.empty();
        }
        session.completeOnboarding(id);
        return getStudent(id, who);
    }
}
