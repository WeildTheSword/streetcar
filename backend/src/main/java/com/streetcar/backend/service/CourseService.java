package com.streetcar.backend.service;

import com.streetcar.backend.model.Course;
import com.streetcar.backend.repository.CourseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courses;

    public CourseService(CourseRepository courses) {
        this.courses = courses;
    }

    public List<Course> getAllCourses() {
        return courses.findAll();
    }
}
