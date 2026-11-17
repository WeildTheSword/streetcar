package com.streetcar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * A row of the "appointments" table: one advisor account meets one student
 * account. Both sides are many-to-one onto users. The API returns
 * {@link AppointmentEntry} or {@link Appointment}, never this entity.
 */
@Entity
@Table(name = "appointments")
public class AdvisingAppointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "advisor_id")
    private User advisor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(name = "starts_at", nullable = false)
    private OffsetDateTime startsAt;

    /** Comma-separated labels, such as "Interview Thursday, Pre-brief ready". */
    @Column(nullable = false)
    private String tags;

    /** For Hibernate only. */
    protected AdvisingAppointment() {}

    public AdvisingAppointment(User advisor, User student, OffsetDateTime startsAt, String tags) {
        this.advisor = advisor;
        this.student = student;
        this.startsAt = startsAt;
        this.tags = tags == null ? "" : tags.strip();
    }

    public Long getId() { return id; }
    public User getAdvisor() { return advisor; }
    public User getStudent() { return student; }
    public OffsetDateTime getStartsAt() { return startsAt; }

    public List<String> getTagList() {
        return Arrays.stream(tags.split(",")).map(String::strip).filter(tag -> !tag.isEmpty()).toList();
    }
}
