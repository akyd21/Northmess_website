package com.northmess.controller;

import com.northmess.entity.Complaint;
import com.northmess.request.ComplaintStatusRequest;
import com.northmess.security.UserPrincipal;
import com.northmess.service.ComplaintService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Complaint submit(@RequestBody Complaint request, @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.submit(request, principal);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Complaint> getAll(@RequestParam(required = false) String status) {
        return complaintService.getAll(status);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Complaint> getMy(@AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.getMy(principal);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Complaint updateStatus(@PathVariable String id, @RequestBody ComplaintStatusRequest request, @AuthenticationPrincipal UserPrincipal principal) {
        return complaintService.updateStatus(id, request, principal);
    }
}