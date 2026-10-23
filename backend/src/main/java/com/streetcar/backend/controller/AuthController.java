package com.streetcar.backend.controller;

import com.streetcar.backend.model.AuthRequest;
import com.streetcar.backend.model.AuthResponse;
import com.streetcar.backend.model.SignupRequest;
import com.streetcar.backend.service.AuthService;
import com.streetcar.backend.service.DemoResetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final DemoResetService demoReset;

    public AuthController(AuthService authService, DemoResetService demoReset) {
        this.authService = authService;
        this.demoReset = demoReset;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return authService.signIn(request)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signUp(@RequestBody SignupRequest request) {
        return authService.signUp(request)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(409).build());
    }

    /** Puts the demo back to its opening state so the splash can be shown again. */
    @PostMapping("/reset")
    public ResponseEntity<Void> reset() {
        demoReset.reset();
        return ResponseEntity.noContent().build();
    }
}
