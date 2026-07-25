package com.northmess.entity;

import com.northmess.entity.enums.DayOfWeekEnum;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "menus")
public class Menu {
    @Id
    private String id;
    private DayOfWeekEnum day;
    private List<String> breakfast = new ArrayList<>();
    private List<String> lunch = new ArrayList<>();
    private List<String> dinner = new ArrayList<>();
    private Instant updatedAt;
    private String updatedBy;
}