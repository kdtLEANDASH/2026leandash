package com.onlyman.leandash.dto;

import java.time.LocalDateTime;

public class ScheduleResponseDto {

    private Long scheduleId;
    private Long userId;
    private String title;
    private String content;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String scheduleType;
    private Integer isAllDay;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScheduleResponseDto() {
    }

    public ScheduleResponseDto(Long scheduleId, Long userId, String title, String content,
                               LocalDateTime startDatetime, LocalDateTime endDatetime,
                               String scheduleType, Integer isAllDay,
                               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.scheduleId = scheduleId;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.startDatetime = startDatetime;
        this.endDatetime = endDatetime;
        this.scheduleType = scheduleType;
        this.isAllDay = isAllDay;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getStartDatetime() {
        return startDatetime;
    }

    public LocalDateTime getEndDatetime() {
        return endDatetime;
    }

    public String getScheduleType() {
        return scheduleType;
    }

    public Integer getIsAllDay() {
        return isAllDay;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
