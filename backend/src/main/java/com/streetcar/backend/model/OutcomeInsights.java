package com.streetcar.backend.model;

import java.time.LocalDate;
import java.util.List;

/** How every student's applications are turning out. */
public record OutcomeInsights(Funnel funnel, int total, int offerRate, List<Offer> offers,
                              List<StudentOutcome> byStudent) {

    public record Funnel(int applied, int interview, int offer, int rejected) {}

    public record Offer(long studentId, String studentName, String company, String roleTitle, LocalDate appliedOn) {}

    public record StudentOutcome(long studentId, String studentName, int applications, int interviews, int offers) {}
}
