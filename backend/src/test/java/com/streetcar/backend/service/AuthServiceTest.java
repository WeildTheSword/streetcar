package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.AuthResponse;
import com.streetcar.backend.model.SignupRequest;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {
    private static final String TOKEN = "signed.jwt.token";

    private UserRepository users;
    private JwtIssuer tokens;
    // A real encoder, at the lowest cost so the tests stay fast: hashing is the behaviour under test.
    private final PasswordEncoder passwords = new BCryptPasswordEncoder(4);
    private DemoSessionState session;
    private AuthService service;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        tokens = mock(JwtIssuer.class);
        when(tokens.issue(any())).thenReturn(TOKEN);
        when(users.save(any())).thenAnswer(call -> call.getArgument(0));
        session = new DemoSessionState();
        service = new AuthService(users, passwords, tokens, new DemoFixtures(), session);
    }

    private User stored(String email, String password, String role, String name) {
        User user = new User(email, passwords.encode(password), role, name);
        when(users.findByEmail(email)).thenReturn(Optional.of(user));
        return user;
    }

    @Test
    void signUpStoresAHashNotThePassword() {
        // Arrange
        SignupRequest request = new SignupRequest(" Alex Rivera ", "Alex@Tulane.edu", "secret", "student");
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);

        // Act
        Optional<AuthResponse> created = service.signUp(request);

        // Assert
        verify(users).save(saved.capture());
        User user = saved.getValue();
        assertEquals("alex@tulane.edu", user.getEmail());
        assertEquals("STUDENT", user.getRole());
        assertEquals("Alex Rivera", user.getDisplayName());
        assertNotEquals("secret", user.getPasswordHash());
        assertTrue(passwords.matches("secret", user.getPasswordHash()));
        assertTrue(created.isPresent());
        assertEquals(TOKEN, created.get().token());
        assertEquals("AR", created.get().initials());
        assertEquals("Alex Rivera", session.identityOr(DemoFixtures.MORGAN_ID, DemoFixtures.MORGAN).name());
    }

    @Test
    void signUpCreatesAdvisorAccountWithSingleNameInitial() {
        // Arrange
        SignupRequest request = new SignupRequest("Cher", "cher@tulane.edu", "secret", "ADVISOR");

        // Act
        Optional<AuthResponse> created = service.signUp(request);

        // Assert
        assertTrue(created.isPresent());
        assertEquals("ADVISOR", created.get().role());
        assertEquals(DemoFixtures.BILL_ID, created.get().profileId());
        assertEquals("C", created.get().initials());
        assertTrue(created.get().onboarded());
    }

    @Test
    void signUpRejectsBlankFieldsAndTakenEmail() {
        // Arrange
        when(users.existsByEmail("morgan@tulane.edu")).thenReturn(true);
        SignupRequest blankName = new SignupRequest(" ", "new@tulane.edu", "secret", "STUDENT");
        SignupRequest takenEmail = new SignupRequest("Morgan", " Morgan@Tulane.edu", "secret", "STUDENT");

        // Act + Assert
        assertTrue(service.signUp(null).isEmpty());
        assertTrue(service.signUp(blankName).isEmpty());
        assertTrue(service.signUp(takenEmail).isEmpty());
        verify(users, never()).save(any());
    }

    @Test
    void signUpTreatsAnEmailClaimedMeanwhileAsTaken() {
        // Arrange
        when(users.save(any())).thenThrow(new DataIntegrityViolationException("duplicate email"));

        // Act
        Optional<AuthResponse> created = service.signUp(
            new SignupRequest("Alex Rivera", "alex@tulane.edu", "secret", "STUDENT"));

        // Assert
        assertTrue(created.isEmpty());
    }

    @Test
    void signInReturnsASignedTokenForTheMatchingPassword() {
        // Arrange
        User morgan = stored("morgan@tulane.edu", "streetcar", "STUDENT", "Morgan A. Thibodaux");

        // Act
        Optional<AuthResponse> response = service.signIn(new AuthRequest("  Morgan@Tulane.edu ", "streetcar"));

        // Assert
        assertTrue(response.isPresent());
        assertEquals(TOKEN, response.get().token());
        assertEquals("STUDENT", response.get().role());
        assertEquals(DemoFixtures.MORGAN_ID, response.get().profileId());
        assertEquals("Morgan A. Thibodaux", response.get().displayName());
        assertEquals("MT", response.get().initials());
        assertFalse(response.get().onboarded());
        verify(tokens).issue(morgan);
    }

    @Test
    void signInMarksAdvisorAsOnboarded() {
        // Arrange
        stored("bill.hudlow@tulane.edu", "streetcar", "ADVISOR", "Bill Hudlow");

        // Act
        Optional<AuthResponse> response = service.signIn(new AuthRequest("bill.hudlow@tulane.edu", "streetcar"));

        // Assert
        assertTrue(response.isPresent());
        assertEquals("ADVISOR", response.get().role());
        assertTrue(response.get().onboarded());
    }

    @Test
    void signInWearsTheSignedInNameOverTheFixtureProfile() {
        // Arrange
        stored("alex@tulane.edu", "secret", "STUDENT", "Alex Rivera");

        // Act
        service.signIn(new AuthRequest("alex@tulane.edu", "secret"));

        // Assert
        assertEquals("Alex Rivera", session.identityOr(DemoFixtures.MORGAN_ID, DemoFixtures.MORGAN).name());
    }

    @Test
    void signInRejectsWrongPasswordWithoutIssuingAToken() {
        // Arrange
        stored("morgan@tulane.edu", "streetcar", "STUDENT", "Morgan A. Thibodaux");

        // Act
        Optional<AuthResponse> response = service.signIn(new AuthRequest("morgan@tulane.edu", "wrong"));

        // Assert
        assertTrue(response.isEmpty());
        verify(tokens, never()).issue(any());
    }

    @Test
    void signInRejectsUnknownEmail() {
        // Arrange
        when(users.findByEmail("nobody@tulane.edu")).thenReturn(Optional.empty());

        // Act
        Optional<AuthResponse> response = service.signIn(new AuthRequest("nobody@tulane.edu", "streetcar"));

        // Assert
        assertTrue(response.isEmpty());
    }

    @Test
    void signInRejectsMissingCredentials() {
        // Arrange
        AuthRequest noEmail = new AuthRequest(null, "streetcar");
        AuthRequest noPassword = new AuthRequest("morgan@tulane.edu", null);

        // Act + Assert
        assertTrue(service.signIn(null).isEmpty());
        assertTrue(service.signIn(noEmail).isEmpty());
        assertTrue(service.signIn(noPassword).isEmpty());
    }

    @Test
    void ensureDemoAccountsAddsOnlyTheMissingOnesHashed() {
        // Arrange
        when(users.existsByEmail("morgan@tulane.edu")).thenReturn(true);
        when(users.existsByEmail("bill.hudlow@tulane.edu")).thenReturn(false);
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);

        // Act
        service.ensureDemoAccounts();

        // Assert
        verify(users).save(saved.capture());
        assertEquals("bill.hudlow@tulane.edu", saved.getValue().getEmail());
        assertEquals("ADVISOR", saved.getValue().getRole());
        assertTrue(passwords.matches("streetcar", saved.getValue().getPasswordHash()));
    }

    @Test
    void clearCreatedAccountsKeepsTheDemoAccounts() {
        // Arrange: nothing beyond the mocks

        // Act
        service.clearCreatedAccounts();

        // Assert
        verify(users).deleteAllExcept(List.of("morgan@tulane.edu", "bill.hudlow@tulane.edu"));
    }
}
