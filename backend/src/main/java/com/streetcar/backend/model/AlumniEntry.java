package com.streetcar.backend.model;

/** One alumni account in the advisor's alumni database, with how many students it is talking to. */
public record AlumniEntry(long id, String name, String initials, String email, String school,
                          int gradYear, String currentRole, String city, int studentCount) {}
