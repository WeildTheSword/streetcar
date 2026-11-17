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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Alumni accounts and their conversations with students, read from the
 * alumni_profiles and conversations tables. Each read runs in a transaction
 * because the users on either side of a conversation load lazily.
 */
@Service
public class AlumniService {
    private final AlumniProfileRepository profiles;
    private final ConversationRepository conversations;
    private final Clock clock;

    public AlumniService(AlumniProfileRepository profiles, ConversationRepository conversations, Clock clock) {
        this.profiles = profiles;
        this.conversations = conversations;
        this.clock = clock;
    }

    /** A student's threads with alumni, newest first, in the shape the dashboards render. */
    @Transactional(readOnly = true)
    public List<AlumniConversation> conversationsFor(long studentId) {
        return conversations.findByStudentIdOrderByUpdatedAtDesc(studentId).stream()
                .map(this::toAlumniConversation)
                .toList();
    }

    /** Every alumni account, with how many students it is talking to. */
    @Transactional(readOnly = true)
    public List<AlumniRadarRow> radar() {
        return profiles.findAllByOrderByGradYearDescUserDisplayNameAsc().stream()
                .map(profile -> {
                    int students = studentCount(profile.getUserId());
                    return new AlumniRadarRow(Names.initials(profile.getUser().getDisplayName()),
                            profile.nameWithClass(), profile.getSchool(), profile.getJobTitle(),
                            profile.getCity(), students, matchLabel(students));
                })
                .toList();
    }

    /** The advisor's alumni database: every alumni account and its profile. */
    @Transactional(readOnly = true)
    public List<AlumniEntry> directory() {
        return profiles.findAllByOrderByGradYearDescUserDisplayNameAsc().stream()
                .map(profile -> {
                    User user = profile.getUser();
                    return new AlumniEntry(user.getId(), user.getDisplayName(), Names.initials(user.getDisplayName()),
                            user.getEmail(), profile.getSchool(), profile.getGradYear(), profile.getJobTitle(),
                            profile.getCity(), studentCount(user.getId()));
                })
                .toList();
    }

    public Optional<AlumniProfile> profile(long userId) {
        return profiles.findById(userId);
    }

    /** A student's threads for their account page, each named by the alum. */
    @Transactional(readOnly = true)
    public List<AccountConversation> accountConversationsForStudent(long studentId) {
        return conversations.findByStudentIdOrderByUpdatedAtDesc(studentId).stream()
                .map(c -> accountConversation(c, c.getAlumnus()))
                .toList();
    }

    /** An alum's threads for their account page, each named by the student. */
    @Transactional(readOnly = true)
    public List<AccountConversation> accountConversationsForAlumnus(long alumnusId) {
        return conversations.findByAlumnusIdOrderByUpdatedAtDesc(alumnusId).stream()
                .map(c -> accountConversation(c, c.getStudent()))
                .toList();
    }

    private AccountConversation accountConversation(Conversation conversation, User other) {
        return new AccountConversation(conversation.getId(), other.getDisplayName(), conversation.getStatus(),
                statusLabel(conversation.getStatus()), conversation.getSnippet());
    }

    private AlumniConversation toAlumniConversation(Conversation conversation) {
        User alum = conversation.getAlumnus();
        Optional<AlumniProfile> profile = profiles.findById(alum.getId());
        String role = profile
                .map(p -> schoolName(p) + " '" + String.format("%02d", p.getGradYear() % 100) + " · " + p.getJobTitle())
                .orElse("Tulane alum");
        String status = conversation.getStatus();
        return new AlumniConversation(Names.initials(alum.getDisplayName()), alum.getDisplayName(), role,
                conversation.getSnippet(), prefix(status), status, statusLabel(status),
                profile.map(AlumniProfile::getCity).orElse(""), ago(conversation.getUpdatedAt()),
                conversation.isUnread());
    }

    private int studentCount(long alumnusId) {
        return (int) conversations.findByAlumnusIdOrderByUpdatedAtDesc(alumnusId).stream()
                .map(c -> c.getStudent().getId())
                .distinct()
                .count();
    }

    /** "Freeman · Finance" is shown as "Freeman" next to a class year. */
    private static String schoolName(AlumniProfile profile) {
        return profile.getSchool().split(" · ")[0];
    }

    static String statusLabel(String status) {
        return switch (status) {
            case "reply" -> "Replied";
            case "sent" -> "Sent";
            case "draft" -> "Draft ready";
            case "warm" -> "Reply owed";
            default -> status;
        };
    }

    private static String prefix(String status) {
        return switch (status) {
            case "sent" -> "You:";
            case "draft" -> "Draft:";
            default -> null;
        };
    }

    private static String matchLabel(int students) {
        return switch (students) {
            case 0 -> "0 matches";
            case 1 -> "1 student";
            default -> students + " students";
        };
    }

    /** "12 min", "4h", "Yesterday", "3d": how long ago, the way the inbox shows it. */
    String ago(OffsetDateTime when) {
        Duration elapsed = Duration.between(when, OffsetDateTime.now(clock));
        if (elapsed.toMinutes() < 1) return "Just now";
        if (elapsed.toHours() < 1) return elapsed.toMinutes() + " min";
        if (elapsed.toDays() < 1) return elapsed.toHours() + "h";
        if (elapsed.toDays() == 1) return "Yesterday";
        return elapsed.toDays() + "d";
    }
}
