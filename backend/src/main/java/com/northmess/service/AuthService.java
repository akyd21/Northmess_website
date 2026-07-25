package com.northmess.service;

import com.northmess.entity.Admin;
import com.northmess.entity.Student;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.entity.enums.UserRole;
import com.northmess.exception.BadRequestException;
import com.northmess.exception.ResourceNotFoundException;
import com.northmess.repository.AdminRepository;
import com.northmess.repository.StudentRepository;
import com.northmess.request.LoginRequest;
import com.northmess.request.ProfileUpdateRequest;
import com.northmess.request.RegisterRequest;
import com.northmess.security.JwtTokenProvider;
import com.northmess.security.UserPrincipal;
import com.northmess.utils.FileUploadUtil;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final FileUploadUtil fileUploadUtil;

    public Student register(RegisterRequest request) {
        if (request.getTerms() == null || !Boolean.parseBoolean(request.getTerms())) {
            throw new BadRequestException("You must agree to the terms");
        }
        if (studentRepository.findByEmailIgnoreCase(request.getEmail()).isPresent() || adminRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email already exists");
        }
        if (studentRepository.findByRollNumberIgnoreCase(request.getRollNumber()).isPresent()) {
            throw new BadRequestException("Roll number already exists");
        }

        Student student = new Student();
        student.setName(request.getName());
        student.setRollNumber(request.getRollNumber());
        student.setDepartment(request.getDepartment());
        student.setYear(request.getYear());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setHostelRoom(request.getHostelRoom());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(UserRole.STUDENT);
        student.setStatus(ApprovalStatus.PENDING);
        student.setActive(true);
        student.setCreatedAt(Instant.now());
        student.setUpdatedAt(Instant.now());
        student = studentRepository.save(student);

        String photoUrl = fileUploadUtil.saveFile(request.getPhoto(), "students/" + student.getId(), "photo");
        String idCardUrl = fileUploadUtil.saveFile(request.getIdCard(), "students/" + student.getId(), "idcard");
        if (StringUtils.hasText(photoUrl) || StringUtils.hasText(idCardUrl)) {
            student.setPhotoUrl(photoUrl);
            student.setIdCardUrl(idCardUrl);
            student.setUpdatedAt(Instant.now());
            student = studentRepository.save(student);
        }

        return student;
    }

    public Map<String, Object> login(LoginRequest request) {
        UserPrincipal principal = adminRepository.findByEmailIgnoreCase(request.email())
                .map(this::toPrincipal)
                .or(() -> studentRepository.findByEmailIgnoreCase(request.email()).map(this::toPrincipal))
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), principal.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        if ("STUDENT".equals(principal.getUserType()) && principal.getStatus() != ApprovalStatus.APPROVED) {
            throw new BadRequestException("Your registration is pending admin approval");
        }

        String token = jwtTokenProvider.generateToken(principal);
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", currentUser(principal));
        return response;
    }

    public Object currentUser(UserPrincipal principal) {
        return switch (principal.getUserType()) {
            case "ADMIN" -> adminRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            default -> studentRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        };
    }

    public Object updateProfile(UserPrincipal principal, ProfileUpdateRequest request) {
        if ("ADMIN".equals(principal.getUserType())) {
            Admin admin = adminRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
            if (StringUtils.hasText(request.getName())) {
                admin.setName(request.getName());
            }
            if (StringUtils.hasText(request.getPhone())) {
                admin.setPhone(request.getPhone());
            }
            admin.setUpdatedAt(Instant.now());
            return adminRepository.save(admin);
        }

        Student student = studentRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        if (StringUtils.hasText(request.getName())) {
            student.setName(request.getName());
        }
        if (StringUtils.hasText(request.getPhone())) {
            student.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getHostelRoom())) {
            student.setHostelRoom(request.getHostelRoom());
        }
        if (StringUtils.hasText(request.getDepartment())) {
            student.setDepartment(request.getDepartment());
        }
        if (StringUtils.hasText(request.getYear())) {
            student.setYear(request.getYear());
        }
        String photoUrl = fileUploadUtil.saveFile(request.getPhoto(), "students/" + student.getId(), "photo");
        String idCardUrl = fileUploadUtil.saveFile(request.getIdCard(), "students/" + student.getId(), "idcard");
        if (StringUtils.hasText(photoUrl)) {
            student.setPhotoUrl(photoUrl);
        }
        if (StringUtils.hasText(idCardUrl)) {
            student.setIdCardUrl(idCardUrl);
        }
        student.setUpdatedAt(Instant.now());
        return studentRepository.save(student);
    }

    private UserPrincipal toPrincipal(Student student) {
        return new UserPrincipal(student.getId(), student.getEmail(), student.getPassword(), student.getName(), student.getRole(), student.getStatus(), "STUDENT", student.getStatus() == ApprovalStatus.APPROVED);
    }

    private UserPrincipal toPrincipal(Admin admin) {
        return new UserPrincipal(admin.getId(), admin.getEmail(), admin.getPassword(), admin.getName(), admin.getRole(), admin.getStatus(), "ADMIN", true);
    }
}