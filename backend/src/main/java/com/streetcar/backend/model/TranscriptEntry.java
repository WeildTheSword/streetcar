package com.streetcar.backend.model;

/** One completed course on the student's registrar record. */
public record TranscriptEntry(
        String term,
        String code,
        String title,
        double credits,
        String grade) {}
