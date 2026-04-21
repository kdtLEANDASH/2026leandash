package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.ScheduleRequestDto;
import com.onlyman.leandash.dto.ScheduleResponseDto;
import com.onlyman.leandash.entity.Role;
import com.onlyman.leandash.entity.Schedule;
import com.onlyman.leandash.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleService(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    public ScheduleResponseDto createSchedule(Long currentUserId, ScheduleRequestDto requestDto) {
        validateScheduleRequest(requestDto);

        Schedule schedule = new Schedule();
        schedule.setUserId(currentUserId);
        schedule.setTitle(requestDto.getTitle());
        schedule.setContent(requestDto.getContent());
        schedule.setStartDatetime(requestDto.getStartDatetime());
        schedule.setEndDatetime(requestDto.getEndDatetime());
        schedule.setScheduleType(
                requestDto.getScheduleType() == null || requestDto.getScheduleType().isBlank()
                        ? "PERSONAL"
                        : requestDto.getScheduleType()
        );
        schedule.setIsAllDay(requestDto.getIsAllDay() == null ? 0 : requestDto.getIsAllDay());

        Schedule savedSchedule = scheduleRepository.save(schedule);
        return toResponseDto(savedSchedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponseDto> getAllSchedules() {
        return scheduleRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScheduleResponseDto getScheduleById(Long scheduleId) {
        Schedule schedule = findSchedule(scheduleId);
        return toResponseDto(schedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponseDto> getSchedulesByUserId(Long userId) {
        return scheduleRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponseDto> getSchedulesByType(String scheduleType) {
        return scheduleRepository.findByScheduleType(scheduleType)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public ScheduleResponseDto updateSchedule(Long currentUserId, String currentUserRole, Long scheduleId,
                                              ScheduleRequestDto requestDto) {
        validateScheduleRequest(requestDto);

        Schedule schedule = findSchedule(scheduleId);
        validateScheduleAccess(currentUserId, currentUserRole, schedule);

        schedule.setTitle(requestDto.getTitle());
        schedule.setContent(requestDto.getContent());
        schedule.setStartDatetime(requestDto.getStartDatetime());
        schedule.setEndDatetime(requestDto.getEndDatetime());
        schedule.setScheduleType(
                requestDto.getScheduleType() == null || requestDto.getScheduleType().isBlank()
                        ? "PERSONAL"
                        : requestDto.getScheduleType()
        );
        schedule.setIsAllDay(requestDto.getIsAllDay() == null ? 0 : requestDto.getIsAllDay());

        return toResponseDto(schedule);
    }

    public void deleteSchedule(Long currentUserId, String currentUserRole, Long scheduleId) {
        Schedule schedule = findSchedule(scheduleId);
        validateScheduleAccess(currentUserId, currentUserRole, schedule);
        scheduleRepository.delete(schedule);
    }

    private void validateScheduleRequest(ScheduleRequestDto requestDto) {
        if (requestDto.getTitle() == null || requestDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("schedule title is required");
        }

        if (requestDto.getStartDatetime() == null || requestDto.getEndDatetime() == null) {
            throw new IllegalArgumentException("start time and end time are required");
        }

        if (requestDto.getStartDatetime().isAfter(requestDto.getEndDatetime())) {
            throw new IllegalArgumentException("start time cannot be after end time");
        }
    }

    private void validateScheduleAccess(Long currentUserId, String currentUserRole, Schedule schedule) {
        if (Role.ADMIN.name().equals(currentUserRole)) {
            return;
        }

        if (!schedule.getUserId().equals(currentUserId)) {
            throw new IllegalArgumentException("you cannot modify another user's schedule");
        }
    }

    private Schedule findSchedule(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("schedule not found: id=" + scheduleId));
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
