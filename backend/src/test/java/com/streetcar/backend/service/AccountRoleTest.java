package com.streetcar.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AccountRoleTest {

    @Test
    void studentStrategyPointsAtMorganAndMustOnboard() {
        // Arrange
        AccountRole role = AccountRole.STUDENT;

        // Act + Assert
        assertEquals(DemoFixtures.MORGAN_ID, role.fixtureProfileId());
        assertEquals("Finance + CS · Junior", role.defaultSubtitle());
        assertTrue(role.mustOnboard());
    }

    @Test
    void advisorStrategyPointsAtBillAndSkipsOnboarding() {
        // Arrange
        AccountRole role = AccountRole.ADVISOR;

        // Act + Assert
        assertEquals(DemoFixtures.BILL_ID, role.fixtureProfileId());
        assertEquals("Freeman · Consultant", role.defaultSubtitle());
        assertFalse(role.mustOnboard());
    }

    @Test
    void requestedRoleIsMatchedIgnoringCase() {
        // Arrange
        String typed = "advisor";

        // Act
        AccountRole role = AccountRole.fromRequest(typed);

        // Assert
        assertEquals(AccountRole.ADVISOR, role);
    }

    @Test
    void anyOtherRequestedRoleSignsUpAsAStudent() {
        // Arrange
        String typed = "somebody else";

        // Act
        AccountRole role = AccountRole.fromRequest(typed);

        // Assert
        assertEquals(AccountRole.STUDENT, role);
    }

    @Test
    void onboardedOnlyAsksTheSessionWhenTheRoleMustOnboard() {
        // Arrange
        DemoSessionState session = new DemoSessionState();

        // Act + Assert
        assertTrue(AccountRole.ADVISOR.isOnboarded(DemoFixtures.BILL_ID, session));
        assertFalse(AccountRole.STUDENT.isOnboarded(DemoFixtures.MORGAN_ID, session));
        session.completeOnboarding(DemoFixtures.MORGAN_ID);
        assertTrue(AccountRole.STUDENT.isOnboarded(DemoFixtures.MORGAN_ID, session));
    }
}
