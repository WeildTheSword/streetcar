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

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * A row of the "applications" table: one job or internship a student has
 * applied to. Many-to-one onto the student's users row. Getters only; an edit
 * is saved as a new instance carrying the same id. The API returns
 * {@link ApplicationEntry}, never this entity.
 */
@Entity
@Table(name = "applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(nullable = false, length = 120)
    private String company;

    @Column(name = "role_title", nullable = false, length = 160)
    private String roleTitle;

    /** applied, interview, offer or rejected. */
    @Column(nullable = false, length = 12)
    private String status;

    @Column(name = "applied_on", nullable = false)
    private LocalDate appliedOn;

    @Column(length = 500)
    private String notes;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** For Hibernate only. */
    protected JobApplication() {}

    /** A new application, or with an id, the saved version of an existing one. */
    public JobApplication(Long id, User student, String company, String roleTitle, String status,
                          LocalDate appliedOn, String notes, OffsetDateTime updatedAt) {
        this.id = id;
        this.student = student;
        this.company = company;
        this.roleTitle = roleTitle;
        this.status = status;
        this.appliedOn = appliedOn;
        this.notes = notes;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public String getCompany() { return company; }
    public String getRoleTitle() { return roleTitle; }
    public String getStatus() { return status; }
    public LocalDate getAppliedOn() { return appliedOn; }
    public String getNotes() { return notes; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }

    public boolean isOwnedBy(long userId) {
        return student != null && student.getId() == userId;
    }
}
