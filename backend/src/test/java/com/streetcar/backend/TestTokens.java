package com.streetcar.backend;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;

/** Signs tokens the way sign-in will, using the jwt.secret in the test application.properties. */
public final class TestTokens {
    public static final String SECRET = "test-only-secret-at-least-32-bytes-long";

    private TestTokens() {}

    public static SecretKey key() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public static String forUser(long id, String role) {
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("role", role)
                .expiration(Date.from(Instant.now().plus(Duration.ofHours(1))))
                .signWith(key())
                .compact();
    }

    public static String bearer(long id, String role) {
        return "Bearer " + forUser(id, role);
    }
}
