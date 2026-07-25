package com.northmess.repository;

import com.northmess.entity.Complaint;
import com.northmess.entity.enums.ComplaintStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ComplaintRepository extends MongoRepository<Complaint, String> {
    List<Complaint> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<Complaint> findByStatus(ComplaintStatus status);
}