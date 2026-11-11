package com.streetcar.backend.service;

import com.streetcar.backend.model.Identity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class DemoResetServiceTest {
    private DemoSessionState session;
    private AuthService auth;
    private DemoResetService reset;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        auth = mock(AuthService.class);
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
        // Arrange: nothing beyond the mocks

        // Act
        reset.reset();

        // Assert
        verify(auth).clearCreatedAccounts();
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
}
