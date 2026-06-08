package com.onlyman.leandash.controller;

import com.onlyman.leandash.dto.ScheduleResponseDto;
import com.onlyman.leandash.entity.Schedule;
import com.onlyman.leandash.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PublicScheduleController {

    private final ScheduleRepository scheduleRepository;

    @GetMapping("/api/public/schedules")
    public List<ScheduleResponseDto> getPublicSchedules() {

        return scheduleRepository
                .findByScheduleTypeInOrderByStartDatetimeAsc(
                        List.of("COMPANY", "HOLIDAY")
                )
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    private ScheduleResponseDto toResponseDto(Schedule schedule) {
        return new ScheduleResponseDto(
                schedule.getScheduleId(),
                schedule.getUserId(),
                schedule.getTitle(),
                schedule.getContent(),
                schedule.getStartDatetime(),
                schedule.getEndDatetime(),
                schedule.getScheduleType(),
                schedule.getIsAllDay(),
                schedule.getCreatedAt(),
                schedule.getUpdatedAt()
        );
    }
}