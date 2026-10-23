package com.streetcar.backend.service;

import org.springframework.stereotype.Service;

/**
 * Puts the demo back to its opening state. This is the one place that knows
 * where demo state lives, so a new piece of state is cleared here rather than
 * in a controller.
 */
@Service
public class DemoResetService {

    private final DemoSessionState session;
    private final AuthService auth;

    public DemoResetService(DemoSessionState session, AuthService auth) {
        this.session = session;
        this.auth = auth;
    }

    /** Clears onboarding, sign-up identities and accounts created during the demo. */
    public void reset() {
        session.reset();
        auth.clearCreatedAccounts();
    }
}
