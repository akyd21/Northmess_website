package com.northmess.request;

import org.springframework.web.multipart.MultipartFile;

public class StaffForm {
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
    private MultipartFile image;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getSpecialDishes() { return specialDishes; }
    public void setSpecialDishes(String specialDishes) { this.specialDishes = specialDishes; }
    public String getWorkingSince() { return workingSince; }
    public void setWorkingSince(String workingSince) { this.workingSince = workingSince; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}