package com.streetcar.backend.model;

/** The signed-in advisor. */
public record Advisor(
        String id,
        String name,
        String initials,
        String title,
        int studentCount,
        int appointmentCount) {}
