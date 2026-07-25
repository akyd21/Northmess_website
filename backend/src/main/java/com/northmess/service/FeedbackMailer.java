package com.northmess.service;

import com.northmess.config.AppProperties;
import com.northmess.entity.Feedback;
import com.northmess.entity.Student;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackMailer {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final AppProperties appProperties;

    public void sendFeedbackEmail(Feedback feedback, Student student) {
        if (!appProperties.getMail().isEnabled()) {
            log.info("Feedback mail skipped because mail is disabled");
            return;
        }

        try {
            Context context = new Context();
            context.setVariable("studentName", student.getName());
            context.setVariable("rollNumber", student.getRollNumber());
            context.setVariable("weekLabel", feedback.getWeekLabel());
            context.setVariable("comments", feedback.getComments());
            context.setVariable("submittedAt", DateTimeFormatter.ISO_INSTANT.format(feedback.getCreatedAt()));

            Map<String, Integer> ratings = new LinkedHashMap<>();
            ratings.put("Food Quality", feedback.getFoodQuality());
            ratings.put("Taste", feedback.getTaste());
            ratings.put("Hygiene", feedback.getHygiene());
            ratings.put("Quantity", feedback.getQuantity());
            ratings.put("Staff Behaviour", feedback.getStaffBehaviour());
            ratings.put("Cleanliness", feedback.getCleanliness());
            context.setVariable("ratings", ratings);

            String html = templateEngine.process("feedback-email", context);
            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setTo(appProperties.getMail().getRecipientEmail());
            helper.setFrom(appProperties.getMail().getFromAddress());
            helper.setSubject("New North Mess Feedback Submitted");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception exception) {
            log.warn("Failed to send feedback email: {}", exception.getMessage());
        }
    }
}