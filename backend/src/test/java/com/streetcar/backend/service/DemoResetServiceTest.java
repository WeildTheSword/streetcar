package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.SignupRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DemoResetServiceTest {
    private DemoSessionState session;
    private AuthService auth;
    private DemoResetService reset;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        auth = new AuthService(new DemoFixtures(), session);
        reset = new DemoResetService(session, auth);
    }

    @Test
    void resetClearsOnboarding() {
        // Arrange
        session.completeOnboarding(DemoFixtures.MORGAN_ID);

        // Act
        reset.reset();

        // Assert
        assertFalse(session.isOnboarded(DemoFixtures.MORGAN_ID));
    }

    @Test
    void resetRemovesAccountsCreatedDuringTheDemo() {
        // Arrange
        auth.signUp(new SignupRequest("Avery Lee", "avery@tulane.edu", "secret", "STUDENT"));
        assertTrue(auth.signIn(new AuthRequest("avery@tulane.edu", "secret")).isPresent());

        // Act
        reset.reset();

        // Assert
        assertFalse(auth.signIn(new AuthRequest("avery@tulane.edu", "secret")).isPresent());
    }

    @Test
    void resetDropsTheNameASignUpWoreOverAFixture() {
        // Arrange
        Identity fixture = new Identity("Morgan Thibodaux", "MT");
        session.setIdentity(DemoFixtures.MORGAN_ID, new Identity("Avery Lee", "AL"));

        // Act
        reset.reset();

        // Assert
        assertEquals(fixture, session.identityOr(DemoFixtures.MORGAN_ID, fixture));
    }

    @Test
    void resetKeepsTheBuiltInDemoAccounts() {
        // Arrange
        AuthRequest morgan = new AuthRequest("morgan@tulane.edu", "streetcar");

        // Act
        reset.reset();

        // Assert
        assertTrue(auth.signIn(morgan).isPresent());
    }
}
