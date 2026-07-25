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
@Document(collection = "staff")
public class Staff {
    @Id
    private String id;
    private String name;
    private String role;
    private String department;
    private String phone;
    private String email;
    private String experience;
    private String specialDishes;
    private String workingSince;
    private String message;
    private String kind;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}