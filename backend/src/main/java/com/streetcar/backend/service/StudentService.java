package com.streetcar.backend.service;

import com.streetcar.backend.model.Student;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StudentService {

    private final DemoDataService demoData;

    public StudentService(DemoDataService demoData) {
        this.demoData = demoData;
    }

    public Optional<Student> getStudent(String id) {
        Student morgan = demoData.morgan();
        return morgan.id().equals(id) ? Optional.of(morgan) : Optional.empty();
    }

    public Optional<Student> completeFingerprint(String id) {
        if (getStudent(id).isEmpty()) {
            return Optional.empty();
        }
        demoData.completeOnboarding(id);
        return getStudent(id);
    }
}
