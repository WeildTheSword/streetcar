package com.streetcar.backend.service;

import com.streetcar.backend.model.Identity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoSessionStateTest {
    private static final String MORGAN = "morgan-thibodaux";
    private static final Identity FALLBACK = new Identity("Morgan A. Thibodaux", "MT");
    private DemoSessionState session;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
    }

    @Test
    void completeOnboardingMarksOnlyThatStudent() {
        // Arrange: nobody starts onboarded

        // Act
        session.completeOnboarding(MORGAN);

        // Assert
        assertTrue(session.isOnboarded(MORGAN));
        assertFalse(session.isOnboarded("someone-else"));
    }

    @Test
    void identityOrFallsBackUntilAnIdentityIsSet() {
        // Arrange
        Identity alex = new Identity("Alex Rivera", "AR");

        // Act
        Identity before = session.identityOr(MORGAN, FALLBACK);
        session.setIdentity(MORGAN, alex);
        Identity after = session.identityOr(MORGAN, FALLBACK);

        // Assert
        assertEquals(FALLBACK, before);
        assertEquals(alex, after);
    }

    @Test
    void resetClearsProgressAndIdentities() {
        // Arrange
        session.completeOnboarding(MORGAN);
        session.setIdentity(MORGAN, new Identity("Alex Rivera", "AR"));

        // Act
        session.reset();

        // Assert
        assertFalse(session.isOnboarded(MORGAN));
        assertEquals(FALLBACK, session.identityOr(MORGAN, FALLBACK));
    }
}
