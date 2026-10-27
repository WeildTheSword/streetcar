package com.streetcar.backend.service;

import com.streetcar.backend.model.Advisor;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.Student;
import org.springframework.stereotype.Component;

import static com.streetcar.backend.service.DemoFixtures.BILL;
import static com.streetcar.backend.service.DemoFixtures.BILL_ID;
import static com.streetcar.backend.service.DemoFixtures.MORGAN;
import static com.streetcar.backend.service.DemoFixtures.MORGAN_ID;

/**
 * The demo profiles as they stand right now: the fixture content from
 * {@link DemoFixtures}, under whatever name a sign-up gave it and at the
 * onboarding state held in {@link DemoSessionState}. The student and advisor
 * services both read the profiles through here, so that combination is written once.
 */
@Component
public class CurrentProfiles {

    private final DemoFixtures fixtures;
    private final DemoSessionState session;

    public CurrentProfiles(DemoFixtures fixtures, DemoSessionState session) {
        this.fixtures = fixtures;
        this.session = session;
    }

    public Identity morganIdentity() {
        return session.identityOr(MORGAN_ID, MORGAN);
    }

    public Student morgan() {
        return fixtures.morgan(morganIdentity(), session.isOnboarded(MORGAN_ID));
    }

    public Advisor bill() {
        return fixtures.bill(session.identityOr(BILL_ID, BILL));
    }
}
