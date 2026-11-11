package com.streetcar.backend.repository;

import com.streetcar.backend.model.Course;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

/**
 * Where courses come from. Services depend on this interface rather than on a
 * particular store; Spring Data implements it against the "courses" table.
 * It extends the bare {@link Repository} so the catalogue stays read-only.
 * See the design pattern register in README.md.
 */
public interface CourseRepository extends Repository<Course, Integer> {

    /** Every course, in catalogue order. */
    @Query("select c from Course c order by c.id")
    List<Course> findAll();
}
