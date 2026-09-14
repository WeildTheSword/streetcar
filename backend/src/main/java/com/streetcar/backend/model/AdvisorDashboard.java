package com.streetcar.backend.model;

import java.util.List;

/** Everything the advisor console renders in one payload. */
public record AdvisorDashboard(
        Advisor advisor,
        Student nextStudent,
        Appointment nextAppointment,
        List<Appointment> schedule,
        List<FeedItem> updates,
        List<AlumniRadarRow> alumniRadar) {}
