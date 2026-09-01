package com.streetcar.backend.controller;

import com.streetcar.backend.model.Course;
import com.streetcar.backend.service.CourseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
public class CourseController {
    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    public List<Course> getCourses() {
        return courseService.getAllCourses();
    }
}