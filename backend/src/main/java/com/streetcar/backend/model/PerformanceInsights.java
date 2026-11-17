package com.streetcar.backend.model;

import java.time.LocalDate;
import java.util.List;

/** The signed-in advisor's appointment load and how much of the student body they have seen. */
public record PerformanceInsights(int students, int appointmentsTotal, int upcoming, int completed, int thisWeek,
                                  int studentsSeen, int coveragePercent, List<Week> weeks) {

    /** Appointments in the week starting on this Monday. */
    public record Week(LocalDate weekStart, int appointments) {}
}
