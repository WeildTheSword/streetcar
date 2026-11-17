package com.streetcar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

/**
 * A student's resume: one-to-one with their users row, sharing its id. Getters
 * only; saving again replaces the row through ResumeRepository.replace. The API
 * returns {@link ResumeEntry}.
 */
@Entity
@Table(name = "resumes")
public class Resume {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 200)
    private String headline;

    @Column(nullable = false, length = 2000)
    private String summary;

    @Column(nullable = false, length = 4000)
    private String experience;

    @Column(nullable = false, length = 1000)
    private String skills;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /** For Hibernate only. */
    protected Resume() {}

    public Resume(User user, String headline, String summary, String experience, String skills,
                  OffsetDateTime updatedAt) {
        this.user = user;
        this.headline = headline;
        this.summary = summary;
        this.experience = experience;
        this.skills = skills;
        this.updatedAt = updatedAt;
    }

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public String getHeadline() { return headline; }
    public String getSummary() { return summary; }
    public String getExperience() { return experience; }
    public String getSkills() { return skills; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
