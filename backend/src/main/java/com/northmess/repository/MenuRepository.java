package com.northmess.repository;

import com.northmess.entity.Menu;
import com.northmess.entity.enums.DayOfWeekEnum;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuRepository extends MongoRepository<Menu, String> {
    Optional<Menu> findByDay(DayOfWeekEnum day);
}