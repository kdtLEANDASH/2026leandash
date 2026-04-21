package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.CalendarScheduleRequestDto;
import com.onlyman.leandash.dto.CalendarScheduleResponseDto;
import com.onlyman.leandash.entity.CalendarSchedule;
import com.onlyman.leandash.repository.CalendarScheduleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarScheduleService {

    private final CalendarScheduleRepository calendarScheduleRepository;

    public CalendarScheduleService(CalendarScheduleRepository calendarScheduleRepository) {
        this.calendarScheduleRepository = calendarScheduleRepository;
    }

    public CalendarScheduleResponseDto createCalendarSchedule(CalendarScheduleRequestDto requestDto) {
        CalendarSchedule calendarSchedule = new CalendarSchedule();

        calendarSchedule.setUserId(requestDto.getUserId());
        calendarSchedule.setTitle(requestDto.getTitle());
        calendarSchedule.setContent(requestDto.getContent());
        calendarSchedule.setStartDatetime(requestDto.getStartDatetime());
        calendarSchedule.setEndDatetime(requestDto.getEndDatetime());
        calendarSchedule.setScheduleType(requestDto.getScheduleType());
        calendarSchedule.setIsAllDay(requestDto.getIsAllDay());
        calendarSchedule.setDepartmentId(requestDto.getDepartmentId());
        calendarSchedule.setIsOfficial(requestDto.getIsOfficial());
        calendarSchedule.setIsHoliday(requestDto.getIsHoliday());
        calendarSchedule.setColor(requestDto.getColor());
        calendarSchedule.setRemindAt(requestDto.getRemindAt());

        CalendarSchedule saved = calendarScheduleRepository.save(calendarSchedule);
        return toResponseDto(saved);
    }

    public List<CalendarScheduleResponseDto> getAllCalendarSchedules() {
        return calendarScheduleRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public CalendarScheduleResponseDto getCalendarScheduleById(Long scheduleId) {
        CalendarSchedule calendarSchedule = calendarScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 존재하지 않습니다. id=" + scheduleId));

        return toResponseDto(calendarSchedule);
    }

    public List<CalendarScheduleResponseDto> getCalendarSchedulesByUserId(Long userId) {
        return calendarScheduleRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    private CalendarScheduleResponseDto toResponseDto(CalendarSchedule calendarSchedule) {
        CalendarScheduleResponseDto responseDto = new CalendarScheduleResponseDto();

        responseDto.setScheduleId(calendarSchedule.getScheduleId());
        responseDto.setUserId(calendarSchedule.getUserId());
        responseDto.setTitle(calendarSchedule.getTitle());
        responseDto.setContent(calendarSchedule.getContent());
        responseDto.setStartDatetime(calendarSchedule.getStartDatetime());
        responseDto.setEndDatetime(calendarSchedule.getEndDatetime());
        responseDto.setScheduleType(calendarSchedule.getScheduleType());
        responseDto.setIsAllDay(calendarSchedule.getIsAllDay());
        responseDto.setDepartmentId(calendarSchedule.getDepartmentId());
        responseDto.setIsOfficial(calendarSchedule.getIsOfficial());
        responseDto.setIsHoliday(calendarSchedule.getIsHoliday());
        responseDto.setColor(calendarSchedule.getColor());
        responseDto.setRemindAt(calendarSchedule.getRemindAt());
        responseDto.setStatus(calendarSchedule.getStatus());
        responseDto.setCreatedAt(calendarSchedule.getCreatedAt());
        responseDto.setUpdatedAt(calendarSchedule.getUpdatedAt());

        return responseDto;
    }
}
