package com.onlyman.leandash.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarEventDto {

    private Long scheduleId;
    private Long userId;
    private String title;
    private String content;
    private LocalDate startDate;
    private LocalDate endDate;
    private String eventType;
    private String status;
}