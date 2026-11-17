package com.streetcar.backend.repository;

import com.streetcar.backend.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    /** Most recently applied first, then newest row first. */
    List<JobApplication> findByStudentIdOrderByAppliedOnDescIdDesc(Long studentId);

    long countByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);
}
