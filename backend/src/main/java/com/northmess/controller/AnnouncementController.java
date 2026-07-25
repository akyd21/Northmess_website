package com.northmess.controller;

import com.northmess.entity.Announcement;
import com.northmess.security.UserPrincipal;
import com.northmess.service.AnnouncementService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public List<Announcement> getAll() {
        return announcementService.getAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement create(@RequestBody Announcement request, @AuthenticationPrincipal UserPrincipal principal) {
        return announcementService.create(request, principal);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement update(@PathVariable String id, @RequestBody Announcement request) {
        return announcementService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        announcementService.delete(id);
    }
}