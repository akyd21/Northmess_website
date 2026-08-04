package com.northmess.response;

import com.northmess.entity.Payment;
import com.northmess.entity.Student;
import com.northmess.entity.enums.PaymentStatus;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PaymentResponse {
    private String id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
    private Double amount;
    private String currency;
    private String receipt;
    private String transactionId;
    private String verifiedBy;
    private PaymentStatus status;
    private StudentSummaryResponse student;
    private Integer month;
    private Integer year;
    private Instant createdAt;
    private Instant updatedAt;

    public static PaymentResponse from(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());
        response.setRazorpayPaymentId(payment.getRazorpayPaymentId());
        response.setRazorpaySignature(payment.getRazorpaySignature());
        response.setAmount(payment.getAmount());
        response.setCurrency(payment.getCurrency());
        response.setReceipt(payment.getReceipt());
        response.setTransactionId(payment.getTransactionId());
        response.setVerifiedBy(payment.getVerifiedBy());
        response.setStatus(payment.getStatus());
        response.setStudent(resolveStudentSummary(payment));
        response.setMonth(payment.getMonth());
        response.setYear(payment.getYear());
        response.setCreatedAt(payment.getCreatedAt());
        response.setUpdatedAt(payment.getUpdatedAt());
        return response;
    }

    public static List<PaymentResponse> fromList(List<Payment> payments) {
        List<PaymentResponse> responses = new ArrayList<>();
        for (Payment payment : payments) {
            responses.add(from(payment));
        }
        return responses;
    }

    private static StudentSummaryResponse resolveStudentSummary(Payment payment) {
        try {
            return toStudentSummary(payment.getStudent());
        } catch (Exception ignored) {
            return null;
        }
    }

    private static StudentSummaryResponse toStudentSummary(Student student) {
        if (student == null) {
            return null;
        }

        StudentSummaryResponse response = new StudentSummaryResponse();
        response.setId(student.getId());
        response.setName(student.getName());
        response.setRollNumber(student.getRollNumber());
        response.setDepartment(student.getDepartment());
        response.setYear(student.getYear());
        response.setEmail(student.getEmail());
        response.setPhone(student.getPhone());
        response.setHostelRoom(student.getHostelRoom());
        return response;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getReceipt() { return receipt; }
    public void setReceipt(String receipt) { this.receipt = receipt; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public StudentSummaryResponse getStudent() { return student; }
    public void setStudent(StudentSummaryResponse student) { this.student = student; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}