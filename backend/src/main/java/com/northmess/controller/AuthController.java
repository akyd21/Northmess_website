package com.northmess.controller;

import com.northmess.request.LoginRequest;
import com.northmess.request.ProfileUpdateRequest;
import com.northmess.request.RegisterRequest;
import com.northmess.security.UserPrincipal;
import com.northmess.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public Object register(@Valid @ModelAttribute RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public Object me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.currentUser(principal);
    }

    @PutMapping(value = "/profile", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public Object updateProfile(@AuthenticationPrincipal UserPrincipal principal, @ModelAttribute ProfileUpdateRequest request) {
        return authService.updateProfile(principal, request);
    }
}