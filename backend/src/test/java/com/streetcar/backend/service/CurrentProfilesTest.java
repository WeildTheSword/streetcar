package com.streetcar.backend.service;

import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CurrentProfilesTest {
    private DemoSessionState session;
    private CurrentProfiles profiles;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        profiles = new CurrentProfiles(new DemoFixtures(), session);
    }

    @Test
    void morganUsesTheFixtureIdentityBeforeAnySignUp() {
        // Arrange: fresh session from setUp

        // Act
        Student morgan = profiles.morgan();

        // Assert
        assertEquals(DemoFixtures.MORGAN, profiles.morganIdentity());
        assertEquals("Morgan A. Thibodaux", morgan.name());
        assertFalse(morgan.onboarded());
    }

    @Test
    void morganReflectsSignUpNameAndOnboarding() {
        // Arrange
        Identity jordan = new Identity("Jordan Lee", "JL");
        session.setIdentity("morgan-thibodaux", jordan);
        session.completeOnboarding("morgan-thibodaux");

        // Act
        Student morgan = profiles.morgan();

        // Assert
        assertEquals(jordan, profiles.morganIdentity());
        assertEquals("Jordan Lee", morgan.name());
        assertTrue(morgan.onboarded());
    }

    @Test
    void billReflectsSignUpName() {
        // Arrange
        session.setIdentity("bill-hudlow", new Identity("Dana Fox", "DF"));

        // Act + Assert
        assertEquals("Dana Fox", profiles.bill().name());
    }
}
