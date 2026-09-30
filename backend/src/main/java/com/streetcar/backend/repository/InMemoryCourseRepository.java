package com.streetcar.backend.repository;

import com.streetcar.backend.model.Course;
import org.springframework.stereotype.Repository;

import java.util.List;

/** The demo course catalogue, held in memory until courses move to the database. */
@Repository
public class InMemoryCourseRepository implements CourseRepository {

    private final List<Course> courses = List.of(
        new Course(1, "CMPS 1500", "Introduction to Computer Science",
            "Foundational programming concepts. Recommended for students pursuing software engineering."),
        new Course(2, "CMPS 2200", "Data Structures and Algorithms",
            "Core data structures and algorithmic analysis. Frequently required for technical interviews."),
        new Course(3, "BSAN 3010", "Business Analytics",
            "Data-driven decision making. Suits students exploring analytics career paths.")
    );

    @Override
    public List<Course> findAll() {
        return courses;
    }
}
