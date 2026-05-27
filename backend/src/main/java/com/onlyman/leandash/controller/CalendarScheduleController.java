
package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.CalendarScheduleRequestDto;
import com.onlyman.leandash.dto.CalendarScheduleResponseDto;
import com.onlyman.leandash.service.CalendarScheduleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/calendar-schedules")
public class CalendarScheduleController {

    private final CalendarScheduleService calendarScheduleService;

    public CalendarScheduleController(CalendarScheduleService calendarScheduleService) {
        this.calendarScheduleService = calendarScheduleService;
    }

    @PostMapping
    public CalendarScheduleResponseDto createCalendarSchedule(@RequestBody CalendarScheduleRequestDto requestDto) {
        return calendarScheduleService.createCalendarSchedule(requestDto);
    }

    @GetMapping
    public List<CalendarScheduleResponseDto> getAllCalendarSchedules() {
        return calendarScheduleService.getAllCalendarSchedules();
    }

    @GetMapping("/{scheduleId}")
    public CalendarScheduleResponseDto getCalendarScheduleById(@PathVariable Long scheduleId) {
        return calendarScheduleService.getCalendarScheduleById(scheduleId);
    }

    @GetMapping("/user/{userId}")
    public List<CalendarScheduleResponseDto> getCalendarSchedulesByUserId(@PathVariable Long userId) {
        return calendarScheduleService.getCalendarSchedulesByUserId(userId);
    }
}

