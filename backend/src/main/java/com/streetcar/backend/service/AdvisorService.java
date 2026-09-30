package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.Appointment;
import com.streetcar.backend.model.Identity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static com.streetcar.backend.service.DemoFixtures.BILL;
import static com.streetcar.backend.service.DemoFixtures.BILL_ID;
import static com.streetcar.backend.service.DemoFixtures.MORGAN;
import static com.streetcar.backend.service.DemoFixtures.MORGAN_ID;

@Service
public class AdvisorService {

    private final DemoFixtures fixtures;
    private final DemoSessionState session;

    public AdvisorService(DemoFixtures fixtures, DemoSessionState session) {
        this.fixtures = fixtures;
        this.session = session;
    }

    public Optional<AdvisorDashboard> getDashboard(String advisorId) {
        if (!BILL_ID.equals(advisorId)) {
            return Optional.empty();
        }
        Identity morgan = session.identityOr(MORGAN_ID, MORGAN);
        List<Appointment> schedule = fixtures.schedule(morgan);
        return Optional.of(new AdvisorDashboard(
            fixtures.bill(session.identityOr(BILL_ID, BILL)),
            fixtures.morgan(morgan, session.isOnboarded(MORGAN_ID)),
            schedule.get(0),
            schedule,
            fixtures.updates(),
            fixtures.alumniRadar()));
    }
}
