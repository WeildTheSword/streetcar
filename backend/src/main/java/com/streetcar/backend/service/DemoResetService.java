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

    public DemoResetService(DemoSessionState session) {
        this.session = session;
    }

    /**
     * Clears onboarding and the names sign-ups wore over the fixtures. Accounts
     * are real, so the reset never deletes them or anything they saved.
     */
    public void reset() {
        session.reset();
    }
}
