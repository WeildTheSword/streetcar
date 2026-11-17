package com.streetcar.backend.model;

/** The counts on a student's home: alumni they are talking to, upcoming appointments, applications. */
public record StudentWorkspaceSummary(int alumni, int appointments, int applications) {}
