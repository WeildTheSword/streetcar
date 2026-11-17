package com.streetcar.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * A sign-in account, stored in the "users" table. The password is kept only as
 * a BCrypt hash. The numeric id is what a JWT carries as its subject.
 */
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    /** STUDENT or ADVISOR, the name of an {@code AccountRole}. */
    @Column(nullable = false)
    private String role;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    /**
     * The other side of Submission.user: one account owns many submissions,
     * through submissions.user_id. Newest first. Lazy, so read it inside a transaction.
     */
    @OneToMany(mappedBy = "user")
    @OrderBy("id DESC")
    private List<Submission> submissions = new ArrayList<>();

    /** For Hibernate only. */
    protected User() {}

    public User(String email, String passwordHash, String role, String displayName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.displayName = displayName;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public String getDisplayName() { return displayName; }
    public List<Submission> getSubmissions() { return Collections.unmodifiableList(submissions); }
}
