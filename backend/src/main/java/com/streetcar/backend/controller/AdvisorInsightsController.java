package com.streetcar.backend.controller;

import com.streetcar.backend.model.ActivityLogEntry;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.HiringInsights;
import com.streetcar.backend.model.OutcomeInsights;
import com.streetcar.backend.model.PerformanceInsights;
import com.streetcar.backend.model.StudentReportRow;
import com.streetcar.backend.service.AdvisorInsightsService;
import com.streetcar.backend.service.AdvisorReportService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** The advisor's trends, performance, outcomes, reports and activity log. Advisor-only, enforced in SecurityConfig. */
@RestController
@RequestMapping("/advisor")
public class AdvisorInsightsController {
    private final AdvisorInsightsService insights;
    private final AdvisorReportService reports;

    public AdvisorInsightsController(AdvisorInsightsService insights, AdvisorReportService reports) {
        this.insights = insights;
        this.reports = reports;
    }

    @GetMapping("/insights/hiring")
    public HiringInsights hiring() {
        return insights.hiring();
    }

    @GetMapping("/insights/performance")
    public PerformanceInsights performance(@AuthenticationPrincipal AuthenticatedUser who) {
        return insights.performance(who.id());
    }

    @GetMapping("/insights/outcomes")
    public OutcomeInsights outcomes() {
        return insights.outcomes();
    }

    @GetMapping("/reports/students")
    public List<StudentReportRow> studentReport() {
        return reports.students();
    }

    @GetMapping("/logs")
    public List<ActivityLogEntry> logs() {
        return reports.logs();
    }
}
