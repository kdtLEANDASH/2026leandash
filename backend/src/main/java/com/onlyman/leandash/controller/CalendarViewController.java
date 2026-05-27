package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.CalendarEventDto;
import com.onlyman.leandash.service.CalendarViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/calendar")
public class CalendarViewController {

    private final CalendarViewService calendarViewService;

    @GetMapping("/events")
    public List<CalendarEventDto> getCalendarEvents(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return calendarViewService.getCalendarEvents(startDate, endDate);
    }
}