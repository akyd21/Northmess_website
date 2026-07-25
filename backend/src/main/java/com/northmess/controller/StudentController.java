package com.northmess.controller;

import com.northmess.security.UserPrincipal;
import com.northmess.service.StudentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<?> getAll(@RequestParam(required = false) String status, @RequestParam(required = false, name = "q") String query) {
        return studentService.getAll(status, query);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Object getById(@PathVariable String id) {
        return studentService.getById(id);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public List<?> search(@RequestParam("q") String query) {
        return studentService.getAll(null, query);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public Object approve(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        return studentService.approve(id, principal);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public Object reject(@PathVariable String id, @AuthenticationPrincipal UserPrincipal principal) {
        return studentService.reject(id, principal);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        studentService.delete(id);
    }
}