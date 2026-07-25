package com.northmess;

import com.northmess.entity.Admin;
import com.northmess.entity.Announcement;
import com.northmess.entity.Menu;
import com.northmess.entity.enums.ApprovalStatus;
import com.northmess.entity.enums.DayOfWeekEnum;
import com.northmess.entity.enums.UserRole;
import com.northmess.repository.AdminRepository;
import com.northmess.repository.AnnouncementRepository;
import com.northmess.repository.MenuRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class NorthMessApplication {

    private static final Logger log = LoggerFactory.getLogger(NorthMessApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(NorthMessApplication.class, args);
    }

    @Bean
    CommandLineRunner seedData(
            AdminRepository adminRepository,
            MenuRepository menuRepository,
            AnnouncementRepository announcementRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                if (adminRepository.count() == 0) {
                    Admin admin = new Admin();
                    admin.setName("Mess Secretary");
                    admin.setEmail("userakashinfo@gmail.com");
                    admin.setPhone("8207817105");
                    admin.setPassword(passwordEncoder.encode("akyd21"));
                    admin.setRole(UserRole.ADMIN);
                    admin.setStatus(ApprovalStatus.APPROVED);
                    admin.setCreatedAt(Instant.now());
                    admin.setUpdatedAt(Instant.now());
                    adminRepository.save(admin);
                }

                if (menuRepository.count() == 0) {
                    menuRepository.saveAll(defaultMenus());
                } else {
                    syncDefaultMenus(menuRepository);
                }


                if (announcementRepository.count() == 0) {
                    Announcement announcement = new Announcement();
                    announcement.setTitle("Welcome to North Mess");
                    announcement.setMessage("Fresh weekly menus and announcements are now live.");
                    announcement.setCategory("GENERAL");
                    announcement.setPinned(true);
                    announcement.setActive(true);
                    announcement.setCreatedBy("system");
                    announcement.setCreatedByName("North Mess");
                    announcement.setCreatedAt(Instant.now());
                    announcement.setUpdatedAt(Instant.now());
                    announcementRepository.save(announcement);
                }
            } catch (DataAccessResourceFailureException exception) {
                log.warn("Skipping database seed because MongoDB is unavailable: {}", exception.getMessage());
            } catch (Exception exception) {
                log.warn("Skipping database seed due to startup data issue: {}", exception.getMessage());
            }
        };
    }

    private List<Menu> defaultMenus() {
        return List.of(
                menu(DayOfWeekEnum.MONDAY, List.of(), List.of("Dal", "Chawal", "Aloo Bhujiya", "Papad"), List.of("Roti", "Sabji", "Kheer")),
                menu(DayOfWeekEnum.TUESDAY, List.of(), List.of("Dal", "Chawal", "Aloo-Bhindi Bhujiya", "Papad"), List.of("Puri", "Sabji")),
                menu(DayOfWeekEnum.WEDNESDAY, List.of(), List.of("Dal", "Chawal", "Soyabean Sabji", "Papad"), List.of("Roti", "Paneer / Chicken")),
                menu(DayOfWeekEnum.THURSDAY, List.of(), List.of("Kadhi", "Chawal", "Pakora", "Bhujiya"), List.of("Aloo Paratha / Sattu Paratha")),
                menu(DayOfWeekEnum.FRIDAY, List.of(), List.of("Rajma / Chana", "Chawal", "Papad", "Curd"), List.of("Egg / Veg", "Roti")),
                menu(DayOfWeekEnum.SATURDAY, List.of(), List.of("Chokha", "Chawal", "Dal", "Papad"), List.of("Roti", "Mix Veg / Manchurian")),
                menu(DayOfWeekEnum.SUNDAY, List.of(), List.of("Jeera Rice", "Tadka", "Papad"), List.of("Paneer / Chicken Biryani"))
        );
    }

    private void syncDefaultMenus(MenuRepository menuRepository) {
        for (Menu defaultMenu : defaultMenus()) {
            menuRepository.findByDay(defaultMenu.getDay()).ifPresentOrElse(existing -> {
                existing.setBreakfast(defaultMenu.getBreakfast());
                existing.setLunch(defaultMenu.getLunch());
                existing.setDinner(defaultMenu.getDinner());
                existing.setUpdatedAt(Instant.now());
                existing.setUpdatedBy("system");
                menuRepository.save(existing);
            }, () -> menuRepository.save(defaultMenu));
        }
    }

    private Menu menu(DayOfWeekEnum day, List<String> breakfast, List<String> lunch, List<String> dinner) {
        Menu menu = new Menu();
        menu.setDay(day);
        menu.setBreakfast(breakfast);
        menu.setLunch(lunch);
        menu.setDinner(dinner);
        menu.setUpdatedAt(Instant.now());
        menu.setUpdatedBy("system");
        return menu;
    }
}