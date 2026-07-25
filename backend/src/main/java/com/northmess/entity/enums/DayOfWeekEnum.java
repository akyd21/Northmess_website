package com.northmess.entity.enums;

public enum DayOfWeekEnum {
    SUNDAY,
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY;

    public static DayOfWeekEnum from(String value) {
        return DayOfWeekEnum.valueOf(value.trim().toUpperCase());
    }
}