package com.streetcar.backend.controller;

import com.streetcar.backend.model.Submission;
import com.streetcar.backend.service.SubmissionService;
import com.streetcar.backend.service.SubmissionValidator;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/submissions")
public class SubmissionController {
    private final SubmissionService service;
    private final SubmissionValidator validator;

    public SubmissionController(SubmissionService service, SubmissionValidator validator) {
        this.service = service;
        this.validator = validator;
    }

    @GetMapping
    public List<Submission> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Submission getById(@PathVariable long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Submission create(@RequestBody Submission input) {
        validator.validate(input);
        return service.create(input);
    }

    @PutMapping("/{id}")
    public Submission update(@PathVariable long id, @RequestBody Submission input) {
        validator.validate(input);
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        service.delete(id);
    }

    @ExceptionHandler({IllegalArgumentException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<Map<String, String>> invalidInput() {
        return ResponseEntity.badRequest().body(Map.of("message", SubmissionValidator.RULES));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Submission not found."));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, String>> databaseError() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("message", "Unable to access submissions. Please try again later."));
    }
}
