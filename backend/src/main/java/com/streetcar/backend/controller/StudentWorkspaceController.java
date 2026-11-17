package com.streetcar.backend.controller;

import com.streetcar.backend.model.AccountInfo.AccountAppointment;
import com.streetcar.backend.model.AlumniContact;
import com.streetcar.backend.model.ApplicationEntry;
import com.streetcar.backend.model.ApplicationRequest;
import com.streetcar.backend.model.AuthenticatedUser;
import com.streetcar.backend.model.ConversationRequest;
import com.streetcar.backend.model.ResumeEntry;
import com.streetcar.backend.model.ResumeRequest;
import com.streetcar.backend.model.StudentWorkspaceSummary;
import com.streetcar.backend.service.ApplicationService;
import com.streetcar.backend.service.ConflictException;
import com.streetcar.backend.service.ResumeService;
import com.streetcar.backend.service.StudentWorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * The signed-in student's own tabs. Student-only, enforced in SecurityConfig;
 * every read and write is scoped to the id in the student's token.
 */
@RestController
@RequestMapping("/me")
public class StudentWorkspaceController {
    private final StudentWorkspaceService workspace;
    private final ApplicationService applications;
    private final ResumeService resumes;

    public StudentWorkspaceController(StudentWorkspaceService workspace, ApplicationService applications,
                                      ResumeService resumes) {
        this.workspace = workspace;
        this.applications = applications;
        this.resumes = resumes;
    }

    @GetMapping("/summary")
    public StudentWorkspaceSummary summary(@AuthenticationPrincipal AuthenticatedUser who) {
        return workspace.summary(who.id());
    }

    @GetMapping("/appointments")
    public List<AccountAppointment> appointments(@AuthenticationPrincipal AuthenticatedUser who) {
        return workspace.appointments(who.id());
    }

    @GetMapping("/alumni")
    public List<AlumniContact> alumni(@AuthenticationPrincipal AuthenticatedUser who) {
        return workspace.alumni(who.id());
    }

    @PostMapping("/alumni/{alumId}/conversations")
    @ResponseStatus(HttpStatus.CREATED)
    public AlumniContact startConversation(@PathVariable long alumId, @RequestBody ConversationRequest request,
                                           @AuthenticationPrincipal AuthenticatedUser who) {
        return workspace.startConversation(who.id(), alumId, request == null ? null : request.message());
    }

    @GetMapping("/applications")
    public List<ApplicationEntry> applications(@AuthenticationPrincipal AuthenticatedUser who) {
        return applications.forStudent(who.id());
    }

    @PostMapping("/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationEntry createApplication(@RequestBody ApplicationRequest request,
                                              @AuthenticationPrincipal AuthenticatedUser who) {
        return applications.create(who.id(), request);
    }

    @PutMapping("/applications/{id}")
    public ApplicationEntry updateApplication(@PathVariable long id, @RequestBody ApplicationRequest request,
                                              @AuthenticationPrincipal AuthenticatedUser who) {
        return applications.update(who.id(), id, request);
    }

    @DeleteMapping("/applications/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteApplication(@PathVariable long id, @AuthenticationPrincipal AuthenticatedUser who) {
        applications.delete(who.id(), id);
    }

    @GetMapping("/resume")
    public ResumeEntry resume(@AuthenticationPrincipal AuthenticatedUser who) {
        return resumes.mine(who.id());
    }

    @PutMapping("/resume")
    public ResumeEntry saveResume(@RequestBody ResumeRequest request, @AuthenticationPrincipal AuthenticatedUser who) {
        return resumes.save(who.id(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> invalid(IllegalArgumentException error) {
        return ResponseEntity.badRequest().body(Map.of("message", error.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable() {
        return ResponseEntity.badRequest().body(Map.of("message", "That request could not be read."));
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound(NoSuchElementException error) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", error.getMessage()));
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<Map<String, String>> conflict(ConflictException error) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", error.getMessage()));
    }
}
