package com.streetcar.backend.model;

/** What a student sends to save their resume. */
public record ResumeRequest(String headline, String summary, String experience, String skills) {}
