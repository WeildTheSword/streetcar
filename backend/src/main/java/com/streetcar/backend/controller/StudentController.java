package com.streetcar.backend.controller;

import com.streetcar.backend.model.Student;
import com.streetcar.backend.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.streetcar.backend.model.AuthenticatedUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser who) {
        return studentService.getStudent(id, who)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/fingerprint")
    public ResponseEntity<Student> completeFingerprint(@PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser who) {
        return studentService.completeFingerprint(id, who)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
