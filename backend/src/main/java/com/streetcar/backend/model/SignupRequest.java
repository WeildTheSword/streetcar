package com.streetcar.backend.model;

/** Details posted by the demo's create-account form. */
public record SignupRequest(String name, String email, String password, String role) {}
