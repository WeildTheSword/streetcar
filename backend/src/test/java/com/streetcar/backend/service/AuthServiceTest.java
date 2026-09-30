package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.AuthResponse;
import com.streetcar.backend.model.SignupRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthServiceTest {
    private DemoSessionState session;
    private AuthService service;

    @BeforeEach
    void setUp() {
        session = new DemoSessionState();
        service = new AuthService(new DemoFixtures(), session);
    }

    @Test
    void signInReturnsSessionForDemoStudent() {
        // Arrange
        AuthRequest request = new AuthRequest("  Morgan@Tulane.edu ", "streetcar");

        // Act
        Optional<AuthResponse> response = service.signIn(request);

        // Assert
        assertTrue(response.isPresent());
        assertEquals("STUDENT", response.get().role());
        assertEquals("morgan-thibodaux", response.get().profileId());
        assertEquals("demo-morgan-thibodaux", response.get().token());
        assertFalse(response.get().onboarded());
    }

    @Test
    void signInMarksAdvisorAsOnboarded() {
        // Arrange
        AuthRequest request = new AuthRequest("bill.hudlow@tulane.edu", "streetcar");

        // Act
        Optional<AuthResponse> response = service.signIn(request);

        // Assert
        assertTrue(response.isPresent());
        assertEquals("ADVISOR", response.get().role());
        assertTrue(response.get().onboarded());
    }

    @Test
    void signInRejectsWrongPassword() {
        // Arrange
        AuthRequest request = new AuthRequest("morgan@tulane.edu", "wrong");

        // Act
        Optional<AuthResponse> response = service.signIn(request);

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
    void signUpCreatesStudentAccountThatCanSignIn() {
        // Arrange
        SignupRequest request = new SignupRequest(" Alex Rivera ", "Alex@Tulane.edu", "secret", "student");

        // Act
        Optional<AuthResponse> created = service.signUp(request);
        Optional<AuthResponse> signedIn = service.signIn(new AuthRequest("alex@tulane.edu", "secret"));

        // Assert
        assertTrue(created.isPresent());
        assertEquals("STUDENT", created.get().role());
        assertEquals("Alex Rivera", created.get().displayName());
        assertEquals("AR", created.get().initials());
        assertEquals("Alex Rivera", session.identityOr("morgan-thibodaux", DemoFixtures.MORGAN).name());
        assertTrue(signedIn.isPresent());
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
        assertEquals("bill-hudlow", created.get().profileId());
        assertEquals("C", created.get().initials());
    }

    @Test
    void signUpRejectsBlankFieldsAndTakenEmail() {
        // Arrange
        SignupRequest blankName = new SignupRequest(" ", "new@tulane.edu", "secret", "STUDENT");
        SignupRequest takenEmail = new SignupRequest("Morgan", "morgan@tulane.edu", "secret", "STUDENT");

        // Act + Assert
        assertTrue(service.signUp(null).isEmpty());
        assertTrue(service.signUp(blankName).isEmpty());
        assertTrue(service.signUp(takenEmail).isEmpty());
    }

    @Test
    void clearCreatedAccountsRemovesSignedUpUsers() {
        // Arrange
        service.signUp(new SignupRequest("Alex Rivera", "alex@tulane.edu", "secret", "STUDENT"));

        // Act
        service.clearCreatedAccounts();

        // Assert
        assertTrue(service.signIn(new AuthRequest("alex@tulane.edu", "secret")).isEmpty());
    }
}
