package com.streetcar.backend.model;

public class TranscriptCourse {
    private String code;
    private String title;
    private String grade;
    private double credits;
    private String term;
    private boolean inProgress;

    public TranscriptCourse(String code, String title, String grade, double credits, String term, boolean inProgress) {
        this.code = code;
        this.title = title;
        this.grade = grade;
        this.credits = credits;
        this.term = term;
        this.inProgress = inProgress;
    }

    public String getCode() { return code; }
    public String getTitle() { return title; }
    public String getGrade() { return grade; }
    public double getCredits() { return credits; }
    public String getTerm() { return term; }
    public boolean isInProgress() { return inProgress; }
}
