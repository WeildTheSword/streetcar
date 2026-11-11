package com.streetcar.backend.controller;

import com.jayway.jsonpath.JsonPath;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.UserRepository;
import com.streetcar.backend.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Sign-up and sign-in through the real controller, users table and token signing. */
@SpringBootTest
@AutoConfigureMockMvc
class AuthApiTest {
    /** The jwt.secret in the test application.properties. */
    private static final String SECRET = "test-only-secret-at-least-32-bytes-long";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository users;

    @Autowired
    private AuthService auth;

    @BeforeEach
    void keepOnlyTheDemoAccounts() {
        auth.clearCreatedAccounts();
    }

    private ResultActions postJson(String path, String json) throws Exception {
        return mvc.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private static Claims claimsOf(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @Test
    void signUpThenLoginReturnsAJwtCarryingTheUsersIdAndRole() throws Exception {
        // Arrange
        postJson("/auth/signup", "{\"name\":\"Cher Vail\",\"email\":\"cher@tulane.edu\",\"password\":\"s3cret\",\"role\":\"ADVISOR\"}")
                .andExpect(status().isOk());

        // Act
        String body = postJson("/auth/login", "{\"email\":\"cher@tulane.edu\",\"password\":\"s3cret\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADVISOR"))
                .andReturn().getResponse().getContentAsString();

        // Assert
        Claims claims = claimsOf(JsonPath.read(body, "$.token"));
        User cher = users.findByEmail("cher@tulane.edu").orElseThrow();
        assertEquals("ADVISOR", claims.get("role", String.class));
        assertEquals(String.valueOf(cher.getId()), claims.getSubject());
        assertTrue(claims.getExpiration().getTime() > System.currentTimeMillis());
    }

    @Test
    void aWrongPasswordGets401AndNoToken() throws Exception {
        // Arrange
        postJson("/auth/signup", "{\"name\":\"Alex Rivera\",\"email\":\"alex@tulane.edu\",\"password\":\"s3cret\",\"role\":\"STUDENT\"}")
                .andExpect(status().isOk());

        // Act + Assert
        postJson("/auth/login", "{\"email\":\"alex@tulane.edu\",\"password\":\"wrong\"}")
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(""));
    }

    @Test
    void theDatabaseHoldsABcryptHashNotThePassword() throws Exception {
        // Arrange + Act
        postJson("/auth/signup", "{\"name\":\"Alex Rivera\",\"email\":\"alex@tulane.edu\",\"password\":\"s3cret\",\"role\":\"STUDENT\"}")
                .andExpect(status().isOk());

        // Assert
        String stored = users.findByEmail("alex@tulane.edu").orElseThrow().getPasswordHash();
        assertNotEquals("s3cret", stored);
        assertTrue(stored.startsWith("$2"), "expected a BCrypt hash");
    }

    @Test
    void theDemoAccountsSignInWithTheirDocumentedPassword() throws Exception {
        // Arrange: DemoAccountSeeder adds them at startup

        // Act
        String body = postJson("/auth/login", "{\"email\":\"morgan@tulane.edu\",\"password\":\"streetcar\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profileId").value("morgan-thibodaux"))
                .andReturn().getResponse().getContentAsString();

        // Assert
        assertEquals("STUDENT", claimsOf(JsonPath.read(body, "$.token")).get("role", String.class));
    }

    @Test
    void signingUpWithATakenEmailGets409() throws Exception {
        // Arrange
        String alex = "{\"name\":\"Alex Rivera\",\"email\":\"alex@tulane.edu\",\"password\":\"s3cret\",\"role\":\"STUDENT\"}";
        postJson("/auth/signup", alex).andExpect(status().isOk());

        // Act + Assert
        postJson("/auth/signup", alex).andExpect(status().isConflict());
    }
}
