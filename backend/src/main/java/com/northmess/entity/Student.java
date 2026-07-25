package com.northmess.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.entity.enums.UserRole;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "students")
public class Student {
    @Id
    private String id;
    private String name;
    private String rollNumber;
    private String department;
    private String year;
    private String email;
    private String phone;
    private String hostelRoom;

    @JsonIgnore
    private String password;

    private String photoUrl;
    private String idCardUrl;
    private UserRole role = UserRole.STUDENT;
    private ApprovalStatus status = ApprovalStatus.PENDING;
    private boolean active = true;
    private String approvedBy;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant approvedAt;
}