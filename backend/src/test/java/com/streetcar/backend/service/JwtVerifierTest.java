package com.streetcar.backend.service;

import com.streetcar.backend.TestTokens;
import com.streetcar.backend.model.AuthenticatedUser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtVerifierTest {
    private final JwtVerifier verifier = new JwtVerifier(TestTokens.SECRET);

    private static Date inOneHour() {
        return Date.from(Instant.now().plus(Duration.ofHours(1)));
    }

    @Test
    void aValidTokenGivesItsUserIdAndRole() {
        // Arrange
        String token = TestTokens.forUser(42, "ADVISOR");

        // Act
        Optional<AuthenticatedUser> user = verifier.verify(token);

        // Assert
        assertEquals(Optional.of(new AuthenticatedUser(42, "ADVISOR")), user);
    }

    @Test
    void aTokenSignedWithAnotherKeyIsRejected() {
        // Arrange
        byte[] otherSecret = "another-secret-also-at-least-32-bytes".getBytes(StandardCharsets.UTF_8);
        String token = Jwts.builder().subject("42").claim("role", "ADVISOR").expiration(inOneHour())
                .signWith(Keys.hmacShaKeyFor(otherSecret)).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void anUnsignedTokenIsRejected() {
        // Arrange
        String token = Jwts.builder().subject("42").claim("role", "ADVISOR").expiration(inOneHour()).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void anExpiredTokenIsRejected() {
        // Arrange
        String token = Jwts.builder().subject("42").claim("role", "ADVISOR")
                .expiration(Date.from(Instant.now().minus(Duration.ofMinutes(5))))
                .signWith(TestTokens.key()).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void aTokenThatNeverExpiresIsRejected() {
        // Arrange
        String token = Jwts.builder().subject("42").claim("role", "ADVISOR").signWith(TestTokens.key()).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void aTokenWithAnUnknownRoleIsRejected() {
        // Arrange
        String token = TestTokens.forUser(42, "SUPERUSER");

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void aTokenWithNoRoleIsRejected() {
        // Arrange
        String token = Jwts.builder().subject("42").expiration(inOneHour()).signWith(TestTokens.key()).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void aTokenWithANonNumericSubjectIsRejected() {
        // Arrange
        String token = Jwts.builder().subject("morgan").claim("role", "STUDENT").expiration(inOneHour())
                .signWith(TestTokens.key()).compact();

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void theOldDemoLabelTokenIsRejected() {
        // Arrange
        String token = "demo-morgan-thibodaux";

        // Act + Assert
        assertTrue(verifier.verify(token).isEmpty());
    }

    @Test
    void aShortSecretStopsTheAppStarting() {
        // Arrange
        String tooShort = "short";

        // Act + Assert
        assertThrows(IllegalStateException.class, () -> new JwtVerifier(tooShort));
    }
}
