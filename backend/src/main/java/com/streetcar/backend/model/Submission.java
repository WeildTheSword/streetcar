package com.streetcar.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

/**
 * One student's saved academic profile. A JPA entity can't be a record, so this
 * stays immutable the other way: getters only, and a change is a new instance.
 */
@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal gpa;

    @Column(name = "completed_courses", nullable = false, length = 2000)
    private String completedCourses;

    @Column(nullable = false, length = 120)
    private String major;

    @Column(name = "career_goal", nullable = false, length = 200)
    private String careerGoal;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /** For Hibernate only. */
    protected Submission() {}

    @JsonCreator
    public Submission(@JsonProperty("id") Long id, @JsonProperty("gpa") BigDecimal gpa,
                      @JsonProperty("completedCourses") String completedCourses,
                      @JsonProperty("major") String major, @JsonProperty("careerGoal") String careerGoal,
                      @JsonProperty("createdAt") OffsetDateTime createdAt) {
        this.id = id;
        this.gpa = gpa;
        this.completedCourses = completedCourses;
        this.major = major;
        this.careerGoal = careerGoal;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getGpa() {
        return gpa;
    }

    public String getCompletedCourses() {
        return completedCourses;
    }

    public String getMajor() {
        return major;
    }

    public String getCareerGoal() {
        return careerGoal;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    /** A copy with the text fields trimmed and the GPA at the column's scale, as they are stored. */
    public Submission normalized() {
        return new Submission(id, gpa.setScale(2, RoundingMode.HALF_UP), completedCourses.strip(),
                major.strip(), careerGoal.strip(), createdAt);
    }

    /** The same values under a server-assigned identity; nothing a client sends can set these two. */
    public Submission withIdentity(Long newId, OffsetDateTime newCreatedAt) {
        return new Submission(newId, gpa, completedCourses, major, careerGoal, newCreatedAt);
    }

    @PrePersist
    void stampCreatedAt() {
        // Microseconds is what the column keeps, so the create response matches later reads.
        createdAt = OffsetDateTime.now().truncatedTo(ChronoUnit.MICROS);
    }
}
