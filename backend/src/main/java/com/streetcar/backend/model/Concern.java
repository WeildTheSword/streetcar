package com.streetcar.backend.model;

/** Something the student has flagged as worrying them, shown to both sides. */
public record Concern(String title, String detail, String tone) {}
