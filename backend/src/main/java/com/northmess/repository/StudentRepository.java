package com.northmess.repository;

import com.northmess.entity.Student;
import com.northmess.entity.enums.ApprovalStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByEmailIgnoreCase(String email);
    Optional<Student> findByRollNumberIgnoreCase(String rollNumber);
    List<Student> findByStatus(ApprovalStatus status);
    List<Student> findByStatusOrderByCreatedAtDesc(ApprovalStatus status);
    List<Student> findByNameContainingIgnoreCaseOrRollNumberContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String rollNumber, String email);
}