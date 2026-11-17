package com.streetcar.backend.controller;

import com.streetcar.backend.model.StudentAccount;
import com.streetcar.backend.model.StudentSummary;
import com.streetcar.backend.service.StudentDirectoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/** Lets an advisor list every student account and open one. Advisor-only, enforced in SecurityConfig. */
@RestController
@RequestMapping("/advisor/students")
public class StudentDirectoryController {
    private final StudentDirectoryService service;

    public StudentDirectoryController(StudentDirectoryService service) {
        this.service = service;
    }

    @GetMapping
    public List<StudentSummary> listStudents() {
        return service.listStudents();
    }

    @GetMapping("/{id}")
    public StudentAccount getStudent(@PathVariable long id) {
        return service.getStudent(id);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Student not found."));
    }
}
