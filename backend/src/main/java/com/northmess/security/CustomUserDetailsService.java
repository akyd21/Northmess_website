package com.northmess.security;

import com.northmess.entity.Admin;
import com.northmess.entity.Student;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.repository.AdminRepository;
import com.northmess.repository.StudentRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    @Override
    public UserPrincipal loadUserByUsername(String username) {
        return adminRepository.findByEmailIgnoreCase(username)
                .map(this::toPrincipal)
                .or(() -> studentRepository.findByEmailIgnoreCase(username).map(this::toPrincipal))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public UserPrincipal loadById(String id) {
        return studentRepository.findById(id)
                .map(this::toPrincipal)
                .or(() -> adminRepository.findById(id).map(this::toPrincipal))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public Optional<Student> findStudentByEmail(String email) {
        return studentRepository.findByEmailIgnoreCase(email);
    }

    public Optional<Admin> findAdminByEmail(String email) {
        return adminRepository.findByEmailIgnoreCase(email);
    }

    private UserPrincipal toPrincipal(Student student) {
        return new UserPrincipal(
                student.getId(),
                student.getEmail(),
                student.getPassword(),
                student.getName(),
                student.getRole(),
                student.getStatus(),
                "STUDENT",
                student.getStatus() == ApprovalStatus.APPROVED);
    }

    private UserPrincipal toPrincipal(Admin admin) {
        return new UserPrincipal(
                admin.getId(),
                admin.getEmail(),
                admin.getPassword(),
                admin.getName(),
                admin.getRole(),
                admin.getStatus(),
                "ADMIN",
                true);
    }
}