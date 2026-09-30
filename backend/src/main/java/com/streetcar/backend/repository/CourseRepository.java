package com.streetcar.backend.repository;

import com.streetcar.backend.model.Course;

import java.util.List;

/**
 * Where courses come from. Services depend on this interface rather than on a
 * particular store, so the catalogue can move to the database without touching
 * them. See the design pattern register in README.md.
 */
public interface CourseRepository {
    List<Course> findAll();
}
