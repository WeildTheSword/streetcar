package com.streetcar.backend.repository;

import com.streetcar.backend.model.AlumniProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long> {
    /** Most recent graduates first, then by name. */
    List<AlumniProfile> findAllByOrderByGradYearDescUserDisplayNameAsc();
}
