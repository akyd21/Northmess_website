package com.northmess.service;

import com.northmess.entity.Feedback;
import com.northmess.entity.Student;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.entity.enums.ComplaintStatus;
import com.northmess.repository.AnnouncementRepository;
import com.northmess.repository.ComplaintRepository;
import com.northmess.repository.FeedbackRepository;
import com.northmess.repository.StaffRepository;
import com.northmess.repository.StudentRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final StudentRepository studentRepository;
    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;
    private final AnnouncementRepository announcementRepository;
    private final StaffRepository staffRepository;

    public Map<String, Object> summary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalStudents", studentRepository.findByStatus(ApprovalStatus.APPROVED).size());
        summary.put("pendingStudents", studentRepository.findByStatus(ApprovalStatus.PENDING).size());
        summary.put("approvedStudents", studentRepository.findByStatus(ApprovalStatus.APPROVED).size());
        summary.put("rejectedStudents", studentRepository.findByStatus(ApprovalStatus.REJECTED).size());
        summary.put("totalFeedback", feedbackRepository.count());
        summary.put("totalComplaints", complaintRepository.count());
        summary.put("pendingComplaints", complaintRepository.findByStatus(ComplaintStatus.PENDING).size());
        summary.put("resolvedComplaints", complaintRepository.findByStatus(ComplaintStatus.RESOLVED).size());
        summary.put("totalAnnouncements", announcementRepository.count());
        summary.put("totalStaff", staffRepository.count());
        return summary;
    }

    public String studentsCsv() {
        StringBuilder builder = new StringBuilder("name,rollNumber,department,year,email,phone,status\n");
        for (Student student : studentRepository.findAll()) {
            builder.append(csv(student.getName())).append(',')
                    .append(csv(student.getRollNumber())).append(',')
                    .append(csv(student.getDepartment())).append(',')
                    .append(csv(student.getYear())).append(',')
                    .append(csv(student.getEmail())).append(',')
                    .append(csv(student.getPhone())).append(',')
                    .append(csv(String.valueOf(student.getStatus())))
                    .append('\n');
        }
        return builder.toString();
    }

    public String feedbackCsv() {
        StringBuilder builder = new StringBuilder("studentName,rollNumber,weekLabel,foodQuality,taste,hygiene,quantity,staffBehaviour,cleanliness,comments\n");
        for (Feedback feedback : feedbackRepository.findAll()) {
            builder.append(csv(feedback.getStudentName())).append(',')
                    .append(csv(feedback.getRollNumber())).append(',')
                    .append(csv(feedback.getWeekLabel())).append(',')
                    .append(feedback.getFoodQuality()).append(',')
                    .append(feedback.getTaste()).append(',')
                    .append(feedback.getHygiene()).append(',')
                    .append(feedback.getQuantity()).append(',')
                    .append(feedback.getStaffBehaviour()).append(',')
                    .append(feedback.getCleanliness()).append(',')
                    .append(csv(feedback.getComments()))
                    .append('\n');
        }
        return builder.toString();
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}