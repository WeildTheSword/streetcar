package com.streetcar.backend.controller;

import com.streetcar.backend.model.AlumniEntry;
import com.streetcar.backend.model.AppointmentEntry;
import com.streetcar.backend.model.AppointmentRequest;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.service.AlumniService;
import com.streetcar.backend.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/** The advisor's appointments board and alumni database. Advisor-only, enforced in SecurityConfig. */
@RestController
@RequestMapping("/advisor")
public class AdvisorWorkspaceController {
    private final AppointmentService appointments;
    private final AlumniService alumni;

    public AdvisorWorkspaceController(AppointmentService appointments, AlumniService alumni) {
        this.appointments = appointments;
        this.alumni = alumni;
    }

    @GetMapping("/appointments")
    public List<AppointmentEntry> board(@AuthenticationPrincipal AuthenticatedUser who) {
        return appointments.board(who.id());
    }

    @PostMapping("/appointments")
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentEntry book(@RequestBody AppointmentRequest request,
                                 @AuthenticationPrincipal AuthenticatedUser who) {
        return appointments.book(who.id(), request);
    }

    @DeleteMapping("/appointments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable long id, @AuthenticationPrincipal AuthenticatedUser who) {
        appointments.cancel(who.id(), id);
    }

    @GetMapping("/alumni")
    public List<AlumniEntry> alumni() {
        return alumni.directory();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalid(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable() {
        return ResponseEntity.badRequest().body(Map.of("message", "A student and a start time are required."));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Appointment not found."));
    }
}
