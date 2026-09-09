package com.streetcar.backend.model;

import java.util.List;

public class TranscriptResult {
    private String studentName;
    private String studentId;
    private String degree;
    private Double overallGpa;
    private List<TranscriptCourse> courses;

    public TranscriptResult(String studentName, String studentId, String degree, Double overallGpa, List<TranscriptCourse> courses) {
        this.studentName = studentName;
        this.studentId = studentId;
        this.degree = degree;
        this.overallGpa = overallGpa;
        this.courses = courses;
    }

    public String getStudentName() { return studentName; }
    public String getStudentId() { return studentId; }
    public String getDegree() { return degree; }
    public Double getOverallGpa() { return overallGpa; }
    public List<TranscriptCourse> getCourses() { return courses; }
}
