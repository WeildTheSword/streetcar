package com.streetcar.backend.controller;

import com.streetcar.backend.model.AccountInfo;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.NoSuchElementException;

/** The signed-in user's own account, for students, advisors and alumni alike. */
@RestController
public class AccountController {
    private final AccountService accounts;

    public AccountController(AccountService accounts) {
        this.accounts = accounts;
    }

    @GetMapping("/account")
    public AccountInfo account(@AuthenticationPrincipal AuthenticatedUser who) {
        return accounts.account(who);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Account not found."));
    }
}
