package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.CalendarEventDto;
import com.onlyman.leandash.dto.CalendarScheduleRequestDto;
import com.onlyman.leandash.dto.CalendarScheduleResponseDto;
import com.onlyman.leandash.entity.CalendarSchedule;
import com.onlyman.leandash.repository.CalendarScheduleRepository;
import com.onlyman.leandash.status.CalendarType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarScheduleService {

    private final CalendarScheduleRepository calendarScheduleRepository;
    private final HolidayService holidayService;

    public CalendarScheduleService(
            CalendarScheduleRepository calendarScheduleRepository,
            HolidayService holidayService
    ) {
        this.calendarScheduleRepository = calendarScheduleRepository;
        this.holidayService = holidayService;
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
        List<CalendarScheduleResponseDto> schedules = calendarScheduleRepository.findAll()
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toCollection(ArrayList::new));

        LocalDate startDate = LocalDate.now().minusMonths(3);
        LocalDate endDate = LocalDate.now().plusMonths(12);

        List<CalendarEventDto> holidays = holidayService.getHolidayEvents(startDate, endDate);

        schedules.addAll(
                holidays.stream()
                        .map(this::holidayToScheduleResponseDto)
                        .toList()
        );

        return schedules;
    }

    public CalendarScheduleResponseDto getCalendarScheduleById(Long scheduleId) {
        CalendarSchedule calendarSchedule = calendarScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("해당 일정이 존재하지 않습니다. id=" + scheduleId));

        return toResponseDto(calendarSchedule);
    }

    public List<CalendarScheduleResponseDto> getCalendarSchedulesByUserId(Long userId) {
        List<CalendarScheduleResponseDto> schedules = calendarScheduleRepository.findByUserId(userId)
                .stream()
                .map(this::toResponseDto)
                .collect(Collectors.toCollection(ArrayList::new));

        LocalDate startDate = LocalDate.now().minusMonths(3);
        LocalDate endDate = LocalDate.now().plusMonths(12);

        List<CalendarEventDto> holidays = holidayService.getHolidayEvents(startDate, endDate);

        schedules.addAll(
                holidays.stream()
                        .map(this::holidayToScheduleResponseDto)
                        .toList()
        );

        return schedules;
    }

    private CalendarScheduleResponseDto holidayToScheduleResponseDto(CalendarEventDto holiday) {
        CalendarScheduleResponseDto responseDto = new CalendarScheduleResponseDto();

        responseDto.setScheduleId(holiday.getScheduleId());
        responseDto.setUserId(0L);
        responseDto.setTitle(holiday.getTitle());
        responseDto.setContent(holiday.getContent());

        LocalDate startDate = holiday.getStartDate();
        LocalDate endDate = holiday.getEndDate() != null
                ? holiday.getEndDate()
                : holiday.getStartDate();

        responseDto.setStartDatetime(startDate.atStartOfDay());
        responseDto.setEndDatetime(endDate.atTime(23, 59, 59));

        responseDto.setScheduleType(CalendarType.HOLIDAY);
        responseDto.setIsAllDay(true);
        responseDto.setDepartmentId(null);
        responseDto.setIsOfficial(true);
        responseDto.setIsHoliday(true);
        responseDto.setColor("#ef4444");
        responseDto.setRemindAt(null);
        responseDto.setStatus(null);
        responseDto.setCreatedAt(LocalDateTime.now());
        responseDto.setUpdatedAt(LocalDateTime.now());

        return responseDto;
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

    public void deleteCalendarSchedule(Long scheduleId) {
        calendarScheduleRepository.deleteById(scheduleId);
    }
}