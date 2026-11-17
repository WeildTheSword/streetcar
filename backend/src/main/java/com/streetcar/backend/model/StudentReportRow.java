package com.streetcar.backend.model;

/** One student account in the advisor's report, with how much they have done in each part of the app. */
public record StudentReportRow(long id, String name, String email, String classYear, int submissions,
                               int applications, int offers, int appointments, int conversations, boolean resume) {}
