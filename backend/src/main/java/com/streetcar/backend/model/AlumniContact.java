package com.streetcar.backend.model;

/**
 * An alum as a student browses them, with the student's conversation with
 * that alum, if any. status, statusLabel and snippet are null when there is none.
 */
public record AlumniContact(long id, String name, String initials, String school, int gradYear,
                            String currentRole, String city, String status, String statusLabel, String snippet) {}
