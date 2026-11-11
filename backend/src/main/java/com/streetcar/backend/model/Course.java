package com.streetcar.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A course in the catalogue, stored in the "courses" table. Getter-only like
 * the other models; the rows are seeded by schema.sql.
 */
@Entity
@Table(name = "courses")
public class Course {
    @Id
    private int id;
    private String code;
    private String title;
    private String description;

    /** For Hibernate only. */
    protected Course() {}

    public Course(int id, String code, String title, String description) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
    }

    public int getId() { return id; }
    public String getCode() { return code; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
}
