package com.northmess.repository;

import com.northmess.entity.Staff;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface StaffRepository extends MongoRepository<Staff, String> {
    List<Staff> findAllByOrderByCreatedAtDesc();
}