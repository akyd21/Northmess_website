package com.northmess.service;

import com.northmess.entity.Menu;
import com.northmess.entity.enums.DayOfWeekEnum;
import com.northmess.repository.MenuRepository;
import com.northmess.security.UserPrincipal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuRepository menuRepository;

    public Menu getTodayMenu() {
        DayOfWeekEnum today = mapDay(LocalDate.now().getDayOfWeek());
        return menuRepository.findByDay(today)
            .orElseGet(() -> emptyMenu(today));
    }

    public List<Menu> getWeeklyMenu() {
        List<Menu> menus = new ArrayList<>();
        for (DayOfWeekEnum day : DayOfWeekEnum.values()) {
            menus.add(menuRepository.findByDay(day).orElseGet(() -> emptyMenu(day)));
        }
        menus.sort(Comparator.comparingInt(menu -> menu.getDay().ordinal()));
        return menus;
    }

    public Menu getByDay(String day) {
        DayOfWeekEnum dayEnum = DayOfWeekEnum.from(day);
        return menuRepository.findByDay(dayEnum).orElseGet(() -> emptyMenu(dayEnum));
    }

    public Menu updateMenu(String day, Menu request, UserPrincipal principal) {
        DayOfWeekEnum dayEnum = DayOfWeekEnum.from(day);
        Menu menu = menuRepository.findByDay(dayEnum).orElseGet(() -> emptyMenu(dayEnum));
        menu.setDay(dayEnum);
        if (request.getBreakfast() != null) menu.setBreakfast(request.getBreakfast());
        if (request.getLunch() != null) menu.setLunch(request.getLunch());
        if (request.getDinner() != null) menu.setDinner(request.getDinner());
        menu.setUpdatedAt(Instant.now());
        menu.setUpdatedBy(principal.getName());
        return menuRepository.save(menu);
    }

    public List<Menu> updateWeeklyMenu(List<Menu> menus, UserPrincipal principal) {
        List<Menu> saved = new ArrayList<>();
        for (Menu menu : menus) {
            if (menu.getDay() == null) {
                continue;
            }
            saved.add(updateMenu(menu.getDay().name(), menu, principal));
        }
        return saved;
    }

    private Menu emptyMenu(DayOfWeekEnum day) {
        Menu menu = new Menu();
        menu.setDay(day);
        menu.setBreakfast(List.of());
        menu.setLunch(List.of());
        menu.setDinner(List.of());
        return menu;
    }

    private DayOfWeekEnum mapDay(DayOfWeek day) {
        return switch (day) {
            case MONDAY -> DayOfWeekEnum.MONDAY;
            case TUESDAY -> DayOfWeekEnum.TUESDAY;
            case WEDNESDAY -> DayOfWeekEnum.WEDNESDAY;
            case THURSDAY -> DayOfWeekEnum.THURSDAY;
            case FRIDAY -> DayOfWeekEnum.FRIDAY;
            case SATURDAY -> DayOfWeekEnum.SATURDAY;
            case SUNDAY -> DayOfWeekEnum.SUNDAY;
        };
    }
}