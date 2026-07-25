package com.northmess.controller;

import com.northmess.entity.Menu;
import com.northmess.security.UserPrincipal;
import com.northmess.service.MenuService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping("/today")
    public Menu today() {
        return menuService.getTodayMenu();
    }

    @GetMapping("/weekly")
    public List<Menu> weekly() {
        return menuService.getWeeklyMenu();
    }

    @GetMapping("/{day}")
    public Menu byDay(@PathVariable String day) {
        return menuService.getByDay(day);
    }

    @PutMapping("/{day}")
    @PreAuthorize("hasRole('ADMIN')")
    public Menu update(@PathVariable String day, @RequestBody Menu request, @AuthenticationPrincipal UserPrincipal principal) {
        return menuService.updateMenu(day, request, principal);
    }

    @PutMapping("/weekly")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Menu> updateWeekly(@RequestBody List<Menu> request, @AuthenticationPrincipal UserPrincipal principal) {
        return menuService.updateWeeklyMenu(request, principal);
    }
}