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
import com.northmess.response.PaymentResponse;
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
import java.io.InputStream;
import java.util.ArrayList;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.web.multipart.MultipartFile;
import com.northmess.request.TransactionSubmitRequest;
import com.northmess.request.VerifyTransactionRequest;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import java.io.ByteArrayOutputStream;

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

    public PaymentResponse createOrder(UserPrincipal principal, PaymentRequest request) {
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

            return PaymentResponse.from(paymentRepository.save(payment));

        } catch (RazorpayException e) {
            throw new RuntimeException("Error creating Razorpay order: " + e.getMessage());
        }
    }

    public PaymentResponse verifyPayment(UserPrincipal principal, PaymentVerificationRequest request) {
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
                return PaymentResponse.from(paymentRepository.save(payment));
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

    public List<PaymentResponse> getMyPayments(UserPrincipal principal) {
        return PaymentResponse.fromList(paymentRepository.findByStudentId(principal.getId()));
    }

    public List<PaymentResponse> uploadDues(MultipartFile file, Integer month, Integer year) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please upload a non-empty Excel file");
        }

        if (month == null || year == null) {
            throw new BadRequestException("Month and year are required");
        }

        List<PaymentResponse> createdPayments = new ArrayList<>();
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            if (workbook.getNumberOfSheets() == 0) {
                throw new BadRequestException("Excel file does not contain any sheets");
            }

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header

                String rollNumber = formatter.formatCellValue(row.getCell(0)).trim();
                String amountText = formatter.formatCellValue(row.getCell(1)).trim();

                if (rollNumber.isBlank() && amountText.isBlank()) {
                    continue;
                }

                if (rollNumber.isBlank()) {
                    throw new BadRequestException("Missing roll number in row " + (row.getRowNum() + 1));
                }
                if (amountText.isBlank()) {
                    throw new BadRequestException("Missing amount in row " + (row.getRowNum() + 1));
                }

                double amount;
                try {
                    amount = Double.parseDouble(amountText.replaceAll("[^0-9.-]", ""));
                } catch (NumberFormatException exception) {
                    throw new BadRequestException("Invalid amount in row " + (row.getRowNum() + 1) + ": " + amountText);
                }

                Student student = studentRepository.findByRollNumberIgnoreCase(rollNumber)
                        .orElseThrow(() -> new BadRequestException("Student not found for roll number: " + rollNumber));

                Payment payment = new Payment();
                payment.setAmount(amount);
                payment.setStatus(PaymentStatus.PENDING);
                payment.setStudent(student);
                payment.setMonth(month);
                payment.setYear(year);
                payment.setCreatedAt(Instant.now());
                payment.setUpdatedAt(Instant.now());
                createdPayments.add(PaymentResponse.from(paymentRepository.save(payment)));
            }
        } catch (Exception e) {
            if (e instanceof BadRequestException badRequestException) {
                throw badRequestException;
            }
            throw new BadRequestException("Failed to process Excel file: " + e.getMessage());
        }
        return createdPayments;
    }

    public Payment submitTransaction(UserPrincipal principal, String paymentId, TransactionSubmitRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getStudent().getId().equals(principal.getId())) {
            throw new BadRequestException("Unauthorized access to payment");
        }

        payment.setTransactionId(request.getTransactionId());
        payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
        payment.setUpdatedAt(Instant.now());
        return paymentRepository.save(payment);
    }

    public List<PaymentResponse> getPendingVerifications() {
        return PaymentResponse.fromList(paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION));
    }

    public PaymentResponse verifyTransaction(UserPrincipal principal, String paymentId, VerifyTransactionRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (request.getApproved()) {
            payment.setStatus(PaymentStatus.PAID);
            payment.setVerifiedBy(principal.getName());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
        }
        payment.setUpdatedAt(Instant.now());
        return PaymentResponse.from(paymentRepository.save(payment));
    }

    public byte[] generateReceiptPdf(String paymentId, UserPrincipal principal) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        
        if (!payment.getStudent().getId().equals(principal.getId()) && !principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
             throw new BadRequestException("Unauthorized access to receipt");
        }

        if (payment.getStatus() != PaymentStatus.PAID) {
             throw new BadRequestException("Payment is not PAID yet");
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            document.add(new Paragraph("North Mess Management System", titleFont));
            document.add(new Paragraph("Payment Receipt", titleFont));
            document.add(new Paragraph("--------------------------------------------------", regularFont));
            
            document.add(new Paragraph("Payment ID: " + payment.getId(), regularFont));
            document.add(new Paragraph("Transaction ID: " + payment.getTransactionId(), regularFont));
            document.add(new Paragraph("Student Name: " + payment.getStudent().getName(), regularFont));
            document.add(new Paragraph("Roll Number: " + payment.getStudent().getRollNumber(), regularFont));
            document.add(new Paragraph("Amount Paid: " + payment.getCurrency() + " " + payment.getAmount(), regularFont));
            document.add(new Paragraph("Month/Year: " + payment.getMonth() + "/" + payment.getYear(), regularFont));
            document.add(new Paragraph("Status: " + payment.getStatus(), regularFont));
            if (payment.getVerifiedBy() != null) {
                document.add(new Paragraph("Verified By: " + payment.getVerifiedBy(), regularFont));
            }
            document.add(new Paragraph("Date: " + payment.getUpdatedAt(), regularFont));
            
            document.add(new Paragraph("--------------------------------------------------", regularFont));
            document.add(new Paragraph("Thank you!", regularFont));
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF: " + e.getMessage());
        }
    }
}
