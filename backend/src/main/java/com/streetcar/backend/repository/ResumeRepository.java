package com.streetcar.backend.repository;

import com.streetcar.backend.model.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    /**
     * Overwrites the account's resume in place and returns how many rows changed,
     * 0 when the account has none yet. Resume has no setters, so this is how a
     * second save replaces the first.
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Resume r set r.headline = :headline, r.summary = :summary, r.experience = :experience, "
            + "r.skills = :skills, r.updatedAt = :updatedAt where r.userId = :userId")
    int replace(@Param("userId") Long userId, @Param("headline") String headline, @Param("summary") String summary,
                @Param("experience") String experience, @Param("skills") String skills,
                @Param("updatedAt") OffsetDateTime updatedAt);
}
