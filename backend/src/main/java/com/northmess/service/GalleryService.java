package com.northmess.service;

import com.northmess.entity.GalleryImage;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.GalleryRepository;
import com.northmess.request.GalleryUploadForm;
import com.northmess.security.UserPrincipal;
import com.northmess.utils.FileUploadUtil;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryRepository galleryRepository;
    private final FileUploadUtil fileUploadUtil;

    public List<GalleryImage> getAll() {
        return galleryRepository.findAllByOrderByUploadedAtDesc();
    }

    public GalleryImage upload(GalleryUploadForm form, UserPrincipal principal) {
        GalleryImage image = new GalleryImage();
        image.setTitle(form.getTitle());
        image.setDescription(form.getDescription());
        image.setCategory(form.getCategory());
        image.setUploadedBy(principal.getId());
        image.setUploadedByName(principal.getName());
        image.setUploadedAt(Instant.now());
        image.setImageUrl(fileUploadUtil.saveFile(form.getImage(), "gallery", form.getTitle() == null ? "gallery" : form.getTitle()));
        return galleryRepository.save(image);
    }

    public void delete(String id) {
        GalleryImage image = galleryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery image not found"));
        fileUploadUtil.deleteFile(image.getImageUrl());
        galleryRepository.deleteById(id);
    }
}