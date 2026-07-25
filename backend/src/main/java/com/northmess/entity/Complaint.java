package com.northmess.entity;

import com.northmess.entity.enums.ComplaintStatus;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "complaints")
public class Complaint {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String category;
    private String title;
    private String description;
    private ComplaintStatus status = ComplaintStatus.PENDING;
    private String adminResponse;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant resolvedAt;
}