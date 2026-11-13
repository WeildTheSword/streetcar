package com.streetcar.backend.model;

/** Who a request is from, as read from its verified JWT. */
public record AuthenticatedUser(long id, String role) {}
