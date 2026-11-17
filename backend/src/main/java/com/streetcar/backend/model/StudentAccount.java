package com.streetcar.backend.model;

import java.util.List;

/** A student account as an advisor sees it: who they are and every profile they have submitted, newest first. */
public record StudentAccount(long id, String name, String email, String classYear,
                             List<Submission> submissions, List<AlumniConversation> conversations,
                             List<AppointmentEntry> appointments) {}
