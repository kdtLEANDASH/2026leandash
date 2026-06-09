package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.CalendarEventDto;
import com.onlyman.leandash.dto.CalendarScheduleRequestDto;
import com.onlyman.leandash.dto.CalendarScheduleResponseDto;
import com.onlyman.leandash.service.CalendarScheduleService;
import com.onlyman.leandash.service.HolidayService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/calendar-schedules")
public class CalendarScheduleController {

    private final CalendarScheduleService calendarScheduleService;
    private final HolidayService holidayService;

    public CalendarScheduleController(
            CalendarScheduleService calendarScheduleService,
            HolidayService holidayService
    ) {
        this.calendarScheduleService = calendarScheduleService;
        this.holidayService = holidayService;
    }

    @PostMapping
    public CalendarScheduleResponseDto createCalendarSchedule(
            @RequestBody CalendarScheduleRequestDto requestDto
    ) {
        return calendarScheduleService.createCalendarSchedule(requestDto);
    }

    @GetMapping
    public List<CalendarScheduleResponseDto> getAllCalendarSchedules() {
        return calendarScheduleService.getAllCalendarSchedules();
    }

    @GetMapping("/with-holidays")
    public List<CalendarEventDto> getCalendarSchedulesWithHolidays(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);

        List<CalendarEventDto> result = new ArrayList<>();

        result.addAll(holidayService.getHolidayEvents(start, end));

        return result;
    }

    @GetMapping("/{scheduleId}")
    public CalendarScheduleResponseDto getCalendarScheduleById(@PathVariable Long scheduleId) {
        return calendarScheduleService.getCalendarScheduleById(scheduleId);
    }

    @GetMapping("/user/{userId}")
    public List<CalendarScheduleResponseDto> getCalendarSchedulesByUserId(@PathVariable Long userId) {
        return calendarScheduleService.getCalendarSchedulesByUserId(userId);
    }

    @DeleteMapping("/{scheduleId}")
    public void deleteCalendarSchedule(@PathVariable Long scheduleId) {
        calendarScheduleService.deleteCalendarSchedule(scheduleId);
    }
}