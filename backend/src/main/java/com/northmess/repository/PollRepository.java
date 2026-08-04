package com.northmess.repository;

import com.northmess.entity.Poll;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PollRepository extends MongoRepository<Poll, String> {
    List<Poll> findByStatusOrderByCreatedAtDesc(String status);
}
