package com.northmess.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String rollNumber;

    @NotBlank
    private String department;

    @NotBlank
    private String year;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String phone;

    @NotBlank
    private String hostelRoom;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String terms;
    private MultipartFile photo;
    private MultipartFile idCard;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getHostelRoom() { return hostelRoom; }
    public void setHostelRoom(String hostelRoom) { this.hostelRoom = hostelRoom; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }
    public MultipartFile getPhoto() { return photo; }
    public void setPhoto(MultipartFile photo) { this.photo = photo; }
    public MultipartFile getIdCard() { return idCard; }
    public void setIdCard(MultipartFile idCard) { this.idCard = idCard; }
}