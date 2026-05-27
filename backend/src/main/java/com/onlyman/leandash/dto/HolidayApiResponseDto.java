package com.onlyman.leandash.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HolidayApiResponseDto {

    private String dateName;
    private LocalDate locdate;
    private String isHoliday;

    public boolean isPublicHoliday() {
        return "Y".equalsIgnoreCase(isHoliday);
    }

    public CalendarEventDto toCalendarEventDto() {
        return CalendarEventDto.builder()
                .scheduleId(null)
                .userId(null)
                .title(dateName)
                .content("공공 API 공휴일")
                .startDate(locdate)
                .endDate(locdate)
                .eventType("HOLIDAY")
                .status("ACTIVE")
                .build();
    }
}