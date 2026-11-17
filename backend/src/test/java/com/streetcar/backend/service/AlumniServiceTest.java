package com.streetcar.backend.service;

import com.streetcar.backend.model.AccountInfo.AccountConversation;
import com.streetcar.backend.model.AlumniConversation;
import com.streetcar.backend.model.AlumniEntry;
import com.streetcar.backend.model.AlumniProfile;
import com.streetcar.backend.model.AlumniRadarRow;
import com.streetcar.backend.model.Conversation;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.AlumniProfileRepository;
import com.streetcar.backend.repository.ConversationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AlumniServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-11-17T18:00:00Z"), ZoneId.of("America/Chicago"));
    private static final OffsetDateTime NOW = OffsetDateTime.now(CLOCK);

    private AlumniProfileRepository profiles;
    private ConversationRepository conversations;
    private AlumniService service;

    private final User morgan = user(1, "STUDENT", "Morgan A. Thibodaux");
    private final User alex = user(2, "STUDENT", "Alex Park");
    private final User sarah = user(10, "ALUMNI", "Sarah Kim");
    private final User james = user(11, "ALUMNI", "James Whitfield");

    @BeforeEach
    void setUp() {
        profiles = mock(AlumniProfileRepository.class);
        conversations = mock(ConversationRepository.class);
        service = new AlumniService(profiles, conversations, CLOCK);
    }

    private static User user(long id, String role, String name) {
        User user = new User(name.toLowerCase().replace(' ', '.') + "@tulane.edu", "not-a-real-hash", role, name);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static AlumniProfile profile(User user, String school, int year, String title, String city) {
        AlumniProfile profile = new AlumniProfile(user, school, year, title, city);
        ReflectionTestUtils.setField(profile, "userId", user.getId());
        return profile;
    }

    private static Conversation conversation(long id, User student, User alum, String status, OffsetDateTime at) {
        Conversation conversation = new Conversation(student, alum, status, "Snippet " + id, at, id % 2 == 0);
        ReflectionTestUtils.setField(conversation, "id", id);
        return conversation;
    }

    @Test
    void conversationsForAStudentUseTheAlumsProfileForTheirRoleAndCity() {
        // Arrange
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(
                conversation(2, morgan, sarah, "reply", NOW.minusMinutes(12))));
        when(profiles.findById(10L)).thenReturn(Optional.of(
                profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY")));

        // Act
        List<AlumniConversation> threads = service.conversationsFor(1);

        // Assert
        AlumniConversation thread = threads.get(0);
        assertEquals("SK", thread.initials());
        assertEquals("Sarah Kim", thread.name());
        assertEquals("Freeman '16 · Goldman Sachs IBD", thread.role());
        assertEquals("Snippet 2", thread.snippet());
        assertNull(thread.prefix());
        assertEquals("reply", thread.status());
        assertEquals("Replied", thread.statusLabel());
        assertEquals("New York, NY", thread.meta());
        assertEquals("12 min", thread.time());
        assertTrue(thread.unread());
    }

    @Test
    void eachStatusHasItsPrefixAndLabel() {
        // Arrange
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "sent", NOW),
                conversation(3, morgan, sarah, "draft", NOW),
                conversation(5, morgan, sarah, "warm", NOW),
                conversation(7, morgan, sarah, "archived", NOW)));
        when(profiles.findById(10L)).thenReturn(Optional.empty());

        // Act
        List<AlumniConversation> threads = service.conversationsFor(1);

        // Assert
        assertEquals("You:", threads.get(0).prefix());
        assertEquals("Sent", threads.get(0).statusLabel());
        assertEquals("Draft:", threads.get(1).prefix());
        assertEquals("Draft ready", threads.get(1).statusLabel());
        assertNull(threads.get(2).prefix());
        assertEquals("Reply owed", threads.get(2).statusLabel());
        assertEquals("archived", threads.get(3).statusLabel());
        assertFalse(threads.get(0).unread());
    }

    @Test
    void anAlumWithoutAProfileIsATulaneAlumWithNoCity() {
        // Arrange
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "reply", NOW)));
        when(profiles.findById(10L)).thenReturn(Optional.empty());

        // Act
        AlumniConversation thread = service.conversationsFor(1).get(0);

        // Assert
        assertEquals("Tulane alum", thread.role());
        assertEquals("", thread.meta());
    }

    @Test
    void timesReadTheWayTheInboxShowsThem() {
        // Arrange
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "reply", NOW.minusSeconds(20)),
                conversation(3, morgan, sarah, "reply", NOW.minusMinutes(59)),
                conversation(5, morgan, sarah, "reply", NOW.minusHours(4)),
                conversation(7, morgan, sarah, "reply", NOW.minusHours(30)),
                conversation(9, morgan, sarah, "reply", NOW.minusDays(3))));
        when(profiles.findById(10L)).thenReturn(Optional.empty());

        // Act
        List<String> times = service.conversationsFor(1).stream().map(AlumniConversation::time).toList();

        // Assert
        assertEquals(List.of("Just now", "59 min", "4h", "Yesterday", "3d"), times);
    }

    @Test
    void theRadarCountsDistinctStudentsPerAlum() {
        // Arrange
        AlumniProfile sarahs = profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY");
        AlumniProfile jamess = profile(james, "Freeman · Accounting", 2022, "Senior Manager · KPMG M&A", "Chicago, IL");
        when(profiles.findAllByOrderByGradYearDescUserDisplayNameAsc()).thenReturn(List.of(jamess, sarahs));
        when(conversations.findByAlumnusIdOrderByUpdatedAtDesc(11L)).thenReturn(List.of());
        when(conversations.findByAlumnusIdOrderByUpdatedAtDesc(10L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "reply", NOW),
                conversation(3, morgan, sarah, "sent", NOW),
                conversation(5, alex, sarah, "draft", NOW)));

        // Act
        List<AlumniRadarRow> radar = service.radar();

        // Assert
        assertEquals(new AlumniRadarRow("JW", "James Whitfield '22", "Freeman · Accounting",
                "Senior Manager · KPMG M&A", "Chicago, IL", 0, "0 matches"), radar.get(0));
        assertEquals(new AlumniRadarRow("SK", "Sarah Kim '16", "Freeman · Finance",
                "Goldman Sachs IBD", "New York, NY", 2, "2 students"), radar.get(1));
    }

    @Test
    void oneStudentIsLabelledInTheSingular() {
        // Arrange
        when(profiles.findAllByOrderByGradYearDescUserDisplayNameAsc()).thenReturn(List.of(
                profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY")));
        when(conversations.findByAlumnusIdOrderByUpdatedAtDesc(10L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "reply", NOW)));

        // Act
        AlumniRadarRow row = service.radar().get(0);

        // Assert
        assertEquals(1, row.matches());
        assertEquals("1 student", row.matchLabel());
    }

    @Test
    void theDirectoryListsEveryAlumniAccount() {
        // Arrange
        when(profiles.findAllByOrderByGradYearDescUserDisplayNameAsc()).thenReturn(List.of(
                profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY")));
        when(conversations.findByAlumnusIdOrderByUpdatedAtDesc(10L)).thenReturn(List.of(
                conversation(1, morgan, sarah, "reply", NOW)));

        // Act
        List<AlumniEntry> directory = service.directory();

        // Assert
        assertEquals(List.of(new AlumniEntry(10, "Sarah Kim", "SK", "sarah.kim@tulane.edu", "Freeman · Finance",
                2016, "Goldman Sachs IBD", "New York, NY", 1)), directory);
    }

    @Test
    void aStudentsAccountNamesEachThreadByTheAlum() {
        // Arrange
        when(conversations.findByStudentIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(
                conversation(4, morgan, sarah, "warm", NOW)));

        // Act
        List<AccountConversation> threads = service.accountConversationsForStudent(1);

        // Assert
        assertEquals(List.of(new AccountConversation(4, "Sarah Kim", "warm", "Reply owed", "Snippet 4")), threads);
    }

    @Test
    void anAlumsAccountNamesEachThreadByTheStudent() {
        // Arrange
        when(conversations.findByAlumnusIdOrderByUpdatedAtDesc(10L)).thenReturn(List.of(
                conversation(4, morgan, sarah, "draft", NOW)));

        // Act
        List<AccountConversation> threads = service.accountConversationsForAlumnus(10);

        // Assert
        assertEquals(List.of(new AccountConversation(4, "Morgan A. Thibodaux", "draft", "Draft ready", "Snippet 4")),
                threads);
    }

    @Test
    void profileReadsTheAlumsProfileRow() {
        // Arrange
        AlumniProfile sarahs = profile(sarah, "Freeman · Finance", 2016, "Goldman Sachs IBD", "New York, NY");
        when(profiles.findById(10L)).thenReturn(Optional.of(sarahs));

        // Act
        Optional<AlumniProfile> found = service.profile(10);

        // Assert
        assertEquals(Optional.of(sarahs), found);
    }
}
