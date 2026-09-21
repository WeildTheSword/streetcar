package com.streetcar.backend.model;

/** A recent alumni role announcement matched against open student tracks. */
public record AlumniRadarRow(
        String initials,
        String name,
        String school,
        String newRole,
        String city,
        int matches,
        String matchLabel) {}
