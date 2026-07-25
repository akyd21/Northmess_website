package com.northmess.repository;

import com.northmess.entity.ActivityLog;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc();
}