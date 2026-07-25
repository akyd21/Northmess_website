package com.northmess.service;

import com.northmess.entity.Student;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.StudentRepository;
import com.northmess.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;

    public List<Student> getAll(String status, String q) {
        if (q != null && !q.isBlank()) {
            return studentRepository.findByNameContainingIgnoreCaseOrRollNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, q);
        }
        if (status != null && !status.isBlank()) {
            return studentRepository.findByStatus(ApprovalStatus.valueOf(status.toUpperCase()));
        }
        return studentRepository.findAll();
    }

    public Student getById(String id) {
        return studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    }

    public Student approve(String id, UserPrincipal principal) {
        Student student = getById(id);
        student.setStatus(ApprovalStatus.APPROVED);
        student.setActive(true);
        student.setApprovedBy(principal.getName());
        student.setApprovedAt(Instant.now());
        student.setUpdatedAt(Instant.now());
        return studentRepository.save(student);
    }

    public Student reject(String id, UserPrincipal principal) {
        Student student = getById(id);
        student.setStatus(ApprovalStatus.REJECTED);
        student.setApprovedBy(principal.getName());
        student.setUpdatedAt(Instant.now());
        return studentRepository.save(student);
    }

    public void delete(String id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found");
        }
        studentRepository.deleteById(id);
    }
}