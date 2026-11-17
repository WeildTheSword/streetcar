package com.streetcar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/** What an alumni account adds to its users row: one-to-one, sharing the user's id. */
@Entity
@Table(name = "alumni_profiles")
public class AlumniProfile {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String school;

    @Column(name = "grad_year", nullable = false)
    private int gradYear;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private String city;

    /** For Hibernate only. */
    protected AlumniProfile() {}

    public AlumniProfile(User user, String school, int gradYear, String jobTitle, String city) {
        this.user = user;
        this.school = school;
        this.gradYear = gradYear;
        this.jobTitle = jobTitle;
        this.city = city;
    }

    public Long getUserId() { return userId; }
    public User getUser() { return user; }
    public String getSchool() { return school; }
    public int getGradYear() { return gradYear; }
    public String getJobTitle() { return jobTitle; }
    public String getCity() { return city; }

    /** "Sarah Kim '16", the way the console names an alum. */
    public String nameWithClass() {
        return user.getDisplayName() + " '" + String.format("%02d", gradYear % 100);
    }
}
