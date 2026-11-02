package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.Appointment;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.streetcar.backend.service.DemoFixtures.BILL_ID;

@Service
public class AdvisorService {

    private final DemoFixtures fixtures;
    private final CurrentProfiles profiles;

    public AdvisorService(DemoFixtures fixtures, CurrentProfiles profiles) {
        this.fixtures = fixtures;
        this.profiles = profiles;
    }

    public Optional<AdvisorDashboard> getDashboard(String advisorId) {
        if (!BILL_ID.equals(advisorId)) {
            return Optional.empty();
        }
        List<Appointment> schedule = fixtures.schedule(profiles.morganIdentity());
        return Optional.of(new AdvisorDashboard(
            profiles.bill(),
            profiles.morgan(),
            schedule.get(0),
            schedule,
            fixtures.updates(),
            fixtures.alumniRadar()));
    }
}
