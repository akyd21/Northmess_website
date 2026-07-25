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
@Document(collection = "admins")
public class Admin {
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;

    @JsonIgnore
    private String password;

    private UserRole role = UserRole.ADMIN;
    private ApprovalStatus status = ApprovalStatus.APPROVED;
    private String department;
    private String message;
    private Instant createdAt;
    private Instant updatedAt;
}