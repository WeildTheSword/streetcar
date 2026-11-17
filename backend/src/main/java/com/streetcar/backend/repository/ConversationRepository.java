package com.streetcar.backend.repository;

import com.streetcar.backend.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByStudentIdOrderByUpdatedAtDesc(Long studentId);

    List<Conversation> findByAlumnusIdOrderByUpdatedAtDesc(Long alumnusId);

    boolean existsByStudentIdAndAlumnusId(Long studentId, Long alumnusId);
}
