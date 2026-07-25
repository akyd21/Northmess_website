package com.northmess.controller;

import com.northmess.entity.GalleryImage;
import com.northmess.request.GalleryUploadForm;
import com.northmess.security.UserPrincipal;
import com.northmess.service.GalleryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping
    public List<GalleryImage> getAll() {
        return galleryService.getAll();
    }

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public GalleryImage upload(@ModelAttribute GalleryUploadForm form, @AuthenticationPrincipal UserPrincipal principal) {
        return galleryService.upload(form, principal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        galleryService.delete(id);
    }
}