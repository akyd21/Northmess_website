package com.northmess.service;

import com.northmess.entity.Complaint;
import com.northmess.entity.enums.ComplaintStatus;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.ComplaintRepository;
import com.northmess.repository.StudentRepository;
import com.northmess.request.ComplaintStatusRequest;
import com.northmess.security.UserPrincipal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;

    public Complaint submit(Complaint request, UserPrincipal principal) {
        var student = studentRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Complaint complaint = new Complaint();
        complaint.setStudentId(student.getId());
        complaint.setStudentName(student.getName());
        complaint.setCategory(request.getCategory());
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setStatus(ComplaintStatus.PENDING);
        complaint.setCreatedAt(Instant.now());
        complaint.setUpdatedAt(Instant.now());
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAll(String status) {
        List<Complaint> complaints = status == null || status.isBlank()
                ? complaintRepository.findAll()
                : complaintRepository.findByStatus(ComplaintStatus.valueOf(status.toUpperCase()));
        return complaints.stream().sorted(Comparator.comparing(Complaint::getCreatedAt).reversed()).toList();
    }

    public List<Complaint> getMy(UserPrincipal principal) {
        return complaintRepository.findByStudentIdOrderByCreatedAtDesc(principal.getId());
    }

    public Complaint updateStatus(String id, ComplaintStatusRequest request, UserPrincipal principal) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        ComplaintStatus status = ComplaintStatus.valueOf(request.status().toUpperCase());
        complaint.setStatus(status);
        if (request.adminResponse() != null) {
            complaint.setAdminResponse(request.adminResponse());
        }
        complaint.setUpdatedAt(Instant.now());
        if (status == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(Instant.now());
        }
        return complaintRepository.save(complaint);
    }
}