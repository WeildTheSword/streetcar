package com.streetcar.backend.service;

import com.streetcar.backend.model.Course;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {
    public List<Course> getAllCourses() {
        return List.of(
            new Course(1, "CMPS 1500", "Introduction to Computer Science",
                "Foundational programming concepts. Recommended for students pursuing software engineering."),
            new Course(2, "CMPS 2200", "Data Structures and Algorithms",
                "Core data structures and algorithmic analysis. Frequently required for technical interviews."),
            new Course(3, "BSAN 3010", "Business Analytics",
                "Data-driven decision making. Suits students exploring analytics career paths.")
        );
    }
}