package com.northmess.repository;

import com.northmess.entity.Feedback;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByStudentIdOrderByCreatedAtDesc(String studentId);
}