package com.streetcar.backend.model;

/** The signed-in session handed back to the browser. */
public record AuthResponse(
        String token,
        String role,
        String profileId,
        String displayName,
        String initials,
        String subtitle,
        boolean onboarded) {}
