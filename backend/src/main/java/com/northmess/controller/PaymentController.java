package com.northmess.controller;

import com.northmess.entity.Payment;
import com.northmess.request.PaymentRequest;
import com.northmess.request.PaymentVerificationRequest;
import com.northmess.security.UserPrincipal;
import com.northmess.service.PaymentService;
import com.northmess.response.PaymentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;
import com.northmess.request.TransactionSubmitRequest;
import com.northmess.request.VerifyTransactionRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    
    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public PaymentResponse createOrder(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody PaymentRequest request) {
        return paymentService.createOrder(principal, request);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public PaymentResponse verifyPayment(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody PaymentVerificationRequest request) {
        return paymentService.verifyPayment(principal, request);
    }

    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('STUDENT')")
    public List<PaymentResponse> getMyPayments(@AuthenticationPrincipal UserPrincipal principal) {
        return paymentService.getMyPayments(principal);
    }
    
    @GetMapping("/config")
    @PreAuthorize("isAuthenticated()")
    public Map<String, String> getConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayKeyId);
        return config;
    }

    @PostMapping("/admin/upload-dues")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> uploadDues(@RequestParam("file") MultipartFile file, @RequestParam("month") Integer month, @RequestParam("year") Integer year) {
        return paymentService.uploadDues(file, month, year);
    }

    @PostMapping("/{paymentId}/submit-transaction")
    @PreAuthorize("hasRole('STUDENT')")
    public Payment submitTransaction(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String paymentId, @Valid @RequestBody TransactionSubmitRequest request) {
        return paymentService.submitTransaction(principal, paymentId, request);
    }

    @GetMapping("/admin/pending-verifications")
    @PreAuthorize("hasRole('ADMIN')")
    public List<PaymentResponse> getPendingVerifications() {
        return paymentService.getPendingVerifications();
    }

    @PostMapping("/admin/verify/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public PaymentResponse verifyTransaction(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String paymentId, @Valid @RequestBody VerifyTransactionRequest request) {
        return paymentService.verifyTransaction(principal, paymentId, request);
    }

    @GetMapping("/{paymentId}/receipt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadReceipt(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String paymentId) {
        byte[] pdfBytes = paymentService.generateReceiptPdf(paymentId, principal);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt_" + paymentId + ".pdf");
        return ResponseEntity.ok().headers(headers).body(pdfBytes);
    }
}
