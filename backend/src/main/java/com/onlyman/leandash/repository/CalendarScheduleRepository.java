package com.onlyman.leandash.repository;

import com.onlyman.leandash.entity.CalendarSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarScheduleRepository extends JpaRepository<CalendarSchedule, Long> {
    List<CalendarSchedule> findByUserId(Long userId);
}