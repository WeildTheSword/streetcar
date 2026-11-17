package com.streetcar.backend.model;

/** One row of the advisor's student list: a student account and how many profiles it has submitted. */
public record StudentSummary(long id, String name, String email, int submissionCount) {}
