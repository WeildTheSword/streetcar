package com.streetcar.backend.model;

public class Course {
    private int id;
    private String code;
    private String title;
    private String description;

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