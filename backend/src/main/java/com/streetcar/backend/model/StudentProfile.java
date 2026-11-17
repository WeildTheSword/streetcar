package com.streetcar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/** What a student account adds to its users row: one-to-one, sharing the user's id. */
@Entity
@Table(name = "student_profiles")
public class StudentProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "class_year", nullable = false)
    private String classYear;

    /** For Hibernate only. */
    protected StudentProfile() {}

    public StudentProfile(User user, String classYear) {
        this.user = user;
        this.classYear = classYear;
    }

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public String getClassYear() { return classYear; }
}
