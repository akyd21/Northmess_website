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
@Document(collection = "announcements")
public class Announcement {
    @Id
    private String id;
    private String title;
    private String message;
    private String category;
    private boolean pinned;
    private boolean active = true;
    private String createdBy;
    private String createdByName;
    private Instant createdAt;
    private Instant updatedAt;
}