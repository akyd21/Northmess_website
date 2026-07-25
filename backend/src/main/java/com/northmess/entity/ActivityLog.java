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
@Document(collection = "activity_logs")
public class ActivityLog {
    @Id
    private String id;
    private String actorId;
    private String actorName;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private Instant createdAt;
}