package com.streetcar.backend.model;

import java.time.LocalDate;

/** What a student sends to add or edit an application. The service validates and trims it. */
public record ApplicationRequest(String company, String roleTitle, String status, LocalDate appliedOn, String notes) {}
