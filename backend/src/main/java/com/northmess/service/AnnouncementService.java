package com.northmess.service;

import com.northmess.entity.Announcement;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.AnnouncementRepository;
import com.northmess.security.UserPrincipal;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public List<Announcement> getAll() {
        return announcementRepository.findAllByOrderByPinnedDescCreatedAtDesc();
    }

    public Announcement create(Announcement request, UserPrincipal principal) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setMessage(request.getMessage());
        announcement.setCategory(request.getCategory());
        announcement.setPinned(request.isPinned());
        announcement.setActive(true);
        announcement.setCreatedBy(principal.getId());
        announcement.setCreatedByName(principal.getName());
        announcement.setCreatedAt(Instant.now());
        announcement.setUpdatedAt(Instant.now());
        return announcementRepository.save(announcement);
    }

    public Announcement update(String id, Announcement request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));
        if (request.getTitle() != null) announcement.setTitle(request.getTitle());
        if (request.getMessage() != null) announcement.setMessage(request.getMessage());
        if (request.getCategory() != null) announcement.setCategory(request.getCategory());
        announcement.setPinned(request.isPinned());
        announcement.setUpdatedAt(Instant.now());
        return announcementRepository.save(announcement);
    }

    public void delete(String id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Announcement not found");
        }
        announcementRepository.deleteById(id);
    }
}