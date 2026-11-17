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

/**
 * A row of the "conversations" table: a thread between a student account and
 * an alumni account, both many-to-one onto users. The API returns
 * {@link AlumniConversation}, never this entity.
 */
@Entity
@Table(name = "conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "alumnus_id")
    private User alumnus;

    /** reply, sent, draft or warm. */
    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String snippet;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(nullable = false)
    private boolean unread;

    /** For Hibernate only. */
    protected Conversation() {}

    public Conversation(User student, User alumnus, String status, String snippet,
                        OffsetDateTime updatedAt, boolean unread) {
        this.student = student;
        this.alumnus = alumnus;
        this.status = status;
        this.snippet = snippet;
        this.updatedAt = updatedAt;
        this.unread = unread;
    }

    public Long getId() { return id; }
    public User getStudent() { return student; }
    public User getAlumnus() { return alumnus; }
    public String getStatus() { return status; }
    public String getSnippet() { return snippet; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public boolean isUnread() { return unread; }
}
