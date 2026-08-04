package com.northmess.service;

import com.northmess.entity.Payment;
import com.northmess.entity.Student;
import com.northmess.entity.enums.PaymentStatus;
import com.northmess.exception.BadRequestException;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.PaymentRepository;
import com.northmess.repository.StudentRepository;
import com.northmess.request.PaymentRequest;
import com.northmess.request.PaymentVerificationRequest;
import com.northmess.security.UserPrincipal;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(PaymentRepository paymentRepository, StudentRepository studentRepository) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
    }

    public Payment createOrder(UserPrincipal principal, PaymentRequest request) {
        Student student = studentRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (request.getAmount() * 100)); // amount in paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "receipt_" + System.currentTimeMillis());
            
            Order order = client.orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(request.getAmount());
            payment.setStatus(PaymentStatus.PENDING);
            payment.setStudent(student);
            payment.setMonth(request.getMonth());
            payment.setYear(request.getYear());
            payment.setCreatedAt(Instant.now());
            payment.setUpdatedAt(Instant.now());

            return paymentRepository.save(payment);

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    public Payment verifyPayment(UserPrincipal principal, PaymentVerificationRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getStudent().getId().equals(principal.getId())) {
            throw new BadRequestException("Unauthorized access to payment");
        }

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isValid) {
                payment.setStatus(PaymentStatus.PAID);
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setUpdatedAt(Instant.now());
                return paymentRepository.save(payment);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setUpdatedAt(Instant.now());
                paymentRepository.save(payment);
                throw new BadRequestException("Payment verification failed");
            }
        } catch (RazorpayException e) {
            throw new RuntimeException("Error verifying Razorpay signature: " + e.getMessage());
        }
    }

    public List<Payment> getMyPayments(UserPrincipal principal) {
        return paymentRepository.findByStudentId(principal.getId());
    }
}
