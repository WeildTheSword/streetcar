package com.streetcar.backend.service;

import java.util.List;
import java.util.stream.Stream;

/** How the app abbreviates a person's name. */
public final class Names {
    private Names() {}

    /** "Morgan A. Thibodaux" becomes "MT": first and last initials, or "?" for a blank name. */
    public static String initials(String name) {
        List<String> parts = Stream.of(name.trim().split("\\s+"))
            .filter(part -> !part.isEmpty())
            .toList();
        if (parts.isEmpty()) return "?";
        String first = parts.get(0).substring(0, 1);
        String last = parts.size() > 1 ? parts.get(parts.size() - 1).substring(0, 1) : "";
        return (first + last).toUpperCase();
    }
}
