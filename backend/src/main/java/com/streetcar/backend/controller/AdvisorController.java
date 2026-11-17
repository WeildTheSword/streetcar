package com.streetcar.backend.controller;

import com.streetcar.backend.model.AdvisorDashboard;
import com.streetcar.backend.service.AdvisorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.streetcar.backend.model.AuthenticatedUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/advisors")
public class AdvisorController {

    private final AdvisorService advisorService;

    public AdvisorController(AdvisorService advisorService) {
        this.advisorService = advisorService;
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<AdvisorDashboard> getDashboard(@PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser who) {
        return advisorService.getDashboard(id, who)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
