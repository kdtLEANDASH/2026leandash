package com.onlyman.leandash.controller;

import com.onlyman.leandash.config.UserPrincipal;
import com.onlyman.leandash.dto.ScheduleRequestDto;
import com.onlyman.leandash.dto.ScheduleResponseDto;
import com.onlyman.leandash.service.ScheduleService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ScheduleResponseDto createSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ScheduleRequestDto requestDto
    ) {
        return scheduleService.createSchedule(principal.getUserId(), requestDto);
    }

    @GetMapping
    public List<ScheduleResponseDto> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{scheduleId}")
    public ScheduleResponseDto getScheduleById(@PathVariable Long scheduleId) {
        return scheduleService.getScheduleById(scheduleId);
    }

    @GetMapping("/user/{userId}")
    public List<ScheduleResponseDto> getSchedulesByUserId(@PathVariable Long userId) {
        return scheduleService.getSchedulesByUserId(userId);
    }

    @GetMapping("/type/{scheduleType}")
    public List<ScheduleResponseDto> getSchedulesByType(@PathVariable String scheduleType) {
        return scheduleService.getSchedulesByType(scheduleType);
    }

    @PutMapping("/{scheduleId}")
    public ScheduleResponseDto updateSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long scheduleId,
            @RequestBody ScheduleRequestDto requestDto
    ) {
        return scheduleService.updateSchedule(
                principal.getUserId(),
                principal.getRole().name(),
                scheduleId,
                requestDto
        );
    }

    @DeleteMapping("/{scheduleId}")
    public String deleteSchedule(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long scheduleId
    ) {
        scheduleService.deleteSchedule(principal.getUserId(), principal.getRole().name(), scheduleId);
        return "schedule deleted successfully";
    }
}
