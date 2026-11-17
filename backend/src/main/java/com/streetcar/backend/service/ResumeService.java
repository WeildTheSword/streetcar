package com.streetcar.backend.service;

import com.streetcar.backend.model.Resume;
import com.streetcar.backend.model.ResumeEntry;
import com.streetcar.backend.model.ResumeRequest;
import com.streetcar.backend.model.User;
import com.streetcar.backend.repository.ResumeRepository;
import com.streetcar.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.NoSuchElementException;
import java.util.Optional;

/** A student's resume, read and saved by the student and read by an advisor. */
@Service
public class ResumeService {
    private final ResumeRepository resumes;
    private final UserRepository users;
    private final Clock clock;

    public ResumeService(ResumeRepository resumes, UserRepository users, Clock clock) {
        this.resumes = resumes;
        this.users = users;
        this.clock = clock;
    }

    /** The saved resume, if there is one. */
    @Transactional(readOnly = true)
    public Optional<ResumeEntry> find(long userId) {
        return resumes.findById(userId).map(ResumeService::entry);
    }

    /** The student's own resume, blank until they save one. */
    @Transactional(readOnly = true)
    public ResumeEntry mine(long userId) {
        return find(userId).orElseGet(ResumeEntry::blank);
    }

    /** Creates or replaces the student's resume. */
    @Transactional
    public ResumeEntry save(long userId, ResumeRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("A headline is required.");
        }
        String headline = text(request.headline(), "Headline", 200);
        if (headline.isEmpty()) {
            throw new IllegalArgumentException("A headline is required.");
        }
        String summary = text(request.summary(), "Summary", 2000);
        String experience = text(request.experience(), "Experience", 4000);
        String skills = text(request.skills(), "Skills", 1000);
        User user = users.findById(userId).orElseThrow(() -> new NoSuchElementException("Account not found."));
        OffsetDateTime now = OffsetDateTime.now(clock).truncatedTo(ChronoUnit.MICROS);
        if (resumes.replace(userId, headline, summary, experience, skills, now) == 0) {
            resumes.save(new Resume(user, headline, summary, experience, skills, now));
        }
        return new ResumeEntry(headline, summary, experience, skills, now);
    }

    private static String text(String value, String field, int max) {
        String trimmed = value == null ? "" : value.strip();
        if (trimmed.length() > max) {
            throw new IllegalArgumentException(field + " must be " + max + " characters or fewer.");
        }
        return trimmed;
    }

    private static ResumeEntry entry(Resume resume) {
        return new ResumeEntry(resume.getHeadline(), resume.getSummary(), resume.getExperience(),
                resume.getSkills(), resume.getUpdatedAt());
    }
}
