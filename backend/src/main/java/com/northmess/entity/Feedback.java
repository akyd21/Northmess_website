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
@Document(collection = "feedback")
public class Feedback {
    @Id
    private String id;
    private String studentId;
    private String studentName;
    private String rollNumber;
    private String weekLabel;
    private int foodQuality;
    private int taste;
    private int hygiene;
    private int quantity;
    private int staffBehaviour;
    private int cleanliness;
    private String comments;
    private Instant createdAt;
}