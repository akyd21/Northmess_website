package com.northmess.repository;

import com.northmess.entity.GalleryImage;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GalleryRepository extends MongoRepository<GalleryImage, String> {
    List<GalleryImage> findAllByOrderByUploadedAtDesc();
}