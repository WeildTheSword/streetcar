package com.streetcar.backend.model;

/**
 * A built-in demo account, as listed in DEMO.md. The password here is only the
 * seed: {@code AuthService.ensureDemoAccounts} stores its BCrypt hash in the
 * "users" table, and sign-in checks against that.
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
