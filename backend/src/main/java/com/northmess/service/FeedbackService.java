package com.northmess.service;

import com.northmess.entity.Feedback;
import com.northmess.entity.Student;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.FeedbackRepository;
import com.northmess.repository.StudentRepository;
import com.northmess.security.UserPrincipal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;
    private final FeedbackMailer feedbackMailer;

    public Feedback submit(Feedback request, UserPrincipal principal) {
        Student student = studentRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Feedback feedback = new Feedback();
        feedback.setStudentId(student.getId());
        feedback.setStudentName(student.getName());
        feedback.setRollNumber(student.getRollNumber());
        feedback.setWeekLabel(buildWeekLabel());
        feedback.setFoodQuality(request.getFoodQuality());
        feedback.setTaste(request.getTaste());
        feedback.setHygiene(request.getHygiene());
        feedback.setQuantity(request.getQuantity());
        feedback.setStaffBehaviour(request.getStaffBehaviour());
        feedback.setCleanliness(request.getCleanliness());
        feedback.setComments(request.getComments());
        feedback.setCreatedAt(Instant.now());

        Feedback saved = feedbackRepository.save(feedback);
        feedbackMailer.sendFeedbackEmail(saved, student);
        return saved;
    }

    public List<Feedback> getAll() {
        return feedbackRepository.findAll().stream()
                .sorted(Comparator.comparing(Feedback::getCreatedAt).reversed())
                .toList();
    }

    public List<Feedback> getMy(UserPrincipal principal) {
        return feedbackRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId());
    }

    public Map<String, Object> analytics() {
        List<Feedback> feedbacks = getAll();
        Map<String, Object> result = new HashMap<>();
        result.put("totalFeedback", feedbacks.size());
        result.put("averageFoodQuality", average(feedbacks, Feedback::getFoodQuality));
        result.put("averageTaste", average(feedbacks, Feedback::getTaste));
        result.put("averageHygiene", average(feedbacks, Feedback::getHygiene));
        result.put("averageQuantity", average(feedbacks, Feedback::getQuantity));
        result.put("averageStaffBehaviour", average(feedbacks, Feedback::getStaffBehaviour));
        result.put("averageCleanliness", average(feedbacks, Feedback::getCleanliness));
        result.put("latestFeedback", feedbacks.stream().limit(5).toList());
        return result;
    }

    private String buildWeekLabel() {
        LocalDate today = LocalDate.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = today.get(weekFields.weekOfWeekBasedYear());
        LocalDate start = today.minusDays(today.getDayOfWeek().getValue() % 7L);
        LocalDate end = start.plusDays(6);
        return "Week " + weekNumber + " (" + start + " - " + end + ")";
    }

    private double average(List<Feedback> feedbacks, java.util.function.ToIntFunction<Feedback> mapper) {
        return feedbacks.isEmpty() ? 0.0 : feedbacks.stream().mapToInt(mapper).average().orElse(0.0);
    }
}