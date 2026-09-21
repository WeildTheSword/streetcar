package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.AuthResponse;
import com.streetcar.backend.model.DemoUser;
import com.streetcar.backend.model.SignupRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

/**
 * Fake sign-in for the demo. Credentials are compared against hardcoded demo
 * accounts and the returned token is a label, not a credential — nothing here
 * is real authentication and it must not be reused as such.
 */
@Service
public class AuthService {

    private final DemoDataService demoData;

    public AuthService(DemoDataService demoData) {
        this.demoData = demoData;
    }

    /**
     * Accounts created during the demo. Held in memory only — they disappear on
     * restart, which is what /auth/reset relies on.
     */
    private final Map<String, DemoUser> created = new ConcurrentHashMap<>();

    /**
     * Creates a demo account. The new user gets the name and email they typed,
     * but is pointed at an existing demo profile so the dashboards still have
     * data to render — there is only one student and one advisor fixture.
     */
    public Optional<AuthResponse> signUp(SignupRequest request) {
        if (request == null
                || isBlank(request.name())
                || isBlank(request.email())
                || isBlank(request.password())
                || isBlank(request.role())) {
            return Optional.empty();
        }
        String email = request.email().trim().toLowerCase();
        boolean taken = allUsers().anyMatch(user -> user.email().equals(email));
        if (taken) {
            return Optional.empty();
        }

        boolean advisor = "ADVISOR".equalsIgnoreCase(request.role());
        String name = request.name().trim();
        DemoUser user = new DemoUser(
            email,
            request.password(),
            advisor ? "ADVISOR" : "STUDENT",
            advisor ? "bill-hudlow" : "morgan-thibodaux",
            name,
            initialsOf(name),
            advisor ? "Freeman · Consultant" : "Finance + CS · Junior");
        created.put(email, user);
        // Keep the fixture profile, wear the new name over it.
        demoData.setIdentity(user.profileId(), name, user.initials());
        return Optional.of(toResponse(user));
    }

    public void clearCreatedAccounts() {
        created.clear();
    }

    private Stream<DemoUser> allUsers() {
        return Stream.concat(demoData.users().stream(), created.values().stream());
    }

    private static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String initialsOf(String name) {
        List<String> parts = Stream.of(name.trim().split("\\s+"))
            .filter(part -> !part.isEmpty())
            .toList();
        if (parts.isEmpty()) return "?";
        String first = parts.get(0).substring(0, 1);
        String last = parts.size() > 1 ? parts.get(parts.size() - 1).substring(0, 1) : "";
        return (first + last).toUpperCase();
    }

    public Optional<AuthResponse> signIn(AuthRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            return Optional.empty();
        }
        String email = request.email().trim().toLowerCase();
        return allUsers()
            .filter(user -> user.email().equals(email))
            .filter(user -> user.password().equals(request.password()))
            .findFirst()
            .map(this::toResponse);
    }

    private AuthResponse toResponse(DemoUser user) {
        boolean onboarded = !"STUDENT".equals(user.role()) || demoData.isOnboarded(user.profileId());
        return new AuthResponse(
            "demo-" + user.profileId(),
            user.role(),
            user.profileId(),
            user.displayName(),
            user.initials(),
            user.subtitle(),
            onboarded);
    }
}
