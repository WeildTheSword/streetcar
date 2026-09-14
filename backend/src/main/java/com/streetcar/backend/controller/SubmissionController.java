package com.streetcar.backend.controller;

import com.streetcar.backend.model.Submission;
import com.streetcar.backend.service.SubmissionService;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {
    private final SubmissionService service;

    public SubmissionController(SubmissionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Submission> getAll() {
        return service.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Submission create(@RequestBody Submission input) {
        if (input.gpa() == null || input.gpa().compareTo(BigDecimal.ZERO) < 0
                || input.gpa().compareTo(new BigDecimal("4")) > 0
                || input.gpa().stripTrailingZeros().scale() > 2
                || !validText(input.completedCourses(), 2000)
                || !validText(input.major(), 120) || !validText(input.careerGoal(), 200)) {
            throw new IllegalArgumentException();
        }
        return service.create(input);
    }

    private boolean validText(String value, int max) {
        return value != null && !value.isBlank() && value.strip().length() <= max;
    }

    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<Map<String, String>> invalidInput() {
        return ResponseEntity.badRequest().body(Map.of("message",
                "Provide GPA (0–4, at most two decimals), completed courses (up to 2000 characters), "
                + "major (up to 120), and career goal (up to 200)."));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> databaseError() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Unable to access submissions. Please try again later."));
    }
}
