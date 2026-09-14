package com.streetcar.backend.model;

/** A task on the student's week. */
public record ActionItem(String title, String detail, String meta, boolean done) {}
