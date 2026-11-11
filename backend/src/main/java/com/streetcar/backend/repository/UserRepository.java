package com.streetcar.backend.repository;

import com.streetcar.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /** Emails are stored trimmed and lower-cased, so look them up the same way. */
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Removes every account except the ones with these emails. */
    @Transactional
    @Modifying
    @Query("delete from User u where u.email not in :kept")
    void deleteAllExcept(@Param("kept") Collection<String> kept);
}
