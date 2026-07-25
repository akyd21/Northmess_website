package com.northmess.request;

import org.springframework.web.multipart.MultipartFile;

public class GalleryUploadForm {
    private String title;
    private String description;
    private String category;
    private MultipartFile image;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}