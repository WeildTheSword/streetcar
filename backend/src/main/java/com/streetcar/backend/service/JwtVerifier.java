package com.streetcar.backend.service;

import com.streetcar.backend.model.AuthenticatedUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Checks the tokens that sign-in issues. A valid token is HS256-signed with
 * JWT_SECRET, has an expiry, and carries the numeric user id as its subject and
 * STUDENT or ADVISOR as its "role" claim. Anything else is not a valid token.
 */
@Service
public class JwtVerifier {
    private static final int MIN_SECRET_BYTES = 32;

    private final JwtParser parser;

    public JwtVerifier(@Value("${jwt.secret}") String secret) {
        byte[] key = secret.getBytes(StandardCharsets.UTF_8);
        // Refuse to start rather than run with a guessable signing key.
        if (key.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("Set JWT_SECRET to at least " + MIN_SECRET_BYTES + " bytes.");
        }
        this.parser = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(key)).build();
    }

    /** The user the token identifies, or empty if the token is not valid for any reason. */
    public Optional<AuthenticatedUser> verify(String token) {
        try {
            Claims claims = parser.parseSignedClaims(token).getPayload();
            String role = claims.get("role", String.class);
            if (claims.getExpiration() == null || role == null) {
                return Optional.empty();
            }
            return Optional.of(new AuthenticatedUser(Long.parseLong(claims.getSubject()), AccountRole.valueOf(role).name()));
        } catch (JwtException | IllegalArgumentException invalid) {
            return Optional.empty();
        }
    }
}
