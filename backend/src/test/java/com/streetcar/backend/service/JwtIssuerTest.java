package com.streetcar.backend.service;

import com.streetcar.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtIssuerTest {
    private static final String SECRET = "test-only-secret-at-least-32-bytes-long";
    // Ahead of the real clock, so the token is still unexpired when the test parses it.
    private static final Instant NOW = Instant.now().plusSeconds(60).truncatedTo(ChronoUnit.SECONDS);

    private static User userWithId(long id, String role) {
        User user = new User("alex@tulane.edu", "hash", role, "Alex Rivera");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    @Test
    void issuesAnHs256TokenWithTheUserIdRoleAndExpiry() {
        // Arrange
        JwtIssuer issuer = new JwtIssuer(SECRET, Clock.fixed(NOW, ZoneOffset.UTC));

        // Act
        String token = issuer.issue(userWithId(42, "ADVISOR"));

        // Assert
        Jws<Claims> parsed = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token);
        assertEquals("HS256", parsed.getHeader().getAlgorithm());
        assertEquals("42", parsed.getPayload().getSubject());
        assertEquals("ADVISOR", parsed.getPayload().get("role", String.class));
        assertEquals(Date.from(NOW), parsed.getPayload().getIssuedAt());
        assertEquals(Date.from(NOW.plus(JwtIssuer.LIFETIME)), parsed.getPayload().getExpiration());
    }

    @Test
    void refusesASecretShorterThan32Bytes() {
        // Arrange
        String tooShort = "x".repeat(JwtIssuer.MIN_SECRET_BYTES - 1);

        // Act + Assert
        assertThrows(IllegalStateException.class, () -> new JwtIssuer(tooShort));
    }
}
