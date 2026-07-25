package com.northmess.repository;

import com.northmess.entity.Announcement;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findAllByOrderByPinnedDescCreatedAtDesc();
}