package com.streetcar.backend.service;

/**
 * One strategy per kind of demo account. Each role knows which fixture profile
 * it wears, the subtitle a new account starts with, and whether it has to
 * finish onboarding, so {@link AuthService} asks the role instead of branching
 * on it. A new role is a new constant here, not an edit in every method.
 */
public enum AccountRole {

    STUDENT(DemoFixtures.MORGAN_ID, "Finance + CS · Junior") {
        @Override
        public boolean mustOnboard() {
            return true;
        }
    },

    ADVISOR(DemoFixtures.BILL_ID, "Freeman · Consultant") {
        @Override
        public boolean mustOnboard() {
            return false;
        }
    };

    private final String fixtureProfileId;
    private final String defaultSubtitle;

    AccountRole(String fixtureProfileId, String defaultSubtitle) {
        this.fixtureProfileId = fixtureProfileId;
        this.defaultSubtitle = defaultSubtitle;
    }

    /** The demo profile a new account of this role is pointed at. */
    public String fixtureProfileId() {
        return fixtureProfileId;
    }

    /** The subtitle a new account of this role shows under its name. */
    public String defaultSubtitle() {
        return defaultSubtitle;
    }

    /** Whether this role has to complete the fingerprint onboarding. */
    public abstract boolean mustOnboard();

    /** True when this role needs no onboarding, or the profile has finished it. */
    public boolean isOnboarded(String profileId, DemoSessionState session) {
        return !mustOnboard() || session.isOnboarded(profileId);
    }

    /**
     * The role a sign-up asked for. Only "ADVISOR" (any case) makes an
     * advisor; anything else signs up as a student, as the demo always has.
     */
    public static AccountRole fromRequest(String requested) {
        return ADVISOR.name().equalsIgnoreCase(requested) ? ADVISOR : STUDENT;
    }
}
