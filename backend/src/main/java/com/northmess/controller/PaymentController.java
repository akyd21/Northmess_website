package com.northmess.controller;

import com.northmess.entity.Payment;
import com.northmess.request.PaymentRequest;
import com.northmess.request.PaymentVerificationRequest;
import com.northmess.security.UserPrincipal;
import com.northmess.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public Payment createOrder(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody PaymentRequest request) {
        return paymentService.createOrder(principal, request);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public Payment verifyPayment(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody PaymentVerificationRequest request) {
        return paymentService.verifyPayment(principal, request);
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Payment> getMyPayments(@AuthenticationPrincipal UserPrincipal principal) {
        return paymentService.getMyPayments(principal);
    }
    
    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayKeyId);
        return config;
    }
}
