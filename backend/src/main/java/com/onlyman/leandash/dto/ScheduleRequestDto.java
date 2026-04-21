package com.onlyman.leandash.dto;

import java.time.LocalDateTime;

public class ScheduleRequestDto {

    private String title;
    private String content;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private String scheduleType;
    private Integer isAllDay;

    public ScheduleRequestDto() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getStartDatetime() {
        return startDatetime;
    }

    public void setStartDatetime(LocalDateTime startDatetime) {
        this.startDatetime = startDatetime;
    }

    public LocalDateTime getEndDatetime() {
        return endDatetime;
    }

    public void setEndDatetime(LocalDateTime endDatetime) {
        this.endDatetime = endDatetime;
    }

    public String getScheduleType() {
        return scheduleType;
    }

    public void setScheduleType(String scheduleType) {
        this.scheduleType = scheduleType;
    }

    public Integer getIsAllDay() {
        return isAllDay;
    }

    public void setIsAllDay(Integer isAllDay) {
        this.isAllDay = isAllDay;
    }
}
