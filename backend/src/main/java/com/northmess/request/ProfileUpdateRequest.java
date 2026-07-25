package com.northmess.request;

import org.springframework.web.multipart.MultipartFile;

public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String hostelRoom;
    private String department;
    private String year;
    private MultipartFile photo;
    private MultipartFile idCard;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getHostelRoom() { return hostelRoom; }
    public void setHostelRoom(String hostelRoom) { this.hostelRoom = hostelRoom; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public MultipartFile getPhoto() { return photo; }
    public void setPhoto(MultipartFile photo) { this.photo = photo; }
    public MultipartFile getIdCard() { return idCard; }
    public void setIdCard(MultipartFile idCard) { this.idCard = idCard; }
}