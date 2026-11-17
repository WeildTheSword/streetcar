package com.streetcar.backend.service;

import com.streetcar.backend.model.AdvisingAppointment;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.HiringInsights;
import com.streetcar.backend.model.JobApplication;
import com.streetcar.backend.model.OutcomeInsights;
import com.streetcar.backend.model.PerformanceInsights;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.AppointmentRepository;
import com.streetcar.backend.repository.JobApplicationRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * The advisor's analytics tabs: hiring trends, their own appointment
 * performance, and student outcomes. Everything is counted from the
 * applications, alumni_profiles and appointments tables on each request.
 */
@Service
public class AdvisorInsightsService {
    private static final String EMPLOYER_SEPARATOR = " · ";
    private static final int WEEKS_BEFORE = 5;
    private static final int WEEKS_AFTER = 2;

    private final JobApplicationRepository applications;
    private final AlumniProfileRepository alumniProfiles;
    private final AppointmentRepository appointments;
    private final UserRepository users;
    private final Clock clock;

    public AdvisorInsightsService(JobApplicationRepository applications, AlumniProfileRepository alumniProfiles,
                                  AppointmentRepository appointments, UserRepository users, Clock clock) {
        this.applications = applications;
        this.alumniProfiles = alumniProfiles;
        this.appointments = appointments;
        this.users = users;
        this.clock = clock;
    }

    /** Where students apply, grouped by company, and where alumni work and live. */
    @Transactional(readOnly = true)
    public HiringInsights hiring() {
        List<JobApplication> all = applications.findAll();
        List<HiringInsights.Company> companies = all.stream()
                .collect(Collectors.groupingBy(JobApplication::getCompany, LinkedHashMap::new, Collectors.toList()))
                .entrySet().stream()
                .map(group -> new HiringInsights.Company(group.getKey(), group.getValue().size(),
                        count(group.getValue(), "interview"), count(group.getValue(), "offer")))
                .sorted(Comparator.comparingInt(HiringInsights.Company::applications).reversed()
                        .thenComparing(HiringInsights.Company::company))
                .toList();
        List<AlumniProfile> alumni = alumniProfiles.findAll();
        List<HiringInsights.Employer> employers = tally(alumni, profile -> employer(profile.getJobTitle())).stream()
                .map(entry -> new HiringInsights.Employer(entry.getKey(), entry.getValue()))
                .toList();
        List<HiringInsights.City> cities = tally(alumni, AlumniProfile::getCity).stream()
                .map(entry -> new HiringInsights.City(entry.getKey(), entry.getValue()))
                .toList();
        return new HiringInsights(companies, employers, cities, all.size(), alumni.size());
    }

    /** The signed-in advisor's sessions: totals, this week, coverage, and eight weeks around this one. */
    @Transactional(readOnly = true)
    public PerformanceInsights performance(long advisorId) {
        int students = (int) users.countByRole(AccountRole.STUDENT.name());
        List<AdvisingAppointment> mine = appointments.findByAdvisorIdOrderByStartsAtAsc(advisorId);
        OffsetDateTime now = OffsetDateTime.now(clock);
        int upcoming = (int) mine.stream().filter(a -> !a.getStartsAt().isBefore(now)).count();
        LocalDate monday = LocalDate.now(clock).with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        int seen = (int) mine.stream().map(a -> a.getStudent().getId()).distinct().count();
        int coverage = students == 0 ? 0 : (int) Math.round(seen * 100.0 / students);
        List<PerformanceInsights.Week> weeks = IntStream.rangeClosed(-WEEKS_BEFORE, WEEKS_AFTER)
                .mapToObj(offset -> {
                    LocalDate start = monday.plusWeeks(offset);
                    return new PerformanceInsights.Week(start, inWeek(mine, start));
                })
                .toList();
        return new PerformanceInsights(students, mine.size(), upcoming, mine.size() - upcoming,
                inWeek(mine, monday), seen, coverage, weeks);
    }

    /** Every student's applications as a funnel, the offers made, and who is applying most. */
    @Transactional(readOnly = true)
    public OutcomeInsights outcomes() {
        List<JobApplication> all = applications.findAll();
        int offers = count(all, "offer");
        OutcomeInsights.Funnel funnel = new OutcomeInsights.Funnel(count(all, "applied"), count(all, "interview"),
                offers, count(all, "rejected"));
        int offerRate = all.isEmpty() ? 0 : (int) Math.round(offers * 100.0 / all.size());
        List<OutcomeInsights.Offer> offerRows = all.stream()
                .filter(a -> "offer".equals(a.getStatus()))
                .sorted(Comparator.comparing(JobApplication::getAppliedOn).reversed()
                        .thenComparing(JobApplication::getId, Comparator.reverseOrder()))
                .map(a -> new OutcomeInsights.Offer(a.getStudent().getId(), a.getStudent().getDisplayName(),
                        a.getCompany(), a.getRoleTitle(), a.getAppliedOn()))
                .toList();
        List<OutcomeInsights.StudentOutcome> byStudent = all.stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getId(), LinkedHashMap::new, Collectors.toList()))
                .values().stream()
                .map(rows -> {
                    User student = rows.get(0).getStudent();
                    return new OutcomeInsights.StudentOutcome(student.getId(), student.getDisplayName(), rows.size(),
                            count(rows, "interview"), count(rows, "offer"));
                })
                .sorted(Comparator.comparingInt(OutcomeInsights.StudentOutcome::applications).reversed()
                        .thenComparing(OutcomeInsights.StudentOutcome::studentName))
                .toList();
        return new OutcomeInsights(funnel, all.size(), offerRate, offerRows, byStudent);
    }

    /** "Analyst · Goldman Sachs TMT" works at "Goldman Sachs TMT"; a title with no separator is the employer. */
    static String employer(String jobTitle) {
        int at = jobTitle.lastIndexOf(EMPLOYER_SEPARATOR);
        return at < 0 ? jobTitle.strip() : jobTitle.substring(at + EMPLOYER_SEPARATOR.length()).strip();
    }

    private static int count(List<JobApplication> rows, String status) {
        return (int) rows.stream().filter(a -> status.equals(a.getStatus())).count();
    }

    /** How many rows share each key, most first, then by key. */
    private static <T> List<Map.Entry<String, Integer>> tally(List<T> rows, Function<T, String> key) {
        return rows.stream()
                .collect(Collectors.groupingBy(key, Collectors.summingInt(row -> 1)))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed()
                        .thenComparing(Map.Entry.comparingByKey()))
                .toList();
    }

    /** Appointments from that Monday's midnight up to the next Monday's, in the clock's zone. */
    private int inWeek(List<AdvisingAppointment> rows, LocalDate monday) {
        OffsetDateTime from = monday.atStartOfDay(clock.getZone()).toOffsetDateTime();
        OffsetDateTime to = monday.plusWeeks(1).atStartOfDay(clock.getZone()).toOffsetDateTime();
        return (int) rows.stream()
                .filter(a -> !a.getStartsAt().isBefore(from) && a.getStartsAt().isBefore(to))
                .count();
    }
}
