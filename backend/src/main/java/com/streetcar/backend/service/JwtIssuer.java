package com.streetcar.backend.service;

import com.streetcar.backend.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Signs the token a successful sign-in returns: HS256 with JWT_SECRET, the
 * numeric user id as the subject, STUDENT or ADVISOR as the "role" claim, and
 * an expiry. This is the format the backend's token check expects.
 */
@Service
public class JwtIssuer {
    static final int MIN_SECRET_BYTES = 32;
    static final Duration LIFETIME = Duration.ofHours(8);

    private final SecretKey key;
    private final Clock clock;

    @Autowired
    public JwtIssuer(@Value("${jwt.secret}") String secret) {
        this(secret, Clock.systemUTC());
    }

    JwtIssuer(String secret, Clock clock) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        // Refuse to start rather than sign with a guessable key.
        if (bytes.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("Set JWT_SECRET to at least " + MIN_SECRET_BYTES + " bytes.");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.clock = clock;
    }

    public String issue(User user) {
        Instant now = clock.instant();
        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("role", user.getRole())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(LIFETIME)))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }
}
