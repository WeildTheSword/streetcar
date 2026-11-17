package com.streetcar.backend.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class NamesTest {
    @Test
    void initialsTakeTheFirstAndLastNames() {
        // Arrange
        String name = "Morgan A. Thibodaux";

        // Act
        String initials = Names.initials(name);

        // Assert
        assertEquals("MT", initials);
    }

    @Test
    void aSingleNameGivesOneInitial() {
        // Act
        String initials = Names.initials("cher");

        // Assert
        assertEquals("C", initials);
    }

    @Test
    void extraSpacesAreIgnored() {
        // Act
        String initials = Names.initials("  sarah   kim  ");

        // Assert
        assertEquals("SK", initials);
    }

    @Test
    void aBlankNameGivesAQuestionMark() {
        // Act
        String initials = Names.initials("   ");

        // Assert
        assertEquals("?", initials);
    }
}
