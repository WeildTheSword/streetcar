package com.streetcar.backend.service;

import com.streetcar.backend.model.Student;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static com.streetcar.backend.service.DemoFixtures.MORGAN_ID;

@Service
public class StudentService {

    private final CurrentProfiles profiles;
    private final DemoSessionState session;

    public StudentService(CurrentProfiles profiles, DemoSessionState session) {
        this.profiles = profiles;
        this.session = session;
    }

    public Optional<Student> getStudent(String id) {
        if (!MORGAN_ID.equals(id)) {
            return Optional.empty();
        }
        return Optional.of(profiles.morgan());
    }

    public Optional<Student> completeFingerprint(String id) {
        if (getStudent(id).isEmpty()) {
            return Optional.empty();
        }
        session.completeOnboarding(id);
        return getStudent(id);
    }
}
