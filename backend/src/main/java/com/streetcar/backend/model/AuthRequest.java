package com.streetcar.backend.model;

/** Credentials posted by the sign-in form. */
public record AuthRequest(String email, String password) {}
