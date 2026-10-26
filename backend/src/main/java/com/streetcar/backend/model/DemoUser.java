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
        String subtitle) {

    /** Takes the display name and initials together, as the {@link Identity} they are shown under. */
    public DemoUser(
            String email,
            String password,
            String role,
            String profileId,
            Identity who,
            String subtitle) {
        this(email, password, role, profileId, who.name(), who.initials(), subtitle);
    }
}
