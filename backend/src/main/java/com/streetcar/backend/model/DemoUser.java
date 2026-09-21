package com.streetcar.backend.model;

/**
 * A demo account. Passwords are plain text on purpose — this is a fake auth
 * portal for the pitch demo, not an authentication system.
 */
public record DemoUser(
        String email,
        String password,
        String role,
        String profileId,
        String displayName,
        String initials,
        String subtitle) {}
