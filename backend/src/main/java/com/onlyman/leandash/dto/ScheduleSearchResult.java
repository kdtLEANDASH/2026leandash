package com.onlyman.leandash.dto;

import com.onlyman.leandash.entity.Schedule;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ScheduleSearchResult {

    private Long scheduleId;
    private String title;
    private String content;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;

    public static ScheduleSearchResult from(Schedule schedule) {
        return new ScheduleSearchResult(
                schedule.getScheduleId(),
                schedule.getTitle(),
                schedule.getContent(),
                schedule.getStartDatetime(),
                schedule.getEndDatetime()
        );
    }
}
