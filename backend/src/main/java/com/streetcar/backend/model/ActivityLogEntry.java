package com.streetcar.backend.model;

import java.time.OffsetDateTime;

/** One thing a student did, for the advisor's activity log. */
public record ActivityLogEntry(String type, String actor, String detail, OffsetDateTime at) {}
