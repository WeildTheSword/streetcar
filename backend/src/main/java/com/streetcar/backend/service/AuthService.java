package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.AuthResponse;
import com.streetcar.backend.model.DemoUser;
import com.streetcar.backend.model.Identity;
import com.streetcar.backend.model.SignupRequest;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * Sign-up and sign-in against the "users" table. Passwords are stored as
 * BCrypt hashes, and a successful sign-in returns a signed JWT carrying the
 * user's id and role.
 *
 * <p>Accounts are real, but the dashboards are still the demo's: each role
 * points at its fixture profile, and the signed-in user's name is worn over it.
 */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final JwtIssuer tokens;
    private final DemoFixtures fixtures;
    private final DemoSessionState session;

    public AuthService(UserRepository users, PasswordEncoder passwords, JwtIssuer tokens,
                       DemoFixtures fixtures, DemoSessionState session) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
        this.fixtures = fixtures;
        this.session = session;
    }

    /** Creates an account and signs it in, or returns empty if a field is blank or the email is taken. */
    public Optional<AuthResponse> signUp(SignupRequest request) {
        if (!isComplete(request)) {
            return Optional.empty();
        }
        String email = normalize(request.email());
        if (users.existsByEmail(email)) {
            return Optional.empty();
        }
        AccountRole role = AccountRole.fromRequest(request.role());
        User user;
        try {
            user = users.save(new User(email, passwords.encode(request.password()),
                role.name(), request.name().trim()));
        } catch (DataIntegrityViolationException takenMeanwhile) {
            // Another sign-up claimed the email between the check and the insert.
            return Optional.empty();
        }
        return Optional.of(startSession(user));
    }

    /** Signs in with an email and password, or returns empty if they don't match an account. */
    public Optional<AuthResponse> signIn(AuthRequest request) {
        if (request == null || request.email() == null || request.password() == null) {
            return Optional.empty();
        }
        return users.findByEmail(normalize(request.email()))
            .filter(user -> passwords.matches(request.password(), user.getPasswordHash()))
            .map(this::startSession);
    }

    /** Adds the built-in demo accounts from {@link DemoFixtures} if they are missing. */
    public void ensureDemoAccounts() {
        for (DemoUser demo : fixtures.users()) {
            if (!users.existsByEmail(demo.email())) {
                users.save(new User(demo.email(), passwords.encode(demo.password()),
                    demo.role(), demo.displayName()));
            }
        }
    }

    /** Deletes every account except the built-in demo ones, for /auth/reset. */
    public void clearCreatedAccounts() {
        users.deleteAllExcept(fixtures.users().stream().map(DemoUser::email).toList());
    }

    /** Wears the user's name over their role's fixture profile and builds the signed-in session. */
    private AuthResponse startSession(User user) {
        AccountRole role = AccountRole.valueOf(user.getRole());
        String profileId = role.fixtureProfileId();
        Identity who = new Identity(user.getDisplayName(), initialsOf(user.getDisplayName()));
        session.setIdentity(profileId, who);
        return new AuthResponse(
            tokens.issue(user),
            role.name(),
            profileId,
            who.name(),
            who.initials(),
            role.defaultSubtitle(),
            role.isOnboarded(profileId, session));
    }

    private static boolean isComplete(SignupRequest request) {
        return request != null
            && !isBlank(request.name())
            && !isBlank(request.email())
            && !isBlank(request.password())
            && !isBlank(request.role());
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase();
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
}
