package com.streetcar.backend.model;

/** A thread between the student and an alum. */
public record AlumniConversation(
        String initials,
        String name,
        String role,
        String snippet,
        String prefix,
        String status,
        String statusLabel,
        String meta,
        String time,
        boolean unread) {}
