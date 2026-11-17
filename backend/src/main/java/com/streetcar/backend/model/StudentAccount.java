package com.streetcar.backend.model;

import java.util.List;

/**
 * A student account as an advisor sees it: who they are, every profile they
 * have submitted (newest first), their conversations, appointments and
 * applications, and their resume, or null if they have not saved one.
 */
public record StudentAccount(long id, String name, String email, String classYear,
                             List<Submission> submissions, List<AlumniConversation> conversations,
                             List<AppointmentEntry> appointments, List<ApplicationEntry> applications,
                             ResumeEntry resume) {}
