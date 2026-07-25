package com.northmess.service;

import com.northmess.entity.Staff;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.StaffRepository;
import com.northmess.request.StaffForm;
import com.northmess.security.UserPrincipal;
import com.northmess.utils.FileUploadUtil;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final FileUploadUtil fileUploadUtil;

    public List<Staff> getAll() {
        return staffRepository.findAllByOrderByCreatedAtDesc();
    }

    public Staff create(StaffForm form, UserPrincipal principal) {
        Staff staff = new Staff();
        applyForm(staff, form);
        staff.setCreatedAt(Instant.now());
        staff.setUpdatedAt(Instant.now());
        String imageUrl = fileUploadUtil.saveFile(form.getImage(), "staff", form.getName() == null ? "staff" : form.getName());
        staff.setImageUrl(imageUrl);
        return staffRepository.save(staff);
    }

    public Staff update(String id, StaffForm form) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));
        applyForm(staff, form);
        String imageUrl = fileUploadUtil.saveFile(form.getImage(), "staff", form.getName() == null ? staff.getName() : form.getName());
        if (StringUtils.hasText(imageUrl)) {
            fileUploadUtil.deleteFile(staff.getImageUrl());
            staff.setImageUrl(imageUrl);
        }
        staff.setUpdatedAt(Instant.now());
        return staffRepository.save(staff);
    }

    public void delete(String id) {
        Staff staff = staffRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));
        fileUploadUtil.deleteFile(staff.getImageUrl());
        staffRepository.deleteById(id);
    }

    private void applyForm(Staff staff, StaffForm form) {
        if (form.getName() != null) staff.setName(form.getName());
        if (form.getRole() != null) staff.setRole(form.getRole());
        if (form.getDepartment() != null) staff.setDepartment(form.getDepartment());
        if (form.getPhone() != null) staff.setPhone(form.getPhone());
        if (form.getEmail() != null) staff.setEmail(form.getEmail());
        if (form.getExperience() != null) staff.setExperience(form.getExperience());
        if (form.getSpecialDishes() != null) staff.setSpecialDishes(form.getSpecialDishes());
        if (form.getWorkingSince() != null) staff.setWorkingSince(form.getWorkingSince());
        if (form.getMessage() != null) staff.setMessage(form.getMessage());
        if (form.getKind() != null) staff.setKind(form.getKind());
    }
}