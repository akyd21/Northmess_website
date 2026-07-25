package com.northmess.controller;

import com.northmess.entity.Feedback;
import com.northmess.security.UserPrincipal;
import com.northmess.service.FeedbackService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Feedback submit(@RequestBody Feedback request, @AuthenticationPrincipal UserPrincipal principal) {
        return feedbackService.submit(request, principal);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Feedback> getAll() {
        return feedbackService.getAll();
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Feedback> getMy(@AuthenticationPrincipal UserPrincipal principal) {
        return feedbackService.getMy(principal);
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> analytics() {
        return feedbackService.analytics();
    }
}