package com.northmess.entity;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "gallery")
public class GalleryImage {
    @Id
    private String id;
    private String title;
    private String description;
    private String category;
    private String imageUrl;
    private String uploadedBy;
    private String uploadedByName;
    private Instant uploadedAt;
}