package com.streetcar.backend.model;

/** An entry in the advisor's updates feed. */
public record FeedItem(String kind, String time, String title, String detail) {}
