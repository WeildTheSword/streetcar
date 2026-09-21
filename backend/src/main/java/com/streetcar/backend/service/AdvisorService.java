package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.model.Appointment;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdvisorService {

    private final DemoDataService demoData;

    public AdvisorService(DemoDataService demoData) {
        this.demoData = demoData;
    }

    public Optional<AdvisorDashboard> getDashboard(String advisorId) {
        if (!demoData.bill().id().equals(advisorId)) {
            return Optional.empty();
        }
        List<Appointment> schedule = demoData.schedule();
        return Optional.of(new AdvisorDashboard(
            demoData.bill(),
            demoData.morgan(),
            schedule.get(0),
            schedule,
            demoData.updates(),
            demoData.alumniRadar()));
    }
}
