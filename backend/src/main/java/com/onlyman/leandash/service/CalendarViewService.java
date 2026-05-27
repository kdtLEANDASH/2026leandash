package com.onlyman.leandash.service;

import com.onlyman.leandash.dto.CalendarEventDto;
import com.onlyman.leandash.entity.Schedule;
import com.onlyman.leandash.entity.Vacation;
import com.onlyman.leandash.entity.VacationStatus;
import com.onlyman.leandash.repository.ScheduleRepository;
import com.onlyman.leandash.repository.VacationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CalendarViewService {

    private final ScheduleRepository scheduleRepository;
    private final VacationRepository vacationRepository;
    private final HolidayService holidayService;

    public List<CalendarEventDto> getCalendarEvents(LocalDate startDate, LocalDate endDate) {

        LocalDateTime startDatetime = startDate.atStartOfDay();
        LocalDateTime endDatetime = endDate.atTime(LocalTime.MAX);

        List<CalendarEventDto> events = new ArrayList<>();

        List<Schedule> schedules =
                scheduleRepository.findByStartDatetimeBetween(startDatetime, endDatetime);

        for (Schedule schedule : schedules) {
            events.add(CalendarEventDto.builder()
                    .scheduleId(schedule.getScheduleId())
                    .userId(schedule.getUserId())
                    .title(schedule.getTitle())
                    .content(schedule.getContent())
                    .startDate(schedule.getStartDatetime().toLocalDate())
                    .endDate(schedule.getEndDatetime().toLocalDate())
                    .eventType(schedule.getScheduleType() == null ? "PERSONAL" : schedule.getScheduleType())
                    .status("ACTIVE")
                    .build());
        }

        List<Vacation> vacations =
                vacationRepository.findByStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        VacationStatus.APPROVED,
                        endDate,
                        startDate
                );

        for (Vacation vacation : vacations) {
            events.add(CalendarEventDto.builder()
                    .scheduleId(vacation.getVacationId())
                    .userId(vacation.getUserId())
                    .title(vacation.getVacationType())
                    .content(vacation.getReason())
                    .startDate(vacation.getStartDate())
                    .endDate(vacation.getEndDate())
                    .eventType("VACATION")
                    .status(vacation.getStatus() == null ? null : vacation.getStatus().name())
                    .build());
        }

        events.addAll(holidayService.getHolidayEvents(startDate, endDate));

        events.sort(Comparator.comparing(CalendarEventDto::getStartDate));

        return events;
    }
}