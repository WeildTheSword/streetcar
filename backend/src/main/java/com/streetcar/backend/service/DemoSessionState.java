package com.streetcar.backend.service;

import com.streetcar.backend.model.Identity;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The demo's mutable progress: which students have completed the fingerprint
 * onboarding, and the identity a signed-up user wears over a fixture profile.
 * There is no database, so this lives in memory and resets on restart.
 */
@Component
public class DemoSessionState {

    private final Map<String, Boolean> onboarded = new ConcurrentHashMap<>();

    /**
     * Name/initials supplied when an account is created during the demo. The
     * fixture profile is kept in full — only the identity on the front of it is
     * swapped, so a new sign-up sees their own name over the same record.
     */
    private final Map<String, Identity> identities = new ConcurrentHashMap<>();

    public boolean isOnboarded(String studentId) {
        return onboarded.getOrDefault(studentId, false);
    }

    public void completeOnboarding(String studentId) {
        onboarded.put(studentId, true);
    }

    public void setIdentity(String profileId, Identity identity) {
        identities.put(profileId, identity);
    }

    /** The identity a sign-up gave this profile, or {@code fallback} if there was none. */
    public Identity identityOr(String profileId, Identity fallback) {
        return identities.getOrDefault(profileId, fallback);
    }

    /** Resets onboarding and any created identities so the demo can run again. */
    public void reset() {
        onboarded.clear();
        identities.clear();
    }
}
