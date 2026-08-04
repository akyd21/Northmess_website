package com.northmess.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendDeletionEmail(String toEmail, String studentName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Account Removed - North Mess Management");
            message.setText("Dear " + studentName + ",\n\n"
                    + "This email is to inform you that you are no longer a member of the North Mess. "
                    + "Your account and registration details have been removed by the administrator.\n\n"
                    + "If you have any questions, please contact the Mess Secretary.\n\n"
                    + "Best regards,\nNorth Mess Administration");
            
            mailSender.send(message);
            log.info("Sent deletion email to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}", toEmail, e);
        }
    }
}
